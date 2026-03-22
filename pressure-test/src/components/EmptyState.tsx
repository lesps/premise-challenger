import { useNavigate } from 'react-router-dom';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 20px',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
          lineHeight: 1.5,
        }}
      >
        Capture a belief, decision, or conclusion.
      </p>
      <p
        style={{
          color: 'var(--text-tertiary)',
          fontSize: '0.9rem',
          marginBottom: '32px',
        }}
      >
        Then pressure-test it.
      </p>
      <button
        type="button"
        onClick={() => navigate('/new')}
        style={{
          background: 'var(--accent)',
          color: '#0f0f0f',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '48px',
          transition: 'opacity var(--transition)',
        }}
      >
        Add your first proposition
      </button>
    </div>
  );
}
