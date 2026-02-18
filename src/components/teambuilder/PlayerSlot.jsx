import { ROLES } from '../../utils/constants';
import ChampionIcon from '../common/ChampionIcon';

export default function PlayerSlot({
  role,
  championId,
  championName,
  playerName,
  side,
  onPickChampion,
  onClearChampion,
  disabled,
}) {
  const roleInfo = ROLES.find((r) => r.key === role);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        side === 'BLUE'
          ? 'bg-blue-team/5 border-blue-team/20'
          : 'bg-red-team/5 border-red-team/20'
      }`}
    >
      <div className="text-xl w-8 text-center">{roleInfo?.icon || '?'}</div>
      <div className="flex-1 min-w-0">
        <div className="text-text-muted text-xs">{roleInfo?.label}</div>
        {playerName && (
          <div className="text-text-primary text-sm truncate">{playerName}</div>
        )}
      </div>

      {championId ? (
        <div className="flex items-center gap-2">
          <ChampionIcon championId={championId} championName={championName} size={36} />
          <span className="text-text-primary text-sm hidden sm:block">{championName}</span>
          {!disabled && (
            <button
              onClick={onClearChampion}
              className="text-text-muted hover:text-loss text-xs ml-1"
              title="챔피언 해제"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={onPickChampion}
          disabled={disabled}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            disabled
              ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              : 'bg-bg-tertiary text-text-secondary hover:text-primary hover:border-primary border border-border'
          }`}
        >
          챔피언 선택
        </button>
      )}
    </div>
  );
}
