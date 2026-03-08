import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function WinRateCircle({ winRate, size = 44 }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const filled = circ * (winRate / 100);

  return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border-clr)" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke={winRate >= 60 ? '#4489c8' : winRate <= 40 ? '#e84057' : '#8b8b9e'}
        strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text x="22" y="26" textAnchor="middle" fontSize="9" fill="var(--text-hi)" fontWeight="700">
        {new Intl.NumberFormat('ko', { style: 'percent', maximumFractionDigits: 0 }).format(winRate / 100)}
      </text>
    </svg>
  );
}

export default function HeadToHeadTable({ participations, allParticipants, streamerId }) {
  const seasonParticipants = allParticipants ?? [];
  const { t } = useApp();

  const h2hMap = {};
  const myMatchMap = {};
  for (const p of participations) {
    if (p.match) myMatchMap[p.match.id] = p;
  }

  for (const p of seasonParticipants) {
    const myData = myMatchMap[p.match_id];
    if (!myData) continue;
    if (p.streamer_id === streamerId) continue;
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
        {t('h2h_no_data')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-xs border-b border-border">
            <th className="text-left pb-3 font-medium">{t('col_streamer')}</th>
            <th className="text-center pb-3 font-medium">{t('col_games')}</th>
            <th className="text-center pb-3 font-medium">{t('col_winrate')}</th>
            <th className="text-center pb-3 font-medium">{t('col_wl')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-bg-hover transition-colors">
              <td className="py-3">
                <Link to={`/streamer/${row.id}`} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-bg-input border border-border overflow-hidden shrink-0">
                    {row.profileImageUrl ? (
                      <img src={row.profileImageUrl} alt={row.name} width={36} height={36} loading="lazy" className="w-full h-full object-cover" />
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
                <span className="text-win font-semibold">{row.wins}{t('stat_wins')}</span>
                <span className="text-text-muted mx-1">/</span>
                <span className="text-loss font-semibold">{row.losses}{t('stat_losses')}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
