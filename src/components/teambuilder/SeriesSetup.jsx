import { useState } from 'react';
import { useTeamBuilder } from '../../context/TeamBuilderContext';
import { ROLES } from '../../utils/constants';

export default function SeriesSetup() {
  const { dispatch } = useTeamBuilder();
  const [totalGames, setTotalGames] = useState(5);
  const [blueName, setBlueName] = useState('블루팀');
  const [redName, setRedName] = useState('레드팀');

  const handleStart = () => {
    dispatch({
      type: 'START_SERIES',
      payload: {
        totalGames,
        blueName,
        redName,
        bluePlayers: ROLES.map((r) => ({ name: '', role: r.key, region: null, profileData: null })),
        redPlayers: ROLES.map((r) => ({ name: '', role: r.key, region: null, profileData: null })),
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">팀 빌더</h1>
      <p className="text-text-secondary text-center mb-8">
        LCK 스타일 시리즈 경기를 설정하세요
      </p>

      <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-6">
        {/* Game Count */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">시리즈 경기 수</label>
          <div className="flex gap-3">
            {[1, 3, 5, 7].map((n) => (
              <button
                key={n}
                onClick={() => setTotalGames(n)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  totalGames === n
                    ? 'bg-primary text-bg-primary'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
              >
                BO{n}
              </button>
            ))}
          </div>
        </div>

        {/* Team Names */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-blue-team text-sm font-medium mb-2">블루팀 이름</label>
            <input
              type="text"
              value={blueName}
              onChange={(e) => setBlueName(e.target.value)}
              className="w-full bg-bg-tertiary border border-blue-team/30 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:border-blue-team"
            />
          </div>
          <div>
            <label className="block text-red-team text-sm font-medium mb-2">레드팀 이름</label>
            <input
              type="text"
              value={redName}
              onChange={(e) => setRedName(e.target.value)}
              className="w-full bg-bg-tertiary border border-red-team/30 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:border-red-team"
            />
          </div>
        </div>

        {/* Roles Preview */}
        <div>
          <label className="block text-text-secondary text-sm mb-2">포지션 구성</label>
          <div className="flex gap-2">
            {ROLES.map((r) => (
              <div
                key={r.key}
                className="flex-1 bg-bg-tertiary rounded-lg p-3 text-center"
              >
                <div className="text-xl">{r.icon}</div>
                <div className="text-text-secondary text-xs mt-1">{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 bg-primary text-bg-primary font-bold rounded-lg hover:bg-primary-light transition-colors text-lg"
        >
          시리즈 시작
        </button>
      </div>
    </div>
  );
}
