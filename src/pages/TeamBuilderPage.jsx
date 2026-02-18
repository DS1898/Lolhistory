import { TeamBuilderProvider, useTeamBuilder } from '../context/TeamBuilderContext';
import PlayerInputPhase from '../components/teambuilder/PlayerInputPhase';
import ShufflePhase from '../components/teambuilder/ShufflePhase';
import ConfirmedPhase from '../components/teambuilder/ConfirmedPhase';

function TeamBuilderContent() {
  const { state } = useTeamBuilder();

  switch (state.phase) {
    case 'INPUT':
      return <PlayerInputPhase />;
    case 'SHUFFLE':
      return <ShufflePhase />;
    case 'CONFIRMED':
      return <ConfirmedPhase />;
    default:
      return <PlayerInputPhase />;
  }
}

export default function TeamBuilderPage() {
  return (
    <TeamBuilderProvider>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TeamBuilderContent />
      </div>
    </TeamBuilderProvider>
  );
}
