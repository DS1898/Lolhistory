import ChampionIcon from '../common/ChampionIcon';

export default function ChampionPoolGrid({
  champions,
  usedChampionIds,
  currentPickIds,
  onSelect,
}) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {champions.map((champ) => {
        const isUsed = usedChampionIds.has(champ.id);
        const isPicked = currentPickIds.has(champ.id);
        const isDisabled = isUsed || isPicked;

        return (
          <button
            key={champ.id}
            onClick={() => !isDisabled && onSelect(champ)}
            disabled={isDisabled}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              isDisabled
                ? 'opacity-30 cursor-not-allowed grayscale'
                : 'hover:bg-bg-hover cursor-pointer'
            }`}
            title={
              isUsed
                ? `${champ.name} - 이전 경기에서 사용됨`
                : isPicked
                  ? `${champ.name} - 이번 경기에서 이미 선택됨`
                  : champ.name
            }
          >
            <ChampionIcon championId={champ.id} championName={champ.name} size={40} />
            <span className="text-xs text-text-secondary truncate w-full text-center">
              {champ.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
