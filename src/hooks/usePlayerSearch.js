import { useState, useEffect } from 'react';
import { getPlayerProfile } from '../api/riotApi';

export function usePlayerSearch(region, gameName, tagLine) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!region || !gameName || !tagLine) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setProfile(null);

    getPlayerProfile(region, gameName, tagLine)
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || '소환사를 찾을 수 없습니다.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [region, gameName, tagLine]);

  return { profile, loading, error };
}
