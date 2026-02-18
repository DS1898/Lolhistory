import { getRankEmblemUrl } from '../../utils/championUtils';
import { calcWinRate, tierToKorean } from '../../utils/formatters';
import { QUEUE_TYPES } from '../../utils/constants';

export default function RankBadge({ entry }) {
  if (!entry) {
    return (
      <div className="bg-bg-tertiary border border-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center text-text-muted text-2xl">
          ?
        </div>
        <div>
          <p className="text-text-muted text-sm">Unranked</p>
        </div>
      </div>
    );
  }

  const winRate = calcWinRate(entry.wins, entry.losses);

  return (
    <div className="bg-bg-tertiary border border-border rounded-xl p-4 flex items-center gap-4">
      <img
        src={getRankEmblemUrl(entry.tier)}
        alt={entry.tier}
        className="w-16 h-16"
      />
      <div className="flex-1">
        <p className="text-text-muted text-xs mb-1">
          {QUEUE_TYPES[entry.queueType] || entry.queueType}
        </p>
        <p className="text-text-primary font-bold">
          {tierToKorean(entry.tier)} {entry.rank} - {entry.leaguePoints} LP
        </p>
        <p className="text-text-secondary text-sm">
          {entry.wins}승 {entry.losses}패{' '}
          <span className={winRate >= 50 ? 'text-win' : 'text-loss'}>
            ({winRate}%)
          </span>
        </p>
      </div>
    </div>
  );
}
