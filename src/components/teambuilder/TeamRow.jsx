export default function TeamRow({ label, players, color, onShuffle, showShuffle = true }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-bold text-${color}`}>{label}</h3>
        {showShuffle && (
          <button
            onClick={onShuffle}
            className={`px-3 py-1.5 text-sm bg-${color}/10 text-${color} border border-${color}/30 rounded-lg hover:bg-${color}/20 transition-colors`}
          >
            🎲 랜덤
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`bg-bg-tertiary border border-${color}/20 rounded-lg p-3 text-center min-h-[60px] flex items-center justify-center`}
          >
            {players[i] ? (
              <span className="text-text-primary text-sm font-medium">{players[i]}</span>
            ) : (
              <span className="text-text-muted text-xs">-</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
