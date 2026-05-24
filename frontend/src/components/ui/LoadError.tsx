interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-[12px] px-4 py-3 text-[13.5px]"
      style={{
        backgroundColor: 'oklch(96% 0.03 30)',
        border: '1px solid oklch(85% 0.08 30)',
        color: 'oklch(35% 0.12 30)',
      }}
    >
      <span>Couldn't load: {message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="font-medium underline-offset-2 hover:underline"
        style={{ color: 'oklch(35% 0.12 30)' }}
      >
        Retry
      </button>
    </div>
  );
}
