import { useState, useMemo } from 'react';
import { useChampions } from '../../context/ChampionDataContext';
import { useTeamBuilder, getUsedChampions, getCurrentGamePicks } from '../../context/TeamBuilderContext';
import { CHAMPION_TAGS } from '../../utils/constants';
import ChampionPoolGrid from './ChampionPoolGrid';

const allTags = Object.keys(CHAMPION_TAGS);

export default function ChampionPickerModal({ side, role, gameIndex, onClose }) {
  const { championList } = useChampions();
  const { state, dispatch } = useTeamBuilder();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const usedChampionIds = useMemo(
    () => getUsedChampions(state, side, gameIndex),
    [state, side, gameIndex],
  );

  const currentPickIds = useMemo(
    () => getCurrentGamePicks(state, side, gameIndex, role),
    [state, side, gameIndex, role],
  );

  const filtered = useMemo(() => {
    return championList.filter((champ) => {
      const matchSearch =
        !search ||
        champ.name.toLowerCase().includes(search.toLowerCase()) ||
        champ.id.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || champ.tags?.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [championList, search, activeTag]);

  const handleSelect = (champ) => {
    dispatch({
      type: 'PICK_CHAMPION',
      payload: {
        gameIndex,
        side,
        role,
        championId: champ.id,
        championName: champ.name,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">챔피언 선택</h2>
            <p className="text-text-muted text-sm">
              {side === 'BLUE' ? '블루팀' : '레드팀'} - Game {gameIndex + 1}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="챔피언 검색..."
            className="w-full bg-bg-tertiary text-text-primary border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary placeholder:text-text-muted"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                !activeTag ? 'bg-primary text-bg-primary' : 'bg-bg-tertiary text-text-secondary'
              }`}
            >
              전체
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  activeTag === tag ? 'bg-primary text-bg-primary' : 'bg-bg-tertiary text-text-secondary'
                }`}
              >
                {CHAMPION_TAGS[tag]}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-text-muted">
            <span>🔒 이전 게임 사용: {usedChampionIds.size}개</span>
            <span>🚫 이번 게임 선택됨: {currentPickIds.size}개</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <ChampionPoolGrid
            champions={filtered}
            usedChampionIds={usedChampionIds}
            currentPickIds={currentPickIds}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
