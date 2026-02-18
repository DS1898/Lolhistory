export default function LoadingSpinner({ size = 'md', text = '로딩 중...' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeClasses[size]} border-2 border-bg-tertiary border-t-primary rounded-full animate-spin`}
      />
      {text && <p className="text-text-secondary text-sm">{text}</p>}
    </div>
  );
}
