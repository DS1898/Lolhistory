import { useState, useMemo } from 'react';
import { useChampions } from '../../context/ChampionDataContext';
import ChampionFilter from './ChampionFilter';
import ChampionCard from './ChampionCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

export default function ChampionGrid() {
  const { championList, loading, error } = useChampions();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

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

  if (loading) return <LoadingSpinner text="챔피언 데이터를 불러오는 중..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <ChampionFilter
        search={search}
        onSearchChange={setSearch}
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />
      <p className="text-text-secondary text-sm mb-4">{filtered.length}개의 챔피언</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filtered.map((champ) => (
          <ChampionCard key={champ.id} champion={champ} />
        ))}
      </div>
    </div>
  );
}
