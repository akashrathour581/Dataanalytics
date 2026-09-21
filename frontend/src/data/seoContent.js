export const SEO_PAGES = {
  '/excel-to-pdf': {
    slug: '/excel-to-pdf',
    toolId: 'excel-to-pdf',
    title: 'Free Excel to PDF Converter Online — Convert XLSX to PDF Fast',
    metaDesc: 'Convert Excel (.xlsx, .xls) and CSV sheets to formatted, printable PDF documents online for free. Clean table layout with zero data retention.',
    h1: 'Convert Excel to Formatted PDF Online',
    subtitle: 'Transform your spreadsheets, financial models, and tables into beautiful, publication-ready landscape PDF documents in seconds.',
    toolType: 'converter',
    steps: [
      { step: 1, title: 'Upload Spreadsheet', desc: 'Drag and drop your .xlsx, .xls, or .csv file into the secure converter above.' },
      { step: 2, title: 'Instant Conversion', desc: 'Our engine parses tabular grids, styles headers, and generates a clean PDF.' },
      { step: 3, title: 'Download PDF', desc: 'Click Download to instantly save your formatted, high-resolution PDF document.' }
    ],
    features: [
      { title: 'Formatted Table Design', desc: 'Auto-adjusts column widths and applies elegant header themes for clean printability.' },
      { title: 'Multi-Sheet & CSV Support', desc: 'Easily handles standard workbooks, legacy Excel files, and raw CSV tables.' },
      { title: '100% Client-Safe & Private', desc: 'Files are processed in memory and never stored or shared on persistent disks.' },
      { title: 'Lightning Fast Engine', desc: 'Powered by Python and ReportLab for sub-second document generation.' }
    ],
    faqs: [
      { q: 'Will my table formatting and grid lines be preserved?', a: 'Yes, the converter formats table headers, alternating row colors, and cell boundaries into clean, readable PDF tables.' },
      { q: 'Is there a file size limit for converting Excel to PDF?', a: 'You can upload workbooks up to 50MB with thousands of rows without any paywalls or watermarks.' },
      { q: 'Can I convert CSV files to PDF as well?', a: 'Yes, both CSV and Excel (.xlsx, .xls) files are supported by this tool.' }
    ],
    related: ['/pdf-to-excel', '/csv-to-json', '/excel-analyzer']
  },

  '/jpg-to-png': {
    slug: '/jpg-to-png',
    toolId: 'jpg-to-png',
    title: 'Free JPG to PNG Converter — High Quality & Lossless Online',
    metaDesc: 'Convert JPG/JPEG images to lossless PNG format online for free. Maintain high visual clarity, edge sharpness, and transparency readiness.',
    h1: 'Convert JPG to Lossless PNG Online',
    subtitle: 'Upgrade your compressed JPEG photos and graphics to pristine, high-fidelity PNG format with zero quality degradation.',
    toolType: 'image',
    steps: [
      { step: 1, title: 'Select JPG Image', desc: 'Drag and drop or browse any .jpg or .jpeg file from your computer or phone.' },
      { step: 2, title: 'Lossless Encoding', desc: 'Our image engine decodes the pixel array and encodes to PNG compression.' },
      { step: 3, title: 'Download PNG', desc: 'Get your full-resolution PNG image immediately with 1 click.' }
    ],
    features: [
      { title: 'Zero Artifacts Added', desc: 'Ensures sharp edges and rich color reproduction without lossy recompression.' },
      { title: 'Full Resolution Preservation', desc: 'Pixel dimensions, DPI, and visual fidelity are retained 100% intact.' },
      { title: 'Instant In-Browser Flow', desc: 'Super fast conversion with no email signup or waiting queues.' },
      { title: 'Safe & Secure', desc: 'Images are processed in temporary RAM and deleted immediately upon transfer.' }
    ],
    faqs: [
      { q: 'Does converting JPG to PNG improve quality?', a: 'While it cannot restore information lost during original JPEG compression, converting to PNG prevents any further generation loss during future edits and saves.' },
      { q: 'Can I convert large photos?', a: 'Yes, high-resolution photographs up to 30MB are fully supported.' },
      { q: 'Is it completely free?', a: 'Yes, DataSphere AI tools are 100% free with unlimited conversions.' }
    ],
    related: ['/png-to-jpg', '/image-compressor', '/jpg-to-pdf']
  },

  '/pdf-to-excel': {
    slug: '/pdf-to-excel',
    toolId: 'pdf-to-excel',
    title: 'PDF to Excel Converter — Extract PDF Tables to XLSX Online',
    metaDesc: 'Extract tables, statements, and numbers from PDF documents into editable Microsoft Excel (.xlsx) spreadsheets with high accuracy.',
    h1: 'Extract PDF Tables into Editable Excel Spreadsheets',
    subtitle: 'Stop retyping financial statements, invoices, and reports. Extract structured tabular data from PDF files directly into Excel (.xlsx).',
    toolType: 'converter',
    steps: [
      { step: 1, title: 'Upload PDF Document', desc: 'Upload your PDF containing bank statements, invoices, or data tables.' },
      { step: 2, title: 'Intelligent Table Extraction', desc: 'Our engine identifies table cells, borders, and rows across all pages.' },
      { step: 3, title: 'Download Excel File', desc: 'Open the generated .xlsx workbook in Microsoft Excel or Google Sheets.' }
    ],
    features: [
      { title: 'Multi-Page Table Detection', desc: 'Scans every page to extract both multi-column tables and text blocks.' },
      { title: 'Preserves Column Structures', desc: 'Outputs proper column headers and cell types ready for Excel formulas.' },
      { title: 'Ideal for Invoices & Reports', desc: 'Perfect for accounting statements, audits, inventory logs, and research.' },
      { title: 'No OCR Watermarks', desc: 'Clean, direct spreadsheet export without annoying watermarks or locked cells.' }
    ],
    faqs: [
      { q: 'Can it extract multiple tables across different pages?', a: 'Yes, each extracted table is automatically placed into its own neatly organized sheet or structured layout in Excel.' },
      { q: 'Can I edit the extracted Excel file in Google Sheets?', a: 'Yes, the output is a standard .xlsx workbook compatible with Excel, Google Sheets, LibreOffice, and Numbers.' }
    ],
    related: ['/excel-to-pdf', '/excel-analyzer', '/csv-analyzer']
  },

  '/csv-to-json': {
    slug: '/csv-to-json',
    toolId: 'csv-to-json',
    title: 'CSV to JSON Converter — Convert Tabular CSV to JSON Online',
    metaDesc: 'Convert CSV rows into formatted, indented JSON arrays and objects. Perfect for web developers, API testing, and data engineering.',
    h1: 'Convert CSV to Structured JSON Online',
    subtitle: 'Transform tabular data into clean, formatted JSON arrays. Ideal for frontend developers, APIs, database seeds, and backend migrations.',
    toolType: 'converter',
    steps: [
      { step: 1, title: 'Upload CSV File', desc: 'Upload any CSV file or export from your database or spreadsheet.' },
      { step: 2, title: 'JSON Serialization', desc: 'Rows are parsed into structured JSON records with typed numbers and strings.' },
      { step: 3, title: 'Download .json', desc: 'Download your formatted .json file or copy it into your developer workflow.' }
    ],
    features: [
      { title: 'Beautified & Indented Output', desc: 'Generates clean 2-space indented JSON ready for codebases and APIs.' },
      { title: 'Type Inference', desc: 'Automatically preserves numbers, booleans, and nulls where possible.' },
      { title: 'Handles Large Datasets', desc: 'Processes thousands of records smoothly without memory bottlenecks.' }
    ],
    faqs: [
      { q: 'What orientation is used for JSON output?', a: 'By default, it outputs a standard JSON array of objects ([{"col": "val"}, ...]), which is the most widely adopted format for REST APIs.' },
      { q: 'Can I convert back from JSON to CSV?', a: 'Yes, you can use our companion JSON to CSV converter tool anytime.' }
    ],
    related: ['/json-to-csv', '/csv-analyzer', '/csv-to-excel']
  },

  '/json-to-csv': {
    slug: '/json-to-csv',
    toolId: 'json-to-csv',
    title: 'JSON to CSV Converter — Flatten JSON Arrays into CSV',
    metaDesc: 'Convert JSON objects and arrays into structured CSV files online. Fast flattening, custom headers, and seamless spreadsheet export.',
    h1: 'Flatten JSON Arrays into Clean CSV Spreadsheets',
    subtitle: 'Convert API payloads, MongoDB exports, and JSON arrays into structured CSV files for Excel, pandas, and BI tools.',
    toolType: 'converter',
    steps: [
      { step: 1, title: 'Upload JSON File', desc: 'Upload your .json file containing an array of records or nested objects.' },
      { step: 2, title: 'Automated Flattening', desc: 'The engine normalizes nested keys and builds unified column headers.' },
      { step: 3, title: 'Download CSV', desc: 'Open the resulting CSV in Microsoft Excel, Google Sheets, or PowerBI.' }
    ],
    features: [
      { title: 'Nested Keys Normalization', desc: 'Handles nested JSON structures with dot-notation column names.' },
      { title: 'UTF-8 Compliant', desc: 'Preserves international character sets, accents, and emojis.' },
      { title: 'Fast & Secure', desc: 'Instantly processes large payloads with zero data storage.' }
    ],
    faqs: [
      { q: 'What happens if some JSON objects have different keys?', a: 'The tool automatically unions all keys so no data is lost; missing fields in specific records are left empty.' }
    ],
    related: ['/csv-to-json', '/csv-analyzer', '/excel-to-csv']
  },

  '/compress-pdf': {
    slug: '/compress-pdf',
    toolId: 'compress-pdf',
    title: 'Compress PDF Online — Reduce PDF File Size Free',
    metaDesc: 'Compress PDF documents online to smaller file sizes while preserving sharp text and image quality. Fast, free, and secure.',
    h1: 'Compress PDF Documents Online for Free',
    subtitle: 'Shrink bulky PDF files for email attachments, web uploads, and government portals without losing readability or layout.',
    toolType: 'pdf',
    steps: [
      { step: 1, title: 'Upload PDF', desc: 'Select or drag & drop the PDF document you want to compress.' },
      { step: 2, title: 'Stream Optimization', desc: 'Removes redundant font subsets, deflates content streams, and optimizes objects.' },
      { step: 3, title: 'Download Compressed PDF', desc: 'Download your optimized, lightweight PDF file immediately.' }
    ],
    features: [
      { title: 'Email-Ready Sizes', desc: 'Reduces large PDFs down to portal and email attachment limits.' },
      { title: 'Sharp Text Preservation', desc: 'Maintains vector sharpness so text remains 100% crisp when zoomed.' },
      { title: 'Privacy Guaranteed', desc: 'Encrypted transfer with zero retention — your sensitive documents stay private.' }
    ],
    faqs: [
      { q: 'Will the compression make the text blurry?', a: 'No, PDF text is stored as vector glyphs which remain razor sharp. Only redundant metadata and image streams are optimized.' }
    ],
    related: ['/pdf-to-excel', '/excel-to-pdf', '/image-compressor']
  },

  '/image-compressor': {
    slug: '/image-compressor',
    toolId: 'compress-image',
    title: 'Free Image Compressor Online — Compress JPG & PNG with Quality Slider',
    metaDesc: 'Compress JPG, JPEG, and PNG images with real-time quality control. Save up to 80% file size without visible degradation.',
    h1: 'Intelligent Image Compressor with Quality Slider',
    subtitle: 'Optimize JPEG and PNG image sizes for faster website speeds, email attachments, and apps with interactive quality tuning.',
    toolType: 'image',
    steps: [
      { step: 1, title: 'Upload Image', desc: 'Upload any .jpg, .jpeg, or .png image.' },
      { step: 2, title: 'Adjust Quality', desc: 'Use the slider to select your desired quality level (70%–80% recommended).' },
      { step: 3, title: 'Download & Compare', desc: 'See original vs compressed sizes and % saved, then download with 1 click.' }
    ],
    features: [
      { title: 'Precision Slider Control', desc: 'Dial in the exact balance of size reduction vs visual clarity (10% to 95%).' },
      { title: 'Real-Time Savings Report', desc: 'Displays exact KB before and after along with total percentage saved.' },
      { title: 'Supports PNG & JPEG', desc: 'Optimizes both lossy JPEG photos and lossless PNG graphics.' }
    ],
    faqs: [
      { q: 'What is the recommended compression quality?', a: '75% to 80% offers the sweet spot: typically reduces file size by 50% to 75% with zero noticeable visual difference.' }
    ],
    related: ['/image-resizer', '/jpg-to-png', '/png-to-jpg']
  },

  '/csv-analyzer': {
    slug: '/csv-analyzer',
    toolId: 'analyze-csv',
    title: 'Free CSV Analyzer Online — Schema, Missing Values & Profiling',
    metaDesc: 'Analyze CSV files online for free. Instantly inspect row counts, data types, missing value percentages, duplicates, and column distributions.',
    h1: 'Instant In-Depth CSV Analyzer & Data Profiler',
    subtitle: 'Upload any CSV file to get immediate insights: schema validation, row & column counts, missing value audits, and data health scores.',
    toolType: 'data',
    steps: [
      { step: 1, title: 'Drop CSV File', desc: 'Drag and drop your raw CSV file into the analyzer.' },
      { step: 2, title: 'Instant Profiling', desc: 'Our engine computes data health, completeness, missing percentages, and uniqueness.' },
      { step: 3, title: 'Review Structural Report', desc: 'Examine detailed column-by-column metrics and preview the top rows.' }
    ],
    features: [
      { title: 'Data Completeness Score', desc: 'Calculates the exact ratio of populated cells versus null entries.' },
      { title: 'Duplicate Rows Detection', desc: 'Identifies identical rows that could skew machine learning models or charts.' },
      { title: 'Column Type Classification', desc: 'Categorizes columns into integer, float, string, and categorical.' }
    ],
    faqs: [
      { q: 'Can I clean the CSV if issues are found?', a: 'Yes! You can jump straight to our CSV Cleaner or Duplicate Remover tool in the left sidebar to fix issues with 1 click.' }
    ],
    related: ['/excel-analyzer', '/clean-csv', '/ai-data-analyst']
  },

  '/excel-analyzer': {
    slug: '/excel-analyzer',
    toolId: 'analyze-excel',
    title: 'Excel Workbook Analyzer — Multi-Sheet Inspection Online',
    metaDesc: 'Inspect multi-sheet Excel (.xlsx, .xls) workbooks. Calculate row counts, dimensional density, missing cells, and sheets summary online.',
    h1: 'Multi-Sheet Excel Workbook Analyzer',
    subtitle: 'Get an instant high-level diagnostic of all worksheets, dimensional sizes, duplicate records, and data density in your Excel files.',
    toolType: 'data',
    steps: [
      { step: 1, title: 'Upload Excel File', desc: 'Select any .xlsx or .xls multi-sheet workbook.' },
      { step: 2, title: 'Multi-Sheet Inspection', desc: 'Every worksheet is parsed and profiled for row counts, columns, and quality.' },
      { step: 3, title: 'Explore Breakdown', desc: 'Review the sheet-by-sheet diagnostic table with cell counts and missing rates.' }
    ],
    features: [
      { title: 'All Sheets Supported', desc: 'Inspects multiple sheets simultaneously with individual sheet statistics.' },
      { title: 'Missing Cells Audit', desc: 'Finds hidden nulls and blanks across complex financial spreadsheets.' },
      { title: 'Zero Setup Required', desc: 'No software installation or Python knowledge needed.' }
    ],
    faqs: [
      { q: 'Does this modify my Excel file?', a: 'No, this tool only reads and profiles your file in memory without altering the original.' }
    ],
    related: ['/csv-analyzer', '/excel-to-pdf', '/ai-data-analyst']
  },

  '/ai-data-analyst': {
    slug: '/ai-data-analyst',
    toolId: 'overview',
    title: 'AI Data Analyst — Automated Excel & CSV Dashboard & EDA Studio',
    metaDesc: 'Upload Excel or CSV files to generate automated executive dashboards, time-series trends, category rankings, correlation heatmaps, and smart AI insights.',
    h1: 'Autonomous AI Data Analyst for Excel & CSV',
    subtitle: 'Turn messy spreadsheets into interactive executive dashboards, time-series area charts, correlation heatmaps, and business intelligence in seconds.',
    toolType: 'analytics',
    steps: [
      { step: 1, title: 'Upload Excel or CSV', desc: 'Upload any spreadsheet or click "Load Retail Sample" to demo immediately.' },
      { step: 2, title: 'Automated AI EDA', desc: 'The engine categorizes measures, dimensions, dates, and computes correlations.' },
      { step: 3, title: 'Interact & Slice Data', desc: 'Explore KPIs, monthly trends, dynamic chart builder, and data quality profiler.' }
    ],
    features: [
      { title: 'Auto-Generated Executive Dashboards', desc: 'Instantly builds Area, Bar, Donut, and Heatmap charts tailored to your data.' },
      { title: 'No-Code Dynamic Query Builder', desc: 'Pick any X-Axis, Y-Axis, and aggregation (SUM, AVG, COUNT, MIN, MAX) live.' },
      { title: '1-Click Data Hygiene', desc: 'Deduplicate records and impute null values automatically with 1 click.' },
      { title: 'Searchable & Sortable Data Grid', desc: 'Inspect every record with multi-column sorting, search filters, and export.' }
    ],
    faqs: [
      { q: 'What types of datasets work best with the AI Analyst?', a: 'Any tabular data — retail sales, financial transactions, marketing leads, inventory, customer metrics, and survey data.' },
      { q: 'Can I export the cleaned dataset?', a: 'Yes, you can export the cleaned data as formatted Excel (.xlsx) or CSV anytime.' }
    ],
    related: ['/excel-analyzer', '/csv-analyzer', '/excel-to-pdf']
  },

  '/cgpa-calculator': {
    slug: '/cgpa-calculator',
    toolId: 'cgpa-calculator',
    title: 'Free CGPA Calculator Online — Cumulative Grade Point Average',
    metaDesc: 'Calculate your college & university CGPA accurately. Supports 10-point scale, 4.0 US scale, credit weightage, and percentage conversion.',
    h1: 'Cumulative Grade Point Average (CGPA) Calculator',
    subtitle: 'Accurately calculate your overall university CGPA with credit hour weightage, academic class standing, and percentage equivalent in real time.',
    toolType: 'student',
    steps: [
      { step: 1, title: 'Enter Semesters', desc: 'Input your SGPA and credit hours for each completed college semester.' },
      { step: 2, title: 'Select Grading Scale', desc: 'Choose between 10-Point Indian scale or 4.0 US/Global GPA scale.' },
      { step: 3, title: 'Instant CGPA & Rank', desc: 'Get your official Cumulative CGPA, equivalent percentage, and division classification.' }
    ],
    features: [
      { title: 'Credit-Weighted Precision', desc: 'Accounts for differing credit weights per semester for 100% transcript accuracy.' },
      { title: 'CBSE & AICTE Standards', desc: 'Includes standard 9.5 multiplier percentage conversion and honours class standing.' },
      { title: 'Semester Progression Graph', desc: 'Visual trend bar graph to track academic improvement over time.' },
      { title: '1-Click Copy & Share', desc: 'Copy your calculated grade summary directly to clipboard for resume & applications.' }
    ],
    faqs: [
      { q: 'How is CGPA calculated?', a: 'CGPA is calculated by dividing total quality points (sum of SGPA × credits for each semester) by the total number of credits earned.' },
      { q: 'What is the formula to convert CGPA to percentage?', a: 'Under CBSE and AICTE guidelines, Percentage = CGPA × 9.5.' },
      { q: 'Can I calculate with unequal semester credits?', a: 'Yes! Toggle Credit-Weighted mode and input the exact credits for each semester.' }
    ],
    related: ['/sgpa-calculator', '/cgpa-to-percentage', '/overall-cgpa-calculator']
  },

  '/sgpa-calculator': {
    slug: '/sgpa-calculator',
    toolId: 'sgpa-calculator',
    title: 'Free SGPA Calculator Online — Semester Grade Point Average',
    metaDesc: 'Calculate your semester SGPA easily. Input courses, letter grades (O, A+, A, B, C, F), and credit points for B.Tech, BCA, MCA, and college degrees.',
    h1: 'Semester Grade Point Average (SGPA) Calculator',
    subtitle: 'Compute your single-semester SGPA from individual theory and lab subject grades with dynamic credit weighting.',
    toolType: 'student',
    steps: [
      { step: 1, title: 'Add Course Subjects', desc: 'Add each theory subject and lab course for your current semester.' },
      { step: 2, title: 'Assign Grades & Credits', desc: 'Select letter grades (O, A+, A, B+, B, C, P, F) and course credits.' },
      { step: 3, title: 'Instant SGPA Score', desc: 'View your total credit points, semester SGPA, and performance rating.' }
    ],
    features: [
      { title: 'Preset Letter Grades', desc: 'Pre-configured with standard 10-point scale: O (10), A+ (9), A (8), B+ (7), B (6), C (5), P (4), F (0).' },
      { title: 'Dynamic Course Rows', desc: 'Easily add, edit, or remove subjects with instant reactive recalculation.' },
      { title: 'Preloaded Degree Samples', desc: '1-Click demo loading for engineering and computer science semesters.' },
      { title: 'Equivalent Percentage', desc: 'Automatic calculation of semester percentage alongside SGPA.' }
    ],
    faqs: [
      { q: 'What is the difference between SGPA and CGPA?', a: 'SGPA is the Grade Point Average for a single semester, while CGPA is the cumulative average across all semesters completed so far.' },
      { q: 'How is SGPA calculated?', a: 'SGPA = Sum of (Course Credits × Grade Points) / Total Semester Credits.' }
    ],
    related: ['/cgpa-calculator', '/overall-cgpa-calculator', '/cgpa-to-percentage']
  },

  '/cgpa-to-percentage': {
    slug: '/cgpa-to-percentage',
    toolId: 'cgpa-to-percentage',
    title: 'CGPA to Percentage Converter — CBSE, AICTE, VTU, Mumbai University',
    metaDesc: 'Convert CGPA to percentage online with official university formulas: CBSE (9.5x), Anna University (10x), VTU, and Mumbai University.',
    h1: 'CGPA to Percentage Calculator & Converter',
    subtitle: 'Convert 10-point CGPA into exact percentage marks with verified formulas from CBSE, AICTE, VTU, and State Universities.',
    toolType: 'student',
    steps: [
      { step: 1, title: 'Enter Your CGPA', desc: 'Use the interactive slider or enter your CGPA up to 2 decimal places.' },
      { step: 2, title: 'Select University Rule', desc: 'Choose CBSE (9.5×), Direct (10×), VTU ((CGPA-0.75)×10), or MU formula.' },
      { step: 3, title: 'View Converted Percentage', desc: 'Instant percentage result with step-by-step mathematical breakdown.' }
    ],
    features: [
      { title: 'Official Board Formulas', desc: 'Verified formulas for CBSE, AICTE, VTU, Anna University, and Mumbai University.' },
      { title: 'Interactive Range Slider', desc: 'Real-time drag-and-slide conversion with instant visual feedback.' },
      { title: 'Division Classification', desc: 'Know your official standing: Distinction, First Class, Second Class, or Pass.' },
      { title: 'Quick Lookup Reference Table', desc: 'Convenient reference chart showing CGPA from 6.0 to 10.0 equivalents.' }
    ],
    faqs: [
      { q: 'Why is CGPA multiplied by 9.5?', a: 'CBSE analyzed performance data of students scoring between 91-100 marks and found the average score was approximately 95 marks, leading to the 9.5 conversion factor.' },
      { q: 'How do I convert 8.4 CGPA to percentage?', a: 'Under CBSE/AICTE: 8.4 × 9.5 = 79.80% (First Class with Distinction).' }
    ],
    related: ['/percentage-to-cgpa', '/cgpa-calculator', '/overall-cgpa-calculator']
  },

  '/percentage-to-cgpa': {
    slug: '/percentage-to-cgpa',
    toolId: 'percentage-to-cgpa',
    title: 'Percentage to CGPA Converter — 10-Point & 4.0 US Scale',
    metaDesc: 'Convert marks percentage to CGPA online. Supports 10-point scale (CBSE/Engineering) and US 4.0 GPA scale for study abroad applications.',
    h1: 'Percentage to CGPA Calculator & Converter',
    subtitle: 'Convert marks percentage into equivalent 10-Point CGPA or 4.0 US GPA for university admissions and job applications.',
    toolType: 'student',
    steps: [
      { step: 1, title: 'Enter Percentage', desc: 'Input your aggregate percentage marks or drag the slider.' },
      { step: 2, title: 'Choose Target Scale', desc: 'Select 10-Point scale (India) or 4.0 GPA scale (US / Global).' },
      { step: 3, title: 'Get CGPA & Letter Grade', desc: 'Receive high-precision GPA and equivalent letter grade instantly.' }
    ],
    features: [
      { title: 'Dual Scale Output', desc: 'Simultaneously converts to 10-Point university CGPA and 4.0 US GPA.' },
      { title: 'Letter Grade Mapping', desc: 'Automatic assignment of letter grades (O, A+, A, B+, B, C, F).' },
      { title: 'Step-by-Step Formula', desc: 'Clear mathematical explanation suitable for official application forms.' },
      { title: 'Custom Divisor Support', desc: 'Support for custom institutional conversion factors.' }
    ],
    faqs: [
      { q: 'How do I convert 85% to CGPA?', a: 'Using the standard 9.5 factor: 85 ÷ 9.5 = 8.95 CGPA (Grade A+).' },
      { q: 'How do I convert percentage to 4.0 US GPA?', a: 'US GPA = (Percentage / 100) × 4.0. For 85%, GPA = (85/100) × 4 = 3.40 / 4.0.' }
    ],
    related: ['/cgpa-to-percentage', '/cgpa-calculator', '/overall-cgpa-calculator']
  },

  '/overall-cgpa-calculator': {
    slug: '/overall-cgpa-calculator',
    toolId: 'overall-cgpa-calculator',
    title: 'Overall CGPA Calculator & Target Degree Goal Planner',
    metaDesc: 'Track multi-semester college CGPA and plan your target graduation CGPA. Calculates required SGPA in remaining semesters for B.Tech, BCA, MCA, and Masters.',
    h1: 'Overall Degree CGPA Calculator & Target Planner',
    subtitle: 'Track cumulative degree progress across all semesters and compute the exact SGPA needed in upcoming semesters to hit your dream graduation CGPA.',
    toolType: 'student',
    steps: [
      { step: 1, title: 'Select Program Duration', desc: 'Pick 4 Semesters (Masters), 6 Semesters (Bachelors), or 8 Semesters (B.Tech).' },
      { step: 2, title: 'Mark Completed Semesters', desc: 'Enter SGPA for completed terms and toggle upcoming terms.' },
      { step: 3, title: 'Set Target Graduation CGPA', desc: 'The goal planner calculates the required SGPA in remaining semesters.' }
    ],
    features: [
      { title: 'Target Goal Feasibility Engine', desc: 'Tells you if your target graduation CGPA is easily achievable, challenging, or impossible.' },
      { title: 'Multi-Program Support', desc: 'Tailored for 2-year Masters (MBA, MCA, M.Tech), 3-year Degrees (BCA, B.Sc), and 4-year B.Tech.' },
      { title: 'Comprehensive Degree Audit', desc: 'Live tracker of completed credits vs total degree graduation requirements.' },
      { title: 'Real-Time Re-calculation', desc: 'Instantly updates your graduation trajectory with every grade change.' }
    ],
    faqs: [
      { q: 'How does the Target CGPA Goal Planner work?', a: 'It calculates the remaining quality points needed to reach your target overall CGPA across total degree credits, then divides by remaining credits to give the exact minimum SGPA you need to average.' },
      { q: 'Can I use this for lateral entry students?', a: 'Yes, just mark earlier semesters as completed or adjust credits accordingly.' }
    ],
    related: ['/cgpa-calculator', '/sgpa-calculator', '/cgpa-to-percentage']
  },

  '/calculator': {
    slug: '/calculator',
    toolId: 'calculator',
    title: 'Free Smart Scientific Calculator Online — Algebra, Trig & Solvers',
    metaDesc: 'Advanced scientific & academic calculator with real-time live preview, trigonometry, powers, persistent history, fractions, quadratic equation solver, and unit converters.',
    h1: 'Smart Scientific & Engineering Calculator',
    subtitle: 'Lightning-fast, precision scientific calculator with live syntax preview, persistent calculation history, quadratic equation solver, and fraction conversion.',
    toolType: 'student',
    steps: [
      { step: 1, title: 'Enter Any Formula', desc: 'Type naturally with keyboard or click keys for trigonometry, roots, powers, and logs.' },
      { step: 2, title: 'Live Instant Preview', desc: 'Watch real-time result preview update dynamically as you type each character.' },
      { step: 3, title: 'Explore Solvers & History', desc: 'Reuse past calculations from history, solve quadratic equations, or convert to fractions.' }
    ],
    features: [
      { title: 'Full Scientific Function Suite', desc: 'Trigonometry (sin, cos, tan, inverse), DEG/RAD toggle, log, ln, powers, roots, and factorials.' },
      { title: 'Persistent Calculation History', desc: 'Stores calculations across sessions with 1-click reuse and copy to clipboard.' },
      { title: 'Quadratic Equation Solver', desc: 'Solves ax² + bx + c = 0 with real and complex roots, discriminant, and step-by-step working.' },
      { title: 'Fraction & Base Conversion', desc: 'Instantly converts results to exact fractions (e.g. 5/8) and Binary, Hex, or Octal.' }
    ],
    faqs: [
      { q: 'Can I use my physical computer keyboard?', a: 'Yes! All numbers, operators (+, -, *, /), parentheses, Enter for equals, and Escape for clear are fully supported.' },
      { q: 'How do I switch between Degrees and Radians?', a: 'Click the DEG / RAD toggle button on the top status bar of the calculator.' },
      { q: 'Are past calculations saved?', a: 'Yes, your history is safely preserved in browser local storage and can be copied or reloaded with 1 click.' }
    ],
    related: ['/cgpa-calculator', '/sgpa-calculator', '/overall-cgpa-calculator']
  },

  '/csv-cleaner': {
    slug: '/csv-cleaner',
    toolId: 'clean-csv',
    title: 'Free CSV Cleaner Online — Trim Whitespace & Remove Empty Rows',
    metaDesc: 'Clean messy CSV files online for free. Trim whitespace, drop completely empty rows, prune unpopulated columns, and export cleaned CSV instantly.',
    h1: 'Automated CSV Data Cleaner & Sanitizer',
    subtitle: 'Instantly sanitize messy CSV exports. Strip leading/trailing whitespace, remove blank rows, and drop unpopulated columns with 1 click.',
    toolType: 'data',
    steps: [
      { step: 1, title: 'Upload CSV File', desc: 'Drag and drop your raw CSV file or load the sample dataset.' },
      { step: 2, title: 'Select Clean Rules', desc: 'Choose to trim whitespace, drop empty rows, or delete unpopulated columns.' },
      { step: 3, title: 'Download Clean CSV', desc: 'Download your sanitized, production-ready CSV immediately.' }
    ],
    features: [
      { title: 'Whitespace Stripping', desc: 'Eliminates stubborn leading and trailing spaces that cause database and lookup errors.' },
      { title: 'Empty Row & Col Pruning', desc: 'Removes ghost records and unused blank fields to reduce file size and speed up processing.' },
      { title: '100% Client-Safe', desc: 'Processed securely in temporary RAM and never retained or shared.' }
    ],
    faqs: [
      { q: 'Will this alter my column headers?', a: 'Whitespace from headers will be cleanly trimmed without renaming your columns.' },
      { q: 'Can I undo or preview changes?', a: 'Your original file on your computer remains untouched; you download a freshly cleaned copy.' }
    ],
    related: ['/duplicate-remover', '/csv-analyzer', '/csv-to-excel']
  },

  '/duplicate-remover': {
    slug: '/duplicate-remover',
    toolId: 'remove-duplicates',
    title: 'Duplicate Remover Online — Deduplicate CSV & Excel Files Free',
    metaDesc: 'Find and remove duplicate rows from CSV and Excel spreadsheets online for free. Clean data redundancy and download deduped files.',
    h1: 'Intelligent Duplicate Row Remover',
    subtitle: 'Detect and purge duplicate records from your CSV and Excel files instantly, ensuring clean metrics and unskewed reports.',
    toolType: 'data',
    steps: [
      { step: 1, title: 'Upload Spreadsheet', desc: 'Upload your .csv or .xlsx file with potential duplicate entries.' },
      { step: 2, title: 'Intelligent Deduplication', desc: 'Our engine identifies identical rows while keeping the first distinct occurrence.' },
      { step: 3, title: 'Export Clean Data', desc: 'Download your deduplicated dataset with an exact count of removed duplicates.' }
    ],
    features: [
      { title: 'Exact Row Matching', desc: 'Accurately detects identical records across all columns.' },
      { title: 'Excel & CSV Support', desc: 'Works seamlessly with multi-sheet Excel workbooks and raw CSV files.' },
      { title: 'Deduplication Metrics', desc: 'Reports the exact count of removed rows for your audit logs.' }
    ],
    faqs: [
      { q: 'Which duplicate row is kept?', a: 'The first occurrence of any duplicate row is preserved, and subsequent identical rows are pruned.' },
      { q: 'Does it support Excel workbooks?', a: 'Yes, both .csv and .xlsx files are fully supported.' }
    ],
    related: ['/csv-cleaner', '/csv-analyzer', '/excel-analyzer']
  },

  '/json-formatter': {
    slug: '/json-formatter',
    toolId: 'format-json',
    title: 'Free JSON Formatter & Validator Online — Beautify & Minify JSON',
    metaDesc: 'Beautify, format, validate, and minify JSON online for free. Real-time syntax checking, customizable 2-space or 4-space indentation, and 1-click clipboard copy.',
    h1: 'JSON Validator, Beautifier & Formatter',
    subtitle: 'Format messy, unindented JSON payloads into clean, readable structures with custom indentation, or minify for production efficiency.',
    toolType: 'data',
    steps: [
      { step: 1, title: 'Paste JSON Text', desc: 'Paste your raw JSON string or API response into the editor.' },
      { step: 2, title: 'Select Beautify or Minify', desc: 'Choose 2-space or 4-space indentation, or compact down to single-line JSON.' },
      { step: 3, title: 'Copy to Clipboard', desc: 'Copy formatted JSON with 1 click for your code, API docs, or debugging.' }
    ],
    features: [
      { title: 'Real-Time Syntax Validation', desc: 'Catches missing brackets, dangling commas, and invalid literals with clear error messages.' },
      { title: 'Beautify & Minify Modes', desc: 'Easily toggle between human-readable formatted JSON and lightweight production minification.' },
      { title: 'In-Browser Privacy', desc: 'Your JSON text stays secure and is processed locally.' }
    ],
    faqs: [
      { q: 'Is my JSON data uploaded to external servers?', a: 'No, validation and formatting run locally in your browser memory for maximum security.' },
      { q: 'Can it handle large JSON payloads?', a: 'Yes, it smoothly handles large objects and arrays with thousands of records.' }
    ],
    related: ['/csv-to-json', '/json-to-csv', '/csv-analyzer']
  }
};
