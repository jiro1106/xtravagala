export function EventCardSkeleton() {
  return (
    <div
      className="rounded-[22px] overflow-hidden flex flex-col h-full animate-pulse"
      style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ aspectRatio: '16/10', backgroundColor: 'var(--muted)' }} />
      <div className="flex flex-col px-5 pt-5 pb-5" style={{ flexGrow: 1 }}>
        <div className="h-5 rounded" style={{ backgroundColor: 'var(--muted)', width: '85%' }} />
        <div className="h-5 rounded mt-2" style={{ backgroundColor: 'var(--muted)', width: '60%' }} />
        <div className="h-3.5 rounded mt-4" style={{ backgroundColor: 'var(--muted)', width: '50%' }} />
        <div className="flex items-center gap-2 mt-auto pt-5">
          <div className="flex">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[20px] h-[20px] rounded-full"
                style={{
                  backgroundColor: 'var(--muted)',
                  marginLeft: i === 0 ? 0 : -7,
                  border: '1.5px solid var(--bg)',
                }}
              />
            ))}
          </div>
          <div className="h-3 rounded" style={{ backgroundColor: 'var(--muted)', width: 60 }} />
        </div>
      </div>
    </div>
  );
}
