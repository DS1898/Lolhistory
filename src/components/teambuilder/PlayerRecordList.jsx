import { useTeamBuilder } from '../../context/TeamBuilderContext';

export default function PlayerRecordList() {
  const { state, dispatch } = useTeamBuilder();

  const allPlayers = [...state.team1, ...state.team2];

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-4">
      <h3 className="text-sm font-bold text-text-secondary mb-3">개인 승패 기록</h3>
      <div className="space-y-2">
        {allPlayers.map((name) => {
          const record = state.records[name] || { wins: 0, losses: 0 };
          const total = record.wins + record.losses;
          const winRate = total > 0 ? Math.round((record.wins / total) * 100) : 0;

          return (
            <div
              key={name}
              className="flex items-center gap-2 bg-bg-tertiary rounded-lg p-2.5"
            >
              <span className="flex-1 text-text-primary text-sm font-medium truncate">
                {name}
              </span>

              {/* 승 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch({ type: 'UNDO_WIN', payload: { playerName: name } })}
                  className="w-5 h-5 text-xs text-text-muted hover:text-win rounded transition-colors"
                  title="승 취소"
                >
                  -
                </button>
                <span className="text-win text-sm font-bold min-w-[20px] text-center">
                  {record.wins}
                </span>
                <button
                  onClick={() => dispatch({ type: 'RECORD_WIN', payload: { playerName: name } })}
                  className="w-5 h-5 text-xs bg-win/20 text-win rounded hover:bg-win/30 transition-colors"
                  title="승 기록"
                >
                  +
                </button>
              </div>

              <span className="text-text-muted text-xs">/</span>

              {/* 패 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch({ type: 'UNDO_LOSS', payload: { playerName: name } })}
                  className="w-5 h-5 text-xs text-text-muted hover:text-loss rounded transition-colors"
                  title="패 취소"
                >
                  -
                </button>
                <span className="text-loss text-sm font-bold min-w-[20px] text-center">
                  {record.losses}
                </span>
                <button
                  onClick={() => dispatch({ type: 'RECORD_LOSS', payload: { playerName: name } })}
                  className="w-5 h-5 text-xs bg-loss/20 text-loss rounded hover:bg-loss/30 transition-colors"
                  title="패 기록"
                >
                  +
                </button>
              </div>

              {/* 승률 */}
              <span className={`text-xs min-w-[36px] text-right ${winRate >= 50 ? 'text-win' : total > 0 ? 'text-loss' : 'text-text-muted'}`}>
                {total > 0 ? `${winRate}%` : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
