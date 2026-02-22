import ChampionIcon from '../common/ChampionIcon';

const POSITION_KO = {
  TOP: '탑',
  JUNGLE: '정글',
  MID: '미드',
  ADC: '원딜',
  SUPPORT: '서폿',
};

function kda(kills, deaths, assists) {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

function relativeDate(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '오늘';
  if (days === 1) return '1일 전';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

export default function MatchCard({ participation, allParticipants, streamerId }) {
  const isWin = participation.result === 'WIN';
  const match = participation.match;
  const myTeam = participation.team;

  // 같은 경기 참여자에서 팀 분류
  const teammates = allParticipants
    .filter((p) => p.match_id === match.id && p.team === myTeam && p.streamer_id !== streamerId)
    .slice(0, 4);
  const opponents = allParticipants
    .filter((p) => p.match_id === match.id && p.team !== myTeam)
    .slice(0, 5);

  const kdaRatio = kda(participation.kills, participation.deaths, participation.assists);

  return (
    <div
      className={`flex items-stretch rounded-lg overflow-hidden border transition-all hover:brightness-105 ${
        isWin
          ? 'border-win/30 bg-win-muted'
          : 'border-loss/30 bg-loss-muted'
      }`}
    >
      {/* 왼쪽 색상 바 */}
      <div className={`w-1 shrink-0 ${isWin ? 'bg-win' : 'bg-loss'}`} />

      {/* 내용 */}
      <div className="flex-1 px-4 py-3 flex items-center gap-4 min-w-0">
        {/* 승/패 + 날짜 */}
        <div className="w-14 shrink-0 text-center">
          <div className={`text-sm font-bold ${isWin ? 'text-win' : 'text-loss'}`}>
            {isWin ? '승' : '패'}
          </div>
          <div className="text-xs text-text-muted mt-1">{relativeDate(match.played_at)}</div>
        </div>

        {/* 챔피언 아이콘 */}
        <div className="shrink-0">
          <ChampionIcon championId={participation.champion_id} size={48} rounded="rounded-lg" />
          {participation.position && (
            <div className="text-xs text-text-muted text-center mt-1">
              {POSITION_KO[participation.position] || participation.position}
            </div>
          )}
        </div>

        {/* KDA */}
        <div className="shrink-0 min-w-[80px]">
          <div className="text-sm font-semibold text-text-primary">
            <span className="text-text-primary">{participation.kills}</span>
            <span className="text-text-muted mx-1">/</span>
            <span className="text-loss">{participation.deaths}</span>
            <span className="text-text-muted mx-1">/</span>
            <span className="text-text-primary">{participation.assists}</span>
          </div>
          <div className={`text-xs mt-0.5 ${kdaRatio === 'Perfect' ? 'text-win font-bold' : 'text-text-secondary'}`}>
            {kdaRatio === 'Perfect' ? 'Perfect' : `${kdaRatio} KDA`}
          </div>
        </div>

        {/* 팀원 / 상대 */}
        <div className="flex-1 min-w-0 hidden sm:block">
          {teammates.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-text-muted w-8 shrink-0">아군</span>
              <div className="flex gap-1">
                {teammates.map((t) => (
                  <ChampionIcon
                    key={t.id}
                    championId={t.champion_id}
                    size={22}
                    rounded="rounded-sm"
                  />
                ))}
              </div>
            </div>
          )}
          {opponents.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-muted w-8 shrink-0">상대</span>
              <div className="flex gap-1">
                {opponents.map((t) => (
                  <ChampionIcon
                    key={t.id}
                    championId={t.champion_id}
                    size={22}
                    rounded="rounded-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
