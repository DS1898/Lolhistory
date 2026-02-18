import { useTeamBuilder } from '../../context/TeamBuilderContext';

export default function ScoreBoard() {
  const { state } = useTeamBuilder();

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="text-right flex-1">
        <h2 className="text-xl font-bold text-blue-team">{state.blue.name}</h2>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-black text-blue-team">{state.blue.score}</span>
        <span className="text-2xl text-text-muted">:</span>
        <span className="text-4xl font-black text-red-team">{state.red.score}</span>
      </div>
      <div className="text-left flex-1">
        <h2 className="text-xl font-bold text-red-team">{state.red.name}</h2>
      </div>
    </div>
  );
}
