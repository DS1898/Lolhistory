export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="text-4xl">⚠️</div>
      <p className="text-loss text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg hover:bg-bg-hover transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
