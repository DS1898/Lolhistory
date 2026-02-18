import { useTeamBuilder } from '../../context/TeamBuilderContext';
import PlayerSlot from './PlayerSlot';
import { ROLES } from '../../utils/constants';

export default function TeamPanel({ side, onOpenChampionPicker }) {
  const { state, dispatch } = useTeamBuilder();
  const game = state.games[state.activeGameIndex];
  if (!game) return null;

  const teamData = side === 'BLUE' ? game.blue : game.red;
  const teamInfo = side === 'BLUE' ? state.blue : state.red;
  const isGameDecided = game.winner !== null;

  const handleClearChampion = (role) => {
    dispatch({
      type: 'CLEAR_CHAMPION',
      payload: { gameIndex: state.activeGameIndex, side, role },
    });
  };

  return (
    <div className="flex-1">
      <h3
        className={`text-lg font-bold mb-3 ${
          side === 'BLUE' ? 'text-blue-team' : 'text-red-team'
        }`}
      >
        {teamInfo.name}
      </h3>
      <div className="space-y-2">
        {ROLES.map((roleInfo) => {
          const slot = teamData.players.find((p) => p.role === roleInfo.key);
          const player = teamInfo.players.find((p) => p.role === roleInfo.key);

          return (
            <PlayerSlot
              key={roleInfo.key}
              role={roleInfo.key}
              championId={slot?.championId}
              championName={slot?.championName}
              playerName={player?.name || ''}
              side={side}
              disabled={isGameDecided}
              onPickChampion={() =>
                onOpenChampionPicker(side, roleInfo.key)
              }
              onClearChampion={() => handleClearChampion(roleInfo.key)}
            />
          );
        })}
      </div>
    </div>
  );
}
