import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import KpiCards from './components/KpiCards';
import SmartCharts from './components/SmartCharts';
import ChartBuilder from './components/ChartBuilder';
import DataProfiler from './components/DataProfiler';
import DataTable from './components/DataTable';
import OmniTools from './components/OmniTools';
import StudentTools from './components/StudentTools';
import SeoLandingPage from './components/SeoLandingPage';
import { SEO_PAGES } from './data/seoContent';

import { 
  BarChart3, 
  Sliders, 
  ShieldCheck, 
  Table, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

// Path to toolId mapping
const PATH_TO_TOOL_ID = {
  '/csv-to-excel': 'csv-to-excel',
  '/excel-to-csv': 'excel-to-csv',
  '/excel-to-pdf': 'excel-to-pdf',
  '/csv-to-json': 'csv-to-json',
  '/json-to-csv': 'json-to-csv',
  '/pdf-to-excel': 'pdf-to-excel',
  '/merge-pdf': 'merge-pdf',
  '/compress-pdf': 'compress-pdf',
  '/pdf-to-jpg': 'pdf-to-jpg',
  '/jpg-to-pdf': 'jpg-to-pdf',
  '/jpg-to-png': 'jpg-to-png',
  '/png-to-jpg': 'png-to-jpg',
  '/image-compressor': 'compress-image',
  '/image-resizer': 'resize-image',
  '/csv-analyzer': 'analyze-csv',
  '/excel-analyzer': 'analyze-excel',
  '/csv-cleaner': 'clean-csv',
  '/duplicate-remover': 'remove-duplicates',
  '/json-formatter': 'format-json',
  '/cgpa-calculator': 'cgpa-calculator',
  '/sgpa-calculator': 'sgpa-calculator',
  '/cgpa-to-percentage': 'cgpa-to-percentage',
  '/percentage-to-cgpa': 'percentage-to-cgpa',
  '/overall-cgpa-calculator': 'overall-cgpa-calculator',
  '/calculator': 'calculator',
  '/scientific-calculator': 'calculator',
  '/chart-builder': 'builder',
  '/data-profiler': 'profiler',
  '/data-table': 'table',
  '/ai-data-analyst': 'overview'
};

// Path normalization to support both /tools/slug and /slug uniformly
const normalizePath = (p) => {
  if (!p) return '/ai-data-analyst';
  const clean = p.replace(/\/$/, '') || '/';
  if (clean === '/tools') return '/';
  if (clean.startsWith('/tools/')) {
    return clean.replace(/^\/tools/, '');
  }
  return clean;
};

export default function App() {
  const [currentDataset, setCurrentDataset] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview'); // 'overview', 'builder', 'profiler', 'table'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [forceFullAnalytics, setForceFullAnalytics] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // URL Path change handler
  const navigateTo = (path) => {
    const norm = normalizePath(path);
    setCurrentPath(norm);
    setIsMobileSidebarOpen(false);
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (norm === '/chart-builder') setAnalyticsSubTab('builder');
    else if (norm === '/data-profiler') setAnalyticsSubTab('profiler');
    else if (norm === '/data-table') setAnalyticsSubTab('table');
    else if (norm === '/ai-data-analyst') setAnalyticsSubTab('overview');
  };

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const norm = normalizePath(window.location.pathname);
      setCurrentPath(norm);
      if (norm === '/chart-builder') setAnalyticsSubTab('builder');
      else if (norm === '/data-profiler') setAnalyticsSubTab('profiler');
      else if (norm === '/data-table') setAnalyticsSubTab('table');
      else if (norm === '/ai-data-analyst') setAnalyticsSubTab('overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load sample dataset on first visit for instant delight
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sample-data', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentDataset({
          id: data.dataset_id,
          filename: data.filename,
          sheets: data.sheets,
          active_sheet: data.active_sheet
        });
        setAnalysis(data.analysis);
        showToast(`Loaded sample dataset: ${data.filename}`);
      } else {
        showToast(data.detail || 'Failed to load sample dataset', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentDataset({
          id: data.dataset_id,
          filename: data.filename,
          sheets: data.sheets,
          active_sheet: data.active_sheet
        });
        setAnalysis(data.analysis);
        setAnalyticsSubTab('overview');
        setForceFullAnalytics(true);
        navigateTo('/ai-data-analyst');
        showToast(`Successfully analyzed ${data.filename}! Generated dashboard.`);
      } else {
        showToast(data.detail || 'File parsing failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format = 'xlsx') => {
    if (!currentDataset?.id) return;
    window.open(`/api/export/${currentDataset.id}?format=${format}`, '_blank');
    showToast(`Exporting ${format.toUpperCase()} file...`);
  };

  const handleDataCleaned = (newAnalysis) => {
    setAnalysis(newAnalysis);
    showToast('Dataset refreshed with cleaned values!');
  };

  // Check if current route is an SEO Landing Page
  const matchedSeoPage = SEO_PAGES[currentPath];
  const isAnalyticsView = ['/ai-data-analyst', '/', '/chart-builder', '/data-profiler', '/data-table'].includes(currentPath);
  const isStudentTool = ['/calculator', '/scientific-calculator', '/cgpa-calculator', '/sgpa-calculator', '/cgpa-to-percentage', '/percentage-to-cgpa', '/overall-cgpa-calculator'].includes(currentPath);

  return (
    <div className="app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar 
        activePath={currentPath} 
        onNavigate={navigateTo} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="app-main-content">
        {/* Top Navbar */}
        <Navbar 
          currentDataset={currentDataset}
          onLoadSample={loadSampleData}
          onExport={handleExport}
          loading={loading}
          isAnalyticsView={isAnalyticsView}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 10,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* 1. If User is on an SEO Landing Page (and not in full analytics mode) */}
        {matchedSeoPage && (matchedSeoPage.slug !== '/ai-data-analyst' || !forceFullAnalytics) ? (
          <div>
            <SeoLandingPage 
              page={matchedSeoPage} 
              onNavigate={navigateTo}
              onToast={showToast}
              onLaunchAnalytics={(withSample) => {
                if (withSample) loadSampleData();
                setForceFullAnalytics(true);
                navigateTo('/ai-data-analyst');
              }}
            />
          </div>
        ) : isAnalyticsView ? (
          /* 2. Full Interactive Analytics & BI Studio */
          <div>
            {/* Show Upload Dropzone if no dataset is loaded OR user toggled it */}
            {(!currentDataset || showUploadZone) && (
              <FileUpload 
                onFileUpload={(file) => {
                  handleFileUpload(file);
                  setShowUploadZone(false);
                }}
                onLoadSample={() => {
                  loadSampleData();
                  setShowUploadZone(false);
                }}
                loading={loading}
              />
            )}

            {/* Active Dataset Bar & Analytics Workspace */}
            {analysis && currentDataset && (
              <div>
                <div className="active-dataset-banner">
                  <div className="file-info-group">
                    <div className="file-icon-box">
                      <FileSpreadsheet size={22} />
                    </div>
                    <div>
                      <div className="file-name-title">
                        <span>{currentDataset.filename}</span>
                        {currentDataset.active_sheet && (
                          <span className="brand-badge">Sheet: {currentDataset.active_sheet}</span>
                        )}
                      </div>
                      <div className="file-meta-pills">
                        <span>{analysis.summary.total_rows.toLocaleString()} Records</span>
                        <span>•</span>
                        <span>{analysis.summary.total_cols} Columns</span>
                        <span>•</span>
                        <span>{analysis.summary.health_score}% Quality Score</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowUploadZone(!showUploadZone)}
                    >
                      {showUploadZone ? 'Close Upload' : 'Upload Another File'}
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleExport('csv')}
                    >
                      Download CSV
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExport('xlsx')}
                    >
                      Download Excel (.xlsx)
                    </button>
                  </div>
                </div>

                {/* Sub Tab Navigation for Analytics */}
                <nav className="tab-navigation">
                  <button 
                    className={`tab-btn ${analyticsSubTab === 'overview' ? 'active' : ''}`}
                    onClick={() => {
                      setAnalyticsSubTab('overview');
                      navigateTo('/ai-data-analyst');
                    }}
                  >
                    <BarChart3 size={17} />
                    <span>Executive Dashboard & Insights</span>
                  </button>

                  <button 
                    className={`tab-btn ${analyticsSubTab === 'builder' ? 'active' : ''}`}
                    onClick={() => {
                      setAnalyticsSubTab('builder');
                      navigateTo('/chart-builder');
                    }}
                  >
                    <Sliders size={17} />
                    <span>Dynamic Chart Builder</span>
                  </button>

                  <button 
                    className={`tab-btn ${analyticsSubTab === 'profiler' ? 'active' : ''}`}
                    onClick={() => {
                      setAnalyticsSubTab('profiler');
                      navigateTo('/data-profiler');
                    }}
                  >
                    <ShieldCheck size={17} />
                    <span>Data Quality & Profiling</span>
                  </button>

                  <button 
                    className={`tab-btn ${analyticsSubTab === 'table' ? 'active' : ''}`}
                    onClick={() => {
                      setAnalyticsSubTab('table');
                      navigateTo('/data-table');
                    }}
                  >
                    <Table size={17} />
                    <span>Raw Data Grid ({analysis.summary.total_rows.toLocaleString()})</span>
                  </button>
                </nav>

                {/* Tab 1: Executive Dashboard */}
                {analyticsSubTab === 'overview' && (
                  <div>
                    <KpiCards analysis={analysis} />
                    <SmartCharts analysis={analysis} />
                  </div>
                )}

                {/* Tab 2: Dynamic Chart Builder */}
                {analyticsSubTab === 'builder' && (
                  <div>
                    <ChartBuilder datasetId={currentDataset.id} analysis={analysis} />
                  </div>
                )}

                {/* Tab 3: Data Quality & Profiling */}
                {analyticsSubTab === 'profiler' && (
                  <div>
                    <DataProfiler 
                      datasetId={currentDataset.id} 
                      analysis={analysis} 
                      onDataCleaned={handleDataCleaned}
                    />
                  </div>
                )}

                {/* Tab 4: Raw Data Grid */}
                {analyticsSubTab === 'table' && (
                  <div>
                    <DataTable 
                      datasetId={currentDataset.id} 
                      onExport={handleExport}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isStudentTool ? (
          <StudentTools 
            toolId={PATH_TO_TOOL_ID[currentPath] || currentPath.replace('/', '')} 
            onToast={showToast} 
            onNavigate={navigateTo}
          />
        ) : (
          /* 3. Dedicated Utility Tool View (for non-SEO or direct tool IDs) */
          <OmniTools 
            toolId={PATH_TO_TOOL_ID[currentPath] || currentPath.replace('/', '')} 
            onToast={showToast} 
          />
        )}
      </main>
    </div>
  );
}
