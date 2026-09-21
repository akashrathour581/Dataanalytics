import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, ArrowUpDown } from 'lucide-react';

export default function DataTable({ datasetId, onExport }) {
  const [data, setData] = useState({ records: [], columns: [], total_records: 0, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!datasetId) return;

    const controller = new AbortController();
    const fetchRows = async () => {
      setError('');
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString(),
          search: search,
          sort_col: sortCol,
          sort_dir: sortDir
        });

        const res = await fetch(`/api/preview/${datasetId}?${queryParams}`, {signal:controller.signal});
        const result = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) throw new Error(result.detail || 'Could not load rows.');
        setData(result);
        setPage(result.page);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchRows, 200);
    return () => {clearTimeout(timer);controller.abort();};
  }, [datasetId, page, pageSize, search, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="table-card">
      {error && <p role="alert">{error}</p>}
      <div className="table-toolbar">
        <div className="responsive-row" style={{ alignItems: 'center', gap: 14 }}>
          <div className="responsive-row" style={{ position: 'relative', alignItems: 'center' }}>
            <Search size={16} color="#38bdf8" style={{ position: 'absolute', left: 12, pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.5))' }} />
            <input
              type="text"
              className="table-search-input"
              placeholder="Search in all columns..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: 36 }}
            />
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--theme-text, #cbd5e1)' }}>
            Showing <strong style={{ color: 'var(--theme-ink-teal, #38bdf8)' }}>{data.records.length}</strong> of <strong style={{ color: 'var(--theme-text, #ffffff)' }}>{data.total_records.toLocaleString()}</strong> rows
          </span>
        </div>

        <div className="responsive-row" style={{ alignItems: 'center', gap: 10 }}>
          <select
            className="control-select"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onExport('csv')}
            title="Download CSV"
            style={{
              borderColor: 'rgba(251, 191, 36, 0.4)',
              background: 'rgba(251, 191, 36, 0.12)',
              color: 'var(--theme-ink-orange, #fbbf24)',
              fontWeight: 600
            }}
          >
            <Download size={14} color="#fbbf24" />
            <span>CSV</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onExport('xlsx')}
            title="Download Excel"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: 'var(--theme-shadow, 0 4px 14px rgba(16, 185, 129, 0.4))',
              fontWeight: 600
            }}
          >
            <Download size={14} color="var(--theme-text, #ffffff)" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      <div className="table-scroll-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 50, textAlign: 'center', color: 'var(--theme-ink-teal, #38bdf8)' }}>#</th>
              {data.columns.map((col) => {
                const isSorted = sortCol === col;
                return (
                  <th key={col} onClick={() => handleSort(col)}>
                    <div className="responsive-row" style={{ alignItems: 'center', gap: 6, color: isSorted ? '#38bdf8' : 'var(--theme-text, #ffffff)' }}>
                      <span>{col}</span>
                      <ArrowUpDown
                        size={13}
                        color={isSorted ? '#38bdf8' : '#64748b'}
                        style={{ filter: isSorted ? 'drop-shadow(0 0 4px #38bdf8)' : 'none', opacity: isSorted ? 1 : 0.4 }}
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={data.columns.length + 1} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </td>
              </tr>
            ) : data.records.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length + 1} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              data.records.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: 6,
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--theme-ink-teal, #7dd3fc)',
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {((page - 1) * pageSize) + rIdx + 1}
                    </span>
                  </td>
                  {data.columns.map((col) => (
                    <td key={col}>
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span style={{ color: 'var(--theme-ink-pink, #f43f5e)', opacity: 0.6 }}>null</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-footer">
        <div>
          Page {page} of {data.total_pages}
        </div>
        <div className="pagination-controls">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= data.total_pages}
            onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
