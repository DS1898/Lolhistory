import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initDDragon } from '../lib/ddragon';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MatchCard from '../components/streamer/MatchCard';
import ChampionStatsTable from '../components/streamer/ChampionStatsTable';
import HeadToHeadTable from '../components/streamer/HeadToHeadTable';

const TABS = ['최근 20경기', '챔피언 통계', '상대전적'];
const CURRENT_YEAR = new Date().getFullYear();

function WinRateDonut({ wins, total }) {
  const rate = total > 0 ? (wins / total) * 100 : 0;
  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = circ * (rate / 100);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#2a2b3d" strokeWidth="10" />
        {total > 0 && (
          <circle cx="60" cy="60" r={r} fill="none"
            stroke={rate >= 60 ? '#4489c8' : rate <= 40 ? '#e84057' : '#8b8b9e'}
            strokeWidth="10"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        )}
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-extrabold text-text-primary">{rate.toFixed(0)}%</div>
        <div className="text-xs text-text-muted">{total}게임</div>
      </div>
    </div>
  );
}

export default function StreamerPage() {
  const { id } = useParams();
  const [streamer, setStreamer] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(CURRENT_YEAR);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    initDDragon();
    fetchData();
  }, [id, season]);

  async function fetchData() {
    setLoading(true);

    // 1. 스트리머 정보
    const { data: streamerData } = await supabase
      .from('streamers').select('*').eq('id', id).single();
    if (!streamerData) { setLoading(false); return; }
    setStreamer(streamerData);

    // 2. 해당 시즌의 match_id 목록을 먼저 가져옴
    const { data: seasonMatches } = await supabase
      .from('matches')
      .select('id, played_at, season')
      .eq('season', season);

    const seasonMatchIds = (seasonMatches || []).map((m) => m.id);
    const matchMap = Object.fromEntries((seasonMatches || []).map((m) => [m.id, m]));

    if (seasonMatchIds.length === 0) {
      setParticipations([]);
      setAllParticipants([]);
      setLoading(false);
      return;
    }

    // 3. 해당 스트리머의 참여 기록 (시즌 매치 내에서)
    const { data: myParts } = await supabase
      .from('match_participants')
      .select('id, team, champion_id, position, kills, deaths, assists, result, match_id')
      .eq('streamer_id', id)
      .in('match_id', seasonMatchIds);

    // match 정보를 직접 붙여주고 날짜순 정렬
    const parts = (myParts || [])
      .map((p) => ({ ...p, match: matchMap[p.match_id] }))
      .filter((p) => p.match)
      .sort((a, b) => new Date(b.match.played_at) - new Date(a.match.played_at));

    setParticipations(parts);

    // 4. 최근 20경기 전체 참여자
    const recentMatchIds = parts.slice(0, 20).map((p) => p.match_id);
    if (recentMatchIds.length > 0) {
      const { data: allParts } = await supabase
        .from('match_participants')
        .select('id, match_id, streamer_id, team, champion_id, result, streamer:streamers(id, name, profile_image_url)')
        .in('match_id', recentMatchIds);
      setAllParticipants(allParts || []);
    } else {
      setAllParticipants([]);
    }

    setLoading(false);
  }

  if (loading) return <LoadingSpinner />;
  if (!streamer) {
    return (
      <div className="text-center py-20 text-text-muted">
        스트리머를 찾을 수 없습니다.{' '}
        <Link to="/streamers" className="text-accent hover:underline">목록으로</Link>
      </div>
    );
  }

  const wins = participations.filter((p) => p.result === 'WIN').length;
  const losses = participations.length - wins;
  const winRate = participations.length > 0 ? ((wins / participations.length) * 100).toFixed(1) : '0.0';
  const recent20 = participations.slice(0, 20);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* 상단 헤더 */}
      <div className="bg-bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-bg-input border-2 border-border overflow-hidden shrink-0">
            {streamer.profile_image_url ? (
              <img src={streamer.profile_image_url} alt={streamer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-text-muted">{streamer.name.charAt(0)}</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-text-primary">{streamer.name}</h1>
              {streamer.soop_url && (
                <a href={streamer.soop_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-md hover:bg-accent/30 transition-colors">
                  SOOP 방송 보기
                </a>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {[CURRENT_YEAR, CURRENT_YEAR - 1].map((y) => (
                <button key={y} onClick={() => setSeason(y)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${season === y ? 'bg-accent text-white' : 'bg-bg-input text-text-secondary hover:text-text-primary'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <WinRateDonut wins={wins} total={participations.length} />
            <div className="text-sm space-y-1">
              <div><span className="text-text-muted">총</span> <span className="font-bold text-text-primary">{participations.length}게임</span></div>
              <div>
                <span className="text-win font-bold">{wins}승</span>
                <span className="text-text-muted mx-1">/</span>
                <span className="text-loss font-bold">{losses}패</span>
              </div>
              <div className={`font-bold ${Number(winRate) >= 60 ? 'text-win' : Number(winRate) <= 40 ? 'text-loss' : 'text-text-primary'}`}>
                승률 {winRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border mb-6 gap-2">
        {TABS.map((label, i) => (
          <button key={label} onClick={() => setTab(i)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${tab === i ? 'border-win text-win' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        {tab === 0 && (
          <div className="space-y-2">
            {recent20.length === 0 ? (
              <p className="text-center text-text-muted py-12">이 시즌의 경기 기록이 없습니다.</p>
            ) : (
              recent20.map((p) => (
                <MatchCard key={p.id} participation={p} allParticipants={allParticipants} streamerId={id} />
              ))
            )}
          </div>
        )}
        {tab === 1 && <ChampionStatsTable participations={participations} />}
        {tab === 2 && <HeadToHeadTable participations={participations} allParticipants={allParticipants} streamerId={id} />}
      </div>
    </div>
  );
}
