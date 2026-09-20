import React from 'react';
import { 
  Sparkles,
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  Table, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  FileArchive, 
  Layers, 
  Minimize2, 
  Image as ImageIcon, 
  Crop, 
  Search, 
  Wand2, 
  CopyMinus, 
  Code,
  ChevronRight,
  GraduationCap,
  Calculator,
  Percent,
  Award,
  BookOpen,
  Sigma,
  X
} from 'lucide-react';

export const SECTIONS = [
  {
    group: 'ANALYTICS & BI',
    groupColor: 'linear-gradient(90deg, #38bdf8, #818cf8)',
    items: [
      { id: 'overview', path: '/ai-data-analyst', name: 'Executive Dashboard', icon: BarChart3, color: '#38bdf8' },
      { id: 'builder', path: '/chart-builder', name: 'Dynamic Chart Builder', icon: Sliders, color: '#a855f7' },
      { id: 'profiler', path: '/data-profiler', name: 'Data Quality & Profiling', icon: ShieldCheck, color: '#34d399' },
      { id: 'table', path: '/data-table', name: 'Raw Data Grid', icon: Table, color: '#fbbf24' }
    ]
  },
  {
    group: 'STUDENT TOOLS',
    groupColor: 'linear-gradient(90deg, #818cf8, #c084fc)',
    items: [
      { id: 'scientific-calculator', path: '/calculator', name: 'Scientific Calculator', icon: Sigma, color: '#38bdf8' },
      { id: 'cgpa-calculator', path: '/cgpa-calculator', name: 'CGPA Calculator', icon: GraduationCap, color: '#818cf8' },
      { id: 'sgpa-calculator', path: '/sgpa-calculator', name: 'SGPA Calculator', icon: Calculator, color: '#a855f7' },
      { id: 'cgpa-to-percentage', path: '/cgpa-to-percentage', name: 'CGPA → Percentage', icon: Percent, color: '#34d399' },
      { id: 'percentage-to-cgpa', path: '/percentage-to-cgpa', name: 'Percentage → CGPA', icon: Award, color: '#f59e0b' },
      { id: 'overall-cgpa-calculator', path: '/overall-cgpa-calculator', name: 'Overall CGPA Calculator', icon: BookOpen, color: '#ec4899' }
    ]
  },
  {
    group: 'FILE CONVERTERS',
    groupColor: 'linear-gradient(90deg, #34d399, #06b6d4)',
    items: [
      { id: 'excel-to-pdf', path: '/excel-to-pdf', name: 'Excel → PDF', icon: FileArchive, color: '#f43f5e' },
      { id: 'pdf-to-excel', path: '/pdf-to-excel', name: 'PDF → Excel', icon: FileSpreadsheet, color: '#10b981' },
      { id: 'csv-to-json', path: '/csv-to-json', name: 'CSV → JSON', icon: FileCode, color: '#f59e0b' },
      { id: 'json-to-csv', path: '/json-to-csv', name: 'JSON → CSV', icon: FileSpreadsheet, color: '#06b6d4' },
      { id: 'csv-to-excel', path: '/csv-to-excel', name: 'CSV → Excel', icon: FileSpreadsheet, color: '#22c55e' },
      { id: 'excel-to-csv', path: '/excel-to-csv', name: 'Excel → CSV', icon: FileText, color: '#38bdf8' }
    ]
  },
  {
    group: 'PDF UTILITIES',
    groupColor: 'linear-gradient(90deg, #f43f5e, #fb7185)',
    items: [
      { id: 'compress-pdf', path: '/compress-pdf', name: 'Compress PDF', icon: Minimize2, color: '#ec4899' },
      { id: 'merge-pdf', path: '/merge-pdf', name: 'Merge PDF', icon: Layers, color: '#8b5cf6' },
      { id: 'pdf-to-jpg', path: '/pdf-to-jpg', name: 'PDF → JPG', icon: ImageIcon, color: '#f97316' },
      { id: 'jpg-to-pdf', path: '/jpg-to-pdf', name: 'JPG → PDF', icon: FileArchive, color: '#ef4444' }
    ]
  },
  {
    group: 'IMAGE STUDIO',
    groupColor: 'linear-gradient(90deg, #c084fc, #e879f9)',
    items: [
      { id: 'jpg-to-png', path: '/jpg-to-png', name: 'JPG → PNG', icon: ImageIcon, color: '#a855f7' },
      { id: 'compress-image', path: '/image-compressor', name: 'Image Compressor', icon: Minimize2, color: '#06b6d4' },
      { id: 'png-to-jpg', path: '/png-to-jpg', name: 'PNG → JPG', icon: ImageIcon, color: '#eab308' },
      { id: 'resize-image', path: '/image-resizer', name: 'Image Resizer', icon: Crop, color: '#6366f1' }
    ]
  },
  {
    group: 'DATA TOOLS',
    groupColor: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
    items: [
      { id: 'analyze-csv', path: '/csv-analyzer', name: 'CSV Analyzer', icon: Search, color: '#38bdf8' },
      { id: 'analyze-excel', path: '/excel-analyzer', name: 'Excel Analyzer', icon: Search, color: '#10b981' },
      { id: 'clean-csv', path: '/csv-cleaner', name: 'CSV Cleaner', icon: Wand2, color: '#a855f7' },
      { id: 'remove-duplicates', path: '/duplicate-remover', name: 'Duplicate Remover', icon: CopyMinus, color: '#f43f5e' },
      { id: 'format-json', path: '/json-formatter', name: 'JSON Formatter', icon: Code, color: '#f59e0b' }
    ]
  }
];

export default function Sidebar({ activePath, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          aria-label="Close Sidebar Overlay"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div 
            onClick={() => {
              onNavigate('/ai-data-analyst');
              onClose && onClose();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}
          >
            <div className="brand-icon-wrapper" style={{ 
              width: 38, 
              height: 38,
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.45)'
            }}>
              <Sparkles size={20} color="#090d16" />
            </div>
            <div className="sidebar-brand-text">
              <h2 style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(56, 189, 248, 0.25))'
              }}>
                DataSphere AI
              </h2>
              <span className="brand-badge" style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8'
              }}>
                STUDIO v2.0
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            className="sidebar-close-btn" 
            onClick={onClose}
            aria-label="Close sidebar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="sidebar-nav">
          {SECTIONS.map((sec, sIdx) => (
            <div key={sIdx} className="nav-group">
              <div 
                className="nav-group-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: sec.groupColor,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  padding: '4px 10px',
                  fontSize: '0.72rem'
                }}
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: sec.groupColor,
                  display: 'inline-block',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)'
                }} />
                {sec.group}
              </div>
              <div className="nav-group-items">
                {sec.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activePath === item.path || activePath === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        onNavigate(item.path);
                        onClose && onClose();
                      }}
                      title={item.name}
                      style={{
                        borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                        background: isActive ? `linear-gradient(90deg, ${item.color}20 0%, rgba(255,255,255,0.02) 100%)` : undefined
                      }}
                    >
                    <div className="nav-item-left">
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? `${item.color}30` : `${item.color}15`,
                        border: `1px solid ${isActive ? item.color : `${item.color}35`}`,
                        boxShadow: isActive ? `0 0 14px ${item.color}65` : `0 0 8px ${item.color}25`,
                        transition: 'all 0.22s ease'
                      }}>
                        <IconComponent 
                          size={16} 
                          color={item.color} 
                          style={{ filter: `drop-shadow(0 0 6px ${item.color})` }} 
                        />
                      </div>
                      <span className="nav-item-label" style={{
                        color: isActive ? item.color : '#e2e8f0',
                        fontWeight: isActive ? 700 : 500,
                        textShadow: isActive ? `0 0 12px ${item.color}60` : 'none',
                        transition: 'all 0.2s ease'
                      }}>
                        {item.name}
                      </span>
                    </div>
                    {item.badge && (
                      <span 
                        className="nav-item-badge"
                        style={{
                          background: `linear-gradient(135deg, ${item.badgeColor || '#38bdf8'}25, ${item.badgeColor || '#38bdf8'}10)`,
                          color: item.badgeColor || '#38bdf8',
                          borderColor: `${item.badgeColor || '#38bdf8'}50`,
                          boxShadow: `0 0 10px ${item.badgeColor || '#38bdf8'}40`,
                          fontWeight: 700
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={15} color={item.color} className="nav-item-arrow" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  </>
);
}
