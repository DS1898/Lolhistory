import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true);
      } else {
        navigate('/admin/login', { replace: true });
      }
      setChecking(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  }

  if (checking) return <LoadingSpinner />;
  if (!authed) return null;

  const navClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-accent/20 text-win font-medium'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
    }`;

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* 사이드바 */}
      <aside className="w-56 bg-bg-card border-r border-border flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-extrabold text-win">SOOP</span>
            <span className="font-extrabold text-text-primary"> Tracker</span>
          </Link>
          <p className="text-xs text-text-muted mt-0.5">관리자</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin" end className={navClass}>대시보드</NavLink>
          <NavLink to="/admin/match/new" className={navClass}>경기 추가</NavLink>
          <NavLink to="/admin/streamers" className={navClass}>스트리머 관리</NavLink>
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-loss hover:bg-loss/10 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
