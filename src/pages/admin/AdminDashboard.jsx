import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ChampionIcon from '../../components/common/ChampionIcon';

const POS_KO = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서폿' };
const POSITIONS_ORDER = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

function relativeTime(isoStr) {
  if (!isoStr) return '-';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <p className="text-sm text-text-primary mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 bg-bg-input border border-border text-text-secondary hover:text-text-primary rounded-lg text-sm transition-colors">
            취소
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 bg-loss hover:bg-loss/80 text-white rounded-lg text-sm font-semibold transition-colors">
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ streamers: 0, matches: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [seasonLabelMap, setSeasonLabelMap] = useState({});
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [participantsCache, setParticipantsCache] = useState({});
  const [loadingParticipants, setLoadingParticipants] = useState(null);
  const navigate = useNavigate();

  async function fetchStats() {
    const [{ count: sc, error: e1 }, { count: mc, error: e2 }] = await Promise.all([
      supabase.from('streamers').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
    ]);
    if (e1 || e2) { setError('통계 로드 중 오류가 발생했습니다.'); return; }
    setStats({ streamers: sc || 0, matches: mc || 0 });
  }

  async function fetchRecentMatches() {
    const { data: matches, error: matchErr } = await supabase
      .from('matches')
      .select('id, played_at, season, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (matchErr) { setError('경기 목록 로드 중 오류가 발생했습니다.'); return; }
    if (!matches || matches.length === 0) { setRecentMatches([]); return; }

    const matchIds = matches.map((m) => m.id);
    const { data: parts } = await supabase
      .from('match_participants')
      .select('match_id, team, result')
      .in('match_id', matchIds)
      .eq('result', 'WIN');

    const winTeamMap = {};
    for (const p of (parts || [])) {
      if (!winTeamMap[p.match_id]) winTeamMap[p.match_id] = p.team;
    }

    setRecentMatches(matches.map((m) => ({ ...m, winTeam: winTeamMap[m.id] || null })));
  }

  useEffect(() => {
    async function init() {
      const { data: seasonData } = await supabase.from('seasons').select('id, label');
      const map = {};
      for (const s of (seasonData || [])) map[s.year] = s.label;
      setSeasonLabelMap(map);
      await fetchStats();
      await fetchRecentMatches();
    }
    init();
  }, []);

  async function deleteMatch(matchId) {
    setError('');
    const { error: delErr } = await supabase.from('matches').delete().eq('id', matchId);
    if (delErr) { setError('삭제 중 오류가 발생했습니다.'); return; }
    setRecentMatches((prev) => prev.filter((m) => m.id !== matchId));
    setStats((prev) => ({ ...prev, matches: prev.matches - 1 }));
    setParticipantsCache((prev) => { const next = { ...prev }; delete next[matchId]; return next; });
    if (expandedMatchId === matchId) setExpandedMatchId(null);
  }

  async function fetchMatchParticipants(matchId) {
    if (participantsCache[matchId] !== undefined) return;
    setLoadingParticipants(matchId);
    const { data, error: fetchErr } = await supabase
      .from('match_participants')
      .select('id, team, result, champion_id, position, kills, deaths, assists, streamer:streamers(id, name)')
      .eq('match_id', matchId);
    if (fetchErr) {
      setError('참가자 정보를 불러오는 중 오류가 발생했습니다.');
      setLoadingParticipants(null);
      return;
    }
    setParticipantsCache((prev) => ({ ...prev, [matchId]: data || [] }));
    setLoadingParticipants(null);
  }

  function toggleExpand(matchId) {
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
    } else {
      setExpandedMatchId(matchId);
      fetchMatchParticipants(matchId);
    }
  }

  async function copyMatch(matchId) {
    setError('');
    const { data: participants } = await supabase
      .from('match_participants')
      .select('streamer_id, team, champion_id, position, kills, deaths, assists, result')
      .eq('match_id', matchId);

    const today = new Date().toISOString().slice(0, 10);
    const original = recentMatches.find((m) => m.id === matchId);
    const { data: newMatch, error: insertErr } = await supabase
      .from('matches')
      .insert({ played_at: today, season: original.season })
      .select('id').single();

    if (insertErr || !newMatch) { setError('경기 복사에 실패했습니다.'); return; }
    if (participants?.length > 0) {
      await supabase.from('match_participants').insert(
        participants.map((p) => ({ ...p, match_id: newMatch.id }))
      );
    }
    fetchRecentMatches();
    fetchStats();
    navigate(`/admin/match/edit/${newMatch.id}`);
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-8">대시보드</h1>

      {error && (
        <p className="text-loss text-sm bg-loss/10 border border-loss/30 rounded-lg px-4 py-3 mb-6">{error}</p>
      )}

      {/* 삭제 확인 모달 */}
      {confirmTarget && (
        <ConfirmModal
          message="이 경기를 삭제하시겠습니까?"
          onConfirm={() => { deleteMatch(confirmTarget); setConfirmTarget(null); }}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

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
                <th className="text-left px-5 py-3 font-medium">등록일</th>
                <th className="text-left px-5 py-3 font-medium">날짜</th>
                <th className="text-left px-5 py-3 font-medium">시즌</th>
                <th className="text-center px-5 py-3 font-medium">승리</th>
                <th className="px-5 py-3 text-right font-medium">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentMatches.map((m) => {
                const isExpanded = expandedMatchId === m.id;
                const participants = participantsCache[m.id] || [];
                const team1 = participants
                  .filter((p) => p.team === 1)
                  .sort((a, b) => POSITIONS_ORDER.indexOf(a.position) - POSITIONS_ORDER.indexOf(b.position));
                const team2 = participants
                  .filter((p) => p.team === 2)
                  .sort((a, b) => POSITIONS_ORDER.indexOf(a.position) - POSITIONS_ORDER.indexOf(b.position));

                return (
                  <React.Fragment key={m.id}>
                    <tr
                      className="hover:bg-bg-hover transition-colors cursor-pointer"
                      onClick={() => toggleExpand(m.id)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-text-muted transition-transform duration-200 text-[10px]"
                            style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                          >▶</span>
                          <span className="text-text-secondary">{relativeTime(m.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-primary">{m.played_at}</td>
                      <td className="px-5 py-3 text-text-secondary">{seasonLabelMap[m.season] || `${m.season}시즌`}</td>
                      <td className="px-5 py-3 text-center">
                        {m.winTeam ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.winTeam === 1 ? 'bg-win/20 text-win' : 'bg-loss/20 text-loss'}`}>
                            {m.winTeam}팀 승리
                          </span>
                        ) : (
                          <span className="text-text-muted text-xs">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/match/edit/${m.id}`}
                            className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-bg-input">
                            수정
                          </Link>
                          <button onClick={() => copyMatch(m.id)}
                            className="text-xs text-accent hover:text-accent-hover transition-colors px-2 py-1 rounded hover:bg-accent/10">
                            복사
                          </button>
                          <button onClick={() => setConfirmTarget(m.id)}
                            className="text-xs text-text-muted hover:text-loss transition-colors px-2 py-1 rounded hover:bg-loss/10">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="bg-bg-base border-t border-border px-5 py-4">
                          {loadingParticipants === m.id || participantsCache[m.id] === undefined ? (
                            <p className="text-text-muted text-xs text-center py-2">로딩 중...</p>
                          ) : participants.length === 0 ? (
                            <p className="text-text-muted text-xs text-center py-2">참가자 정보가 없습니다.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-6">
                              {[{ players: team1, teamNum: 1 }, { players: team2, teamNum: 2 }].map(({ players, teamNum }) => {
                                const isWinTeam = m.winTeam === teamNum;
                                return (
                                  <div key={teamNum}>
                                    <div className={`text-xs font-bold mb-2 pb-1 border-b ${isWinTeam ? 'text-win border-win/30' : 'text-loss border-loss/20'}`}>
                                      {teamNum}팀 {isWinTeam ? '승리' : '패배'}
                                    </div>
                                    <div className="space-y-1.5">
                                      {players.map((p) => (
                                        <div key={p.id} className="flex items-center gap-2">
                                          <ChampionIcon championId={p.champion_id} size={26} rounded="rounded-sm" />
                                          <div className="min-w-0">
                                            <div className="text-xs text-text-primary truncate">
                                              {p.streamer?.name || '(미등록)'}
                                            </div>
                                            <div className="text-[10px] text-text-muted">
                                              {POS_KO[p.position] || p.position} · {p.kills}/{p.deaths}/{p.assists}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
