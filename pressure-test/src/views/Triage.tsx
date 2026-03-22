import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePropositions } from '../hooks/usePropositions';

export function Triage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposition, updateProposition } = usePropositions();

  const proposition = id ? getProposition(id) : null;

  useEffect(() => {
    if (!proposition) {
      navigate('/', { replace: true });
    }
  }, [proposition, navigate]);

  if (!proposition) return null;

  const handlePressureTest = () => {
    updateProposition(proposition.id, { triage: 'pressure_test' });
    navigate(`/test/${proposition.id}`);
  };

  const handleActOnIt = () => {
    updateProposition(proposition.id, {
      triage: 'confirmed_intuition',
      status: 'confirmed',
    });
    navigate('/');
  };

  return (
    <div>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          marginBottom: '32px',
          textDecoration: 'none',
        }}
      >
        ← Back
      </Link>

      <blockquote
        style={{
          borderLeft: '3px solid var(--accent)',
          paddingLeft: '20px',
          marginBottom: '32px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.3rem',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
          }}
        >
          {proposition.claim}
        </p>
      </blockquote>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.4rem',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        Does this warrant pressure-testing?
      </h2>
      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '28px',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        Consider: Is this high-stakes? Irreversible? Does it affect others?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          type="button"
          onClick={handlePressureTest}
          style={{
            background: 'var(--accent)',
            color: '#0f0f0f',
            border: 'none',
            borderRadius: '8px',
            padding: '16px 24px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '56px',
            textAlign: 'left',
            transition: 'opacity var(--transition)',
          }}
        >
          Yes, pressure-test this
        </button>
        <button
          type="button"
          onClick={handleActOnIt}
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px 24px',
            fontSize: '1rem',
            cursor: 'pointer',
            minHeight: '56px',
            textAlign: 'left',
            transition: 'background var(--transition)',
          }}
        >
          No, act on it
        </button>
      </div>
    </div>
  );
}
