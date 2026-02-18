import { useMemo } from 'react';
import { useTeamBuilder, getUsedChampions } from '../../context/TeamBuilderContext';
import { useChampions } from '../../context/ChampionDataContext';
import ChampionIcon from '../common/ChampionIcon';

export default function UsedChampionTracker() {
  const { state } = useTeamBuilder();
  const { getChampionByName } = useChampions();

  const blueUsed = useMemo(
    () => getUsedChampions(state, 'BLUE', state.games.length),
    [state],
  );
  const redUsed = useMemo(
    () => getUsedChampions(state, 'RED', state.games.length),
    [state],
  );

  if (blueUsed.size === 0 && redUsed.size === 0) return null;

  const renderChampions = (usedSet, label, colorClass) => {
    const ids = Array.from(usedSet);
    if (ids.length === 0) return null;

    return (
      <div>
        <h4 className={`text-sm font-medium mb-2 ${colorClass}`}>{label}</h4>
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id) => {
            const champ = getChampionByName(id);
            return (
              <div key={id} className="flex flex-col items-center gap-0.5" title={champ?.name || id}>
                <ChampionIcon championId={id} championName={champ?.name} size={28} className="opacity-50" />
                <span className="text-[10px] text-text-muted truncate w-8 text-center">
                  {champ?.name || id}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4 mt-4">
      <h3 className="text-sm font-bold text-text-secondary mb-3">사용된 챔피언 (재사용 불가)</h3>
      <div className="grid grid-cols-2 gap-4">
        {renderChampions(blueUsed, state.blue.name, 'text-blue-team')}
        {renderChampions(redUsed, state.red.name, 'text-red-team')}
      </div>
    </div>
  );
}
