import io
import json
import zipfile
import pandas as pd
from typing import List, Optional, Tuple, Dict, Any
from PIL import Image
import pymupdf as fitz
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from server.storage import parse_uploaded_file, validate_frame
from server.analytics_engine import export_dataframe_bytes, sanitize_val
from server.cleaning import transform


def csv_to_excel_bytes(file_bytes: bytes):
    df, _, _ = parse_uploaded_file(file_bytes, 'data.csv')
    return export_dataframe_bytes(df, 'xlsx')


def excel_to_csv_bytes(file_bytes: bytes, sheet_name=None):
    df, _, _ = parse_uploaded_file(file_bytes, 'data.xlsx', sheet_name)
    return export_dataframe_bytes(df, 'csv')


def excel_to_pdf_bytes(file_bytes: bytes, max_rows: int = 200) -> Tuple[io.BytesIO, str]:
    """Converts Excel/CSV table data to a formatted PDF document."""
    filename = 'data.xlsx' if zipfile.is_zipfile(io.BytesIO(file_bytes)) else 'data.csv'
    df, _, _ = parse_uploaded_file(file_bytes, filename)

    df_subset = df.head(max_rows)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(letter), rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
    elements = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=10
    )
    elements.append(Paragraph(f"Exported Document Table (Showing top {len(df_subset)} records)", title_style))
    elements.append(Spacer(1, 10))

    # Convert DataFrame to table data
    table_data = [[str(col) for col in df_subset.columns]]
    for _, row in df_subset.iterrows():
        table_data.append([str(v) if pd.notna(v) else "" for v in row])

    # Table styling
    t = Table(table_data, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('FONTSIZE', (0, 1), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(t)
    doc.build(elements)
    buf.seek(0)
    return buf, "application/pdf"


def csv_to_json_bytes(file_bytes: bytes, orient='records'):
    df, _, _ = parse_uploaded_file(file_bytes, 'data.csv')
    if orient != 'records': raise ValueError('Choose records JSON orientation.')
    return export_dataframe_bytes(df, 'json')


def json_to_csv_bytes(file_bytes: bytes):
    df, _, _ = parse_uploaded_file(file_bytes, 'data.json')
    return export_dataframe_bytes(df, 'csv')


def pdf_to_excel_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    """Extracts text and tabular content from PDF into an Excel spreadsheet."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    all_pages_data = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        tables = page.find_tables()
        if tables and tables.tables:
            for t_idx, table in enumerate(tables.tables):
                extracted = table.extract()
                if extracted and len(extracted) > 1:
                    headers = extracted[0]
                    rows = extracted[1:]
                    df = pd.DataFrame(rows, columns=[h or f"Col_{i}" for i, h in enumerate(headers)])
                    all_pages_data.append((f"Page{page_num+1}_Table{t_idx+1}", df))
        else:
            # Fallback: extract line blocks as rows
            text = page.get_text("text")
            lines = [l.strip() for l in text.split("\n") if l.strip()]
            if lines:
                df = pd.DataFrame({"Content": lines})
                all_pages_data.append((f"Page_{page_num+1}", df))

    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        if all_pages_data:
            for sheet_name, df in all_pages_data[:15]:
                clean_sheet = sheet_name[:31]
                df.to_excel(writer, index=False, sheet_name=clean_sheet)
        else:
            pd.DataFrame({"Note": ["No extractable tables found in PDF"]}).to_excel(writer, index=False, sheet_name="Summary")

    buf.seek(0)
    return buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def merge_pdfs_bytes(pdf_bytes_list: List[bytes]) -> Tuple[io.BytesIO, str]:
    """Combines multiple PDF files into a single consolidated PDF."""
    writer = PdfWriter()
    for b in pdf_bytes_list:
        reader = PdfReader(io.BytesIO(b))
        for page in reader.pages:
            writer.add_page(page)

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf, "application/pdf"


def compress_pdf_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    """Compresses PDF streams and reduces redundant structures."""
    reader = PdfReader(io.BytesIO(file_bytes))
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)
        writer.pages[-1].compress_content_streams()

    buf = io.BytesIO()
    writer.write(buf)
    buf.seek(0)
    return buf, "application/pdf"


def pdf_to_jpg_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str, str]:
    """
    Renders PDF pages as high-quality JPG images.
    Returns single JPG if 1 page, or a ZIP of JPGs if multiple pages.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    num_pages = len(doc)

    if num_pages == 1:
        page = doc[0]
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("jpeg")
        buf = io.BytesIO(img_bytes)
        buf.seek(0)
        return buf, "image/jpeg", "page_1.jpg"

    # Multi-page: Bundle into ZIP
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for idx in range(num_pages):
            pix = doc[idx].get_pixmap(dpi=150)
            zf.writestr(f"page_{idx+1}.jpg", pix.tobytes("jpeg"))

    zip_buf.seek(0)
    return zip_buf, "application/zip", "pdf_pages.zip"


def jpg_to_pdf_bytes(image_bytes_list: List[bytes]) -> Tuple[io.BytesIO, str]:
    """Combines one or more JPG images into a single clean PDF document."""
    pil_images = []
    for b in image_bytes_list:
        img = Image.open(io.BytesIO(b))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        pil_images.append(img)

    buf = io.BytesIO()
    if pil_images:
        first_img = pil_images[0]
        other_imgs = pil_images[1:]
        first_img.save(buf, format="PDF", save_all=True, append_images=other_imgs)

    buf.seek(0)
    return buf, "application/pdf"


def jpg_to_png_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    """Converts JPG image to PNG format."""
    img = Image.open(io.BytesIO(file_bytes))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf, "image/png"


def png_to_jpg_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    """Converts PNG image to JPG format, cleanly flattening alpha background."""
    img = Image.open(io.BytesIO(file_bytes))
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[3])
        img = bg
    else:
        img = img.convert("RGB")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    return buf, "image/jpeg"


def compress_image_bytes(file_bytes: bytes, quality: int = 70) -> Tuple[io.BytesIO, str, int, int]:
    """Compresses JPEG or PNG image with quality slider."""
    orig_size = len(file_bytes)
    img = Image.open(io.BytesIO(file_bytes))
    fmt = "JPEG" if img.format == "JPEG" or img.mode == "RGB" else "PNG"
    
    buf = io.BytesIO()
    if fmt == "JPEG":
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        media_type = "image/jpeg"
    else:
        # PNG compression
        img.save(buf, format="PNG", optimize=True)
        media_type = "image/png"

    buf.seek(0)
    new_size = len(buf.getvalue())
    return buf, media_type, orig_size, new_size


def resize_image_bytes(file_bytes: bytes, width: Optional[int] = None, height: Optional[int] = None, scale_pct: Optional[int] = None) -> Tuple[io.BytesIO, str, Tuple[int, int], Tuple[int, int]]:
    """Resizes image to specific dimensions or scale percentage."""
    img = Image.open(io.BytesIO(file_bytes))
    orig_dims = img.size

    if scale_pct:
        factor = scale_pct / 100.0
        new_w = max(1, int(orig_dims[0] * factor))
        new_h = max(1, int(orig_dims[1] * factor))
    elif width and height:
        new_w = width
        new_h = height
    elif width:
        aspect = orig_dims[1] / orig_dims[0]
        new_w = width
        new_h = max(1, int(width * aspect))
    elif height:
        aspect = orig_dims[0] / orig_dims[1]
        new_h = height
        new_w = max(1, int(height * aspect))
    else:
        new_w, new_h = orig_dims

    if any(v is not None and v <= 0 for v in (width, height, scale_pct)):
        raise ValueError('Enter positive image dimensions or scale.')
    if new_w * new_h > 20_000_000 or max(new_w, new_h) > 16_384:
        raise ValueError('Use image dimensions up to 16,384 pixels and 20 million pixels total.')
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    fmt = img.format if img.format else "PNG"
    resized.save(buf, format=fmt)
    buf.seek(0)

    media_type = f"image/{fmt.lower()}"
    return buf, media_type, orig_dims, (new_w, new_h)


def analyze_csv_data(file_bytes: bytes) -> Dict[str, Any]:
    """Generates an instant in-depth structural analysis of a CSV file."""
    df, _, _ = parse_uploaded_file(file_bytes, 'data.csv')

    total_rows = len(df)
    total_cols = len(df.columns)
    null_cells = int(df.isna().sum().sum())
    dup_rows = int(df.duplicated().sum())

    cols_info = []
    for col in df.columns:
        s = df[col]
        cols_info.append({
            "name": str(col),
            "dtype": str(s.dtype),
            "nulls": int(s.isna().sum()),
            "null_pct": round((int(s.isna().sum()) / max(total_rows, 1)) * 100, 1),
            "unique": int(s.nunique())
        })

    return {
        "file_type": "CSV",
        "rows": total_rows,
        "columns": total_cols,
        "null_cells": null_cells,
        "completeness_pct": round(((total_rows * total_cols - null_cells) / max(total_rows * total_cols, 1)) * 100, 2),
        "duplicates": dup_rows,
        "columns_detail": cols_info,
        "preview": sanitize_val(df.head(10).to_dict(orient="records"))
    }


def analyze_excel_data(file_bytes: bytes) -> Dict[str, Any]:
    """Generates an in-depth multi-sheet analysis of an Excel file."""
    first, sheets, active = parse_uploaded_file(file_bytes, 'data.xlsx')
    sheets_info = []

    for name in sheets:
        df = first if name == active else parse_uploaded_file(file_bytes, 'data.xlsx', name)[0]
        sheets_info.append({
            "sheet_name": name,
            "rows": len(df),
            "cols": len(df.columns),
            "null_cells": int(df.isna().sum().sum()),
            "duplicates": int(df.duplicated().sum()),
            "columns": list(df.columns)
        })

    return {
        "file_type": "Excel Workbook",
        "total_sheets": len(sheets),
        "sheet_names": sheets,
        "sheets": sheets_info
    }


def clean_csv_data(file_bytes: bytes, trim_whitespace=True, drop_empty_rows=True, drop_empty_cols=True):
    df, _, _ = parse_uploaded_file(file_bytes, 'data.csv')
    orig_rows, orig_cols = df.shape
    if trim_whitespace:
        df.columns = [c.strip() for c in df.columns]
        validate_frame(df)
        df = df.map(lambda v: v.strip() if isinstance(v, str) else v)
    operations = []
    if drop_empty_rows: operations.append({'kind': 'empty_rows'})
    if drop_empty_cols: operations.append({'kind': 'empty_columns'})
    df = transform(df, operations)
    buf, media = export_dataframe_bytes(df, 'csv')
    return buf, media, orig_rows - len(df), orig_cols - len(df.columns)


def remove_duplicate_rows(file_bytes: bytes, filename: str):
    df, _, _ = parse_uploaded_file(file_bytes, filename)
    cleaned = df.drop_duplicates()
    buf, media = export_dataframe_bytes(cleaned, 'xlsx' if filename.lower().endswith('.xlsx') else 'csv')
    return buf, media, len(df) - len(cleaned)


def format_json_string(raw_json: str, indent: int = 2, minify: bool = False) -> Dict[str, Any]:
    """Validates and formats (beautifies or minifies) JSON string."""
    try:
        def invalid_constant(value):
            raise ValueError('Invalid JSON number: ' + value)
        parsed = json.loads(raw_json, parse_constant=invalid_constant)
        if minify:
            formatted = json.dumps(parsed, separators=(',', ':'))
        else:
            formatted = json.dumps(parsed, indent=indent)
        return {
            "valid": True,
            "formatted": formatted,
            "keys_count": len(parsed) if isinstance(parsed, dict) else len(parsed) if isinstance(parsed, list) else 1,
            "type": "array" if isinstance(parsed, list) else "object" if isinstance(parsed, dict) else "primitive"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "formatted": raw_json
        }
