import { useTeamBuilder } from '../../context/TeamBuilderContext';

export default function GameResultSelector({ gameIndex }) {
  const { state, dispatch } = useTeamBuilder();
  const game = state.games[gameIndex];
  if (!game) return null;

  const setWinner = (winner) => {
    dispatch({
      type: 'SET_GAME_WINNER',
      payload: { gameIndex, winner: game.winner === winner ? null : winner },
    });
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <span className="text-text-secondary text-sm">승리팀:</span>
      <button
        onClick={() => setWinner('BLUE')}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
          game.winner === 'BLUE'
            ? 'bg-blue-team text-white'
            : 'bg-bg-tertiary text-blue-team border border-blue-team/30 hover:bg-blue-team/10'
        }`}
      >
        {state.blue.name} 승리
      </button>
      <button
        onClick={() => setWinner('RED')}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
          game.winner === 'RED'
            ? 'bg-red-team text-white'
            : 'bg-bg-tertiary text-red-team border border-red-team/30 hover:bg-red-team/10'
        }`}
      >
        {state.red.name} 승리
      </button>
    </div>
  );
}
