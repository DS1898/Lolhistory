import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initDDragon } from '../lib/ddragon';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [streamers, setStreamers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  useEffect(() => {
    initDDragon();
    async function fetchStreamers() {
      const { data } = await supabase
        .from('streamers')
        .select('id, name, profile_image_url')
        .order('name');
      setStreamers(data || []);
      setLoading(false);
    }
    fetchStreamers();
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return streamers
      .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6);
  }, [query, streamers]);

  useEffect(() => {
    function handleClick(e) {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        suggestionRef.current && !suggestionRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleQueryChange(e) {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
      setActiveIndex(-1);
    }
  }

  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) navigate(`/streamer/${suggestions[activeIndex].id}`);
      else if (suggestions.length === 1) navigate(`/streamer/${suggestions[0].id}`);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="w-full">
      <section className="w-full py-20 px-4" style={{ background: 'linear-gradient(to bottom, #15161e, #0d0e14)' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">
            <span style={{ color: '#4489c8' }}>SOOP</span>
            <span className="text-text-primary"> Tracker</span>
          </h1>
          <p className="text-text-secondary text-base mb-10">방송인들의 팀게임 전적을 한눈에 확인하세요</p>
          <div className="relative max-w-xl mx-auto">
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                placeholder="스트리머 이름 검색..."
                className="flex-1 bg-bg-input text-text-primary border border-border rounded-l-xl px-5 py-4 text-base focus:outline-none focus:border-accent placeholder:text-text-muted"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => {
                  if (suggestions.length === 1) navigate(`/streamer/${suggestions[0].id}`);
                  else if (query.trim()) navigate(`/streamers?q=${encodeURIComponent(query.trim())}`);
                }}
                className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-r-xl font-semibold transition-colors"
              >
                검색
              </button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionRef} className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { navigate(`/streamer/${s.id}`); setShowSuggestions(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i === activeIndex ? 'bg-accent/20' : 'hover:bg-bg-hover'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                      {s.profile_image_url ? (
                        <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-bold">{s.name.charAt(0)}</div>
                      )}
                    </div>
                    <span className="text-sm text-text-primary">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1152px', margin: '0 auto', padding: '3rem 1rem' }}>
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          전체 스트리머
          <span className="ml-2 text-sm font-normal text-text-secondary">({streamers.length}명)</span>
        </h2>
        {loading ? (
          <LoadingSpinner />
        ) : streamers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted mb-2">등록된 스트리머가 없습니다.</p>
            <p className="text-text-muted text-sm">관리자가 스트리머를 추가하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {streamers.map((s) => (
              <Link key={s.id} to={`/streamer/${s.id}`} className="bg-bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-accent hover:bg-bg-hover transition-all group">
                <div className="w-16 h-16 rounded-full bg-bg-input border border-border overflow-hidden">
                  {s.profile_image_url ? (
                    <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xl font-bold">{s.name.charAt(0)}</div>
                  )}
                </div>
                <span className="text-sm font-medium text-text-primary group-hover:text-win transition-colors text-center truncate w-full">{s.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
