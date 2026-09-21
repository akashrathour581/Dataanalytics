import React, { useState, useEffect } from 'react';
import OmniTools from './OmniTools';
import StudentTools from './StudentTools';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

export default function SeoLandingPage({ page, onNavigate, onToast, onLaunchAnalytics }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (page) {
      document.title = page.title;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', page.metaDesc);
      }
    }
  }, [page]);

  if (!page) return null;

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <article className="seo-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('/ai-data-analyst')} className="crumb-link">
          Home
        </button>
        <span className="crumb-sep">/</span>
        <span className="crumb-category">{page.toolType.toUpperCase()}</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{page.h1}</span>
      </nav>

      {/* SEO Hero Section */}
      <header className="seo-hero">
        <div className="seo-hero-badge">
          <Sparkles size={14} color="#38bdf8" />
          <span>Free Online Web Utility • 100% Free & Secure</span>
        </div>
        <h1 className="seo-h1">{page.h1}</h1>
        <p className="seo-subtitle">{page.subtitle}</p>
      </header>

      {/* Interactive Tool Widget Embedded Directly */}
      <section className="seo-tool-section" id="interactive-tool">
        {page.slug === '/ai-data-analyst' ? (
          <div className="chart-card" style={{ padding: '36px 32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.12) 100%)' }}>
            <div className="brand-icon-wrapper" style={{ margin: '0 auto 16px', width: 56, height: 56 }}>
              <FileSpreadsheet size={28} color="#090d16" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
              Launch Full AI Analytics & BI Studio
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 24px', fontSize: '0.9rem' }}>
              Instant automated EDA, KPI cards, monthly sales trends, dynamic query builder, and data cleaning for Excel and CSV files.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                onClick={() => onLaunchAnalytics(false)}
              >
                <Sparkles size={16} />
                <span>Open Analytics Studio</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                onClick={() => onLaunchAnalytics(true)}
              >
                <span>Demo with Retail Sample Data</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : page.toolType === 'student' ? (
          <StudentTools key={page.toolId} toolId={page.toolId} onToast={onToast} onNavigate={onNavigate} />
        ) : (
          <OmniTools key={page.toolId} toolId={page.toolId} onToast={onToast} />
        )}
      </section>

      {/* Trust Badges */}
      <div className="trust-badges-bar">
        <div className="trust-badge">
          <ShieldCheck size={18} color="#34d399" />
          <span>Zero Server Retention (100% In-Memory)</span>
        </div>
        <div className="trust-badge">
          <Zap size={18} color="#38bdf8" />
          <span>Lightning Fast Python Engine</span>
        </div>
        <div className="trust-badge">
          <CheckCircle2 size={18} color="#818cf8" />
          <span>No Signup or Watermarks</span>
        </div>
      </div>

      {/* 3-Step Visual Process */}
      <section className="seo-steps-section">
        <h2 className="seo-section-title">How It Works in 3 Easy Steps</h2>
        <div className="seo-steps-grid">
          {page.steps.map((st) => (
            <div key={st.step} className="seo-step-card">
              <div className="step-number-badge">{st.step}</div>
              <h3 className="step-card-title">{st.title}</h3>
              <p className="step-card-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Technical Benefits Grid */}
      <section className="seo-features-section">
        <h2 className="seo-section-title">Key Features & Technical Advantages</h2>
        <div className="seo-features-grid">
          {page.features.map((feat, idx) => {
            const featColors = ['#38bdf8', '#34d399', '#c084fc', '#fbbf24', '#fb7185', '#818cf8'];
            const curColor = featColors[idx % featColors.length];
            return (
              <div key={idx} className="seo-feature-box" style={{ borderColor: `${curColor}25` }}>
                <div className="feature-check-icon" style={{
                  background: `${curColor}20`,
                  boxShadow: `0 0 12px ${curColor}40`,
                  border: `1px solid ${curColor}40`
                }}>
                  <CheckCircle2 size={18} color={curColor} style={{ filter: `drop-shadow(0 0 4px ${curColor})` }} />
                </div>
                <div>
                  <h3 className="feature-box-title" style={{ color: 'var(--theme-text, #ffffff)' }}>
                    <span style={{ color: curColor, marginRight: 6 }}>✦</span>
                    {feat.title}
                  </h3>
                  <p className="feature-box-desc">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="seo-faq-section">
        <h2 className="seo-section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {page.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="faq-item" style={{ borderColor: isOpen ? 'rgba(56, 189, 248, 0.4)' : undefined }}>
                <button
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  style={{ color: isOpen ? '#38bdf8' : 'var(--theme-text, #ffffff)' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: isOpen ? '#38bdf8' : '#818cf8', fontWeight: 800 }}>Q{idx + 1}.</span>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} color="#38bdf8" /> : <ChevronDown size={18} color="var(--theme-text, #94a3b8)" />}
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Related Tools Recommendation */}
      {page.related && page.related.length > 0 && (
        <section className="seo-related-section">
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            Related Free Data & File Tools:
          </h3>
          <div className="related-pills-list">
            {page.related.map((relSlug) => (
              <button
                key={relSlug}
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate(relSlug)}
              >
                <span>{relSlug.replace('/', '').replace(/-/g, ' ').toUpperCase()}</span>
                <ArrowRight size={13} />
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
