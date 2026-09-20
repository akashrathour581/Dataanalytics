import React from 'react';
import { Layers, Activity, TrendingUp, ShieldCheck, Database, DollarSign } from 'lucide-react';

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

  return (
    <div className="kpi-grid">
      {/* 1. Total Rows */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Total Records</span>
          <div className="kpi-icon" style={{ color: '#38bdf8' }}>
            <Database size={18} />
          </div>
        </div>
        <div className="kpi-value">{summary.total_rows.toLocaleString()}</div>
        <div className="kpi-subtext">
          <span>Across {summary.total_cols} columns</span>
        </div>
      </div>

      {/* 2. Primary Metric (e.g. Total Sales) */}
      {primaryKpi && (
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total {primaryKpi.column}</span>
            <div className="kpi-icon" style={{ color: '#34d399' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(primaryKpi.total)}</div>
          <div className="kpi-subtext">
            <span>Avg: {formatNumber(primaryKpi.average)} | Max: {formatNumber(primaryKpi.max)}</span>
          </div>
        </div>
      )}

      {/* 3. Secondary Metric (e.g. Total Profit or 2nd Metric) */}
      {secondaryKpi && (
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total {secondaryKpi.column}</span>
            <div className="kpi-icon" style={{ color: '#818cf8' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(secondaryKpi.total)}</div>
          <div className="kpi-subtext">
            <span>Avg: {formatNumber(secondaryKpi.average)} | Min: {formatNumber(secondaryKpi.min)}</span>
          </div>
        </div>
      )}

      {/* 4. Data Health Score */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Data Quality Score</span>
          <div className="kpi-icon" style={{ color: summary.health_score > 80 ? '#34d399' : '#f59e0b' }}>
            <ShieldCheck size={18} />
          </div>
        </div>
        <div className="kpi-value">
          {summary.health_score}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / 100</span>
        </div>
        <div className="kpi-subtext">
          <span>{summary.completeness_pct}% Complete • {summary.duplicate_rows} Duplicates</span>
        </div>
      </div>
    </div>
  );
}
