import { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllChampions } from '../api/dataDragon';

const ChampionDataContext = createContext(null);

export function ChampionDataProvider({ children }) {
  const [champions, setChampions] = useState({});
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllChampions()
      .then(({ champions: data, version: v }) => {
        if (!cancelled) {
          setChampions(data);
          setVersion(v);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const getChampionById = (key) => {
    return Object.values(champions).find((c) => c.key === String(key)) || null;
  };

  const getChampionByName = (id) => {
    return champions[id] || null;
  };

  const championList = Object.values(champions).sort((a, b) =>
    a.name.localeCompare(b.name, 'ko'),
  );

  return (
    <ChampionDataContext.Provider
      value={{ champions, championList, version, loading, error, getChampionById, getChampionByName }}
    >
      {children}
    </ChampionDataContext.Provider>
  );
}

export function useChampions() {
  const ctx = useContext(ChampionDataContext);
  if (!ctx) throw new Error('useChampions must be used within ChampionDataProvider');
  return ctx;
}
