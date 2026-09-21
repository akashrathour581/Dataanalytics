import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Sparkles, BarChart2, PieChart as PieIcon, LineChart as LineIcon, Grid } from 'lucide-react';

const PIE_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24', '#a855f7', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'linear-gradient(145deg, var(--theme-panel, rgba(10, 15, 28, 0.97)), var(--theme-panel, rgba(15, 20, 35, 0.97)))',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: 'var(--theme-shadow, 0 12px 32px rgba(0,0,0,0.6), 0 0 20px rgba(56,189,248,0.15))',
        backdropFilter: 'blur(20px)',
        minWidth: 140,
      }}>
        <p style={{
          color: 'var(--theme-text, #94a3b8)',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 6,
        }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{
            color: entry.color || '#38bdf8',
            fontWeight: 700,
            fontSize: '0.95rem',
            fontFamily: 'JetBrains Mono, monospace',
            filter: `drop-shadow(0 0 4px ${entry.color || '#38bdf8'}80)`,
            marginTop: i > 0 ? 4 : 0,
          }}>
            {entry.name}: {Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SmartCharts({ analysis }) {
  if (!analysis) return null;

  const { charts = [], correlation, insights = [] } = analysis;

  const timeSeriesChart = charts.find(c => c.type === 'area');
  const pieChart = charts.find(c => c.type === 'pie');
  const barCharts = charts.filter(c => c.type === 'bar');

  return (
    <div>
      {/* Narrative AI Insights Banner */}
      {insights.length > 0 && (
        <div className="insights-card" style={{
          border: '1px solid rgba(251, 191, 36, 0.35)',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(244, 63, 94, 0.06) 100%)',
          boxShadow: 'var(--theme-shadow, 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(251, 191, 36, 0.15))'
        }}>
          <div className="insights-title">
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(251, 191, 36, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--theme-shadow, 0 0 12px rgba(251, 191, 36, 0.4))'
            }}>
              <Sparkles size={18} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
            </div>
            <strong style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.05rem',
              fontWeight: 800
            }}>
              Automated Data Intelligence & Insights
            </strong>
          </div>
          <ul className="insights-list">
            {insights.map((insight, idx) => {
              const dotColors = ['#38bdf8', '#34d399', '#c084fc', '#fbbf24', '#fb7185'];
              const curDot = dotColors[idx % dotColors.length];
              return (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    marginTop: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: curDot,
                    boxShadow: `0 0 8px ${curDot}`,
                    flexShrink: 0
                  }} />
                  <span style={{ color: 'var(--theme-text, #e2e8f0)', lineHeight: 1.6 }}>{insight}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="charts-grid">
        {/* 1. Time Series Area Chart */}
        {timeSeriesChart && (
          <div className="chart-card col-8">
            <div className="chart-header">
              <div>
                <h3 className="chart-title" style={{
                  background: 'linear-gradient(135deg, var(--theme-text, #ffffff) 20%, #38bdf8 55%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  filter: 'drop-shadow(0 2px 8px rgba(56,189,248,0.3))',
                }}>
                  {timeSeriesChart.title}
                </h3>
                <p className="chart-desc" style={{ color: 'var(--theme-text, #94a3b8)', marginTop: 2 }}>{timeSeriesChart.description}</p>
              </div>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(145deg, rgba(56, 189, 248, 0.18), var(--theme-panel, rgba(8, 12, 24, 0.9)))',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--theme-shadow, 0 0 20px rgba(56, 189, 248, 0.45), inset 1px 1px 3px rgba(255,255,255,0.1))',
                flexShrink: 0,
              }}>
                <LineIcon size={20} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 5px #38bdf8)' }} />
              </div>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={timeSeriesChart.data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Aggregate"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Composition Donut / Pie */}
        {pieChart && (
          <div className={`chart-card ${timeSeriesChart ? 'col-4' : 'col-6'}`}>
            <div className="chart-header">
              <div>
                <h3 className="chart-title" style={{
                  background: 'linear-gradient(135deg, var(--theme-text, #ffffff) 20%, #c084fc 55%, #e879f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  filter: 'drop-shadow(0 2px 8px rgba(192,132,252,0.3))',
                }}>
                  {pieChart.title}
                </h3>
                <p className="chart-desc" style={{ color: 'var(--theme-text, #94a3b8)', marginTop: 2 }}>{pieChart.description}</p>
              </div>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(192, 132, 252, 0.18)',
                border: '1px solid rgba(192, 132, 252, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--theme-shadow, 0 0 14px rgba(192, 132, 252, 0.35))'
              }}>
                <PieIcon size={19} color="#c084fc" style={{ filter: 'drop-shadow(0 0 4px #c084fc)' }} />
              </div>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={pieChart.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChart.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value) => <span style={{ color: 'var(--theme-text, #cbd5e1)', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Categorical Ranking Bar Charts */}
        {barCharts.map((bc, bIdx) => {
          const barTheme = bIdx === 0
            ? { col: '#34d399', bg: 'rgba(52, 211, 153, 0.18)', bdr: 'rgba(52, 211, 153, 0.45)' }
            : { col: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)', bdr: 'rgba(129, 140, 248, 0.45)' };
          return (
            <div key={bc.id || bIdx} className={`chart-card ${barCharts.length > 1 ? 'col-6' : 'col-12'}`}>
              <div className="chart-header">
                <div>
                  <h3 className="chart-title" style={{
                    background: `linear-gradient(135deg, var(--theme-text, #ffffff) 30%, ${barTheme.col} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                  }}>
                    {bc.title}
                  </h3>
                  <p className="chart-desc">{bc.description}</p>
                </div>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: barTheme.bg,
                  border: `1px solid ${barTheme.bdr}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 14px ${barTheme.col}55`
                }}>
                  <BarChart2 size={19} color={barTheme.col} style={{ filter: `drop-shadow(0 0 4px ${barTheme.col})` }} />
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={bc.data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id={`barGlow_${bIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={bIdx === 0 ? "#34d399" : "#818cf8"} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={bIdx === 0 ? "#059669" : "#4f46e5"} stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                    <XAxis
                      dataKey="category"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Metric" fill={`url(#barGlow_${bIdx})`} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}

        {/* 4. Correlation Matrix */}
        {correlation && correlation.columns && correlation.columns.length >= 2 && (
          <div className="chart-card col-12">
            <div className="chart-header">
              <div>
                <h3 className="chart-title" style={{
                  background: 'linear-gradient(135deg, var(--theme-text, #ffffff) 30%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800
                }}>
                  Numeric Features Correlation Heatmap
                </h3>
                <p className="chart-desc">Linear correlation coefficients between detected continuous numerical dimensions (-1.0 to +1.0)</p>
              </div>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(251, 191, 36, 0.18)',
                border: '1px solid rgba(251, 191, 36, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--theme-shadow, 0 0 14px rgba(251, 191, 36, 0.35))'
              }}>
                <Grid size={19} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
              </div>
            </div>
            <div style={{ overflowX: 'auto', padding: '10px 0' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `140px repeat(${correlation.columns.length}, minmax(110px, 1fr))`,
                gap: 6,
                minWidth: 600
              }}>
                <div></div>
                {correlation.columns.map((c, i) => (
                  <div key={i} style={{
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--theme-text, #94a3b8)',
                    padding: '6px 4px',
                    wordBreak: 'break-all'
                  }}>
                    {c}
                  </div>
                ))}

                {correlation.columns.map((rowCol, rIdx) => (
                  <React.Fragment key={rIdx}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--theme-text, #94a3b8)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 8px'
                    }}>
                      {rowCol}
                    </div>
                    {correlation.columns.map((colCol, cIdx) => {
                      const item = correlation.matrix.find(m => m.x === rowCol && m.y === colCol);
                      const val = item && item.value !== null ? item.value : 0;

                      // Calculate color intensity
                      let bg = 'rgba(255,255,255,0.03)';
                      let textColor = 'var(--theme-text, #cbd5e1)';
                      if (val > 0) {
                        bg = `rgba(56, 189, 248, ${Math.max(0.1, val * 0.7)})`;
                        if (val > 0.6) textColor = 'var(--theme-text, #ffffff)';
                      } else if (val < 0) {
                        bg = `rgba(244, 63, 94, ${Math.max(0.1, Math.abs(val) * 0.7)})`;
                      }

                      return (
                        <div key={cIdx} style={{
                          background: bg,
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          padding: '12px 8px',
                          textAlign: 'center',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.85rem',
                          color: textColor,
                          fontWeight: 500,
                          transition: 'transform 0.15s ease'
                        }}>
                          {val !== null ? val.toFixed(2) : '-'}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
