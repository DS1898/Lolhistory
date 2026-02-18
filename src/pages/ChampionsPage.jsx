import ChampionGrid from '../components/champion/ChampionGrid';

export default function ChampionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">챔피언 도감</h1>
      <ChampionGrid />
    </div>
  );
}
