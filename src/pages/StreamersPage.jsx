import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function StreamersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    fetchStreamers(searchParams.get('q') || '');
  }, [searchParams]);

  async function fetchStreamers(q) {
    setLoading(true);
    let req = supabase
      .from('streamers')
      .select('id, name, profile_image_url, soop_url')
      .order('name');

    if (q) {
      req = req.ilike('name', `%${q}%`);
    }

    const { data } = await req;
    setStreamers(data || []);
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    setSearchParams(q ? { q } : {});
  }

  const currentQ = searchParams.get('q') || '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-text-primary">스트리머</h1>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 검색..."
            className="bg-bg-input text-text-primary border border-border rounded-l-lg px-4 py-2 text-sm w-48 focus:outline-none focus:border-accent placeholder:text-text-muted"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm rounded-r-lg transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {currentQ && (
        <p className="text-text-secondary text-sm mb-6">
          &ldquo;{currentQ}&rdquo; 검색 결과
        </p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : streamers.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          {currentQ ? `"${currentQ}"에 해당하는 스트리머가 없습니다.` : '등록된 스트리머가 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {streamers.map((s) => (
            <Link
              key={s.id}
              to={`/streamer/${s.id}`}
              className="bg-bg-card border border-border rounded-xl p-5 flex flex-col items-center gap-3 hover:border-accent hover:bg-bg-hover transition-all group"
            >
              <div className="w-20 h-20 rounded-full bg-bg-input border border-border overflow-hidden">
                {s.profile_image_url ? (
                  <img src={s.profile_image_url} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-text-muted">
                    {s.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-text-primary group-hover:text-win transition-colors text-sm">
                  {s.name}
                </p>
                {s.soop_url && (
                  <p className="text-xs text-text-muted mt-1">SOOP</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
