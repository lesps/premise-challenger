import { useNavigate } from 'react-router-dom';
import { usePropositions } from '../hooks/usePropositions';
import { relativeDate } from '../utils/date';

export function OpenQuestions() {
  const navigate = useNavigate();
  const { propositions } = usePropositions();

  const suspended = propositions.filter((p) => p.status === 'suspended');

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.75rem',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        Open Questions
      </h1>
      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          fontSize: '0.95rem',
        }}
      >
        Propositions waiting for more data.
      </p>

      {suspended.length === 0 ? (
        <p
          style={{
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.05rem',
            textAlign: 'center',
            padding: '64px 0',
          }}
        >
          No suspended propositions. That's either good discipline or insufficient skepticism.
        </p>
      ) : (
        <div>
          {suspended.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`Open question: ${p.claim}`}
              onClick={() => navigate(`/outcome/${p.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/outcome/${p.id}`);
                }
              }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px 20px',
                cursor: 'pointer',
                marginBottom: '12px',
                transition: 'background var(--transition)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                  marginBottom: '8px',
                }}
              >
                {p.claim}
              </p>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  marginBottom: p.resolution_note ? '8px' : '0',
                }}
              >
                {relativeDate(p.created_at)}
              </p>

              {p.resolution_note && (
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Waiting for:
                  </span>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {p.resolution_note}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
