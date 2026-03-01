import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initDDragon } from '../lib/ddragon';
import { getRecent, saveRecent } from '../lib/recentStreamers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TypewriterText from '../components/common/TypewriterText';
import { useApp } from '../context/AppContext';
import { Zap, Snowflake } from 'lucide-react';

/* ── 연승/연패 계산 ── */
async function calcStreaks(streamers) {
  if (!streamers.length) return [];
  const { data: parts } = await supabase
    .from('match_participants')
    .select('streamer_id, result, match_id, matches!inner(played_at)');
  if (!parts) return [];

  const byStreamer = {};
  for (const p of parts) {
    if (!byStreamer[p.streamer_id]) byStreamer[p.streamer_id] = [];
    byStreamer[p.streamer_id].push({ result: p.result, played_at: p.matches?.played_at });
  }
  for (const id in byStreamer) {
    byStreamer[id].sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
  }

  const results = [];
  for (const s of streamers) {
    const history = (byStreamer[s.id] || []).map((x) => x.result);
    if (!history.length) continue;
    const first = history[0];
    let streak = 0;
    for (const r of history) { if (r === first) streak++; else break; }
    if (streak >= 2) results.push({ ...s, streak, type: first === 'WIN' ? 'win' : 'loss' });
  }
  return results.sort((a, b) => b.streak - a.streak);
}

/* ──────────────────────────────────────────────────────
   연승/연패 캐러셀
────────────────────────────────────────────────────── */
const MAX_WIN_CARDS  = 4;
const MAX_LOSS_CARDS = 3;

function StreakCard({ s, t }) {
  const isWin = s.type === 'win';
  const accentColor = isWin ? '#4489c8' : '#e84057';
  const borderBase  = isWin ? 'rgba(68,137,200,0.2)' : 'rgba(232,64,87,0.2)';
  const borderHover = isWin ? 'rgba(68,137,200,0.55)' : 'rgba(232,64,87,0.55)';
  return (
    <Link to={`/streamer/${s.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 200 }}>
      <div
        style={{ background: 'var(--bg-card)', border: `1px solid ${borderBase}`, borderRadius: 16, padding: '1.1rem 1rem', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = borderHover; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderBase;  e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)', border: `2px solid ${accentColor}80`, flexShrink: 0 }}>
            {s.profile_image_url
              ? <img src={s.profile_image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: accentColor }}>{s.name.charAt(0)}</div>}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-lo)', marginTop: 1 }}>{isWin ? t('streak_win_label') : t('streak_loss_label')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isWin
              ? <Zap size={22} color={accentColor} fill={accentColor} strokeWidth={0} />
              : <Snowflake size={22} color={accentColor} strokeWidth={2} />}
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: accentColor, lineHeight: 1 }}>
              {s.streak}<span style={{ fontSize: '1.1rem', marginLeft: 2, fontWeight: 800 }}>{isWin ? t('streak_win_unit') : t('streak_loss_unit')}</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: accentColor, marginTop: 3 }}>
              {isWin ? t('streak_win_badge') : t('streak_loss_badge')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StreakCarousel({ streamers, t }) {
  const [streakData, setStreakData] = useState([]);
  const [loaded, setLoaded]         = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!streamers.length) return;
    calcStreaks(streamers).then((d) => { setStreakData(d); setLoaded(true); });
  }, [streamers]);

  function scroll(dir) {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  }

  if (!loaded || !streakData.length) return null;

  const wins   = streakData.filter((s) => s.type === 'win').slice(0, MAX_WIN_CARDS);
  const losses = streakData.filter((s) => s.type === 'loss').slice(0, MAX_LOSS_CARDS);

  return (
    <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 1rem 3rem' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-hi)' }}>{t('streak_title')}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-lo)' }}>{t('streak_subtitle')}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['left','right'].map((dir) => (
            <button key={dir} onClick={() => scroll(dir)}
              style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', color: 'var(--text-mid)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(68,137,200,0.2)'; e.currentTarget.style.color = '#4489c8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-mid)'; }}>
              {dir === 'left' ? '‹' : '›'}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 스크롤 */}
      <div ref={scrollRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
        {wins.map((s) => <StreakCard key={`w-${s.id}`} s={s} t={t} />)}
        {wins.length > 0 && losses.length > 0 && (
          <div style={{ width: 1, background: 'var(--border-clr)', flexShrink: 0, alignSelf: 'stretch', margin: '0 4px' }} />
        )}
        {losses.map((s) => <StreakCard key={`l-${s.id}`} s={s} t={t} />)}
      </div>
    </div>
  );
}

/* ── Hover Card ── */
function StreamerHoverCard({ streamer, t }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function onEnter() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY - 90, left: r.left + r.width / 2 });
    }
    setHovered(true);
  }

  return (
    <>
      <Link to={`/streamer/${streamer.id}`} ref={ref}
        onMouseEnter={onEnter} onMouseLeave={() => setHovered(false)}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '6px 4px', borderRadius: 10, textDecoration: 'none', transition: 'transform 0.2s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', padding: 2, background: hovered ? 'linear-gradient(135deg,#4489c8,#2d6ea8)' : 'linear-gradient(135deg,var(--bg-hover),var(--bg-input))', transition: 'background 0.25s' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)' }}>
            {streamer.profile_image_url
              ? <img src={streamer.profile_image_url} alt={streamer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: hovered ? '#4489c8' : 'var(--text-lo)' }}>{streamer.name.charAt(0)}</div>}
          </div>
        </div>
        <span style={{ fontSize: '0.66rem', fontWeight: 600, color: hovered ? 'var(--text-hi)' : 'var(--text-mid)', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
          {streamer.name}
        </span>
      </Link>

      {hovered && (
        <div style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid rgba(68,137,200,0.35)', borderRadius: 12, padding: '10px 14px', zIndex: 9999, minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'none', animation: 'fadeUp 0.15s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)', flexShrink: 0 }}>
              {streamer.profile_image_url ? <img src={streamer.profile_image_url} alt={streamer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#4489c8' }}>{streamer.name.charAt(0)}</div>}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-hi)' }}>{streamer.name}</div>
              <div style={{ fontSize: '0.65rem', color: '#4489c8' }}>{t('hover_view')}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── 검색 콤보박스 (홈 중앙) ── */
function SearchCombobox({ streamers, t }) {
  const [query, setQuery]           = useState('');
  const [open, setOpen]             = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentList, setRecentList] = useState([]);
  const navigate   = useNavigate();
  const inputRef   = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setRecentList(getRecent()), 0);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    function fn(e) {
      if (!inputRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const suggestions   = query.trim() ? streamers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];
  const dropdownItems = query.trim() ? suggestions : recentList;
  const showDropdown  = open && dropdownItems.length > 0;

  function handleSelect(s) {
    saveRecent({ id: s.id, name: s.name, profile_image_url: s.profile_image_url });
    setQuery(''); setOpen(false);
    navigate(`/streamer/${s.id}`);
  }

  function handleKeyDown(e) {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, dropdownItems.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter')     { e.preventDefault(); if (activeIndex >= 0) handleSelect(dropdownItems[activeIndex]); }
    else if (e.key === 'Escape')    { setOpen(false); setActiveIndex(-1); }
  }

  return (
    <div style={{ position: 'relative', maxWidth: '36rem', margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: open ? 'rgba(68,137,200,0.07)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${open ? 'rgba(68,137,200,0.6)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: showDropdown ? '14px 14px 0 0' : 14,
        padding: '0.85rem 1.1rem', cursor: 'text',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: open ? '0 0 0 3px rgba(68,137,200,0.12)' : 'none',
      }} onClick={() => { setOpen(true); inputRef.current?.focus(); }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={open ? '#4489c8' : 'var(--text-lo)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input ref={inputRef} type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('hero_search_placeholder')}
          autoComplete="off"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', color: 'var(--text-hi)', fontFamily: 'inherit' }}
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-lo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid rgba(68,137,200,0.4)', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden', zIndex: 100, boxShadow: '0 16px 40px rgba(0,0,0,0.7)' }}>
          <div style={{ height: 1, background: 'var(--border-clr)', margin: '0 1rem' }} />
          <div style={{ padding: '8px 1rem 4px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-lo)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {query.trim() ? t('dropdown_results') : t('dropdown_recent')}
          </div>
          {dropdownItems.map((s, i) => (
            <button key={s.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '0.7rem 1rem', background: i === activeIndex ? 'rgba(68,137,200,0.12)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.1s', borderBottom: i < dropdownItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
              onMouseEnter={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; setActiveIndex(i); }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; setActiveIndex(-1); }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-input)', border: '1px solid var(--border-clr)', flexShrink: 0 }}>
                {s.profile_image_url ? <img src={s.profile_image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: 'var(--text-lo)' }}>{s.name.charAt(0)}</div>}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-hi)', fontWeight: 500 }}>{s.name}</span>
              {!query.trim() && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3b4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 메인 HomePage ── */
const MAX_COLS    = 11;
const MAX_VISIBLE = MAX_COLS * 2; // 22명

export default function HomePage() {
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const { t }    = useApp();

  useEffect(() => {
    initDDragon();
    async function fetchStreamers() {
      const { data } = await supabase.from('streamers').select('id, name, profile_image_url').order('name');
      setStreamers(data || []);
      setLoading(false);
    }
    fetchStreamers();
  }, []);

  const visibleStreamers = streamers.slice(0, MAX_VISIBLE);

  return (
    <div className="w-full">
      {/* 히어로 */}
      <section className="w-full py-20 px-4" style={{ background: 'linear-gradient(to bottom, var(--bg-card), var(--bg-base))' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem', minHeight: '3.75rem' }}>
            <TypewriterText text="SoLog" highlightWord="So" />
          </h1>
          <p style={{ color: 'var(--text-mid)', fontSize: '1rem', marginBottom: '2.5rem' }}>
            {t('hero_subtitle')}
          </p>
          <SearchCombobox streamers={streamers} t={t} />
        </div>
      </section>

      {/* 연승/연패 캐러셀 */}
      <div style={{ paddingTop: '2.5rem' }}>
        <StreakCarousel streamers={streamers} t={t} />
      </div>

      {/* 전체 스트리머 그리드 (2행 × 11열 = 22명) */}
      <section style={{ maxWidth: 1152, margin: '0 auto', padding: '0 1rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-hi)', flexShrink: 0 }}>{t('section_all_streamers')}</h2>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(68,137,200,0.3), transparent)' }} />
          <Link to="/streamers"
            style={{ fontSize: '0.78rem', color: '#4489c8', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}>
            {t('section_view_all')}
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)`, gap: '6px 4px' }}>
            {visibleStreamers.map((s) => <StreamerHoverCard key={s.id} streamer={s} t={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}
