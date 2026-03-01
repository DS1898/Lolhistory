import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initDDragon } from '../lib/ddragon';
import WinRateGauge from '../components/common/WinRateGauge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MatchCard from '../components/streamer/MatchCard';
import ChampionStatsTable from '../components/streamer/ChampionStatsTable';
import HeadToHeadTable from '../components/streamer/HeadToHeadTable';
import { useApp } from '../context/AppContext';

const CURRENT_YEAR = new Date().getFullYear();

function safeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? url : null;
  } catch { return null; }
}

export default function StreamerPage() {
  const { id } = useParams();
  const { t } = useApp();
  const [streamer, setStreamer] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [seasonParticipants, setSeasonParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(null); // matches.season 연도 정수 기반
  const [tab, setTab] = useState(0);
  const [availableSeasons, setAvailableSeasons] = useState([]); // [{ id, year, label }]
  const seasonsFetchedForId = useRef(null); // 시즌 목록 중복 조회 방지

  useEffect(() => {
    initDDragon();

    async function fetchData() {
      setLoading(true);

      // 0. 시즌 목록: id가 바뀔 때만 재조회 (시즌 변경 시 중복 호출 방지)
      if (seasonsFetchedForId.current !== id) {
        const { data: seasonData } = await supabase
          .from('match_participants')
          .select('match_id, matches!inner(season)')
          .eq('streamer_id', id);

        // matches.season 은 연도 정수(예: 2025)로 저장됨
        const uniqueYears = [...new Set((seasonData || []).map(p => p.matches?.season).filter(Boolean))];

        if (uniqueYears.length === 0) {
          setAvailableSeasons([]);
          setParticipations([]);
          setAllParticipants([]);
          setSeasonParticipants([]);
          seasonsFetchedForId.current = id;
          setLoading(false);
          return;
        }

        // seasons 테이블에서 레이블 조회 (year 기반)
        const { data: seasonObjects } = await supabase
          .from('seasons')
          .select('id, year, label')
          .in('year', uniqueYears)
          .order('year', { ascending: false });

        // seasons 테이블에 없는 연도는 기본 라벨로 생성
        const foundYears = new Set((seasonObjects || []).map(s => s.year));
        const fallbackSeasons = uniqueYears
          .filter(y => !foundYears.has(y))
          .map(y => ({ id: null, year: y, label: `${y}시즌` }));

        const list = [...(seasonObjects || []), ...fallbackSeasons]
          .sort((a, b) => b.year - a.year);
        setAvailableSeasons(list);
        seasonsFetchedForId.current = id;

        if (!list.some(s => s.year === season)) {
          setSeason(list[0].year);
          setLoading(false);
          return;
        }
      }

      // 1+3 병렬: 스트리머 정보 + 해당 시즌 참여 기록(match join 포함)
      // Q2(matches 전체 조회) 제거 — matches!inner join으로 통합
      const [{ data: streamerData }, { data: myParts }] = await Promise.all([
        supabase
          .from('streamers')
          .select('id, name, profile_image_url, soop_url')
          .eq('id', id)
          .single(),
        supabase
          .from('match_participants')
          .select('id, team, champion_id, position, kills, deaths, assists, result, match_id, match:matches!inner(id, played_at, season)')
          .eq('streamer_id', id)
          .eq('matches.season', season),
      ]);

      if (!streamerData) { setLoading(false); return; }
      setStreamer(streamerData);

      if (!myParts || myParts.length === 0) {
        setParticipations([]);
        setAllParticipants([]);
        setLoading(false);
        return;
      }

      // match 정보는 join에서 직접 제공됨
      const parts = myParts
        .filter((p) => p.match)
        .sort((a, b) => new Date(b.match.played_at) - new Date(a.match.played_at));

      setParticipations(parts);

      // 4. 참가자 조회: MatchCard용(최근 20경기·풀 데이터) + H2H용(시즌 전체·경량 데이터) 병렬
      const allMatchIds = parts.map((p) => p.match_id);
      const recentMatchIds = allMatchIds.slice(0, 20);

      if (allMatchIds.length > 0) {
        const [{ data: allParts }, { data: h2hParts }] = await Promise.all([
          supabase
            .from('match_participants')
            .select('id, match_id, streamer_id, team, champion_id, position, champion_level, spell1_id, spell2_id, rune_keystone, rune_secondary, item0, item1, item2, item3, item4, item5, item6, result, kills, deaths, assists, streamer:streamers(id, name, profile_image_url)')
            .in('match_id', recentMatchIds),
          // H2H: 시즌 전체 경기 / 이름·팀·결과만 필요
          allMatchIds.length > 20
            ? supabase
                .from('match_participants')
                .select('id, match_id, streamer_id, team, result, streamer:streamers(id, name, profile_image_url)')
                .in('match_id', allMatchIds)
            : Promise.resolve({ data: null }), // 20경기 이하면 재사용
        ]);
        setAllParticipants(allParts || []);
        setSeasonParticipants(h2hParts || allParts || []);
      } else {
        setAllParticipants([]);
        setSeasonParticipants([]);
      }

      setLoading(false);
    }

    fetchData();
  }, [id, season]);

  if (loading) return <LoadingSpinner />;
  if (!streamer) {
    return (
      <div className="text-center py-20 text-text-muted">
        {t('streamer_not_found')}{' '}
        <Link to="/streamers" className="text-accent hover:underline">{t('back_to_list')}</Link>
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
              {safeUrl(streamer.soop_url) && (
                <a href={safeUrl(streamer.soop_url)} target="_blank" rel="noopener noreferrer"
                  className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-md hover:bg-accent/30 transition-colors">
                  {t('soop_link')}
                </a>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {availableSeasons.map((s) => (
                <button key={s.year} onClick={() => setSeason(s.year)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${season === s.year ? 'bg-accent text-white' : 'bg-bg-input text-text-secondary hover:text-text-primary'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <WinRateGauge wins={wins} total={participations.length} />
            <div className="text-sm space-y-1">
              <div><span className="font-bold text-text-primary">{t('total_games', { n: participations.length })}</span></div>
              <div>
                <span className="text-win font-bold">{wins}{t('stat_wins')}</span>
                <span className="text-text-muted mx-1">/</span>
                <span className="text-loss font-bold">{losses}{t('stat_losses')}</span>
              </div>
              <div className={`font-bold ${Number(winRate) >= 60 ? 'text-win' : Number(winRate) <= 40 ? 'text-loss' : 'text-text-primary'}`}>
                {t('stat_winrate')} {winRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border mb-6 gap-2">
        {[t('tab_recent'), t('tab_champ'), t('tab_h2h')].map((label, i) => (
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
              <p className="text-center text-text-muted py-12">{t('no_matches')}</p>
            ) : (
              recent20.map((p) => (
                <MatchCard key={p.id} participation={p} allParticipants={allParticipants} streamerId={id} />
              ))
            )}
          </div>
        )}
        {tab === 1 && <ChampionStatsTable participations={participations} />}
        {tab === 2 && <HeadToHeadTable participations={participations} seasonParticipants={seasonParticipants} streamerId={id} />}
      </div>
    </div>
  );
}
