import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, Wand2, RefreshCw } from 'lucide-react';

export default function DataProfiler({ datasetId, analysis, onDataCleaned }) {
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
      const res = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: datasetId,
          drop_duplicates: dropDuplicates,
          fill_numeric: fillNumeric,
          fill_categorical: fillCategorical
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCleanResult(`Cleaned successfully: Removed ${data.rows_removed} duplicate row(s) and imputed ${data.nulls_fixed} missing value(s).`);
        if (onDataCleaned) {
          onDataCleaned(data.analysis);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div>
      {/* 1-Click Clean Data Panel */}
      <div className="clean-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(56, 189, 248, 0.2)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
          }}>
            <Wand2 size={20} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }} />
          </div>
          <div>
            <h4 style={{ 
              fontSize: '1.05rem', 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Automated Data Hygiene & Cleaning
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
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
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
            }}
            onClick={handleCleanData}
            disabled={cleaning}
          >
            {cleaning ? (
              <RefreshCw size={14} className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            ) : (
              <ShieldCheck size={15} color="#ffffff" />
            )}
            <span>Execute Cleaning</span>
          </button>
        </div>
      </div>

      {cleanResult && (
        <div style={{
          marginBottom: 20,
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 10,
          color: '#34d399',
          fontSize: '0.875rem',
          display: 'flex',
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
                <span className="col-name" style={{ color: '#ffffff', fontWeight: 700 }}>
                  <span style={{ color: curTypeCol, marginRight: 6 }}>●</span>
                  {col.name}
                </span>
                <span className={`type-badge type-${col.type}`}>
                  {col.type}
                </span>
              </div>

              {/* Progress bar for completeness */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
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
