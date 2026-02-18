import { getChampionIconUrl } from '../../utils/championUtils';
import { useChampions } from '../../context/ChampionDataContext';

export default function ChampionIcon({ championId, championName, size = 32, className = '' }) {
  const { version } = useChampions();

  if (!championId) {
    return (
      <div
        className={`bg-bg-tertiary rounded-lg border border-border flex items-center justify-center text-text-muted ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={getChampionIconUrl(championId, version)}
      alt={championName || championId}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      loading="lazy"
    />
  );
}
