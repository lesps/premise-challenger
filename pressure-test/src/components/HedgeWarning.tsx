interface HedgeWarningProps {
  words: string[];
}

export function HedgeWarning({ words }: HedgeWarningProps) {
  if (words.length === 0) return null;

  return (
    <div
      role="alert"
      style={{
        marginTop: '10px',
        padding: '10px 14px',
        borderLeft: '3px solid var(--danger)',
        background: 'rgba(154, 92, 92, 0.08)',
        borderRadius: '0 4px 4px 0',
        animation: 'slideDown 150ms ease',
      }}
    >
      <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: 0 }}>
        Detected:{' '}
        {words.map((w, i) => (
          <span key={w}>
            <em>{w}</em>
            {i < words.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
        Try stating this as a direct claim.
      </p>
    </div>
  );
}
