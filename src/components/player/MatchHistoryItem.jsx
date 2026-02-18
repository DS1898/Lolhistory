import ChampionIcon from '../common/ChampionIcon';
import { calcKDA, formatGameDuration, timeAgo } from '../../utils/formatters';
import { getItemIconUrl } from '../../utils/championUtils';
import { useChampions } from '../../context/ChampionDataContext';

export default function MatchHistoryItem({ match, puuid }) {
  const { getChampionById, version } = useChampions();
  const participant = match.info.participants.find((p) => p.puuid === puuid);
  if (!participant) return null;

  const win = participant.win;
  const kda = calcKDA(participant.kills, participant.deaths, participant.assists);
  const champion = getChampionById(participant.championId);
  const items = [
    participant.item0, participant.item1, participant.item2,
    participant.item3, participant.item4, participant.item5, participant.item6,
  ];

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
        win
          ? 'bg-win/5 border-win/20 hover:bg-win/10'
          : 'bg-loss/5 border-loss/20 hover:bg-loss/10'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        <ChampionIcon
          championId={champion?.id}
          championName={champion?.name}
          size={48}
        />
        <span className={`text-xs font-bold ${win ? 'text-win' : 'text-loss'}`}>
          {win ? '승리' : '패배'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-text-primary font-semibold">
            {participant.kills}/{participant.deaths}/{participant.assists}
          </span>
          <span className="text-text-secondary text-sm">
            KDA {kda}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-text-muted text-xs">
            CS {participant.totalMinionsKilled + participant.neutralMinionsKilled}
          </span>
          <span className="text-text-muted text-xs">
            {formatGameDuration(match.info.gameDuration)}
          </span>
          <span className="text-text-muted text-xs">
            {timeAgo(match.info.gameEndTimestamp)}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex gap-1">
        {items.map((itemId, i) => (
          <div key={i} className="w-8 h-8">
            {itemId > 0 ? (
              <img
                src={getItemIconUrl(itemId, version)}
                alt=""
                className="w-8 h-8 rounded"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 bg-bg-tertiary rounded border border-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
