import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Seo, ToolInfo, AdSlot } from './components/ToolShell';
import { tools, toolPath, privacyText } from './data/tools';
import './platform.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FileUpload from './components/FileUpload';
import KpiCards from './components/KpiCards';
import { SEO_PAGES } from './data/seoContent';

const DataTool = lazy(() => import('./components/DataTool'));
const LocalTool = lazy(() => import('./components/LocalTool'));
const SmartCharts = lazy(() => import('./components/SmartCharts'));
const ChartBuilder = lazy(() => import('./components/ChartBuilder'));
const DataProfiler = lazy(() => import('./components/DataProfiler'));
const DataTable = lazy(() => import('./components/DataTable'));
const OmniTools = lazy(() => import('./components/OmniTools'));
const StudentTools = lazy(() => import('./components/StudentTools'));
const SeoLandingPage = lazy(() => import('./components/SeoLandingPage'));

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

// Path normalization to support routes uniformly
const normalizePath = (p) => {
  if (!p) return '/';
  const clean = p.replace(/\/$/, '') || '/';
  return clean;
};

export default function App() {
  const [currentDataset, setCurrentDataset] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [analyticsSubTab, setAnalyticsSubTab] = useState(() => ({'/chart-builder':'builder','/data-profiler':'profiler','/data-table':'table'}[normalizePath(window.location.pathname)] || 'overview'));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [forceFullAnalytics, setForceFullAnalytics] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);

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

  const pending = useRef(false);
  const loadSampleData = async () => {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    try {
      const listed = await fetch('/api/datasets');
      const retained = listed.ok ? (await listed.json()).datasets : [];
      const existing = retained.find(d => d.filename === 'retail_sales.csv');
      const res = await fetch(existing ? `/api/analysis/${existing.dataset_id}` : '/api/sample-data', existing ? {} : { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        if (currentDataset?.id && currentDataset.id !== data.dataset_id) {
          await fetch(`/api/datasets/${currentDataset.id}`, {method:'DELETE'}).catch(() => {});
        }
        setCurrentDataset({
          id: data.dataset_id,
          filename: data.filename,
          sheets: data.sheets,
          active_sheet: data.active_sheet,
          revision: data.revision
        });
        setAnalysis(data.analysis);
        showToast(`Loaded sample dataset: ${data.filename}`);
      } else {
        showToast(data.detail || 'Failed to load sample dataset', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (pending.current) return;
    pending.current = true;
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
        if (currentDataset?.id && currentDataset.id !== data.dataset_id) {
          await fetch(`/api/datasets/${currentDataset.id}`, {method:'DELETE'}).catch(() => {});
        }
        setCurrentDataset({
          id: data.dataset_id,
          filename: data.filename,
          sheets: data.sheets,
          active_sheet: data.active_sheet,
          revision: data.revision
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
      pending.current = false;
      setLoading(false);
    }
  };

  const handleExport = (format = 'xlsx') => {
    if (!currentDataset?.id) return;
    window.open(`/api/export/${currentDataset.id}?format=${format}`, '_blank');
    showToast(`Exporting ${format.toUpperCase()} file...`);
  };

  const handleDataCleaned = (report) => {
    setAnalysis(report.analysis);
    setCurrentDataset(d => ({...d, revision: report.revision}));
    showToast('Dataset refreshed with cleaned values!');
  };

  const [toolSearch, setToolSearch] = useState('');
  const filteredTools = useMemo(() => {
    const q = toolSearch.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }, [toolSearch]);

  // Check routes
  const cleanPath = currentPath.startsWith('/tools/') ? currentPath.replace('/tools', '') : currentPath;
  const isToolsRoute = currentPath.startsWith('/tools/');
  const registeredTool = isToolsRoute ? tools.find(t => toolPath(t) === currentPath) : null;
  const isDirectoryView = currentPath === '/' || currentPath === '/tools';
  const infoPage = ['privacy','terms','contact'].find(p => '/' + p === currentPath);
  const matchedSeoPage = SEO_PAGES[currentPath] || SEO_PAGES[cleanPath];
  const isAnalyticsView = ['/ai-data-analyst', '/chart-builder', '/data-profiler', '/data-table'].includes(cleanPath);
  const isStudentTool = ['/calculator', '/scientific-calculator', '/cgpa-calculator', '/sgpa-calculator', '/cgpa-to-percentage', '/percentage-to-cgpa', '/overall-cgpa-calculator'].includes(cleanPath);
  const activeToolId = PATH_TO_TOOL_ID[currentPath] || PATH_TO_TOOL_ID[cleanPath] || cleanPath.replace('/', '');

  return (
    <div className="app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activePath={currentPath}
        onNavigate={navigateTo}
        isOpen={isMobileSidebarOpen}
        onClose={closeSidebar}
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
          sidebarOpen={isMobileSidebarOpen}
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div className="toast-notification" role="status" style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: 'var(--theme-text, #ffffff)',
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

        <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: 'var(--theme-text, #94a3b8)' }}>Loading...</div>}>
          {isDirectoryView ? (
            <div className="platform tool-page">
              <Seo
                path={currentPath === '/tools' ? '/tools' : '/'}
                title={currentPath === '/tools' ? "All Free Data Tools | DataSphere AI" : "Free Online Data Analytics & Data Tools | DataSphere AI"}
                description="Free analysis, cleaning, conversion, visualization and calculator tools."
              />
              <h1>{currentPath === '/tools' ? 'All Tools' : 'Analyze, Clean & Transform Your Data Online'}</h1>
              <p>Free tools. No account required.</p>
              <div style={{ margin: '18px 0 22px' }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  Search tools
                  <input
                    type="search"
                    aria-label="Search tools"
                    placeholder="Search 19+ tools..."
                    value={toolSearch}
                    onChange={e => setToolSearch(e.target.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      maxWidth: 420,
                      marginTop: 6,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--theme-text, #ffffff)',
                      fontSize: '0.95rem'
                    }}
                  />
                </label>
                <p role="status" style={{ fontSize: '0.85rem', color: 'var(--theme-text, #94a3b8)' }}>
                  {filteredTools.length} tools found
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.12) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 12,
                padding: '18px 22px',
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--theme-text, #ffffff)' }}>Full Interactive BI & Analytics Studio</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--theme-text, #94a3b8)', fontSize: '0.875rem' }}>Automated EDA, KPI Dashboards, Dynamic Chart Builder & Data Cleaning.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigateTo('/ai-data-analyst')}
                >
                  Launch Studio
                </button>
              </div>
              <div className="tool-grid">{filteredTools.map(t=><a className="tool-card" key={t.slug} href={toolPath(t)}><strong>{t.name}</strong><p>{t.description}</p></a>)}</div>
            </div>
          ) : infoPage ? (
            <div className="platform tool-page"><Seo path={'/'+infoPage} title={infoPage+' | DataSphere AI'} description="DataSphere platform information."/><h1>{infoPage[0].toUpperCase()+infoPage.slice(1)}</h1>
            {infoPage==='privacy'?<p>{privacyText} Browser calculators run locally. File conversion utilities process files on this server.</p>:infoPage==='terms'?<p>Check results before relying on them. Statistical flags do not establish factual accuracy. Grade conversions depend on your institution's rules.</p>:<p>{import.meta.env.VITE_CONTACT_EMAIL?<a href={'mailto:'+import.meta.env.VITE_CONTACT_EMAIL}>Contact support</a>:'Contact the operator of this installation for support.'}</p>}</div>
          ) : matchedSeoPage && (matchedSeoPage.slug !== '/ai-data-analyst' || !forceFullAnalytics) ? (
            <div>
              <SeoLandingPage key={currentPath}
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
            <h1 className="workspace-heading">Analytics Studio</h1>
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

                  {currentDataset.sheets.length > 1 && <label>Worksheet
                    <select aria-label="Worksheet" value={currentDataset.active_sheet} disabled={loading} onChange={async e => {
                      if (pending.current) return;
                      pending.current = true; setLoading(true);
                      try {
                        const res = await fetch('/api/switch-sheet', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({dataset_id:currentDataset.id,sheet_name:e.target.value})});
                        const report = await res.json();
                        if (!res.ok) throw new Error(report.detail);
                        setCurrentDataset(d => ({...d, active_sheet:report.active_sheet, revision:report.revision}));
                        setAnalysis(report.analysis);
                      } catch(e) {showToast(e.message,'error');}
                      finally {pending.current = false;setLoading(false);}
                    }}>{currentDataset.sheets.map(sheet => <option key={sheet}>{sheet}</option>)}</select>
                  </label>}
                  <div className="dataset-actions">
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
                    <ChartBuilder key={`${currentDataset.id}-${currentDataset.revision}`} datasetId={currentDataset.id} analysis={analysis} />
                  </div>
                )}

                {/* Tab 3: Data Quality & Profiling */}
                {analyticsSubTab === 'profiler' && (
                  <div>
                    <DataProfiler key={currentDataset.id}
                      revision={currentDataset.revision}
                      datasetId={currentDataset.id}
                      analysis={analysis}
                      onDataCleaned={handleDataCleaned}
                    />
                  </div>
                )}

                {/* Tab 4: Raw Data Grid */}
                {analyticsSubTab === 'table' && (
                  <div>
                    <DataTable key={`${currentDataset.id}-${currentDataset.revision}`}
                      datasetId={currentDataset.id}
                      onExport={handleExport}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isStudentTool ? (
          <StudentTools key={cleanPath}
            toolId={activeToolId}
            onToast={showToast}
            onNavigate={navigateTo}
          />
        ) : (PATH_TO_TOOL_ID[currentPath] || PATH_TO_TOOL_ID[cleanPath]) ? (
          /* 3. Dedicated Utility Tool View (for non-SEO or direct tool IDs) */
          <OmniTools key={cleanPath}
            toolId={activeToolId}
            onToast={showToast}
          />
        ) : registeredTool ? (
          <div className="platform tool-page">
            <Seo tool={registeredTool} path={toolPath(registeredTool)}/>
            <h1>{registeredTool.name}</h1><p>{registeredTool.description}</p>
            {registeredTool.accept ? <DataTool key={registeredTool.slug} tool={registeredTool}/> : <LocalTool key={registeredTool.slug} tool={registeredTool}/>}
            <AdSlot/><ToolInfo tool={registeredTool}/>
          </div>
        ) : <section><h1>Page not found</h1><a href="/tools">Browse all tools</a></section>}
        </Suspense>
      </main>
    </div>
  );
}
