import { useState } from 'react';
import { useTeamBuilder } from '../../context/TeamBuilderContext';
import ScoreBoard from './ScoreBoard';
import GameTab from './GameTab';
import GamePanel from './GamePanel';
import UsedChampionTracker from './UsedChampionTracker';
import PlayerSearchModal from './PlayerSearchModal';

export default function SeriesDashboard() {
  const { state, dispatch } = useTeamBuilder();
  const [playerModal, setPlayerModal] = useState(null);

  const handleReset = () => {
    if (window.confirm('시리즈를 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      dispatch({ type: 'RESET_SERIES' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">팀 빌더</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPlayerModal('BLUE')}
            className="px-3 py-1.5 text-sm bg-blue-team/20 text-blue-team border border-blue-team/30 rounded-lg hover:bg-blue-team/30 transition-colors"
          >
            + 블루 선수
          </button>
          <button
            onClick={() => setPlayerModal('RED')}
            className="px-3 py-1.5 text-sm bg-red-team/20 text-red-team border border-red-team/30 rounded-lg hover:bg-red-team/30 transition-colors"
          >
            + 레드 선수
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm bg-bg-tertiary text-text-muted border border-border rounded-lg hover:text-loss hover:border-loss/30 transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {/* Score */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4 mb-6">
        <ScoreBoard />
        {state.status === 'COMPLETED' && (
          <div className="text-center mt-4">
            <span className="text-xl font-bold text-primary">
              🏆 {state.blue.score > state.red.score ? state.blue.name : state.red.name} 승리!
            </span>
          </div>
        )}
      </div>

      {/* Game Tabs & Panel */}
      <GameTab />
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <GamePanel />
      </div>

      {/* Used Champions Tracker */}
      <UsedChampionTracker />

      {/* Player Modal */}
      {playerModal && (
        <PlayerSearchModal
          side={playerModal}
          onClose={() => setPlayerModal(null)}
        />
      )}
    </div>
  );
}
