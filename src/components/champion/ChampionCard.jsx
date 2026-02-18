import ChampionIcon from '../common/ChampionIcon';
import { CHAMPION_TAGS } from '../../utils/constants';

export default function ChampionCard({ champion }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-3 hover:border-primary-dark hover:bg-bg-card transition-all flex flex-col items-center gap-2">
      <ChampionIcon championId={champion.id} championName={champion.name} size={64} />
      <span className="text-text-primary text-sm font-medium text-center">{champion.name}</span>
      <div className="flex gap-1 flex-wrap justify-center">
        {champion.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded"
          >
            {CHAMPION_TAGS[tag] || tag}
          </span>
        ))}
      </div>
    </div>
  );
}
