"""Same-origin free data tools API. No external data or AI services."""
import asyncio
import math
import os
import re
import secrets
import time
from collections import OrderedDict
from contextlib import asynccontextmanager, suppress
from pathlib import Path
from typing import Literal
from urllib.parse import quote, urlsplit

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ConfigDict
from starlette.concurrency import run_in_threadpool
from server.analytics_engine import store, parse_uploaded_file, generate_automated_eda, query_aggregation, export_dataframe_bytes, sanitize_val
from server.cleaning import transform
from server.storage import MAX_BYTES
from server.tools_engine import (
    csv_to_excel_bytes, excel_to_csv_bytes, excel_to_pdf_bytes,
    csv_to_json_bytes, json_to_csv_bytes, pdf_to_excel_bytes,
    merge_pdfs_bytes, compress_pdf_bytes, pdf_to_jpg_bytes, jpg_to_pdf_bytes,
    jpg_to_png_bytes, png_to_jpg_bytes, compress_image_bytes, resize_image_bytes,
    analyze_csv_data, analyze_excel_data, clean_csv_data, remove_duplicate_rows,
    format_json_string
)


@asynccontextmanager
async def lifespan(app):
    async def reap():
        while True:
            await asyncio.sleep(30)
            store.cleanup()
    task = asyncio.create_task(reap())
    yield
    task.cancel()
    with suppress(asyncio.CancelledError): await task
    store._datasets.clear()


app = FastAPI(title='DataSphere free data tools', version='3.0.0', lifespan=lifespan)
origins = [s.strip() for s in os.getenv('CORS_ORIGINS', '').split(',') if s.strip()]
if origins:
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
        allow_methods=['GET', 'POST', 'DELETE'], allow_headers=['Content-Type'])


class RequestLimits:
    """Limit actual streamed bytes before multipart parsing, including chunked requests."""
    def __init__(self, app):
        self.app = app
        self.semaphore = asyncio.Semaphore(4)
    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http' or scope['method'] not in {'POST', 'PUT', 'PATCH'}:
            return await self.app(scope, receive, send)
        if self.semaphore.locked():
            return await JSONResponse({'detail': 'Server is busy. Please retry shortly.'}, 503)(scope, receive, send)
        async with self.semaphore:
            await self.bounded_request(scope, receive, send)

    async def bounded_request(self, scope, receive, send):
        chunks, size = [], 0
        while True:
            message = await receive()
            if message['type'] == 'http.disconnect': return
            size += len(message.get('body', b''))
            if size > MAX_BYTES + 64 * 1024:
                return await JSONResponse({'detail': 'Request exceeds the 10 MB upload limit.'}, status_code=413)(scope, receive, send)
            chunks.append(message.get('body', b''))
            if not message.get('more_body'): break
        body, delivered = b''.join(chunks), False
        async def replay():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {'type': 'http.request', 'body': body, 'more_body': False}
            return await receive()
        await self.app(scope, replay, send)


app.add_middleware(RequestLimits)
rate_windows = OrderedDict()


@app.middleware('http')
async def privacy_and_limits(request, call_next):
    if request.url.path.startswith('/api/'):
        now, ip = time.monotonic(), request.client.host if request.client else 'unknown'
        for address in list(rate_windows):
            if now - rate_windows[address][0] > 60:
                del rate_windows[address]
        start, count = rate_windows.pop(ip, (now, 0))
        if now - start >= 60: start, count = now, 0
        rate_windows[ip] = (start, count + 1)
        while len(rate_windows) > 4096: rate_windows.popitem(last=False)
        if count >= 120:
            return JSONResponse({'detail': 'Too many requests. Try again in one minute.'}, 429, headers={'Retry-After': '60'})
        origin = request.headers.get('origin')
        if request.method in {'POST', 'DELETE'} and origin and origin not in origins and (urlsplit(origin).scheme, urlsplit(origin).netloc) != (request.url.scheme, request.url.netloc):
            return JSONResponse({'detail': 'Cross-origin request is not allowed.'}, 403)
        owner = request.cookies.get('datasphere_session', '')
        new_owner = not re.fullmatch(r'[A-Za-z0-9_-]{43}', owner)
        request.state.owner = secrets.token_urlsafe(32) if new_owner else owner
        response = await call_next(request)
        if new_owner:
            response.set_cookie('datasphere_session', request.state.owner, httponly=True, samesite='strict',
                secure=os.getenv('COOKIE_SECURE', 'false').lower() == 'true', max_age=3600)
        response.headers['Cache-Control'] = 'no-store'
    else: response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'same-origin'
    response.headers['X-Frame-Options'] = 'DENY'
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(request, exc):
    return JSONResponse({'detail': 'Please check the required fields and supported input ranges.'}, 422)


@app.exception_handler(ValueError)
async def input_error(request, exc):
    # Only expose our explicit messages, not parser internals or data values.
    message = str(exc)
    safe = ('Choose ', 'Use ', 'Dataset ', 'Memory ', 'Select ', 'Enter ', 'Unsupported ', 'Supported ', 'Column names ', 'That worksheet ', 'Workbook ', 'Invalid XLSX', 'Conversion target ', 'Mean and median ', 'An all-missing ', 'No valid values ', 'Outlier ', 'Split ', 'Limit must ')
    return JSONResponse({'detail': message if message.startswith(safe) else 'We could not process this data. Check its format and try again.'}, 400)


@app.exception_handler(Exception)
async def unexpected_error(request, exc):
    return JSONResponse({'detail': 'We could not process this file. Check the format and try again.'}, 500)


def dataset(request, key):
    item = store.get(key)
    if item is None or not secrets.compare_digest(item['owner'], request.state.owner):
        raise HTTPException(404, 'Dataset unavailable or expired. Upload your file again.')
    return item


def report(item):
    return dict(success=True, dataset_id=item['id'], filename=item['filename'], sheets=item['sheets'],
        active_sheet=item['active_sheet'], revision=item['revision'], undo_available=bool(item['undo']),
        analysis=generate_automated_eda(item['cleaned_df'], item['id'], item['filename'], item['active_sheet']))


def ingest(content, filename, owner, sheet=None):
    df, sheets, active = parse_uploaded_file(content, filename, sheet)
    if df.empty: raise ValueError('Choose a file containing at least one row and one column.')
    with store.lock:
        key = store.save(df, filename, sheets, active, owner, content if filename.lower().endswith('.xlsx') else b'')
        try:
            return report(store.get(key))
        except Exception:
            store.delete(key)
            raise


@app.get('/api/health')
def health(): return {'status': 'healthy', 'version': '3.0.0'}


async def read_upload(file):
    try:
        content = await file.read(MAX_BYTES + 1)
        if len(content) > MAX_BYTES:
            raise HTTPException(413, 'Choose a file no larger than 10 MB.')
        if not content:
            raise HTTPException(400, 'Choose a non-empty file.')
        return content
    finally:
        await file.close()


def attachment(filename):
    fallback = re.sub(r'[^A-Za-z0-9_. -]', '_', filename)
    return f'attachment; filename="{fallback}"; filename*=UTF-8\'\'{quote(filename)}'


async def run_file_tool(function, *args):
    try:
        return await run_in_threadpool(function, *args)
    except HTTPException:
        raise
    except Exception as exc:
        # Parser exceptions can include uploaded values and filesystem details.
        raise HTTPException(400, 'Check the file format and processing options.') from exc


@app.post('/api/upload')
async def upload(request: Request, file: UploadFile = File(...), sheet_name: str | None = Form(None)):
    try:
        filename = re.split(r'[/\\]', file.filename or 'data.csv')[-1][:150]
        ext = filename.lower().rsplit('.', 1)[-1]
        allowed = {'csv': {'text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel'},
            'xlsx': {'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'},
            'json': {'application/json', 'text/json', 'text/plain'}}
        if ext not in allowed or file.content_type not in allowed[ext] | {'application/octet-stream', '', None}:
            raise HTTPException(415, 'This file format is not supported. Choose CSV, XLSX or JSON.')
        content = await read_upload(file)
        return await run_in_threadpool(ingest, content, filename, request.state.owner, sheet_name)
    except (pd.errors.ParserError, pd.errors.EmptyDataError, UnicodeError):
        raise HTTPException(400, 'Invalid or empty file. Check headers, delimiters and encoding.')
    finally: await file.close()


@app.post('/api/sample-data')
def sample(request: Request):
    path = Path(__file__).resolve().parent.parent / 'data' / 'retail_sales.csv'
    return ingest(path.read_bytes(), path.name, request.state.owner)


@app.get('/api/datasets')
def session_datasets(request: Request):
    with store.lock:
        store.cleanup()
        return {'datasets': [{'dataset_id': d['id'], 'filename': d['filename']} for d in store._datasets.values() if secrets.compare_digest(d['owner'], request.state.owner)]}


@app.get('/api/analysis/{key}')
def analysis(key: str, request: Request):
    with store.lock: return report(dataset(request, key))


@app.delete('/api/datasets/{key}')
def delete(key: str, request: Request):
    with store.lock:
        dataset(request, key); store.delete(key)
    return {'success': True}


class SheetRequest(BaseModel):
    dataset_id: str
    sheet_name: str = Field(max_length=100)


@app.post('/api/switch-sheet')
def switch_sheet(req: SheetRequest, request: Request):
    with store.lock:
        d = dataset(request, req.dataset_id)
        if not d['source']: raise ValueError('Choose an Excel workbook to switch sheets.')
        df, _, active = parse_uploaded_file(d['source'], d['filename'], req.sheet_name)
        if df.empty: raise ValueError('Choose a worksheet containing data.')
        additional = int(df.memory_usage(deep=True).sum()) * 2
        replaced = sum(int(frame.memory_usage(deep=True).sum()) for frame in [d['df'], d['cleaned_df'], *d['undo']])
        if store.size() - replaced + additional > store.max_bytes: raise ValueError('Memory capacity reached.')
        d.update(df=df.copy(), cleaned_df=df, active_sheet=active, undo=[], revision=d['revision'] + 1)
        return report(d)


class QueryRequest(BaseModel):
    dataset_id: str
    x_col: str
    y_col: str | None = None
    agg_func: Literal['sum', 'mean', 'avg', 'count', 'min', 'max', 'median'] = 'sum'
    limit: int = Field(default=15, ge=1, le=100)


@app.post('/api/query')
def query(req: QueryRequest, request: Request):
    with store.lock:
        d = dataset(request, req.dataset_id)
        return {'success': True, 'data': query_aggregation(d['cleaned_df'], req.x_col, req.y_col, req.agg_func, req.limit)}


class CleaningOperation(BaseModel):
    model_config = ConfigDict(extra='forbid')
    kind: Literal['duplicates', 'fill', 'replace', 'drop_rows', 'drop_columns', 'rename', 'trim', 'lower', 'upper', 'title', 'find_replace', 'convert', 'date', 'empty_rows', 'empty_columns', 'column_names', 'detect_outliers', 'remove_outliers', 'cap_outliers', 'split', 'merge']
    column: str = Field(default='', max_length=300)
    value: str = Field(default='', max_length=10000)
    replacement: str = Field(default='', max_length=10000)
    method: Literal['mean', 'median', 'mode', 'custom'] = 'median'
    columns: list[str] = Field(default_factory=list, max_length=200)


class CleanRequest(BaseModel):
    dataset_id: str
    operations: list[CleaningOperation] = Field(default_factory=list, max_length=201)
    action: Literal['preview', 'apply', 'undo', 'reset'] = 'preview'
    revision: int = Field(ge=0)


def preview_frame(df):
    return {'rows': len(df), 'columns': list(df.columns), 'missing': int(df.isna().sum().sum()),
        'records': sanitize_val(df.head(10).to_dict(orient='records'))}


@app.post('/api/clean')
def clean(req: CleanRequest, request: Request):
    with store.lock:
        d = dataset(request, req.dataset_id)
        if req.revision != d['revision']: raise HTTPException(409, 'Dataset changed. Refresh the preview before applying.')
        if req.action == 'undo':
            if not d['undo']: raise ValueError('No valid values in undo history; reset to the original instead.')
            d['cleaned_df'] = d['undo'].pop(); d['revision'] += 1
            return report(d)
        if req.action == 'reset':
            store.update_df(req.dataset_id, d['df'])
            return report(d)
        before = d['cleaned_df']
        after = transform(before, [op.model_dump() for op in req.operations])
        preview = {'before': preview_frame(before), 'after': preview_frame(after), 'revision': d['revision']}
        if req.action == 'preview': return dict(success=True, **preview)
        store.update_df(req.dataset_id, after)
        return dict(**report(d), preview=preview)


@app.get('/api/preview/{key}')
def preview(key: str, request: Request, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200),
    search: str = Query('', max_length=200), sort_col: str = '', sort_dir: Literal['asc', 'desc'] = 'asc'):
    with store.lock:
        df = dataset(request, key)['cleaned_df']
        if search:
            mask = pd.Series(False, index=df.index)
            for col in df: mask |= df[col].astype('string').str.contains(search, case=False, regex=False, na=False)
            df = df.loc[mask]
        if sort_col:
            if sort_col not in df: raise ValueError('Select an existing sort column.')
            try: df = df.sort_values(sort_col, ascending=sort_dir == 'asc', kind='stable')
            except TypeError: df = df.sort_values(sort_col, key=lambda s: s.astype('string'), ascending=sort_dir == 'asc', kind='stable')
        pages = max(1, math.ceil(len(df) / page_size)); page = min(page, pages)
        return dict(page=page, page_size=page_size, total_records=len(df), total_pages=pages,
            columns=list(df.columns), records=sanitize_val(df.iloc[(page-1)*page_size:page*page_size].to_dict('records')))


@app.get('/api/export/{key}')
def export(key: str, request: Request, format: Literal['csv', 'xlsx', 'json'] = 'xlsx'):
    with store.lock:
        d = dataset(request, key)
        buf, media = export_dataframe_bytes(d['cleaned_df'], format)
        name = re.sub(r'[^\w. -]', '_', d['filename'].rsplit('.', 1)[0]) + '_result.' + format
    return StreamingResponse(buf, media_type=media,
        headers={'Content-Disposition': "attachment; filename=dataset." + format + "; filename*=UTF-8''" + quote(name)})


# ---------------------------------------------------------------------------
# File Tool Endpoints — wires tools_engine.py to the frontend OmniTools
# ---------------------------------------------------------------------------

class JsonFormatRequest(BaseModel):
    raw_json: str = Field(max_length=500_000)
    indent: int = Field(default=2, ge=1, le=8)
    minify: bool = False


@app.post('/api/tools/format-json')
async def tool_format_json(req: JsonFormatRequest):
    result = await run_file_tool(format_json_string, req.raw_json, req.indent, req.minify)
    return {'success': True, 'result': result}


@app.post('/api/tools/csv-to-excel')
async def tool_csv_to_excel(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(csv_to_excel_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.xlsx')})


@app.post('/api/tools/excel-to-csv')
async def tool_excel_to_csv(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(excel_to_csv_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.csv')})


@app.post('/api/tools/excel-to-pdf')
async def tool_excel_to_pdf(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(excel_to_pdf_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.pdf')})


@app.post('/api/tools/csv-to-json')
async def tool_csv_to_json(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(csv_to_json_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.json')})


@app.post('/api/tools/json-to-csv')
async def tool_json_to_csv(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(json_to_csv_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.csv')})


@app.post('/api/tools/pdf-to-excel')
async def tool_pdf_to_excel(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(pdf_to_excel_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.xlsx')})


@app.post('/api/tools/merge-pdf')
async def tool_merge_pdf(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, 'Select at least 2 PDF files to merge.')
    contents = [await read_upload(f) for f in files]
    buf, media = await run_file_tool(merge_pdfs_bytes, contents)
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': 'attachment; filename="merged.pdf"'})


@app.post('/api/tools/compress-pdf')
async def tool_compress_pdf(file: UploadFile = File(...)):
    content = await read_upload(file)
    orig_size = len(content)
    buf, media = await run_file_tool(compress_pdf_bytes, content)
    comp_size = len(buf.getvalue())
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'document').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={
        'Content-Disposition': attachment(f'{stem}_compressed.pdf'),
        'X-Original-Size': str(orig_size),
        'X-Compressed-Size': str(comp_size),
        'Access-Control-Expose-Headers': 'X-Original-Size, X-Compressed-Size'
    })


@app.post('/api/tools/pdf-to-jpg')
async def tool_pdf_to_jpg(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media, filename = await run_file_tool(pdf_to_jpg_bytes, content)
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{filename}')})


@app.post('/api/tools/jpg-to-pdf')
async def tool_jpg_to_pdf(files: list[UploadFile] = File(...)):
    contents = [await read_upload(f) for f in files]
    buf, media = await run_file_tool(jpg_to_pdf_bytes, contents)
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': 'attachment; filename="images.pdf"'})


@app.post('/api/tools/jpg-to-png')
async def tool_jpg_to_png(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(jpg_to_png_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'image').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.png')})


@app.post('/api/tools/png-to-jpg')
async def tool_png_to_jpg(file: UploadFile = File(...)):
    content = await read_upload(file)
    buf, media = await run_file_tool(png_to_jpg_bytes, content)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'image').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}.jpg')})


@app.post('/api/tools/compress-image')
async def tool_compress_image(file: UploadFile = File(...), quality: int = Form(75)):
    if not 10 <= quality <= 95:
        raise HTTPException(400, 'Quality must be between 10 and 95.')
    content = await read_upload(file)
    buf, media, orig_size, comp_size = await run_file_tool(compress_image_bytes, content, quality)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'image').rsplit('.', 1)[0])
    ext = 'jpg' if 'jpeg' in media else 'png'
    return StreamingResponse(buf, media_type=media, headers={
        'Content-Disposition': attachment(f'{stem}_compressed.{ext}'),
        'X-Original-Size': str(orig_size),
        'X-Compressed-Size': str(comp_size),
        'Access-Control-Expose-Headers': 'X-Original-Size, X-Compressed-Size'
    })


@app.post('/api/tools/resize-image')
async def tool_resize_image(
    file: UploadFile = File(...),
    width: int | None = Form(None),
    height: int | None = Form(None),
    scale_pct: int | None = Form(None)
):
    content = await read_upload(file)
    buf, media, orig_dims, new_dims = await run_file_tool(resize_image_bytes, content, width, height, scale_pct)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'image').rsplit('.', 1)[0])
    ext = media.split('/')[-1].replace('jpeg', 'jpg')
    return StreamingResponse(buf, media_type=media, headers={'Content-Disposition': attachment(f'{stem}_{new_dims[0]}x{new_dims[1]}.{ext}')})


@app.post('/api/tools/analyze-csv')
async def tool_analyze_csv(file: UploadFile = File(...)):
    content = await read_upload(file)
    analysis = await run_file_tool(analyze_csv_data, content)
    return {'success': True, 'analysis': analysis}


@app.post('/api/tools/analyze-excel')
async def tool_analyze_excel(file: UploadFile = File(...)):
    content = await read_upload(file)
    analysis = await run_file_tool(analyze_excel_data, content)
    return {'success': True, 'analysis': analysis}


@app.post('/api/tools/clean-csv')
async def tool_clean_csv(
    file: UploadFile = File(...),
    trim_whitespace: str = Form('true'),
    drop_empty_rows: str = Form('true'),
    drop_empty_cols: str = Form('true')
):
    content = await read_upload(file)
    trim = trim_whitespace.lower() == 'true'
    drop_rows = drop_empty_rows.lower() == 'true'
    drop_cols = drop_empty_cols.lower() == 'true'
    buf, media, rows_removed, cols_removed = await run_file_tool(clean_csv_data, content, trim, drop_rows, drop_cols)
    stem = re.sub(r'[^\w. -]', '_', (file.filename or 'data').rsplit('.', 1)[0])
    return StreamingResponse(buf, media_type=media, headers={
        'Content-Disposition': attachment(f'{stem}_cleaned.csv'),
        'X-Rows-Removed': str(rows_removed),
        'Access-Control-Expose-Headers': 'X-Rows-Removed'
    })


@app.post('/api/tools/remove-duplicates')
async def tool_remove_duplicates(file: UploadFile = File(...)):
    content = await read_upload(file)
    filename = file.filename or 'data.csv'
    buf, media, dups_removed = await run_file_tool(remove_duplicate_rows, content, filename)
    stem = re.sub(r'[^\w. -]', '_', filename.rsplit('.', 1)[0])
    ext = 'xlsx' if filename.lower().endswith(('.xlsx', '.xls')) else 'csv'
    return StreamingResponse(buf, media_type=media, headers={
        'Content-Disposition': attachment(f'{stem}_deduped.{ext}'),
        'X-Duplicates-Removed': str(dups_removed),
        'Access-Control-Expose-Headers': 'X-Duplicates-Removed'
    })


# Built frontend and prerendered tool pages are served from the same origin.
DIST = Path(__file__).resolve().parent.parent / 'frontend' / 'dist'
if (DIST / 'assets').is_dir(): app.mount('/assets', StaticFiles(directory=DIST / 'assets'), name='assets')


@app.get('/{path:path}')
def frontend(path: str):
    if path.startswith('api/'): raise HTTPException(404, 'API endpoint not found.')
    if not DIST.is_dir(): raise HTTPException(404, 'Build the frontend or use the Vite development server.')
    target = (DIST / path).resolve()
    if not target.is_relative_to(DIST.resolve()): raise HTTPException(404)
    # Serve assets and prerendered pages without treating missing routes as the homepage.
    if target.is_file() and target.name != 'index.html':
        return FileResponse(target)
    if path and '/' not in path and (DIST / 'tools' / path / 'index.html').is_file():
        return RedirectResponse('/tools/' + path, status_code=308)
    if (target / 'index.html').is_file():
        return FileResponse(target / 'index.html')
    legacy = {'ai-data-analyst', 'chart-builder', 'data-profiler', 'data-table',
        'excel-to-pdf', 'csv-to-json', 'json-to-csv', 'pdf-to-excel', 'merge-pdf',
        'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'jpg-to-png', 'png-to-jpg',
        'image-compressor', 'image-resizer', 'sgpa-calculator', 'cgpa-to-percentage',
        'percentage-to-cgpa', 'overall-cgpa-calculator', 'calculator', 'scientific-calculator',
        'csv-analyzer', 'excel-analyzer', 'csv-cleaner', 'duplicate-remover', 'json-formatter',
        'clean-csv', 'remove-duplicates', 'format-json'}
    if path.removeprefix('tools/').rstrip('/') in legacy:
        return FileResponse(DIST / 'index.html')
    raise HTTPException(404, 'Page not found.')
