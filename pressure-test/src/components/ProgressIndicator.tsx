interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', gap: '6px' }}>
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const filled = stepNum <= current;
          return (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: '28px',
                height: '4px',
                borderRadius: '2px',
                background: filled ? 'var(--accent)' : 'var(--border)',
                transition: 'background var(--transition)',
              }}
            />
          );
        })}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.05em',
        }}
      >
        Question {current} of {total}
      </span>
    </div>
  );
}
