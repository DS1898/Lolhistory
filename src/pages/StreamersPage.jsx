import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApp } from '../context/AppContext';

const PER_PAGE = 30;

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const btnBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 8, fontSize: '0.85rem',
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: '2.5rem' }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ ...btnBase, background: page === 1 ? 'var(--bg-hover)' : 'var(--bg-input)', color: page === 1 ? 'var(--text-lo)' : 'var(--text-mid)', cursor: page === 1 ? 'default' : 'pointer' }}>
        ‹
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ width: 36, textAlign: 'center', color: 'var(--text-lo)', fontSize: '0.85rem' }}>•••</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            style={{ ...btnBase, background: p === page ? '#4489c8' : 'var(--bg-input)', color: p === page ? '#fff' : 'var(--text-mid)',
              boxShadow: p === page ? '0 2px 10px rgba(68,137,200,0.4)' : 'none' }}>
            {p}
          </button>
        )
      )}

      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        style={{ ...btnBase, background: page === totalPages ? 'var(--bg-hover)' : 'var(--bg-input)', color: page === totalPages ? 'var(--text-lo)' : 'var(--text-mid)', cursor: page === totalPages ? 'default' : 'pointer' }}>
        ›
      </button>
    </div>
  );
}

export default function StreamersPage() {
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    fetchStreamers(searchParams.get('q') || '');
  }, [searchParams]);

  async function fetchStreamers(q) {
    setLoading(true);
    try {
      let req = supabase.from('streamers').select('id, name, profile_image_url, soop_url').order('name');
      if (q) req = req.ilike('name', `%${q}%`);
      const { data, error } = await req;
      if (error) throw error;
      setStreamers(data || []);
    } catch {
      setStreamers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    setSearchParams(q ? { q } : {});
    setPage(1);
  }

  const currentQ = searchParams.get('q') || '';
  const totalPages = Math.ceil(streamers.length / PER_PAGE);
  const paged = streamers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-hi)' }}>{t('streamers_title')}</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', borderRadius: 10, padding: '0 0.5rem 0 0.9rem', gap: 6, transition: 'border-color 0.2s' }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = '#4489c8'}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--border-clr)'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-lo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            style={{ background: 'transparent', border: 'none', outline: 'none', padding: '0.6rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-hi)', width: 200, fontFamily: 'inherit' }}
          />
          <button type="submit" style={{
            background: '#4489c8', border: 'none', borderRadius: 8,
            padding: '0.4rem 0.9rem', color: '#fff', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          }}>{t('search_btn')}</button>
        </form>
      </div>

      {currentQ && (
        <p style={{ color: 'var(--text-mid)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {t('search_results_count', { q: currentQ, n: streamers.length })}
        </p>
      )}

      {loading ? <LoadingSpinner /> : paged.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-lo)' }}>
          {currentQ ? `"${currentQ}" ${t('no_results')}` : t('no_streamers')}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {paged.map((s) => (
              <Link key={s.id} to={`/streamer/${s.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-clr)', borderRadius: 16,
                  padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10, cursor: 'pointer',
                  transition: 'border-color 0.2s, transform 0.2s, background 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4489c8'; e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-clr)'; e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)', border: '2px solid var(--border-clr)', flexShrink: 0 }}>
                    {s.profile_image_url
                      ? <img src={s.profile_image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: 'var(--text-lo)' }}>{s.name.charAt(0)}</div>}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-hi)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{s.name}</p>
                    {s.soop_url && <p style={{ fontSize: '0.7rem', color: '#4489c8' }}>SOOP</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </>
      )}
    </div>
  );
}
