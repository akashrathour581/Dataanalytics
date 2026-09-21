import React from 'react';
import { Layers, TrendingUp, ShieldCheck, Database, DollarSign } from 'lucide-react';

export default function KpiCards({ analysis }) {
  if (!analysis || !analysis.summary) return null;

  const { summary, kpis = [] } = analysis;
  const primaryKpi = kpis.length > 0 ? kpis[0] : null;
  const secondaryKpi = kpis.length > 1 ? kpis[1] : null;

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (typeof num !== 'number') return num;
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return Number.isInteger(num) ? num.toLocaleString() : num.toFixed(2);
  };

  const healthColor = summary.health_score > 80
    ? { icon: '#34d399', label: '#6ee7b7', badge: 'rgba(52,211,153,0.15)', badgeBorder: 'rgba(52,211,153,0.4)' }
    : summary.health_score > 60
      ? { icon: '#fbbf24', label: '#fde68a', badge: 'rgba(251,191,36,0.15)', badgeBorder: 'rgba(251,191,36,0.4)' }
      : { icon: '#fb7185', label: '#fda4af', badge: 'rgba(251,113,133,0.15)', badgeBorder: 'rgba(251,113,133,0.4)' };

  return (
    <div className="kpi-grid">
      {/* 1. Total Rows */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Records</span>
          <div className="kpi-icon" style={{ color: 'var(--theme-ink-teal, #38bdf8)' }}>
            <Database size={20} />
          </div>
        </div>
        <div className="kpi-value">{summary.total_rows.toLocaleString()}</div>
        <div className="kpi-subtext">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 99,
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: 'var(--theme-ink-teal, #7dd3fc)',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <Layers size={12} />
            {summary.total_cols} columns
          </span>
        </div>
      </div>

      {/* 2. Primary Metric (e.g. Total Sales) */}
      {primaryKpi && (
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total {primaryKpi.column}</span>
            <div className="kpi-icon" style={{ color: 'var(--theme-ink-green, #34d399)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(primaryKpi.total)}</div>
          <div className="kpi-subtext" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <span style={{ color: 'var(--theme-ink-green, #a7f3d0)', fontSize: '0.8rem' }}>
              Avg: <strong>{formatNumber(primaryKpi.average)}</strong>
            </span>
            <span style={{ color: 'var(--theme-ink-green, #6ee7b7)', fontSize: '0.8rem' }}>
              Max: <strong>{formatNumber(primaryKpi.max)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* 3. Secondary Metric (e.g. Total Profit or 2nd Metric) */}
      {secondaryKpi && (
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total {secondaryKpi.column}</span>
            <div className="kpi-icon" style={{ color: 'var(--theme-ink-violet, #c084fc)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(secondaryKpi.total)}</div>
          <div className="kpi-subtext" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <span style={{ color: 'var(--theme-ink-blue, #e9d5ff)', fontSize: '0.8rem' }}>
              Avg: <strong>{formatNumber(secondaryKpi.average)}</strong>
            </span>
            <span style={{ color: 'var(--theme-ink-blue, #d8b4fe)', fontSize: '0.8rem' }}>
              Min: <strong>{formatNumber(secondaryKpi.min)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* 4. Data Health Score */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Data Quality Score</span>
          <div className="kpi-icon" style={{ color: healthColor.icon }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="kpi-value">
          {summary.health_score}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / 100</span>
        </div>
        <div className="kpi-subtext" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          {/* Completeness progress bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.75rem', color: healthColor.label, fontWeight: 600 }}>Completeness</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--theme-text, #ffffff)', fontWeight: 700 }}>{summary.completeness_pct}%</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${summary.completeness_pct}%`,
                  background: `linear-gradient(90deg, ${healthColor.icon}, ${healthColor.label})`,
                  boxShadow: `0 0 8px ${healthColor.icon}80`,
                }}
              />
            </div>
          </div>
          <span
            style={{
              padding: '2px 9px',
              borderRadius: 99,
              background: healthColor.badge,
              border: `1px solid ${healthColor.badgeBorder}`,
              color: healthColor.label,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {summary.duplicate_rows} Duplicates
          </span>
        </div>
      </div>
    </div>
  );
}
