import { Link, NavLink } from 'react-router-dom';
import SearchBar from '../common/SearchBar';

const navLinks = [
  { to: '/', label: '홈' },
  { to: '/search', label: '전적 검색' },
  { to: '/team-builder', label: '팀 빌더' },
  { to: '/champions', label: '챔피언' },
];

export default function Navbar() {
  return (
    <nav className="bg-bg-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-primary font-bold text-xl">LoL</span>
              <span className="text-text-primary font-semibold">Team Builder</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-bg-tertiary text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden lg:block w-96">
            <SearchBar size="sm" />
          </div>
        </div>
      </div>
    </nav>
  );
}
