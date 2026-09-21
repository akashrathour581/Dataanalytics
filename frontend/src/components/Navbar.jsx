import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Sparkles, Database, FileSpreadsheet, Download, RefreshCw, Menu } from 'lucide-react';

export default function Navbar({ currentDataset, onLoadSample, onExport, loading, isAnalyticsView, onToggleSidebar, sidebarOpen }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        {/* Mobile Hamburger Menu Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="app-navigation"
        >
          <Menu size={20} />
        </button>

        <div className="brand-icon-wrapper" style={{
          background: 'linear-gradient(145deg, #38bdf8 0%, #818cf8 55%, #c084fc 100%)',
          boxShadow: 'var(--theme-shadow, 0 0 28px rgba(56, 189, 248, 0.55), 0 0 60px rgba(168, 85, 247, 0.25), inset 1px 1px 3px rgba(255,255,255,0.4))',
          borderRadius: 16,
          transition: 'all 0.24s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <Sparkles size={24} color="#070a13" />
        </div>
        <div className="brand-text">
          <h2 className="nav-title">
            <span style={{
              background: 'linear-gradient(135deg, var(--theme-text, #ffffff) 10%, #38bdf8 38%, #a855f7 68%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 14px rgba(56, 189, 248, 0.55))',
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}>
              DataSphere AI
            </span>
            <span className="brand-badge" style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(168, 85, 247, 0.22) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.55)',
              color: 'var(--theme-ink-teal, #7dd3fc)',
              boxShadow: 'var(--theme-shadow, 0 0 14px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255,255,255,0.15))',
              fontWeight: 800,
            }}>
              PRO v2.0
            </span>
          </h2>
          <p className="nav-tagline" style={{ color: 'var(--theme-text, #cbd5e1)', letterSpacing: '0.01em' }}>
            {isAnalyticsView 
              ? <span><span style={{ color: 'var(--theme-ink-teal, #38bdf8)', fontWeight: 700, filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }}>Intelligent Excel Analytics</span> & <span style={{ color: 'var(--theme-ink-violet, #c084fc)', fontWeight: 700, filter: 'drop-shadow(0 0 6px rgba(192,132,252,0.5))' }}>Dynamic Dashboard Studio</span></span>
              : <span><span style={{ color: 'var(--theme-ink-green, #34d399)', fontWeight: 700 }}>All-in-One Data</span>, <span style={{ color: 'var(--theme-ink-pink, #fb7185)', fontWeight: 700 }}>PDF</span>, <span style={{ color: 'var(--theme-ink-violet, #a855f7)', fontWeight: 700 }}>Image</span> & File Processing Suite</span>}
          </p>
        </div>
      </div>

      <ThemeToggle />
      {isAnalyticsView && (
        <div className="nav-actions">
          {currentDataset && (
            <div className="btn btn-secondary btn-sm nav-dataset" style={{
              borderColor: 'rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.08)'
            }} title="Active Dataset">
              <FileSpreadsheet size={16} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }} />
              <span style={{ color: 'var(--theme-text, #ffffff)', fontWeight: 600 }}>{currentDataset.filename}</span>
              {currentDataset.active_sheet && (
                <span style={{ color: 'var(--theme-ink-teal, #38bdf8)', fontSize: '0.75rem', fontWeight: 600 }}>
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
            <span style={{ color: 'var(--theme-text, #c7d2fe)', fontWeight: 600 }}>Load Retail Sample</span>
          </button>

          {currentDataset && (
            <button 
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'var(--theme-text, #ffffff)',
                boxShadow: 'var(--theme-shadow, 0 4px 15px rgba(16, 185, 129, 0.35))'
              }}
              onClick={() => onExport('xlsx')}
              title="Download Cleaned Excel Dataset"
            >
              <Download size={15} color="var(--theme-text, #ffffff)" />
              <span>Export Excel</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
