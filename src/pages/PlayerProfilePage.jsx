import { useParams } from 'react-router-dom';
import { usePlayerSearch } from '../hooks/usePlayerSearch';
import { useMatchHistory } from '../hooks/useMatchHistory';
import PlayerCard from '../components/player/PlayerCard';
import MatchHistoryList from '../components/player/MatchHistoryList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function PlayerProfilePage() {
  const { region, gameName, tagLine } = useParams();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = usePlayerSearch(region, decodeURIComponent(gameName), decodeURIComponent(tagLine));

  const {
    matches,
    loading: matchesLoading,
    loadMore,
    hasMore,
  } = useMatchHistory(region, profile?.account?.puuid);

  if (profileLoading) return <LoadingSpinner text="소환사 정보를 불러오는 중..." />;
  if (profileError) return <ErrorMessage message={profileError} />;
  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <PlayerCard profile={profile} region={region} />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">최근 전적</h2>
        <MatchHistoryList
          matches={matches}
          puuid={profile.account.puuid}
          loading={matchesLoading}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
