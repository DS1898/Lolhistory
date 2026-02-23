import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ streamers: 0, matches: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSeason, setEditSeason] = useState('');
  const navigate = useNavigate();

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
      .limit(10);
    setRecentMatches(data || []);
  }

  async function deleteMatch(matchId) {
    if (!confirm('이 경기를 삭제하시겠습니까?')) return;
    await supabase.from('matches').delete().eq('id', matchId);
    setRecentMatches((prev) => prev.filter((m) => m.id !== matchId));
    setStats((prev) => ({ ...prev, matches: prev.matches - 1 }));
  }

  function startEdit(match) {
    setEditingMatch(match.id);
    setEditDate(match.played_at);
    setEditSeason(String(match.season));
  }

  async function saveEdit(matchId) {
    await supabase.from('matches').update({ played_at: editDate, season: Number(editSeason) }).eq('id', matchId);
    setRecentMatches((prev) =>
      prev.map((m) => m.id === matchId ? { ...m, played_at: editDate, season: Number(editSeason) } : m)
    );
    setEditingMatch(null);
  }

  async function copyMatch(matchId) {
    // 해당 경기의 참여자 데이터 가져오기
    const { data: participants } = await supabase
      .from('match_participants')
      .select('streamer_id, team, champion_id, position, kills, deaths, assists, result')
      .eq('match_id', matchId);

    // 새 경기 생성 (오늘 날짜)
    const today = new Date().toISOString().slice(0, 10);
    const original = recentMatches.find((m) => m.id === matchId);
    const { data: newMatch } = await supabase
      .from('matches')
      .insert({ played_at: today, season: original.season })
      .select('id')
      .single();

    if (newMatch && participants) {
      await supabase.from('match_participants').insert(
        participants.map((p) => ({ ...p, match_id: newMatch.id }))
      );
    }
    fetchRecentMatches();
    fetchStats();
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
        <Link to="/admin/match/new" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors">
          + 경기 추가
        </Link>
        <Link to="/admin/streamers" className="px-5 py-2.5 bg-bg-card border border-border hover:border-accent text-text-primary rounded-lg text-sm transition-colors">
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
                <th className="px-5 py-3 text-right font-medium">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentMatches.map((m) => (
                <tr key={m.id} className="hover:bg-bg-hover transition-colors">
                  <td className="px-5 py-3 text-text-primary">
                    {editingMatch === m.id ? (
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="bg-bg-input border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent"
                      />
                    ) : m.played_at}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {editingMatch === m.id ? (
                      <input
                        type="number"
                        value={editSeason}
                        onChange={(e) => setEditSeason(e.target.value)}
                        className="bg-bg-input border border-border rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-accent w-20"
                      />
                    ) : `${m.season}시즌`}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingMatch === m.id ? (
                        <>
                          <button onClick={() => saveEdit(m.id)} className="text-xs text-win hover:text-win/80 transition-colors px-2 py-1 rounded hover:bg-win/10">저장</button>
                          <button onClick={() => setEditingMatch(null)} className="text-xs text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-bg-input">취소</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(m)} className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-bg-input">수정</button>
                          <button onClick={() => copyMatch(m.id)} className="text-xs text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded hover:bg-accent/10">복사</button>
                          <button onClick={() => deleteMatch(m.id)} className="text-xs text-text-muted hover:text-loss transition-colors px-2 py-1 rounded hover:bg-loss/10">삭제</button>
                        </>
                      )}
                    </div>
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
