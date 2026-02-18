import { useTeamBuilder } from '../../context/TeamBuilderContext';
import TeamRow from './TeamRow';
import PlayerRecordList from './PlayerRecordList';

export default function ConfirmedPhase() {
  const { state, dispatch } = useTeamBuilder();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">팀 확정</h1>
      <p className="text-text-secondary text-center mb-6">
        팀이 확정되었습니다. 오른쪽에서 개인 승패를 기록하세요.
      </p>

      <div className="flex flex-col lg:flex-row gap-6 justify-center">
        {/* 왼쪽: 확정된 팀 */}
        <div className="flex-1 max-w-3xl">
          <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4">
            <TeamRow
              label="1팀"
              players={state.team1}
              color="blue-team"
              showShuffle={false}
            />
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-text-muted text-sm">VS</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <TeamRow
              label="2팀"
              players={state.team2}
              color="red-team"
              showShuffle={false}
            />
          </div>
        </div>

        {/* 오른쪽: 개인 승패 기록 */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <PlayerRecordList />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={() => dispatch({ type: 'BACK_TO_SHUFFLE' })}
          className="px-5 py-2.5 bg-bg-tertiary text-text-secondary border border-border rounded-lg hover:text-text-primary transition-colors"
        >
          다시 섞기
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-5 py-2.5 bg-bg-tertiary text-text-secondary border border-border rounded-lg hover:text-loss hover:border-loss/30 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
