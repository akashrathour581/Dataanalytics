import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, Wand2, RefreshCw } from 'lucide-react';

export default function DataProfiler({ datasetId, analysis, revision, onDataCleaned }) {
  const [dropDuplicates, setDropDuplicates] = useState(true);
  const [fillNumeric, setFillNumeric] = useState('median');
  const [fillCategorical, setFillCategorical] = useState('mode');
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState(null);

  if (!analysis) return null;

  const { column_profiles = [], summary } = analysis;

  const handleCleanData = async () => {
    setCleaning(true);
    setCleanResult(null);
    try {
      // Build operations array matching backend CleaningOperation schema (uses 'kind', per-column fills)
      const operations = [];

      if (dropDuplicates) {
        operations.push({ kind: 'duplicates', column: '', value: '', replacement: '', method: 'median', columns: [] });
      }

      if (fillNumeric !== 'none') {
        const numericCols = column_profiles.filter(c => c.type === 'numeric' && c.null_count > 0 && (c.count > 0 || fillNumeric === 'zero'));
        for (const col of numericCols) {
          if (fillNumeric === 'zero') {
            operations.push({ kind: 'fill', column: col.name, value: '0', replacement: '', method: 'custom', columns: [] });
          } else {
            // 'mean' or 'median'
            operations.push({ kind: 'fill', column: col.name, value: '', replacement: '', method: fillNumeric, columns: [] });
          }
        }
      }

      if (fillCategorical !== 'none') {
        const catCols = column_profiles.filter(c => c.type === 'categorical' && c.null_count > 0 && (c.count > 0 || fillCategorical === 'unknown'));
        for (const col of catCols) {
          if (fillCategorical === 'unknown') {
            operations.push({ kind: 'fill', column: col.name, value: 'Unknown', replacement: '', method: 'custom', columns: [] });
          } else {
            // 'mode'
            operations.push({ kind: 'fill', column: col.name, value: '', replacement: '', method: 'mode', columns: [] });
          }
        }
      }

      const res = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: datasetId,
          operations,
          action: 'apply',
          revision
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Use preview.before / preview.after from the API response for accurate diff stats
        const before = data.preview?.before;
        const after = data.preview?.after;
        const rowsRemoved = (before && after) ? before.rows - after.rows : 0;
        const missingFixed = (before && after) ? before.missing - after.missing : 0;
        setCleanResult(
          `Cleaning applied! Removed ${Math.max(0, rowsRemoved)} duplicate row(s) and filled ${Math.max(0, missingFixed)} missing value(s).`
        );
        if (onDataCleaned) {
          onDataCleaned(data);
        }
      } else {
        setCleanResult(`Error: ${data.detail || 'Cleaning failed. Please try again.'}`);
      }
    } catch (err) {
      console.error(err);
      setCleanResult(`Error: ${err.message}`);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div>
      {/* 1-Click Clean Data Panel */}
      <div className="clean-panel">
        <div className="responsive-row" style={{ alignItems: 'center', gap: 14 }}>
          <div className="responsive-row" style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            color: 'var(--theme-ink-teal, #38bdf8)',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--theme-shadow, 0 0 16px rgba(56, 189, 248, 0.4))'
          }}>
            <Wand2 size={20} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
          </div>
          <div>
            <h4 style={{ 
              fontSize: '1.05rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--theme-text, #ffffff) 30%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Automated Data Hygiene & Cleaning
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--theme-text, #cbd5e1)' }}>
              Impute missing values and strip duplicate records to ensure analysis integrity
            </p>
          </div>
        </div>

        <div className="clean-options">
          <label className="clean-checkbox-label">
            <input 
              type="checkbox" 
              checked={dropDuplicates} 
              onChange={(e) => setDropDuplicates(e.target.checked)} 
            />
            <span>Drop Duplicates ({summary.duplicate_rows})</span>
          </label>

          <div className="responsive-row" style={{ alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Numeric Nulls:</span>
            <select 
              className="control-select"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={fillNumeric}
              onChange={(e) => setFillNumeric(e.target.value)}
            >
              <option value="none">Keep As-Is</option>
              <option value="median">Fill with Median</option>
              <option value="mean">Fill with Mean</option>
              <option value="zero">Fill with 0</option>
            </select>
          </div>

          <div className="responsive-row" style={{ alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Categorical Nulls:</span>
            <select 
              className="control-select"
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={fillCategorical}
              onChange={(e) => setFillCategorical(e.target.value)}
            >
              <option value="none">Keep As-Is</option>
              <option value="mode">Fill with Most Frequent</option>
              <option value="unknown">Fill with 'Unknown'</option>
            </select>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            style={{ 
              padding: '8px 18px', 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
              boxShadow: 'var(--theme-shadow, 0 4px 14px rgba(56, 189, 248, 0.4))'
            }}
            onClick={handleCleanData}
            disabled={cleaning}
          >
            {cleaning ? (
              <RefreshCw size={14} className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            ) : (
              <ShieldCheck size={15} color="var(--theme-text, #ffffff)" />
            )}
            <span>Execute Cleaning</span>
          </button>
        </div>
      </div>

      {cleanResult && (
        <div className="responsive-row" style={{
          marginBottom: 20,
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 10,
          color: 'var(--theme-ink-green, #34d399)',
          fontSize: '0.875rem',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle size={18} />
          <span>{cleanResult}</span>
        </div>
      )}

      {/* Grid of Column Profiles */}
      <div className="profiler-grid">
        {column_profiles.map((col) => {
          const typeColors = {
            numeric: '#38bdf8',
            categorical: '#c084fc',
            datetime: '#34d399',
            id: '#fbbf24'
          };
          const curTypeCol = typeColors[col.type] || '#38bdf8';
          return (
            <div key={col.name} className="profile-card" style={{ borderTop: `3px solid ${curTypeCol}` }}>
              <div className="profile-card-header">
                <span className="col-name" style={{ color: 'var(--theme-text, #ffffff)', fontWeight: 700 }}>
                  <span style={{ color: curTypeCol, marginRight: 6 }}>●</span>
                  {col.name}
                </span>
                <span className={`type-badge type-${col.type}`}>
                  {col.type}
                </span>
              </div>

              {/* Progress bar for completeness */}
              <div className="responsive-row" style={{ justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Missing: {col.null_count.toLocaleString()} ({col.null_pct}%)</span>
                <span>{100 - col.null_pct}% valid</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${Math.max(2, 100 - col.null_pct)}%`,
                    background: col.null_pct > 20 ? '#f43f5e' : (col.null_pct > 0 ? '#f59e0b' : '#10b981')
                  }}
                />
              </div>

              <div className="stat-row">
                <span className="stat-label">Unique Cardinality</span>
                <span className="stat-val">{col.unique_count.toLocaleString()}</span>
              </div>

              {/* Specific stats for numeric */}
              {col.type === 'numeric' && col.mean !== undefined && (
                <>
                  <div className="stat-row">
                    <span className="stat-label">Mean (Average)</span>
                    <span className="stat-val">{Number(col.mean).toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Median / Std Dev</span>
                    <span className="stat-val">{Number(col.median).toLocaleString()} / {Number(col.std || 0).toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Min / Max Range</span>
                    <span className="stat-val">{Number(col.min).toLocaleString()} → {Number(col.max).toLocaleString()}</span>
                  </div>
                </>
              )}

              {/* Specific stats for categorical */}
              {col.type === 'categorical' && col.top_categories && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Top Values:
                  </div>
                  {col.top_categories.slice(0, 3).map((tc, idx) => (
                    <div key={idx} className="stat-row" style={{ fontSize: '0.75rem' }}>
                      <span className="stat-label" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tc.label}
                      </span>
                      <span className="stat-val">{tc.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Specific stats for datetime */}
              {col.type === 'datetime' && col.min_date && (
                <div className="stat-row" style={{ marginTop: 8 }}>
                  <span className="stat-label">Date Span</span>
                  <span className="stat-val">{col.min_date} → {col.max_date}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
