import { useTeamBuilder } from '../../context/TeamBuilderContext';

export default function PlayerInputPhase() {
  const { state, dispatch } = useTeamBuilder();

  const filledCount = state.playerNames.filter((n) => n.trim() !== '').length;
  const canStart = filledCount >= 2;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">팀 빌더</h1>
      <p className="text-text-secondary text-center mb-8">
        참가할 플레이어 이름을 입력하세요 (최소 2명)
      </p>

      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* 왼쪽 5명 */}
          <div className="space-y-3">
            {state.playerNames.slice(0, 5).map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-text-muted text-sm w-5 text-right">{i + 1}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    dispatch({ type: 'SET_PLAYER_NAME', payload: { index: i, name: e.target.value } })
                  }
                  placeholder={`플레이어 ${i + 1}`}
                  className="flex-1 bg-bg-tertiary text-text-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary placeholder:text-text-muted"
                />
              </div>
            ))}
          </div>
          {/* 오른쪽 5명 */}
          <div className="space-y-3">
            {state.playerNames.slice(5, 10).map((name, i) => (
              <div key={i + 5} className="flex items-center gap-3">
                <span className="text-text-muted text-sm w-5 text-right">{i + 6}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    dispatch({ type: 'SET_PLAYER_NAME', payload: { index: i + 5, name: e.target.value } })
                  }
                  placeholder={`플레이어 ${i + 6}`}
                  className="flex-1 bg-bg-tertiary text-text-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary placeholder:text-text-muted"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-text-muted text-sm mb-4">{filledCount}명 입력됨</p>
          <button
            onClick={() => dispatch({ type: 'START_SHUFFLE' })}
            disabled={!canStart}
            className="px-8 py-3 bg-primary text-bg-primary font-bold rounded-lg hover:bg-primary-light transition-colors text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            팀 나누기
          </button>
        </div>
      </div>
    </div>
  );
}
