"""Bounded in-memory datasets. One process; use sticky routing or shared storage to scale."""
import io
import csv
import json
import secrets
import threading
import time
import zipfile
import pandas as pd

MAX_BYTES = 10 * 1024 * 1024
MAX_ROWS = 100_000
MAX_COLS = 200
MAX_CELLS = 2_000_000


def validate_frame(df):
    if len(df) > MAX_ROWS or len(df.columns) > MAX_COLS or df.size > MAX_CELLS:
        raise ValueError('Use at most 100,000 rows, 200 columns and 2 million cells.')
    if df.memory_usage(deep=True).sum() > 32 * 1024 * 1024:
        raise ValueError('Dataset exceeds the 32 MB decoded memory limit.')
    df.columns = [str(c) for c in df.columns]
    if any(len(c) > 300 for c in df.columns):
        raise ValueError('Column names must be no longer than 300 characters.')
    if not df.columns.is_unique:
        raise ValueError('Column names must be unique.')
    return df


def parse_uploaded_file(content, filename, sheet_name=None):
    if not content or len(content) > MAX_BYTES:
        raise ValueError('Choose a non-empty file no larger than 10 MB.')
    ext = filename.lower().rsplit('.', 1)[-1]
    if ext == 'xlsx':
        if not zipfile.is_zipfile(io.BytesIO(content)):
            raise ValueError('Invalid XLSX workbook. Save the file as XLSX and try again.')
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            entries = archive.infolist()
            if len(entries) > 2000 or sum(e.file_size for e in entries) > 50 * 1024 * 1024:
                raise ValueError('Workbook expanded size exceeds the safe limit.')
            if '[Content_Types].xml' not in archive.namelist():
                raise ValueError('Invalid XLSX workbook.')
        with pd.ExcelFile(io.BytesIO(content), engine='openpyxl') as book:
            sheets = book.sheet_names
            if len(sheets) > 100:
                raise ValueError('Use a workbook with at most 100 sheets.')
            active = sheet_name or sheets[0]
            if active not in sheets:
                raise ValueError('That worksheet does not exist.')
            worksheet = book.book[active]
            if (worksheet.max_row or 0) > MAX_ROWS + 1 or (worksheet.max_column or 0) > MAX_COLS or (worksheet.max_row or 0) * (worksheet.max_column or 0) > MAX_CELLS + MAX_COLS:
                raise ValueError('Use at most 100,000 rows, 200 columns and 2 million cells per worksheet.')
            header = next(worksheet.iter_rows(min_row=1, max_row=1, values_only=True), ())
            names = [str(v) if v is not None else '' for v in header]
            if any(not name.strip() for name in names) or len(set(names)) != len(names):
                raise ValueError('Column names must be non-empty and unique.')
            df = book.parse(active, nrows=MAX_ROWS + 1)
    elif ext == 'csv':
        if b'\x00' in content:
            raise ValueError('Use UTF-8 or Latin-1 CSV text, not a binary file.')
        sheets, active = ['CSV Data'], 'CSV Data'
        try: text = content.decode('utf-8-sig')
        except UnicodeDecodeError: text = content.decode('latin1')
        reader = csv.reader(io.StringIO(text), strict=True)
        try:
            header = next(reader, [])
            if len(header) > MAX_COLS:
                raise ValueError('Use at most 200 columns.')
            if not header or any(not h.strip() for h in header) or len(set(header)) != len(header):
                raise ValueError('Column names must be non-empty and unique.')
            count = 0
            for row in reader:
                if not row: continue
                count += 1
                if len(row) != len(header):
                    raise ValueError('Use consistent CSV row widths matching the header.')
                if count > MAX_ROWS or count * len(header) > MAX_CELLS:
                    raise ValueError('Use at most 100,000 rows and 2 million cells.')
        except csv.Error:
            raise ValueError('Use valid CSV quoting and fields shorter than 128 KB.')
        try:
            df = pd.read_csv(io.BytesIO(content), nrows=MAX_ROWS + 1, encoding='utf-8-sig')
        except UnicodeDecodeError:
            df = pd.read_csv(io.BytesIO(content), nrows=MAX_ROWS + 1, encoding='latin1')
    elif ext == 'json':
        def reject_constant(value):
            raise ValueError('Use valid JSON numbers, without NaN or Infinity.')
        data = json.loads(content.decode('utf-8-sig'), parse_constant=reject_constant)
        if not isinstance(data, list) or not all(isinstance(r, dict) for r in data):
            raise ValueError('Use a JSON array of objects.')
        if len(data) > MAX_ROWS:
            raise ValueError('Use at most 100,000 rows.')
        # Flatten one record at a time and reject growing schemas before allocating a wide matrix.
        names, records = set(), []
        def flatten(record, prefix='', depth=0):
            if depth > 10: raise ValueError('Use JSON nested no deeper than ten levels.')
            result = {}
            for k, v in record.items():
                name = prefix + str(k)
                values = flatten(v, name + '.', depth + 1) if isinstance(v, dict) else {name: v}
                if set(values) & set(result): raise ValueError('Column names must remain unique after JSON flattening.')
                result.update(values)
                if len(result) > MAX_COLS: raise ValueError('Use at most 200 columns.')
            return result
        for row in data:
            row = flatten(row)
            names.update(row)
            if len(names) > MAX_COLS or len(names) * len(data) > MAX_CELLS:
                raise ValueError('Use at most 200 columns and 2 million cells.')
            records.append(row)
        df = pd.DataFrame.from_records(records)
        for c in df:
            df[c] = df[c].map(lambda x: json.dumps(x, ensure_ascii=False) if isinstance(x, (list, dict)) else x)
        sheets, active = ['JSON Data'], 'JSON Data'
    else:
        raise ValueError('Supported formats are CSV, XLSX and JSON. Save legacy XLS as XLSX first.')
    return validate_frame(df), sheets, active


class DatasetStore:
    def __init__(self, ttl=3600, max_bytes=256 * 1024 * 1024):
        self._datasets = {}
        self.ttl, self.max_bytes = ttl, max_bytes
        self.lock = threading.RLock()

    def cleanup(self):
        with self.lock:
            for key in list(self._datasets):
                if self._datasets[key]['expires'] <= time.monotonic():
                    del self._datasets[key]

    def size(self):
        return sum(len(d.get('source', b'')) + sum(int(f.memory_usage(deep=True).sum()) for f in [d['df'], d['cleaned_df'], *d['undo']]) for d in self._datasets.values())

    def save(self, df, filename, sheets=None, active_sheet=None, owner='', source=b''):
        with self.lock:
            self.cleanup()
            needed = int(df.memory_usage(deep=True).sum()) * 2 + len(source)
            if len(self._datasets) >= 32 or sum(d['owner'] == owner for d in self._datasets.values()) >= 5 or self.size() + needed > self.max_bytes:
                raise ValueError('Dataset capacity reached. Delete an earlier dataset and try again.')
            key = secrets.token_urlsafe(32)
            self._datasets[key] = dict(id=key, filename=filename, sheets=sheets or [], active_sheet=active_sheet,
                df=df.copy(), cleaned_df=df.copy(), source=source, owner=owner, expires=time.monotonic() + self.ttl,
                undo=[], revision=0)
            return key

    def get(self, key):
        with self.lock:
            self.cleanup()
            return self._datasets.get(key)

    def update_df(self, key, df, action=''):
        validate_frame(df)
        d = self._datasets[key]
        evicted = int(d['undo'][0].memory_usage(deep=True).sum()) if len(d['undo']) == 3 else 0
        if self.size() - evicted + int(df.memory_usage(deep=True).sum()) > self.max_bytes:
            raise ValueError('Memory capacity reached. Delete an earlier dataset and retry.')
        d['undo'] = (d['undo'] + [d['cleaned_df']])[-3:]
        d['cleaned_df'] = df.copy()
        d['revision'] += 1

    def delete(self, key):
        with self.lock:
            self._datasets.pop(key, None)
