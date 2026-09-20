import React from 'react';
import { Sparkles, Database, FileSpreadsheet, Download, RefreshCw, Menu } from 'lucide-react';

export default function Navbar({ currentDataset, onLoadSample, onExport, loading, isAnalyticsView, onToggleSidebar }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        {/* Mobile Hamburger Menu Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="brand-icon-wrapper" style={{
          background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
        }}>
          <Sparkles size={24} color="#070a13" />
        </div>
        <div className="brand-text">
          <h1>
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 10%, #38bdf8 35%, #a855f7 70%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 10px rgba(56, 189, 248, 0.45))',
              fontWeight: 800
            }}>
              DataSphere AI
            </span>
            <span className="brand-badge" style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#38bdf8',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
              fontWeight: 800
            }}>
              PRO v2.0
            </span>
          </h1>
          <p className="nav-tagline" style={{ color: '#cbd5e1' }}>
            {isAnalyticsView 
              ? <span><span style={{ color: '#38bdf8', fontWeight: 700 }}>Intelligent Excel Analytics</span> & <span style={{ color: '#c084fc', fontWeight: 700 }}>Dynamic Dashboard Studio</span></span>
              : <span><span style={{ color: '#34d399', fontWeight: 700 }}>All-in-One Data</span>, <span style={{ color: '#fb7185', fontWeight: 700 }}>PDF</span>, <span style={{ color: '#a855f7', fontWeight: 700 }}>Image</span> & File Processing Suite</span>}
          </p>
        </div>
      </div>

      {isAnalyticsView && (
        <div className="nav-actions">
          {currentDataset && (
            <div className="btn btn-secondary btn-sm" style={{
              borderColor: 'rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.08)'
            }} title="Active Dataset">
              <FileSpreadsheet size={16} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }} />
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{currentDataset.filename}</span>
              {currentDataset.active_sheet && (
                <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>
                  [{currentDataset.active_sheet}]
                </span>
              )}
            </div>
          )}

          <button 
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: 'rgba(129, 140, 248, 0.35)',
              background: 'rgba(129, 140, 248, 0.1)'
            }}
            onClick={onLoadSample}
            disabled={loading}
            title="Instantly test with pre-built retail sales dataset"
          >
            {loading ? <RefreshCw size={14} className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Database size={15} color="#818cf8" style={{ filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.6))' }} />}
            <span style={{ color: '#c7d2fe', fontWeight: 600 }}>Load Retail Sample</span>
          </button>

          {currentDataset && (
            <button 
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
              }}
              onClick={() => onExport('xlsx')}
              title="Download Cleaned Excel Dataset"
            >
              <Download size={15} color="#ffffff" />
              <span>Export Excel</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
