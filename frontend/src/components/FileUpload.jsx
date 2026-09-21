import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileUpload, onLoadSample, loading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (loading) return;
    setErrorMessage(null);
    if (file.size > 10 * 1024 * 1024) {setErrorMessage('Choose a file no larger than 10 MB.');return;}
    const validExtensions = ['.xlsx', '.json', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Please upload a valid Excel (.xlsx), JSON or CSV file.');
      return;
    }

    onFileUpload(file);
  };

  return (
    <section className="upload-hero">
      <div 
        className={`dropzone-container ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xlsx,.json,.csv" disabled={loading} aria-label="Upload dataset"
          onChange={handleFileInputChange}
        />

        <div className="dropzone-icon-circle">
          <UploadCloud size={32} />
        </div>

        <h2 className="dropzone-title">
          {loading ? 'Analyzing & Profiling Dataset...' : 'Drag & Drop your Excel or CSV file here'}
        </h2>
        
        <p className="dropzone-desc">
          Automated Schema Detection, Statistical Profiling, KPI Extraction, and Dynamic Dashboards
        </p>

        <div className="dropzone-pills">
          <span className="pill-format">.XLSX</span>
          <span className="pill-format">.JSON</span>
          <span className="pill-format">.CSV</span>
          <span className="pill-format">Multi-Sheet Supported</span>
        </div>

        {loading && (
          <div style={{ marginTop: 24 }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--theme-ink-teal, #38bdf8)' }}>
              Parsing sheets, calculating correlations, and building dashboards...
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          background: 'rgba(244, 63, 94, 0.15)', 
          border: '1px solid rgba(244, 63, 94, 0.3)', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'var(--theme-ink-pink, #fb7185)',
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ 
        marginTop: 20, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        paddingTop: 16,
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Don't have an Excel file right now? Test with our sample retail dataset:
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onLoadSample();
          }}
          disabled={loading}
        >
          <FileSpreadsheet size={15} color="#38bdf8" />
          <span>Try with Retail Sales Dataset</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </section>
  );
}
