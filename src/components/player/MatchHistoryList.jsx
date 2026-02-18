import MatchHistoryItem from './MatchHistoryItem';
import LoadingSpinner from '../common/LoadingSpinner';

export default function MatchHistoryList({ matches, puuid, loading, onLoadMore, hasMore }) {
  if (!matches.length && loading) {
    return <LoadingSpinner text="매치 기록을 불러오는 중..." />;
  }

  if (!matches.length) {
    return <p className="text-text-muted text-center py-8">매치 기록이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map((match) => (
        <MatchHistoryItem key={match.metadata.matchId} match={match} puuid={puuid} />
      ))}
      {loading && <LoadingSpinner size="sm" text="더 불러오는 중..." />}
      {hasMore && !loading && (
        <button
          onClick={onLoadMore}
          className="mt-4 py-3 text-center text-text-secondary hover:text-primary bg-bg-secondary border border-border rounded-xl transition-colors"
        >
          더 보기
        </button>
      )}
    </div>
  );
}
