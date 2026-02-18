import { useTeamBuilder } from '../../context/TeamBuilderContext';
import TeamRow from './TeamRow';

export default function ShufflePhase() {
  const { state, dispatch } = useTeamBuilder();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">팀 배정</h1>
      <p className="text-text-secondary text-center mb-6">
        랜덤 버튼으로 팀을 섞고, 확정 버튼을 눌러 팀을 확정하세요
      </p>

      <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
        {/* 1팀 */}
        <TeamRow
          label="1팀"
          players={state.team1}
          color="blue-team"
          onShuffle={() => dispatch({ type: 'SHUFFLE_ROW', payload: { row: 1 } })}
        />

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted text-sm">VS</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 2팀 */}
        <TeamRow
          label="2팀"
          players={state.team2}
          color="red-team"
          onShuffle={() => dispatch({ type: 'SHUFFLE_ROW', payload: { row: 2 } })}
        />
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-5 py-2.5 bg-bg-tertiary text-text-secondary border border-border rounded-lg hover:text-text-primary transition-colors"
        >
          처음으로
        </button>
        <button
          onClick={() => dispatch({ type: 'SHUFFLE_ALL' })}
          className="px-5 py-2.5 bg-bg-tertiary text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors font-semibold"
        >
          전체 셔플
        </button>
        <button
          onClick={() => dispatch({ type: 'CONFIRM_TEAMS' })}
          className="px-8 py-2.5 bg-primary text-bg-primary font-bold rounded-lg hover:bg-primary-light transition-colors"
        >
          팀 확정
        </button>
      </div>
    </div>
  );
}
