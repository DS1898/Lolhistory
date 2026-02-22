import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/streamers?q=${encodeURIComponent(q)}` : '/streamers');
    setQuery('');
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <span className="text-lg font-extrabold text-win">SOOP</span>
          <span className="text-lg font-extrabold text-text-primary">Tracker</span>
        </Link>

        {/* 네비 */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          <Link to="/streamers" className="text-text-secondary hover:text-text-primary transition-colors">
            스트리머
          </Link>
        </div>

        {/* 검색 (오른쪽 정렬) */}
        <form onSubmit={handleSearch} className="ml-auto flex">
          <label htmlFor="nav-search" className="sr-only">스트리머 검색</label>
          <input
            id="nav-search"
            type="text"
            name="q"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="스트리머 검색…"
            className="bg-bg-input text-text-primary border border-border rounded-l-lg px-4 py-2 text-sm w-52 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent placeholder:text-text-muted"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm rounded-r-lg transition-colors font-medium"
          >
            검색
          </button>
        </form>
      </div>
    </nav>
  );
}
