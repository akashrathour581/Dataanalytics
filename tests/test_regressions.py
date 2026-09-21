import io
import json
import unittest
import pandas as pd
from PIL import Image
from pypdf import PdfWriter, PdfReader
from fastapi.testclient import TestClient
from server.main import app, rate_windows
from server.analytics_engine import store, generate_automated_eda, query_aggregation
from server.cleaning import transform
from server.tools_engine import png_to_jpg_bytes, compress_pdf_bytes, resize_image_bytes, clean_csv_data


class RegressionTests(unittest.TestCase):
    def setUp(self):
        store._datasets.clear()
        rate_windows.clear()
        self.client = TestClient(app, raise_server_exceptions=False)

    def tool(self, name, body, filename='data.csv'):
        return self.client.post('/api/tools/' + name, files={'file': (filename, body, 'application/octet-stream')})

    def test_csv_analyzer_missing_values(self):
        response = self.tool('analyze-csv', b'a,b\n1,\n,2')
        self.assertEqual(response.status_code, 200, response.text)
        self.assertIsNone(response.json()['analysis']['preview'][0]['b'])

    def test_unicode_download_filename_and_safe_formulas(self):
        response = self.tool('csv-to-excel', b'name\n=1+1', 'sales_\u65e5\u672c.csv')
        self.assertEqual(response.status_code, 200, response.text)
        self.assertIn("filename*=UTF-8''", response.headers['content-disposition'])
        df = pd.read_excel(io.BytesIO(response.content))
        self.assertEqual(df.iloc[0, 0], "'=1+1")
        response = self.tool('json-to-csv', b'[{"name":"=1+1"}]', 'data.json')
        self.assertIn("'=1+1", response.text)

    def test_tools_reject_malformed_input(self):
        for name, body, filename in [('csv-to-excel', b'a,a\n1,2', 'a.csv'),
                ('excel-to-csv', b'not a workbook', 'a.xlsx'),
                ('png-to-jpg', b'not an image', 'a.png')]:
            with self.subTest(name=name):
                self.assertEqual(self.tool(name, body, filename).status_code, 400)

    def test_tool_upload_limit(self):
        self.assertEqual(self.tool('csv-to-excel', b'a' * (10 * 1024 * 1024 + 1)).status_code, 413)
        self.assertEqual(self.client.post('/api/upload', files={'file': ('a.csv', b'a' * (10 * 1024 * 1024 + 1), 'text/csv')}).status_code, 413)

    def test_cleaner_trims_strings_and_drops_whitespace_rows(self):
        buf, _, rows, cols = clean_csv_data(b'name,empty\n Alice ,\n   ,\nBob,')
        self.assertEqual((rows, cols), (1, 1))
        self.assertEqual(pd.read_csv(buf)['name'].tolist(), ['Alice', 'Bob'])

    def test_grayscale_alpha_png(self):
        source = io.BytesIO()
        Image.new('LA', (2, 2), (0, 0)).save(source, 'PNG')
        buf, media = png_to_jpg_bytes(source.getvalue())
        self.assertEqual(media, 'image/jpeg')
        self.assertEqual(Image.open(buf).getpixel((0, 0)), (255, 255, 255))

    def test_pdf_compression_clones_pages_before_compressing(self):
        source = io.BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(100, 100)
        writer.write(source)
        buf, _ = compress_pdf_bytes(source.getvalue())
        self.assertEqual(len(PdfReader(buf).pages), 1)

    def test_resize_rejects_invalid_dimensions(self):
        source = io.BytesIO()
        Image.new('RGB', (2, 2)).save(source, 'PNG')
        for options in [{'width': -1}, {'width': 0}, {'width': 100000}, {'scale_pct': -1}]:
            with self.subTest(options=options), self.assertRaises(ValueError):
                resize_image_bytes(source.getvalue(), **options)

    def test_json_formatter_rejects_non_json_constants(self):
        for value in ['NaN', 'Infinity', '-Infinity']:
            response = self.client.post('/api/tools/format-json', json={'raw_json': value})
            self.assertFalse(response.json()['result']['valid'])

    def test_mixed_dates_are_not_lost_after_inference(self):
        report = generate_automated_eda(pd.DataFrame({'date': ['2025-01-01', '02/01/2025']}), 'id', 'x.csv', 'CSV')
        profile = report['column_profiles'][0]
        self.assertEqual(profile['invalid_dates'], 0)
        self.assertEqual(sum(profile['records_by_month'].values()), 2)

    def test_query_excludes_infinite_measurements(self):
        result = query_aggregation(pd.DataFrame({'g': ['a', 'a'], 'v': [1, float('inf')]}), 'g', 'v')
        self.assertEqual(result, [{'key': 'a', 'value': 1.0}])

    def test_split_always_produces_two_columns(self):
        df = transform(pd.DataFrame({'name': ['Alice', None]}), [{'kind': 'split', 'column': 'name', 'value': ','}])
        self.assertIn('name_2', df)
        self.assertTrue(df['name_2'].isna().all())

    def test_finite_fill_and_nullable_integer_outliers(self):
        with self.assertRaises(ValueError):
            transform(pd.DataFrame({'v': [1.0, None]}), [{'kind': 'fill', 'column': 'v', 'method': 'custom', 'value': 'inf'}])
        df = pd.DataFrame({'v': pd.Series([1, 2, 2, 3, 100], dtype='Int64')})
        result = transform(df, [{'kind': 'cap_outliers', 'column': 'v'}])
        self.assertEqual(result['v'].max(), 4.5)

    def test_canonical_pages_and_missing_assets(self):
        response = self.client.get('/tools/csv-analyzer')
        self.assertIn('CSV Analyzer', response.text)
        self.assertIn('/tools/csv-analyzer', response.text)
        self.assertEqual(self.client.get('/missing.js').status_code, 404)
        self.assertEqual(self.client.get('/chart-builder').status_code, 200)

    def test_repeated_cleaning_with_current_revision(self):
        response = self.client.post('/api/upload', files={'file': ('a.csv', b'a\n1\n1', 'text/csv')}).json()
        for revision in range(3):
            result = self.client.post('/api/clean', json={'dataset_id': response['dataset_id'], 'revision': revision, 'action': 'apply', 'operations': [{'kind': 'duplicates'}]})
            self.assertEqual(result.status_code, 200, result.text)
            self.assertEqual(result.json()['revision'], revision + 1)
