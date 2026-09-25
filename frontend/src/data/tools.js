const entries = [
  ['csv-analyzer','CSV Analyzer','Data Analysis','Analyze CSV structure, statistics, missing values and trends.','analysis','.csv'],
  ['excel-analyzer','Excel Analyzer','Data Analysis','Explore workbook sheets with statistics and automatic charts.','analysis','.xlsx'],
  ['csv-cleaner','CSV Cleaner','Data Cleaning','Preview and apply precise cleaning operations to CSV data.','clean','.csv'],
  ['excel-cleaner','Excel Cleaner','Data Cleaning','Clean an Excel worksheet with reversible transformations.','clean','.xlsx'],
  ['csv-to-excel','CSV to Excel','Converters','Turn CSV rows into a downloadable XLSX workbook.','convert','.csv','xlsx'],
  ['excel-to-csv','Excel to CSV','Converters','Select an Excel worksheet and download its rows as CSV.','convert','.xlsx','csv'],
  ['word-to-pdf','Word to PDF','Converters','Convert a Word (.docx) document into a clean, formatted PDF file.','convert','.docx,.doc','pdf'],
  ['pdf-to-word','PDF to Word','Converters','Extract text from a PDF and download it as an editable Word (.docx) document.','convert','.pdf','docx'],
  ['duplicate-remover','Duplicate Remover','Data Cleaning','Find duplicate rows and preview the deduplicated dataset.','clean','.csv,.xlsx'],
  ['data-quality-checker','Data Quality Checker','Data Analysis','Check completeness, duplicate rows and column quality.','quality','.csv,.xlsx,.json'],
  ['csv-viewer','CSV Viewer','Data Analysis','Browse, search and sort CSV rows with paginated results.','view','.csv'],
  ['json-formatter','JSON Formatter','Developer Tools','Format or minify JSON locally in your browser.','json'],
  ['csv-chart-generator','CSV Chart Generator','Visualization','Build bar, line, area and pie charts from CSV columns.','chart','.csv'],
  ['excel-chart-generator','Excel Chart Generator','Visualization','Visualize an Excel worksheet with grouped charts.','chart','.xlsx'],
  ['json-validator','JSON Validator','Developer Tools','Check JSON syntax locally and see useful error messages.','json'],
  ['csv-validator','CSV Validator','Developer Tools','Check CSV row widths, quoting and headers in your browser.','csv'],
  ['cgpa-calculator','CGPA Calculator','Calculators','Calculate a credit-weighted average of semester grade points.','calculator'],
  ['gpa-calculator','GPA Calculator','Calculators','Calculate a credit-weighted average of course grade points.','calculator'],
  ['percentage-calculator','Percentage Calculator','Calculators','Calculate a percentage of a number and percentage change.','calculator'],
  ['statistics-calculator','Statistics Calculator','Calculators','Compute mean, median, modes, sample deviation and variance.','calculator'],
  ['unit-converter','Unit Converter','Calculators','Convert length, mass and temperature using standard formulas.','calculator'],
];
export const tools = entries.map(([slug,name,category,description,kind,accept,output], i) => ({slug,name,category,description,kind,accept,output,popular:i<10,recent:i>=10}));
export const categories = [...new Set(tools.map(t=>t.category))];
export const toolPath = tool => `/tools/${tool.slug}`;
export const privacyText = 'Files are sent to this server for processing. Datasets and Excel source bytes expire after one hour and are removed from server memory within the next 30 seconds. Upload handling may use temporary disk storage, closed after parsing. Delete your dataset at any time. No uploaded data is sent to AI services or advertising providers.';
export function faqsFor(tool) {
  const local = ['json','csv','calculator'].includes(tool.kind);
  return [
    {q:`Is ${tool.name} free?`,a:'Yes. No account, subscription or credits are required.'},
    {q:'Where is my data processed?',a:local?'This tool runs locally in your browser. Your input is not uploaded.':privacyText},
    {q:'What limits and assumptions apply?',a:local?(tool.kind==='calculator'?'Check the stated formula and use your institution’s grade scale where relevant. No universal GPA-to-percentage conversion is assumed.':'Input is limited to 1 MB of text. JSON follows browser number precision; quote large integer identifiers to preserve them.'):'Uploads support CSV, XLSX and tabular JSON where shown, up to 10 MB, 100,000 rows, 200 columns and 2 million cells. Exports contain the selected worksheet’s values, not workbook formulas, styles or other sheets.'}
  ];
}
