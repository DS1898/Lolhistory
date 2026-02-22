import ChampionIcon from '../common/ChampionIcon';

function WinRateBar({ rate }) {
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={Math.round(rate)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`승률 ${Math.round(rate)}%`}
        className="flex-1 h-1.5 bg-bg-hover rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full ${rate >= 60 ? 'bg-win' : rate <= 40 ? 'bg-loss' : 'bg-text-secondary'}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span
        className={`text-xs font-semibold w-10 text-right tabular-nums ${
          rate >= 60 ? 'text-win' : rate <= 40 ? 'text-loss' : 'text-text-secondary'
        }`}
      >
        {rate.toFixed(0)}%
      </span>
    </div>
  );
}

export default function ChampionStatsTable({ participations }) {
  // 챔피언별 집계
  const statsMap = {};
  for (const p of participations) {
    const id = p.champion_id;
    if (!id) continue;
    if (!statsMap[id]) {
      statsMap[id] = { champion_id: id, games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 };
    }
    const s = statsMap[id];
    s.games++;
    s.kills += p.kills || 0;
    s.deaths += p.deaths || 0;
    s.assists += p.assists || 0;
    if (p.result === 'WIN') s.wins++;
  }

  const rows = Object.values(statsMap)
    .map((s) => ({
      ...s,
      losses: s.games - s.wins,
      winRate: s.games > 0 ? (s.wins / s.games) * 100 : 0,
      avgKda:
        s.deaths === 0
          ? 'Perfect'
          : ((s.kills + s.assists) / s.deaths).toFixed(2),
    }))
    .sort((a, b) => b.games - a.games);

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        챔피언 통계 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-xs border-b border-border">
            <th className="text-left pb-3 font-medium">챔피언</th>
            <th className="text-center pb-3 font-medium">경기</th>
            <th className="text-center pb-3 font-medium">승률</th>
            <th className="text-center pb-3 font-medium w-40 hidden sm:table-cell">승/패</th>
            <th className="text-center pb-3 font-medium">평균 KDA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.champion_id} className="hover:bg-bg-hover transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <ChampionIcon championId={row.champion_id} size={36} rounded="rounded-md" />
                  <span className="font-medium text-text-primary">{row.champion_id}</span>
                </div>
              </td>
              <td className="text-center text-text-secondary tabular-nums">{row.games}</td>
              <td className="py-3 px-2">
                <WinRateBar rate={row.winRate} />
              </td>
              <td className="text-center text-xs hidden sm:table-cell tabular-nums">
                <span className="text-win">{row.wins}승</span>
                <span className="text-text-muted mx-1">/</span>
                <span className="text-loss">{row.losses}패</span>
              </td>
              <td className={`text-center font-semibold tabular-nums ${row.avgKda === 'Perfect' ? 'text-win' : 'text-text-primary'}`}>
                {row.avgKda}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
