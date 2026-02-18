import { createContext, useContext, useReducer, useEffect } from 'react';

const TeamBuilderContext = createContext(null);
const STORAGE_KEY = 'lol-team-builder-state';

function createInitialState() {
  return {
    // 'INPUT' | 'SHUFFLE' | 'CONFIRMED'
    phase: 'INPUT',
    // 10명의 플레이어 이름 입력
    playerNames: Array(10).fill(''),
    // 2행 5열: team1[0..4], team2[0..4]
    team1: [],
    team2: [],
    // 개인 승패 기록: { playerName: { wins: 0, losses: 0 } }
    records: {},
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_NAME': {
      const { index, name } = action.payload;
      const names = [...state.playerNames];
      names[index] = name;
      return { ...state, playerNames: names };
    }

    case 'START_SHUFFLE': {
      const filled = state.playerNames.filter((n) => n.trim() !== '');
      if (filled.length < 2) return state;

      // 빈 칸은 제외하고 셔플
      const shuffled = shuffle(filled);
      const half = Math.ceil(shuffled.length / 2);
      const t1 = shuffled.slice(0, half);
      const t2 = shuffled.slice(half);

      // 기존 records 유지, 새 선수는 추가
      const records = { ...state.records };
      for (const name of filled) {
        if (!records[name]) {
          records[name] = { wins: 0, losses: 0 };
        }
      }

      return {
        ...state,
        phase: 'SHUFFLE',
        team1: t1,
        team2: t2,
        records,
      };
    }

    case 'SHUFFLE_ROW': {
      const { row } = action.payload;
      if (row === 1) {
        return { ...state, team1: shuffle(state.team1) };
      }
      return { ...state, team2: shuffle(state.team2) };
    }

    case 'SHUFFLE_ALL': {
      const all = [...state.team1, ...state.team2];
      const shuffled = shuffle(all);
      const half = Math.ceil(shuffled.length / 2);
      return {
        ...state,
        team1: shuffled.slice(0, half),
        team2: shuffled.slice(half),
      };
    }

    case 'CONFIRM_TEAMS':
      return { ...state, phase: 'CONFIRMED' };

    case 'RECORD_WIN': {
      const { playerName } = action.payload;
      const records = { ...state.records };
      if (records[playerName]) {
        records[playerName] = { ...records[playerName], wins: records[playerName].wins + 1 };
      }
      return { ...state, records };
    }

    case 'RECORD_LOSS': {
      const { playerName } = action.payload;
      const records = { ...state.records };
      if (records[playerName]) {
        records[playerName] = { ...records[playerName], losses: records[playerName].losses + 1 };
      }
      return { ...state, records };
    }

    case 'UNDO_WIN': {
      const { playerName } = action.payload;
      const records = { ...state.records };
      if (records[playerName] && records[playerName].wins > 0) {
        records[playerName] = { ...records[playerName], wins: records[playerName].wins - 1 };
      }
      return { ...state, records };
    }

    case 'UNDO_LOSS': {
      const { playerName } = action.payload;
      const records = { ...state.records };
      if (records[playerName] && records[playerName].losses > 0) {
        records[playerName] = { ...records[playerName], losses: records[playerName].losses - 1 };
      }
      return { ...state, records };
    }

    case 'BACK_TO_SHUFFLE':
      return { ...state, phase: 'SHUFFLE' };

    case 'RESET':
      return createInitialState();

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

export function TeamBuilderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phase && parsed.playerNames) return parsed;
      }
    } catch { /* ignore */ }
    return createInitialState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <TeamBuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </TeamBuilderContext.Provider>
  );
}

export function useTeamBuilder() {
  const ctx = useContext(TeamBuilderContext);
  if (!ctx) throw new Error('useTeamBuilder must be used within TeamBuilderProvider');
  return ctx;
}
