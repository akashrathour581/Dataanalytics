import io
import json
import zipfile
import pandas as pd
from typing import List, Optional, Tuple, Dict, Any
from PIL import Image
import pymupdf as fitz
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
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


def word_to_pdf_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    """Converts .docx to PDF using Microsoft Word (via win32com / docx2pdf) on Windows
    for pixel-perfect formatting preservation including images, fonts, tables.
    Falls back to ReportLab-based rendering if Word is unavailable."""
    import tempfile, os

    # --- Primary: win32com direct MS Word COM automation (most reliable) ---
    try:
        import win32com.client
        import pythoncom
        with tempfile.TemporaryDirectory() as tmpdir:
            in_path  = os.path.abspath(os.path.join(tmpdir, 'input.docx'))
            out_path = os.path.abspath(os.path.join(tmpdir, 'output.pdf'))
            with open(in_path, 'wb') as f:
                f.write(file_bytes)
            pythoncom.CoInitialize()
            try:
                word = win32com.client.Dispatch('Word.Application')
                word.Visible = False
                word.DisplayAlerts = False
                doc = word.Documents.Open(in_path)
                doc.SaveAs(out_path, FileFormat=17)  # 17 = wdFormatPDF
                doc.Close()
                word.Quit()
            finally:
                pythoncom.CoUninitialize()
            with open(out_path, 'rb') as f:
                pdf_bytes = f.read()
        buf = io.BytesIO(pdf_bytes)
        buf.seek(0)
        return buf, 'application/pdf'
    except Exception:
        pass  # Fall through to docx2pdf

    # --- Secondary: docx2pdf (also uses MS Word COM) ---
    try:
        from docx2pdf import convert
        with tempfile.TemporaryDirectory() as tmpdir:
            in_path  = os.path.join(tmpdir, 'input.docx')
            out_path = os.path.join(tmpdir, 'output.pdf')
            with open(in_path, 'wb') as f:
                f.write(file_bytes)
            convert(in_path, out_path)
            with open(out_path, 'rb') as f:
                pdf_bytes = f.read()
        buf = io.BytesIO(pdf_bytes)
        buf.seek(0)
        return buf, 'application/pdf'
    except Exception:
        pass  # Fall through to ReportLab fallback

    # --- Last resort: ReportLab manual render ---
    return _word_to_pdf_reportlab(file_bytes)


def _word_to_pdf_reportlab(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import Image as RLImage
    from docx.enum.text import WD_ALIGN_PARAGRAPH as WDA
    from docx.oxml.ns import qn
    from docx.table import Table as DocxTable
    from docx.text.paragraph import Paragraph as DocxPara

    doc = Document(io.BytesIO(file_bytes))
    buf = io.BytesIO()
    page_w = A4[0]
    page_h = A4[1]
    margin = 22 * mm
    usable_w = page_w - 2 * margin

    pdf_doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=margin, leftMargin=margin,
        topMargin=margin, bottomMargin=margin,
    )

    _style_counter = [0]
    def _ps(**kw):
        _style_counter[0] += 1
        return ParagraphStyle(f'_s{_style_counter[0]}', **kw)

    def _esc(t):
        return t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

    _align = {
        WDA.LEFT: TA_LEFT, WDA.CENTER: TA_CENTER,
        WDA.RIGHT: TA_RIGHT, WDA.JUSTIFY: TA_JUSTIFY,
        WDA.DISTRIBUTE: TA_JUSTIFY, None: TA_LEFT,
    }
    _heading_cfg = {
        'Title':     (26, True,  TA_CENTER, 14, 8,  0),
        'Subtitle':  (16, False, TA_CENTER,  6, 6,  0),
        'Heading 1': (20, True,  TA_LEFT,   12, 6,  0),
        'Heading 2': (16, True,  TA_LEFT,   10, 5,  0),
        'Heading 3': (13, True,  TA_LEFT,    8, 4,  0),
        'Heading 4': (12, True,  TA_LEFT,    6, 3,  0),
        'Heading 5': (11, True,  TA_LEFT,    5, 2,  0),
        'Heading 6': (10, True,  TA_LEFT,    4, 2,  0),
    }

    # Build a rId -> image bytes map from the document's part relationships
    def _build_image_map():
        img_map = {}
        try:
            part = doc.part
            for rel in part.rels.values():
                if 'image' in rel.reltype:
                    try:
                        img_map[rel.rId] = rel.target_part.blob
                    except Exception:
                        pass
        except Exception:
            pass
        return img_map

    _image_map = _build_image_map()

    def _extract_images_from_element(xml_elem):
        """Extract all image rIds from an XML element (paragraph or body)."""
        found = []
        # inline images: a:blip r:embed
        for blip in xml_elem.iter(qn('a:blip')):
            rId = blip.get(qn('r:embed'))
            if rId and rId in _image_map:
                found.append(rId)
        # linked images: r:link
        for blip in xml_elem.iter(qn('a:blip')):
            rId = blip.get(qn('r:link'))
            if rId and rId in _image_map:
                found.append(rId)
        return found

    def _make_rl_image(img_bytes):
        """Create a ReportLab Image flowable from raw image bytes, fitted to page width."""
        try:
            pil_img = Image.open(io.BytesIO(img_bytes))
            orig_w, orig_h = pil_img.size
            # Convert to RGB/PNG for ReportLab compatibility
            if pil_img.mode in ('RGBA', 'P', 'LA'):
                bg = Image.new('RGB', pil_img.size, (255, 255, 255))
                if pil_img.mode in ('RGBA', 'LA'):
                    bg.paste(pil_img, mask=pil_img.split()[-1])
                else:
                    bg.paste(pil_img.convert('RGBA'), mask=pil_img.convert('RGBA').split()[-1])
                pil_img = bg
            elif pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            png_buf = io.BytesIO()
            pil_img.save(png_buf, format='PNG')
            png_buf.seek(0)
            # Scale to fit within usable width, maintain aspect ratio
            dpi = 96.0
            w_pts = (orig_w / dpi) * 72
            h_pts = (orig_h / dpi) * 72
            if w_pts > usable_w:
                scale = usable_w / w_pts
                w_pts = usable_w
                h_pts *= scale
            # Cap height to 60% of page height
            max_h = page_h * 0.6
            if h_pts > max_h:
                scale = max_h / h_pts
                h_pts = max_h
                w_pts *= scale
            rl_img = RLImage(png_buf, width=w_pts, height=h_pts)
            return rl_img
        except Exception:
            return None

    def _run_markup(run, base_sz, base_bold):
        text = _esc(run.text)
        if not text:
            return ''
        sz = base_sz
        try:
            if run.font.size and run.font.size.pt:
                sz = max(6.0, min(72.0, run.font.size.pt))
        except Exception:
            pass
        col = '#1e293b'
        try:
            if run.font.color and run.font.color.type is not None:
                r = run.font.color.rgb
                col = '#{:02x}{:02x}{:02x}'.format(r[0], r[1], r[2])
        except Exception:
            pass
        bold = run.bold if run.bold is not None else base_bold
        italic = run.italic if run.italic is not None else False
        under  = run.underline if run.underline is not None else False
        m = f'<font size="{sz:.1f}" color="{col}">{text}</font>'
        if under:  m = f'<u>{m}</u>'
        if italic: m = f'<i>{m}</i>'
        if bold:   m = f'<b>{m}</b>'
        return m

    def _build_para(para):
        sn = (para.style.name if para.style else 'Normal') or 'Normal'
        align = _align.get(para.alignment, TA_LEFT)
        sz, base_bold, fixed_align, sb, sa, li = 10.0, False, None, 2, 4, 0
        fn = 'Helvetica'
        if sn in _heading_cfg:
            sz, base_bold, fixed_align, sb, sa, li = _heading_cfg[sn]
            fn = 'Helvetica-Bold' if base_bold else 'Helvetica'
            align = fixed_align
        elif 'List' in sn:
            li = 14
        try:
            if para.style and para.style.font and para.style.font.size:
                sz = max(6.0, min(72.0, para.style.font.size.pt))
        except Exception:
            pass
        markup = ''.join(_run_markup(r, sz, base_bold) for r in para.runs).strip()
        if not markup:
            raw = _esc(para.text)
            if not raw.strip(): return None
            markup = raw
        ps = _ps(fontName=fn, fontSize=sz, leading=max(sz*1.35, sz+3),
                 alignment=align, spaceBefore=sb, spaceAfter=sa, leftIndent=li)
        try:
            return Paragraph(markup, ps)
        except Exception:
            ps2 = _ps(fontName=fn, fontSize=sz, leading=sz*1.35,
                      alignment=align, spaceBefore=sb, spaceAfter=sa, leftIndent=li)
            return Paragraph(_esc(para.text), ps2)

    def _build_table(tbl):
        data = []
        for row in tbl.rows:
            data.append([_esc(' '.join(p.text for p in c.paragraphs if p.text)) for c in row.cells])
        if not data: return None
        cw = [usable_w / max(len(r) for r in data)] * max(len(r) for r in data)
        t = Table(data, colWidths=cw, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#1e293b')),
            ('TEXTCOLOR',(0,0),(-1,0),colors.whitesmoke),
            ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
            ('FONTNAME',(0,1),(-1,-1),'Helvetica'),
            ('FONTSIZE',(0,0),(-1,-1),9),
            ('TOPPADDING',(0,0),(-1,-1),5),
            ('BOTTOMPADDING',(0,0),(-1,-1),5),
            ('LEFTPADDING',(0,0),(-1,-1),6),
            ('RIGHTPADDING',(0,0),(-1,-1),6),
            ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#f8fafc'),colors.HexColor('#eef2f7')]),
            ('GRID',(0,0),(-1,-1),0.5,colors.HexColor('#cbd5e1')),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ]))
        return t

    elements = []
    has_content = False
    seen_rids = set()

    for child in doc.element.body:
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        if tag == 'p':
            para = DocxPara(child, doc)
            sn = (para.style.name if para.style else '') or ''

            # --- Extract inline images first ---
            img_rids = _extract_images_from_element(child)
            for rId in img_rids:
                if rId not in seen_rids:
                    seen_rids.add(rId)
                    rl_img = _make_rl_image(_image_map[rId])
                    if rl_img:
                        elements.append(Spacer(1, 4))
                        elements.append(rl_img)
                        elements.append(Spacer(1, 4))
                        has_content = True

            if sn == 'Heading 1' and has_content:
                elements.append(HRFlowable(width='100%', thickness=0.75,
                    color=colors.HexColor('#94a3b8'), spaceAfter=2, spaceBefore=4))
            elem = _build_para(para)
            if elem:
                elements.append(elem)
                has_content = True
            else:
                if not img_rids:  # Only add spacer if no image was added
                    elements.append(Spacer(1, 3))
        elif tag == 'tbl':
            tbl_elem = _build_table(DocxTable(child, doc))
            if tbl_elem:
                elements.append(Spacer(1, 6))
                elements.append(tbl_elem)
                elements.append(Spacer(1, 8))
                has_content = True

    # Handle any floating/anchored images not yet included (body-level drawings)
    for rId, img_bytes in _image_map.items():
        if rId not in seen_rids:
            rl_img = _make_rl_image(img_bytes)
            if rl_img:
                elements.append(Spacer(1, 4))
                elements.append(rl_img)
                elements.append(Spacer(1, 4))
                has_content = True

    if not has_content:
        elements.append(Paragraph('(This document has no readable text content.)',
            _ps(fontName='Helvetica', fontSize=10, leading=15)))
    pdf_doc.build(elements)
    buf.seek(0)
    return buf, 'application/pdf'


def pdf_to_word_bytes(file_bytes: bytes) -> Tuple[io.BytesIO, str]:
    """Converts PDF to Word (.docx) preserving text formatting (bold/italic/
    font-size/headings/colors) detected from span flags, and embedding all images.
    Sets correct page size and margins to match the original PDF page layout."""
    from collections import Counter
    from docx.oxml.ns import qn as _qn
    from docx.oxml import OxmlElement
    from docx.shared import Emu

    fitz_doc = fitz.open(stream=file_bytes, filetype='pdf')
    word_doc = Document()

    # --- Set page size & margins from first PDF page ---
    try:
        first_page = fitz_doc[0]
        pw_pt = first_page.rect.width   # width in PDF points
        ph_pt = first_page.rect.height  # height in PDF points
        # 1 PDF point = 12700 EMU (Word internal unit)
        POINTS_TO_EMU = 12700
        margin_pt = 56.7  # ~20mm in points (standard margin)
        section = word_doc.sections[0]
        section.page_width  = Emu(int(pw_pt * POINTS_TO_EMU))
        section.page_height = Emu(int(ph_pt * POINTS_TO_EMU))
        section.left_margin   = Emu(int(margin_pt * POINTS_TO_EMU))
        section.right_margin  = Emu(int(margin_pt * POINTS_TO_EMU))
        section.top_margin    = Emu(int(margin_pt * POINTS_TO_EMU))
        section.bottom_margin = Emu(int(margin_pt * POINTS_TO_EMU))
    except Exception:
        pass

    # --- Detect dominant body font size ---
    def _detect_body_size():
        size_counts = Counter()
        for page in fitz_doc:
            blocks = page.get_text('dict', flags=fitz.TEXT_PRESERVE_WHITESPACE).get('blocks', [])
            for blk in blocks:
                for line in blk.get('lines', []):
                    for span in line.get('spans', []):
                        sz = round(span.get('size', 10), 1)
                        size_counts[sz] += len(span.get('text', ''))
        return size_counts.most_common(1)[0][0] if size_counts else 10.0

    body_size = _detect_body_size()

    def _classify_span(span):
        """Return (heading_level, is_bold, is_italic) for a text span."""
        flags = span.get('flags', 0)
        is_bold   = bool(flags & 16)   # bit 4 = bold
        is_italic = bool(flags & 2)    # bit 1 = italic
        sz = span.get('size', body_size)
        if sz >= body_size * 2.0:   return 1, is_bold, is_italic
        if sz >= body_size * 1.55:  return 2, is_bold, is_italic
        if sz >= body_size * 1.3:   return 3, is_bold, is_italic
        if sz >= body_size * 1.15:  return 4, is_bold, is_italic
        return 0, is_bold, is_italic

    # Track seen image xrefs to avoid duplicates across pages
    seen_xrefs: set = set()

    for page_num in range(len(fitz_doc)):
        page = fitz_doc[page_num]
        page_dict = page.get_text('dict', flags=fitz.TEXT_PRESERVE_WHITESPACE)
        blocks = page_dict.get('blocks', [])

        # --- Embed images found on this page (in document order via blocks) ---
        # Collect image xrefs that appear on this page
        img_xref_map = {}
        for img_info in page.get_images(full=True):
            xref = img_info[0]
            if xref not in seen_xrefs:
                try:
                    base_img = fitz_doc.extract_image(xref)
                    img_bytes_raw = base_img['image']
                    pil_img = Image.open(io.BytesIO(img_bytes_raw))
                    if pil_img.mode == 'RGBA':
                        bg = Image.new('RGB', pil_img.size, (255, 255, 255))
                        bg.paste(pil_img, mask=pil_img.split()[3])
                        pil_img = bg
                    elif pil_img.mode not in ('RGB', 'L'):
                        pil_img = pil_img.convert('RGB')
                    png_buf = io.BytesIO()
                    pil_img.save(png_buf, format='PNG')
                    png_buf.seek(0)
                    img_xref_map[xref] = (png_buf, pil_img.width, pil_img.height)
                    seen_xrefs.add(xref)
                except Exception:
                    pass

        # Process blocks in vertical order
        for blk in sorted(blocks, key=lambda b: b.get('bbox', (0, 0, 0, 0))[1]):
            blk_type = blk.get('type', -1)

            if blk_type == 1:  # Image block — insert any pending page images
                for xref, (png_buf, w_px, h_px) in img_xref_map.items():
                    w_in = min(w_px / 96.0, 6.0)
                    try:
                        word_doc.add_picture(png_buf, width=Inches(w_in))
                    except Exception:
                        pass
                img_xref_map.clear()
                continue

            if blk_type != 0:  # Only process text blocks
                continue

            for line in blk.get('lines', []):
                spans = line.get('spans', [])
                if not spans:
                    continue

                # Gather all text in the line to detect heading
                line_text = ''.join(s.get('text', '') for s in spans)
                stripped = line_text.strip()
                if not stripped:
                    word_doc.add_paragraph('')
                    continue

                first_span = spans[0]
                h_level, line_bold, line_italic = _classify_span(first_span)

                if h_level > 0:
                    # Add as Word heading
                    h_para = word_doc.add_heading(stripped, level=h_level)
                    if h_para.runs:
                        h_para.runs[0].font.bold = line_bold
                        h_para.runs[0].font.italic = line_italic
                else:
                    # Normal paragraph with span-level formatting
                    para = word_doc.add_paragraph()
                    para.paragraph_format.space_after = Pt(2)
                    para.paragraph_format.space_before = Pt(0)
                    for span in spans:
                        span_text = span.get('text', '')
                        if not span_text:
                            continue
                        _, s_bold, s_italic = _classify_span(span)
                        sz = max(6.0, min(72.0, span.get('size', body_size)))
                        color_int = span.get('color', 0)
                        font_name = span.get('font', '')

                        run = para.add_run(span_text)
                        run.bold   = s_bold
                        run.italic = s_italic
                        run.font.size = Pt(sz)

                        # Set font family if it looks like a standard font
                        if font_name:
                            clean_font = font_name.split('+')[-1].replace('-Bold', '').replace('-Italic', '').replace('-BoldItalic', '').strip()
                            if clean_font:
                                try:
                                    run.font.name = clean_font
                                except Exception:
                                    pass

                        # Apply text color (skip pure black — let Word use default)
                        try:
                            r_val = (color_int >> 16) & 0xFF
                            g_val = (color_int >> 8)  & 0xFF
                            b_val = color_int & 0xFF
                            if (r_val, g_val, b_val) != (0, 0, 0):
                                run.font.color.rgb = RGBColor(r_val, g_val, b_val)
                        except Exception:
                            pass

        # Insert any remaining page images after all text blocks
        for xref, (png_buf, w_px, h_px) in img_xref_map.items():
            w_in = min(w_px / 96.0, 6.0)
            try:
                word_doc.add_picture(png_buf, width=Inches(w_in))
            except Exception:
                pass

        # Page break between pages (except last)
        if page_num < len(fitz_doc) - 1:
            word_doc.add_page_break()

    buf = io.BytesIO()
    word_doc.save(buf)
    buf.seek(0)
    return buf, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'


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
