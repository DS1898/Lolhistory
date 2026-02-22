import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initDDragon } from '../lib/ddragon';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initDDragon();
    fetchStreamers();
  }, []);

  async function fetchStreamers() {
    const { data } = await supabase
      .from('streamers')
      .select('id, name, profile_image_url')
      .order('name');
    setStreamers(data || []);
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/streamers?q=${encodeURIComponent(q)}` : '/streamers');
  }

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-b from-bg-card to-bg-base">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-win">SOOP</span>
            <span className="text-text-primary"> Tracker</span>
          </h1>
          <p className="text-text-secondary text-base mb-10">
            방송인들의 팀게임 전적을 한눈에 확인하세요
          </p>

          {/* 검색바 */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="스트리머 이름 검색..."
              className="flex-1 bg-bg-input text-text-primary border border-border rounded-l-xl px-5 py-4 text-base focus:outline-none focus:border-accent placeholder:text-text-muted"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-r-xl font-semibold transition-colors"
            >
              검색
            </button>
          </form>
        </div>
      </section>

      {/* 스트리머 목록 */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          전체 스트리머
          <span className="ml-2 text-sm font-normal text-text-secondary">
            ({streamers.length}명)
          </span>
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : streamers.length === 0 ? (
          <p className="text-text-muted text-center py-20">
            등록된 스트리머가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {streamers.map((s) => (
              <Link
                key={s.id}
                to={`/streamer/${s.id}`}
                className="bg-bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-accent hover:bg-bg-hover transition-all group"
              >
                {/* 프로필 이미지 */}
                <div className="w-16 h-16 rounded-full bg-bg-input border border-border overflow-hidden">
                  {s.profile_image_url ? (
                    <img
                      src={s.profile_image_url}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xl font-bold">
                      {s.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-text-primary group-hover:text-win transition-colors text-center truncate w-full text-center">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
