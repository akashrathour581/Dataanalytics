import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Sliders, RefreshCw, BarChart2, TrendingUp, Layers, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7', '#06b6d4', '#f97316'];

export default function ChartBuilder({ datasetId, analysis }) {
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [aggFunc, setAggFunc] = useState('sum');
  const [chartType, setChartType] = useState('bar');
  const [limit, setLimit] = useState(12);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = analysis?.column_profiles || [];
  const numericCols = columns.filter(c => c.type === 'numeric');
  const catAndDateCols = columns.filter(c => c.type === 'categorical' || c.type === 'datetime' || c.type === 'id');

  // Initialize defaults
  useEffect(() => {
    if (columns.length > 0) {
      if (catAndDateCols.length > 0 && !xCol) {
        setXCol(catAndDateCols[0].name);
      } else if (!xCol) {
        setXCol(columns[0].name);
      }

      if (numericCols.length > 0 && !yCol) {
        setYCol(numericCols[0].name);
      }
    }
  }, [analysis]);

  // Execute query whenever selections change
  useEffect(() => {
    if (!datasetId || !xCol) return;

    const runQuery = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataset_id: datasetId,
            x_col: xCol,
            y_col: yCol || null,
            agg_func: aggFunc,
            limit: Number(limit)
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setChartData(data.data || []);
        } else {
          setError(data.detail || 'Aggregation query failed');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    runQuery();
  }, [datasetId, xCol, yCol, aggFunc, limit]);

  return (
    <div className="chart-card col-12">
      <div className="chart-header">
        <div>
          <h3 className="chart-title" style={{
            background: 'linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '1.25rem'
          }}>
            Dynamic No-Code Visual Query Builder
          </h3>
          <p className="chart-desc" style={{ color: '#cbd5e1' }}>
            Slice & dice any dimension against measures with custom aggregations on the fly
          </p>
        </div>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'rgba(168, 85, 247, 0.2)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(168, 85, 247, 0.45)'
        }}>
          <Sliders size={20} color="#c084fc" style={{ filter: 'drop-shadow(0 0 6px #c084fc)' }} />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="builder-controls">
        {/* X-Axis (Dimension) */}
        <div className="control-group">
          <label className="control-label" style={{ color: '#7dd3fc', fontWeight: 700, letterSpacing: '0.04em' }}>
            ◆ X-Axis (Dimension)
          </label>
          <select 
            className="control-select"
            value={xCol}
            onChange={(e) => setXCol(e.target.value)}
            style={{ borderColor: 'rgba(56, 189, 248, 0.35)', color: '#f1f5f9' }}
          >
            {columns.map(c => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* Aggregation Function */}
        <div className="control-group">
          <label className="control-label" style={{ color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.04em' }}>
            ◆ Aggregation
          </label>
          <select 
            className="control-select"
            value={aggFunc}
            onChange={(e) => setAggFunc(e.target.value)}
            style={{ borderColor: 'rgba(52, 211, 153, 0.35)', color: '#f1f5f9' }}
          >
            <option value="sum">SUM (Total)</option>
            <option value="mean">MEAN (Average)</option>
            <option value="count">COUNT (Frequency)</option>
            <option value="min">MIN (Lowest)</option>
            <option value="max">MAX (Highest)</option>
            <option value="median">MEDIAN (Middle)</option>
          </select>
        </div>

        {/* Y-Axis (Metric) */}
        <div className="control-group">
          <label className="control-label" style={{ color: '#fde047', fontWeight: 700, letterSpacing: '0.04em' }}>
            ◆ Y-Axis (Metric)
          </label>
          <select 
            className="control-select"
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
            disabled={aggFunc === 'count'}
            style={{ borderColor: 'rgba(251, 191, 36, 0.35)', color: '#f1f5f9' }}
          >
            {aggFunc === 'count' ? (
              <option value="">Row Count (All)</option>
            ) : (
              numericCols.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Chart Type */}
        <div className="control-group">
          <label className="control-label" style={{ color: '#f472b6', fontWeight: 700, letterSpacing: '0.04em' }}>
            ◆ Chart Type
          </label>
          <select 
            className="control-select"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={{ borderColor: 'rgba(244, 63, 94, 0.35)', color: '#f1f5f9' }}
          >
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Donut / Pie Chart</option>
          </select>
        </div>

        {/* Limit */}
        <div className="control-group" style={{ minWidth: 100, flex: 0.5 }}>
          <label className="control-label" style={{ color: '#c084fc', fontWeight: 700, letterSpacing: '0.04em' }}>
            ◆ Top N Limit
          </label>
          <select 
            className="control-select"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            style={{ borderColor: 'rgba(192, 132, 252, 0.35)', color: '#f1f5f9' }}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
            <option value="25">Top 25</option>
          </select>
        </div>
      </div>

      {/* Chart Render Area */}
      <div className="chart-body" style={{ minHeight: 380, position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 8
          }}>
            <div className="spinner"></div>
          </div>
        )}

        {error && (
          <div style={{ color: '#fb7185', padding: 20, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
            No aggregated data returned for this configuration.
          </div>
        )}

        {!error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={380}>
            {chartType === 'bar' && (
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="customBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis 
                  dataKey="key" 
                  stroke="#64748b" 
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" name={`${aggFunc.toUpperCase()} of ${yCol || 'Rows'}`} fill="url(#customBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}

            {chartType === 'line' && (
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="key" stroke="#64748b" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8' }} />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
              </LineChart>
            )}

            {chartType === 'area' && (
              <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="customArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="key" stroke="#64748b" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #10b981' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#customArea)" />
              </AreaChart>
            )}

            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="key"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #38bdf8' }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
