import { CHAMPION_TAGS } from '../../utils/constants';

const allTags = Object.keys(CHAMPION_TAGS);

export default function ChampionFilter({ search, onSearchChange, activeTag, onTagChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="챔피언 검색..."
        className="flex-1 bg-bg-tertiary text-text-primary border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary placeholder:text-text-muted"
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTagChange(null)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            !activeTag
              ? 'bg-primary text-bg-primary'
              : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
          }`}
        >
          전체
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagChange(tag === activeTag ? null : tag)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              activeTag === tag
                ? 'bg-primary text-bg-primary'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            {CHAMPION_TAGS[tag]}
          </button>
        ))}
      </div>
    </div>
  );
}
