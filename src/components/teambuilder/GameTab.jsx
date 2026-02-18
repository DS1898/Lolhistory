import { useTeamBuilder } from '../../context/TeamBuilderContext';

export default function GameTab() {
  const { state, dispatch } = useTeamBuilder();

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {state.games.map((game, i) => {
        const isActive = state.activeGameIndex === i;
        const hasWinner = game.winner !== null;

        let statusIcon = '';
        if (game.winner === 'BLUE') statusIcon = '🔵';
        else if (game.winner === 'RED') statusIcon = '🔴';

        return (
          <button
            key={i}
            onClick={() => dispatch({ type: 'SET_ACTIVE_GAME', payload: i })}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-primary text-bg-primary'
                : hasWinner
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Game {i + 1} {statusIcon}
          </button>
        );
      })}
    </div>
  );
}
