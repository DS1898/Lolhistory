export default function LoadingSpinner({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`flex items-center justify-center py-20 ${className}`}
    >
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin motion-reduce:animate-none" />
    </div>
  );
}
