import { getChampionIconUrl } from '../../lib/ddragon';

export default function ChampionIcon({ championId, size = 32, className = '', rounded = 'rounded-md' }) {
  if (!championId) {
    return (
      <div
        className={`bg-bg-input border border-border flex items-center justify-center text-text-muted text-xs ${rounded} ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <img
      src={getChampionIconUrl(championId)}
      alt={championId}
      width={size}
      height={size}
      className={`object-cover ${rounded} ${className}`}
      loading="lazy"
      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
    />
  );
}
