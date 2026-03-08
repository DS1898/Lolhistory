import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { LANG_OPTIONS } from '../../context/langOptions';
import { getRecent, saveRecent } from '../../lib/recentStreamers';

/* ── 테마 토글 버튼 ── */
function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{
        width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border-clr)',
        background: 'var(--bg-input)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-mid)', transition: 'all 0.2s', flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4489c8'; e.currentTarget.style.color = '#4489c8'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-clr)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
    >
      {isDark ? (
        /* 달 아이콘 (dark→click→light) */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        /* 해 아이콘 (light→click→dark) */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}

/* ── 언어 선택 드롭다운 (shadcn Select 스타일) ── */
function LangSelect() {
  const { lang, setLang } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = LANG_OPTIONS.find((o) => o.value === lang) || LANG_OPTIONS[0];

  useEffect(() => {
    function fn(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 10px',
          background: 'var(--bg-input)',
          border: `1px solid ${open ? '#4489c8' : 'var(--border-clr)'}`,
          borderRadius: open ? '8px 8px 0 0' : 8,
          color: 'var(--text-hi)', fontSize: '0.8rem', fontWeight: 500,
          cursor: 'pointer', transition: 'border-color 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {current.label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* 드롭다운 리스트 */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, minWidth: '100%',
          background: 'var(--bg-card)',
          border: '1px solid #4489c8', borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden', zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {/* 섹션 헤더 */}
          <div style={{ padding: '7px 12px 4px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-lo)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Language
          </div>
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={(e) => { e.preventDefault(); setLang(opt.value); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px',
                background: opt.value === lang ? 'rgba(68,137,200,0.15)' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: '0.82rem',
                color: opt.value === lang ? '#4489c8' : 'var(--text-hi)',
                fontWeight: opt.value === lang ? 700 : 400,
                transition: 'background 0.1s',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={(e) => { if (opt.value !== lang) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (opt.value !== lang) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
              {opt.value === lang && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4489c8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 검색 콤보박스 ── */
function SearchCombobox({ streamers, t }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentList, setRecentList] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setRecentList(getRecent()), 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    function fn(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const suggestions = query.trim()
    ? streamers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];
  const dropdownItems = query.trim() ? suggestions : recentList;
  const showDropdown = open && dropdownItems.length > 0;

  function handleSelect(s) {
    saveRecent(s);
    setQuery(''); setOpen(false); setActiveIndex(-1);
    navigate(`/streamer/${s.id}`);
  }

  function handleKeyDown(e) {
    if (!showDropdown) {
      if (e.key === 'Enter' && query.trim()) { navigate(`/streamers?q=${encodeURIComponent(query.trim())}`); setOpen(false); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, dropdownItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex >= 0) handleSelect(dropdownItems[activeIndex]); }
    else if (e.key === 'Escape') { setOpen(false); setActiveIndex(-1); }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: 250 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: open ? 'rgba(68,137,200,0.07)' : 'var(--bg-input)',
        border: `1px solid ${open ? '#4489c8' : 'var(--border-clr)'}`,
        borderRadius: showDropdown ? '10px 10px 0 0' : 10,
        padding: '0.42rem 0.75rem',
        transition: 'border-color 0.2s, background 0.2s', cursor: 'text',
      }} onClick={() => { setOpen(true); inputRef.current?.focus(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={open ? '#4489c8' : 'var(--text-lo)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input ref={inputRef} type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('nav_search_placeholder')}
          autoComplete="off"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--text-hi)', fontFamily: 'inherit', minWidth: 0 }}
        />
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-lo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg-card)', border: '1px solid #4489c8', borderTop: 'none',
          borderRadius: '0 0 10px 10px', overflow: 'hidden', zIndex: 200,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 0.75rem' }} />
          <div style={{ padding: '5px 0.75rem 3px', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-lo)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {query.trim() ? t('dropdown_results') : t('dropdown_recent')}
          </div>
          {dropdownItems.map((s, i) => (
            <button key={s.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '0.5rem 0.75rem',
                background: i === activeIndex ? 'rgba(68,137,200,0.12)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'background 0.1s',
                borderBottom: i < dropdownItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}
              onMouseEnter={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'var(--bg-hover)'; setActiveIndex(i); }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; setActiveIndex(-1); }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', flexShrink: 0 }}>
                {s.profile_image_url
                  ? <img src={s.profile_image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'var(--text-lo)' }}>{s.name.charAt(0)}</div>}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-hi)', fontWeight: 500 }}>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 메인 Navbar ── */
export default function Navbar() {
  const { t } = useApp();
  const [streamers, setStreamers] = useState([]);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    supabase.from('streamers').select('id, name, profile_image_url').order('name')
      .then(({ data }) => setStreamers(data || []));
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-clr)',
    }}>
      <div style={{
        width: '100%', padding: '0 2.5rem', height: '3.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', boxSizing: 'border-box',
      }}>
        {/* 로고 */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 0, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4489c8' }}>So</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-hi)' }}>Log</span>
        </Link>

        {/* 스트리머 링크 */}
        <Link to="/streamers" style={{ fontSize: '0.875rem', color: 'var(--text-mid)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-hi)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-mid)'}>
          {t('nav_streamers')}
        </Link>

        {/* 문의하기 링크 */}
        <Link to="/contact" style={{ fontSize: '0.875rem', color: 'var(--text-mid)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-hi)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-mid)'}>
          문의하기
        </Link>

        {/* 우측 영역 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 홈에서는 검색창 숨김, 다른 페이지에서만 표시 */}
          {!isHome && <SearchCombobox streamers={streamers} t={t} />}

          {/* 구분선 */}
          <div style={{ width: 1, height: 22, background: 'var(--border-clr)', flexShrink: 0 }} />

          {/* 테마 토글 */}
          <ThemeToggle />

          {/* 언어 선택 */}
          <LangSelect />
        </div>
      </div>
    </nav>
  );
}
