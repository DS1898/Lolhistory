import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminLayout() {
  const [checking, setChecking]       = useState(true);
  const [authed, setAuthed]           = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthed(true);
        fetchUnreadCount();
      } else {
        navigate('/admin/login', { replace: true });
      }
      setChecking(false);
    });
  }, [navigate]);

  async function fetchUnreadCount() {
    const { count } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }

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
      <aside style={{ width: 224, background: "var(--color-bg-card)", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", flexShrink: 0, margin: "1rem 0", borderRadius: "0 12px 12px 0" }}>
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
          <NavLink to="/admin/seasons" className={navClass}>시즌 관리</NavLink>
          <NavLink to="/admin/notices" className={navClass}>공지사항</NavLink>

          {/* 문의 관리 — 미읽음 뱃지 포함 */}
          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/20 text-win font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`
            }
          >
            <span>문의 관리</span>
            {unreadCount > 0 && (
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9,
                background: '#4489c8', color: '#fff',
                fontSize: '0.62rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', lineHeight: 1,
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
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
      <main style={{ flex: 1, overflowY: "auto", padding: "2.5rem 3rem", marginLeft: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
