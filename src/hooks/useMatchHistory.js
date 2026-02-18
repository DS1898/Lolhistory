import { useState, useEffect, useCallback } from 'react';
import { getMatchIds, getMatchDetail } from '../api/riotApi';

export function useMatchHistory(region, puuid, initialCount = 10) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMatches = useCallback(async (start, count) => {
    if (!region || !puuid) return;

    setLoading(true);
    try {
      const ids = await getMatchIds(region, puuid, start, count);
      if (ids.length < count) setHasMore(false);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      const details = await Promise.all(
        ids.map((id) => getMatchDetail(region, id).catch(() => null)),
      );

      setMatches((prev) => [...prev, ...details.filter(Boolean)]);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [region, puuid]);

  useEffect(() => {
    if (puuid) {
      setMatches([]);
      setHasMore(true);
      fetchMatches(0, initialCount);
    }
  }, [puuid, fetchMatches, initialCount]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMatches(matches.length, 10);
    }
  };

  return { matches, loading, hasMore, loadMore };
}
