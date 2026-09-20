import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  FileText, 
  FileArchive, 
  FileCode, 
  Layers, 
  Minimize2, 
  Image as ImageIcon, 
  Crop, 
  Search, 
  Wand2, 
  CopyMinus, 
  Code,
  Copy,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function OmniTools({ toolId, onToast }) {
  const [file, setFile] = useState(null);
  const [multiFiles, setMultiFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState('');
  const fileInputRef = useRef(null);

  // Tool specific states
  const [quality, setQuality] = useState(75);
  const [resizeMode, setResizeMode] = useState('scale'); // 'scale' or 'custom'
  const [scalePct, setScalePct] = useState(50);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [cleanTrim, setCleanTrim] = useState(true);
  const [cleanEmptyRows, setCleanEmptyRows] = useState(true);
  const [cleanEmptyCols, setCleanEmptyCols] = useState(true);
  
  // JSON Formatter states
  const [jsonInput, setJsonInput] = useState('{\n  "name": "DataSphere AI",\n  "status": "production",\n  "tools_count": 19,\n  "supported_formats": ["csv", "xlsx", "pdf", "jpg", "png", "json"]\n}');
  const [jsonResult, setJsonResult] = useState(null);
  const [jsonIndent, setJsonIndent] = useState(2);

  // Clear state when toolId changes
  React.useEffect(() => {
    setFile(null);
    setMultiFiles([]);
    setResult(null);
    setDownloadUrl(null);
    setDownloadName('');
  }, [toolId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (toolId === 'merge-pdf' || toolId === 'jpg-to-pdf') {
        setMultiFiles(Array.from(e.target.files));
      } else {
        setFile(e.target.files[0]);
      }
    }
  };

  const getToolMeta = () => {
    switch (toolId) {
      case 'csv-to-excel':
        return { title: 'CSV to Excel Converter', color: '#22c55e', desc: 'Transform raw CSV data into a fully formatted Microsoft Excel (.xlsx) workbook.', accept: '.csv', icon: FileSpreadsheet };
      case 'excel-to-csv':
        return { title: 'Excel to CSV Converter', color: '#38bdf8', desc: 'Extract any Excel (.xlsx/.xls) worksheet into a lightweight, portable CSV file.', accept: '.xlsx, .xls', icon: FileText };
      case 'excel-to-pdf':
        return { title: 'Excel to PDF Converter', color: '#f43f5e', desc: 'Generate printable, beautifully styled PDF tables from your Excel or CSV files.', accept: '.xlsx, .xls, .csv', icon: FileArchive };
      case 'csv-to-json':
        return { title: 'CSV to JSON Converter', color: '#f59e0b', desc: 'Convert structured CSV tabular rows into web-ready JSON objects with customizable orientation.', accept: '.csv', icon: FileCode };
      case 'json-to-csv':
        return { title: 'JSON to CSV Converter', color: '#06b6d4', desc: 'Flatten and serialize nested or tabular JSON records directly into a clean CSV format.', accept: '.json', icon: FileSpreadsheet };
      case 'pdf-to-excel':
        return { title: 'PDF to Excel Extractor', color: '#10b981', desc: 'Extract embedded tables, grids, and content from PDF documents into Excel spreadsheets.', accept: '.pdf', icon: FileSpreadsheet };
      case 'merge-pdf':
        return { title: 'PDF Merger', color: '#8b5cf6', desc: 'Combine multiple PDF files into one consolidated, ordered PDF document.', accept: '.pdf', icon: Layers, isMulti: true };
      case 'compress-pdf':
        return { title: 'PDF Compressor', color: '#ec4899', desc: 'Optimize PDF content streams and reduce document file size while preserving legibility.', accept: '.pdf', icon: Minimize2 };
      case 'pdf-to-jpg':
        return { title: 'PDF to JPG Converter', color: '#f97316', desc: 'Render PDF pages into high-resolution JPG images (downloads as ZIP if multiple pages).', accept: '.pdf', icon: ImageIcon };
      case 'jpg-to-pdf':
        return { title: 'JPG to PDF Converter', color: '#ef4444', desc: 'Convert and bundle one or more JPG images into a single clean PDF document.', accept: '.jpg, .jpeg', icon: FileArchive, isMulti: true };
      case 'jpg-to-png':
        return { title: 'JPG to PNG Converter', color: '#a855f7', desc: 'Convert JPEG images to high-fidelity lossless PNG format.', accept: '.jpg, .jpeg', icon: ImageIcon };
      case 'png-to-jpg':
        return { title: 'PNG to JPG Converter', color: '#eab308', desc: 'Convert PNG images to standard JPEG format with automated white-background alpha flattening.', accept: '.png', icon: ImageIcon };
      case 'compress-image':
        return { title: 'Smart Image Compressor', color: '#06b6d4', desc: 'Reduce JPEG and PNG file sizes with precision quality tuning.', accept: '.jpg, .jpeg, .png', icon: Minimize2 };
      case 'resize-image':
        return { title: 'Precision Image Resizer', color: '#6366f1', desc: 'Resize images by percentage scale or explicit width/height using high-quality Lanczos resampling.', accept: '.jpg, .jpeg, .png', icon: Crop };
      case 'analyze-csv':
        return { title: 'Deep CSV Analyzer', color: '#38bdf8', desc: 'Inspect CSV schema, row count, null percentages, data completeness, and column profiling.', accept: '.csv', icon: Search };
      case 'analyze-excel':
        return { title: 'Excel Workbook Analyzer', color: '#10b981', desc: 'Analyze all worksheets, calculate dimensional density, cell counts, and duplicate frequency.', accept: '.xlsx, .xls', icon: Search };
      case 'clean-csv':
        return { title: 'Automated CSV Cleaner', color: '#a855f7', desc: 'Remove leading/trailing whitespaces, drop completely empty rows and unpopulated columns.', accept: '.csv', icon: Wand2 };
      case 'remove-duplicates':
        return { title: 'Intelligent Duplicate Remover', color: '#f43f5e', desc: 'Detect and eliminate redundant duplicate records from Excel or CSV files.', accept: '.csv, .xlsx, .xls', icon: CopyMinus };
      case 'format-json':
        return { title: 'JSON Validator & Formatter', color: '#f59e0b', desc: 'Beautify, minify, validate syntax, and format JSON payloads instantly.', icon: Code };
      default:
        return { title: 'File Utility Tool', color: '#38bdf8', desc: 'Fast client-server processing utility.', icon: Wand2 };
    }
  };

  const meta = getToolMeta();
  const IconComponent = meta.icon;

  const executeProcess = async () => {
    setLoading(true);
    setResult(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      let endpoint = `/api/tools/${toolId}`;

      if (meta.isMulti) {
        if (multiFiles.length < (toolId === 'merge-pdf' ? 2 : 1)) {
          alert('Please select files first.');
          setLoading(false);
          return;
        }
        multiFiles.forEach(f => formData.append('files', f));
      } else {
        if (!file) {
          alert('Please select a file first.');
          setLoading(false);
          return;
        }
        formData.append('file', file);
      }

      // Add tool-specific params
      if (toolId === 'compress-image') {
        formData.append('quality', quality.toString());
      } else if (toolId === 'resize-image') {
        if (resizeMode === 'scale') {
          formData.append('scale_pct', scalePct.toString());
        } else {
          formData.append('width', customWidth.toString());
          formData.append('height', customHeight.toString());
        }
      } else if (toolId === 'clean-csv') {
        formData.append('trim_whitespace', cleanTrim.toString());
        formData.append('drop_empty_rows', cleanEmptyRows.toString());
        formData.append('drop_empty_cols', cleanEmptyCols.toString());
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || `Processing failed with status ${res.status}`);
      }

      // If JSON response (Analyzers)
      if (toolId === 'analyze-csv' || toolId === 'analyze-excel') {
        const data = await res.json();
        setResult(data.analysis);
        onToast && onToast('Analysis generated successfully!');
      } else {
        // Blob response for downloads
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        
        let outName = 'downloaded_file';
        const disposition = res.headers.get('Content-Disposition');
        if (disposition && disposition.includes('filename=')) {
          outName = disposition.split('filename=')[1].replace(/"/g, '');
        } else {
          outName = `${toolId}_result`;
        }

        // Extra metadata headers
        const origSize = res.headers.get('X-Original-Size');
        const compSize = res.headers.get('X-Compressed-Size');
        const dupsRemoved = res.headers.get('X-Duplicates-Removed');
        const rowsRemoved = res.headers.get('X-Rows-Removed');

        let metaInfo = '';
        if (origSize && compSize) {
          const origK = (Number(origSize) / 1024).toFixed(1);
          const compK = (Number(compSize) / 1024).toFixed(1);
          const savedPct = Math.round((1 - compSize / origSize) * 100);
          metaInfo = `Reduced from ${origK} KB to ${compK} KB (${savedPct}% saved!)`;
        } else if (dupsRemoved !== null) {
          metaInfo = `Removed ${dupsRemoved} duplicate record(s).`;
        } else if (rowsRemoved !== null) {
          metaInfo = `Cleaned and pruned ${rowsRemoved} blank row(s).`;
        }

        setDownloadUrl(url);
        setDownloadName(outName);
        setResult({ success: true, metaInfo });
        onToast && onToast('File processed successfully!');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonFormat = async (minify = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tools/format-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_json: jsonInput,
          indent: jsonIndent,
          minify: minify
        })
      });
      const data = await res.json();
      setJsonResult(data.result);
      if (data.result.valid) {
        setJsonInput(data.result.formatted);
        onToast && onToast(minify ? 'JSON minified!' : 'JSON beautified!');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-view-container">
      {/* Tool Header */}
      <div className="tool-view-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${meta.color || '#38bdf8'}25`,
            border: `1px solid ${meta.color || '#38bdf8'}55`,
            boxShadow: `0 0 20px ${meta.color || '#38bdf8'}50`
          }}>
            <IconComponent size={24} color={meta.color || '#38bdf8'} style={{ filter: `drop-shadow(0 0 8px ${meta.color || '#38bdf8'})` }} />
          </div>
          <div>
            <h2 style={{ 
              fontSize: '1.45rem', 
              fontWeight: 800,
              background: `linear-gradient(135deg, #ffffff 30%, ${meta.color || '#38bdf8'} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              filter: `drop-shadow(0 2px 10px rgba(0,0,0,0.5))`
            }}>
              {meta.title}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{meta.desc}</p>
          </div>
        </div>
      </div>

      {/* Special case: JSON Formatter */}
      {toolId === 'format-json' ? (
        <div className="chart-card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleJsonFormat(false)}
                disabled={loading}
              >
                <Sparkles size={14} />
                <span>Beautify JSON</span>
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleJsonFormat(true)}
                disabled={loading}
              >
                <Minimize2 size={14} />
                <span>Minify (Compact)</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <span>Indent:</span>
                <select 
                  className="control-select" 
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                  value={jsonIndent}
                  onChange={(e) => setJsonIndent(Number(e.target.value))}
                >
                  <option value="2">2 spaces</option>
                  <option value="4">4 spaces</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(jsonInput);
                  onToast && onToast('Copied to clipboard!');
                }}
              >
                <Copy size={14} />
                <span>Copy</span>
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setJsonInput('');
                  setJsonResult(null);
                }}
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {jsonResult && (
            <div style={{ 
              marginBottom: 14, 
              padding: '10px 14px', 
              borderRadius: 8,
              background: jsonResult.valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${jsonResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: jsonResult.valid ? '#34d399' : '#fb7185',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {jsonResult.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{jsonResult.valid ? `Valid JSON (${jsonResult.type}, ${jsonResult.keys_count} top-level entries)` : `Syntax Error: ${jsonResult.error}`}</span>
            </div>
          )}

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{
              width: '100%',
              minHeight: 380,
              background: 'rgba(10, 15, 26, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: 16,
              color: '#f8fafc',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none'
            }}
            placeholder="Paste your raw JSON string here..."
          />
        </div>
      ) : (
        /* Standard File Processing View */
        <div style={{ marginTop: 24 }}>
          {/* Dropzone Card */}
          <div 
            className="dropzone-container"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept={meta.accept}
              multiple={meta.isMulti}
              onChange={handleFileChange}
            />

            <div className="dropzone-icon-circle" style={{
              background: `linear-gradient(135deg, ${meta.color || '#38bdf8'}40 0%, #818cf840 100%)`,
              color: meta.color || '#38bdf8',
              boxShadow: `0 10px 26px ${meta.color || '#38bdf8'}45, inset 2px 2px 5px rgba(255,255,255,0.4)`
            }}>
              <UploadCloud size={32} style={{ filter: `drop-shadow(0 0 6px ${meta.color || '#38bdf8'})` }} />
            </div>

            <h3 className="dropzone-title">
              {meta.isMulti 
                ? (multiFiles.length > 0 
                    ? <span style={{ color: meta.color || '#38bdf8' }}>Selected {multiFiles.length} files</span> 
                    : 'Select Multiple Files to Combine')
                : (file 
                    ? <span>Selected: <span style={{ color: meta.color || '#38bdf8', fontWeight: 800 }}>{file.name}</span></span> 
                    : <span>Select or Drag & Drop <span style={{ color: meta.color || '#38bdf8' }}>{meta.accept}</span> file</span>)}
            </h3>

            <p className="dropzone-desc" style={{ color: '#cbd5e1' }}>
              Accepted formats: <strong style={{ color: meta.color || '#38bdf8' }}>{meta.accept}</strong>
            </p>

            <span className="btn btn-secondary btn-sm" style={{ 
              pointerEvents: 'none',
              borderColor: `${meta.color || '#38bdf8'}50`,
              background: `${meta.color || '#38bdf8'}15`,
              color: '#ffffff',
              fontWeight: 600
            }}>
              Browse File{meta.isMulti ? 's' : ''}
            </span>
          </div>

          {/* Tool specific options */}
          {toolId === 'compress-image' && (
            <div className="clean-panel" style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Compression Quality:</span>
                <input 
                  type="range" 
                  min="10" 
                  max="95" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))} 
                  style={{ width: 180 }}
                />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', color: 'var(--primary)' }}>
                  {quality}%
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Recommended: 70% - 80% for optimum clarity and size reduction
              </span>
            </div>
          )}

          {toolId === 'resize-image' && (
            <div className="clean-panel" style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <label className="clean-checkbox-label">
                  <input 
                    type="radio" 
                    name="rmode" 
                    checked={resizeMode === 'scale'} 
                    onChange={() => setResizeMode('scale')} 
                  />
                  <span>Scale Percentage</span>
                </label>

                <label className="clean-checkbox-label">
                  <input 
                    type="radio" 
                    name="rmode" 
                    checked={resizeMode === 'custom'} 
                    onChange={() => setResizeMode('custom')} 
                  />
                  <span>Custom Width & Height</span>
                </label>

                {resizeMode === 'scale' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      value={scalePct} 
                      onChange={(e) => setScalePct(Number(e.target.value))} 
                    />
                    <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{scalePct}%</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input 
                      type="number" 
                      className="control-input" 
                      style={{ width: 90 }} 
                      value={customWidth} 
                      onChange={(e) => setCustomWidth(Number(e.target.value))} 
                      placeholder="Width"
                    />
                    <span>×</span>
                    <input 
                      type="number" 
                      className="control-input" 
                      style={{ width: 90 }} 
                      value={customHeight} 
                      onChange={(e) => setCustomHeight(Number(e.target.value))} 
                      placeholder="Height"
                    />
                    <span>px</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {toolId === 'clean-csv' && (
            <div className="clean-panel" style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <label className="clean-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={cleanTrim} 
                    onChange={(e) => setCleanTrim(e.target.checked)} 
                  />
                  <span>Trim whitespace from cells & headers</span>
                </label>
                <label className="clean-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={cleanEmptyRows} 
                    onChange={(e) => setCleanEmptyRows(e.target.checked)} 
                  />
                  <span>Drop completely empty rows</span>
                </label>
                <label className="clean-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={cleanEmptyCols} 
                    onChange={(e) => setCleanEmptyCols(e.target.checked)} 
                  />
                  <span>Drop completely blank columns</span>
                </label>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              style={{ 
                padding: '14px 40px', 
                fontSize: '1rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${meta.color || '#38bdf8'} 0%, #6366f1 50%, #d946ef 100%)`,
                boxShadow: `0 8px 25px ${meta.color || '#38bdf8'}55`,
                border: 'none'
              }}
              onClick={executeProcess}
              disabled={loading || (!file && multiFiles.length === 0)}
            >
              {loading ? (
                <RefreshCw size={18} className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <Sparkles size={18} color="#ffffff" style={{ filter: 'drop-shadow(0 0 4px #ffffff)' }} />
              )}
              <span>{loading ? 'Processing File...' : `Process & Convert Now`}</span>
            </button>
          </div>

          {/* Result / Download Card */}
          {downloadUrl && (
            <div className="chart-card" style={{ 
              marginTop: 26, 
              border: '1px solid rgba(16, 185, 129, 0.45)', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    width: 46, 
                    height: 46, 
                    borderRadius: 12, 
                    background: 'rgba(16, 185, 129, 0.25)', 
                    border: '1px solid rgba(16, 185, 129, 0.5)', 
                    color: '#34d399', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)'
                  }}>
                    <CheckCircle2 size={24} style={{ filter: 'drop-shadow(0 0 6px #10b981)' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399' }}>
                      Success! File Processed & Ready
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: 2 }}>
                      {result?.metaInfo || downloadName}
                    </p>
                  </div>
                </div>

                <a 
                  href={downloadUrl} 
                  download={downloadName}
                  className="btn btn-primary"
                  style={{ 
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                    fontWeight: 700,
                    padding: '12px 24px'
                  }}
                >
                  <Download size={18} />
                  <span>Download Result</span>
                </a>
              </div>
            </div>
          )}

          {/* Analyzer Results Display */}
          {result && toolId === 'analyze-csv' && (
            <div className="chart-card" style={{ marginTop: 24 }}>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Total Rows</div>
                  <div className="kpi-value">{result.rows.toLocaleString()}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Total Columns</div>
                  <div className="kpi-value">{result.columns}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Data Completeness</div>
                  <div className="kpi-value">{result.completeness_pct}%</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Duplicates</div>
                  <div className="kpi-value">{result.duplicates}</div>
                </div>
              </div>

              <h4 style={{ margin: '16px 0 10px', fontSize: '0.95rem' }}>Columns Structure & Quality</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Data Type</th>
                      <th>Missing Count</th>
                      <th>Missing %</th>
                      <th>Unique Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.columns_detail.map((c, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td><span className="brand-badge">{c.dtype}</span></td>
                        <td>{c.nulls}</td>
                        <td>{c.null_pct}%</td>
                        <td>{c.unique}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && toolId === 'analyze-excel' && (
            <div className="chart-card" style={{ marginTop: 24 }}>
              <div className="kpi-card" style={{ marginBottom: 16 }}>
                <div className="kpi-title">Total Worksheets</div>
                <div className="kpi-value">{result.total_sheets}</div>
                <div className="kpi-subtext">Sheets: {result.sheet_names.join(', ')}</div>
              </div>

              <h4 style={{ margin: '16px 0 10px', fontSize: '0.95rem' }}>Worksheet Breakdown</h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sheet Name</th>
                      <th>Rows</th>
                      <th>Columns</th>
                      <th>Missing Cells</th>
                      <th>Duplicates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.sheets.map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{s.sheet_name}</td>
                        <td>{s.rows.toLocaleString()}</td>
                        <td>{s.cols}</td>
                        <td>{s.null_cells}</td>
                        <td>{s.duplicates}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
