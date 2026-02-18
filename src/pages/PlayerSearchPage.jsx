import SearchBar from '../components/common/SearchBar';

export default function PlayerSearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-2">전적 검색</h1>
      <p className="text-text-secondary text-center mb-8">
        Riot ID를 입력하여 소환사 정보를 검색하세요
      </p>
      <SearchBar size="lg" />
      <div className="mt-8 text-center text-text-muted text-sm">
        <p>예시: Hide on bush#KR1</p>
      </div>
    </div>
  );
}
