import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ streamers: 0, matches: 0 });
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentMatches();
  }, []);

  async function fetchStats() {
    const [{ count: sc }, { count: mc }] = await Promise.all([
      supabase.from('streamers').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ streamers: sc || 0, matches: mc || 0 });
  }

  async function fetchRecentMatches() {
    const { data } = await supabase
      .from('matches')
      .select('id, played_at, season')
      .order('played_at', { ascending: false })
      .limit(5);
    setRecentMatches(data || []);
  }

  async function deleteMatch(matchId) {
    if (!confirm('이 경기를 삭제하시겠습니까?')) return;
    await supabase.from('matches').delete().eq('id', matchId);
    setRecentMatches((prev) => prev.filter((m) => m.id !== matchId));
    setStats((prev) => ({ ...prev, matches: prev.matches - 1 }));
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-8">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <p className="text-text-muted text-sm mb-1">등록 스트리머</p>
          <p className="text-3xl font-extrabold text-text-primary">{stats.streamers}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <p className="text-text-muted text-sm mb-1">기록된 경기</p>
          <p className="text-3xl font-extrabold text-text-primary">{stats.matches}</p>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="flex gap-3 mb-10">
        <Link
          to="/admin/match/new"
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + 경기 추가
        </Link>
        <Link
          to="/admin/streamers"
          className="px-5 py-2.5 bg-bg-card border border-border hover:border-accent text-text-primary rounded-lg text-sm transition-colors"
        >
          스트리머 관리
        </Link>
      </div>

      {/* 최근 경기 */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">최근 등록된 경기</h2>
        </div>
        {recentMatches.length === 0 ? (
          <p className="text-center py-10 text-text-muted text-sm">경기 기록이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-border">
                <th className="text-left px-5 py-3 font-medium">날짜</th>
                <th className="text-left px-5 py-3 font-medium">시즌</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentMatches.map((m) => (
                <tr key={m.id} className="hover:bg-bg-hover transition-colors">
                  <td className="px-5 py-3 text-text-primary">{m.played_at}</td>
                  <td className="px-5 py-3 text-text-secondary">{m.season}시즌</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => deleteMatch(m.id)}
                      className="text-xs text-text-muted hover:text-loss transition-colors"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
