import { Link } from 'react-router-dom';

function WinRateCircle({ winRate, size = 44 }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const filled = circ * (winRate / 100);

  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#2a2b3d" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={winRate >= 60 ? '#4489c8' : winRate <= 40 ? '#e84057' : '#8b8b9e'}
        strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="26" textAnchor="middle" fontSize="9" fill="#e8e8ea" fontWeight="700">
        {winRate.toFixed(0)}%
      </text>
    </svg>
  );
}

export default function HeadToHeadTable({ participations, allParticipants, streamerId }) {
  // 경기별로 상대 스트리머 파악
  const h2hMap = {}; // opponentId → { name, profileImageUrl, wins, losses }

  const myMatchMap = {};
  for (const p of participations) {
    myMatchMap[p.match.id] = p;
  }

  for (const p of allParticipants) {
    const myData = myMatchMap[p.match_id];
    if (!myData) continue;
    if (p.streamer_id === streamerId) continue;
    // 상대팀에 있는지 확인
    if (p.team === myData.team) continue;

    const oppId = p.streamer_id;
    if (!h2hMap[oppId]) {
      h2hMap[oppId] = {
        id: oppId,
        name: p.streamer?.name || oppId,
        profileImageUrl: p.streamer?.profile_image_url,
        wins: 0,
        losses: 0,
      };
    }
    if (myData.result === 'WIN') h2hMap[oppId].wins++;
    else h2hMap[oppId].losses++;
  }

  const rows = Object.values(h2hMap)
    .map((r) => ({
      ...r,
      games: r.wins + r.losses,
      winRate: r.wins + r.losses > 0 ? (r.wins / (r.wins + r.losses)) * 100 : 0,
    }))
    .sort((a, b) => b.games - a.games);

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        상대 전적 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-xs border-b border-border">
            <th className="text-left pb-3 font-medium">스트리머</th>
            <th className="text-center pb-3 font-medium">경기</th>
            <th className="text-center pb-3 font-medium">승률</th>
            <th className="text-center pb-3 font-medium">승/패</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-bg-hover transition-colors">
              <td className="py-3">
                <Link to={`/streamer/${row.id}`} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                    {row.profileImageUrl ? (
                      <img src={row.profileImageUrl} alt={row.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted font-bold text-sm">
                        {row.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-text-primary group-hover:text-win transition-colors">
                    {row.name}
                  </span>
                </Link>
              </td>
              <td className="text-center text-text-secondary">{row.games}</td>
              <td className="py-2 text-center">
                <div className="flex justify-center">
                  <WinRateCircle winRate={row.winRate} />
                </div>
              </td>
              <td className="text-center text-xs">
                <span className="text-win font-semibold">{row.wins}승</span>
                <span className="text-text-muted mx-1">/</span>
                <span className="text-loss font-semibold">{row.losses}패</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
