import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePropositions } from '../hooks/usePropositions';
import { StatusBadge } from '../components/StatusBadge';
import { AutoGrowTextarea } from '../components/AutoGrowTextarea';
import type { PropositionStatus } from '../types';

type OutcomeChoice = 'confirmed' | 'revised' | 'suspended' | null;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        marginBottom: '6px',
      }}
    >
      {children}
    </p>
  );
}

function SectionText({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        marginBottom: '20px',
        paddingLeft: '1px',
      }}
    >
      {children}
    </p>
  );
}

export function Outcome() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposition, updateProposition, createProposition, deleteProposition } =
    usePropositions();

  const proposition = id ? getProposition(id) : null;

  const [choice, setChoice] = useState<OutcomeChoice>(null);
  const [revisionText, setRevisionText] = useState('');
  const [suspensionNote, setSuspensionNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!proposition) {
      navigate('/', { replace: true });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!proposition) return null;

  // Decision mode: status is untested and answers exist (just finished pressure test)
  const isDecisionMode =
    proposition.status === 'untested' && proposition.triage === 'pressure_test';

  const handleConfirm = () => {
    updateProposition(proposition.id, { status: 'confirmed' as PropositionStatus });
    navigate('/');
  };

  const handleRevised = () => {
    if (!revisionText.trim()) return;
    const newP = createProposition(revisionText.trim());
    updateProposition(newP.id, { revised_from: proposition.id });
    updateProposition(proposition.id, {
      status: 'revised',
      revision_note: revisionText.trim(),
    });
    navigate(`/triage/${newP.id}`);
  };

  const handleSuspended = () => {
    updateProposition(proposition.id, {
      status: 'suspended',
      resolution_note: suspensionNote.trim() || null,
    });
    navigate('/');
  };

  const handleReEvaluate = () => {
    updateProposition(proposition.id, {
      status: 'untested',
      triage: null,
      evidence: null,
      steelman: null,
      falsifiability: null,
    });
    navigate(`/triage/${proposition.id}`);
  };

  const handleDelete = () => {
    deleteProposition(proposition.id);
    navigate('/');
  };

  return (
    <div>
      {isDecisionMode ? (
        <>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}
          >
            Review your pressure test
          </h1>
        </>
      ) : (
        <>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              marginBottom: '24px',
              textDecoration: 'none',
            }}
          >
            ← Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                color: 'var(--text-primary)',
              }}
            >
              Proposition
            </h1>
            <StatusBadge status={proposition.status} />
          </div>
        </>
      )}

      {/* Claim */}
      <blockquote
        style={{
          borderLeft: '3px solid var(--accent)',
          paddingLeft: '20px',
          marginBottom: '24px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
          }}
        >
          {proposition.claim}
        </p>
      </blockquote>

      {/* Answer summary */}
      {proposition.evidence && (
        <>
          <SectionLabel>Evidence</SectionLabel>
          <SectionText>{proposition.evidence}</SectionText>
        </>
      )}
      {proposition.steelman && (
        <>
          <SectionLabel>Counter-argument</SectionLabel>
          <SectionText>{proposition.steelman}</SectionText>
        </>
      )}
      {proposition.falsifiability && (
        <>
          <SectionLabel>Falsifiability</SectionLabel>
          <SectionText>{proposition.falsifiability}</SectionText>
        </>
      )}

      {/* Revision link in review mode */}
      {!isDecisionMode && proposition.status === 'revised' && proposition.revision_note && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '24px',
          }}
        >
          <SectionLabel>Revised as</SectionLabel>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {proposition.revision_note}
          </p>
        </div>
      )}

      {/* Suspension note in review mode */}
      {!isDecisionMode && proposition.status === 'suspended' && proposition.resolution_note && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '24px',
          }}
        >
          <SectionLabel>Waiting for</SectionLabel>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {proposition.resolution_note}
          </p>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

      {isDecisionMode ? (
        /* Decision mode: status buttons */
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            What's the status of this proposition?
          </h2>

          <div
            role="group"
            aria-label="Proposition status"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {/* Confirmed */}
            <button
              type="button"
              onClick={() => setChoice(choice === 'confirmed' ? null : 'confirmed')}
              style={{
                background: choice === 'confirmed' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${choice === 'confirmed' ? 'var(--status-confirmed)' : 'var(--border)'}`,
                borderRadius: '8px',
                padding: '14px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '56px',
                transition: 'border-color var(--transition)',
              }}
            >
              <p style={{ color: 'var(--status-confirmed)', fontWeight: 600, marginBottom: '2px' }}>
                Confirmed
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Evidence holds up. Alternative is weak. You know what would change your mind.
              </p>
            </button>

            {/* Revised */}
            <button
              type="button"
              onClick={() => setChoice(choice === 'revised' ? null : 'revised')}
              style={{
                background: choice === 'revised' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${choice === 'revised' ? 'var(--status-revised)' : 'var(--border)'}`,
                borderRadius: '8px',
                padding: '14px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '56px',
                transition: 'border-color var(--transition)',
              }}
            >
              <p style={{ color: 'var(--status-revised)', fontWeight: 600, marginBottom: '2px' }}>
                Revised
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                The process surfaced something that changes the claim.
              </p>
            </button>

            {/* Suspended */}
            <button
              type="button"
              onClick={() => setChoice(choice === 'suspended' ? null : 'suspended')}
              style={{
                background: choice === 'suspended' ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                border: `1px solid ${choice === 'suspended' ? 'var(--status-suspended)' : 'var(--border)'}`,
                borderRadius: '8px',
                padding: '14px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                minHeight: '56px',
                transition: 'border-color var(--transition)',
              }}
            >
              <p style={{ color: 'var(--status-suspended)', fontWeight: 600, marginBottom: '2px' }}>
                Suspended
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Not enough data yet.
              </p>
            </button>
          </div>

          {/* Confirmed action */}
          {choice === 'confirmed' && (
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  background: 'var(--status-confirmed)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                Confirm this proposition
              </button>
            </div>
          )}

          {/* Revised inline form */}
          {choice === 'revised' && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>
                How would you restate the proposition now?
              </p>
              <AutoGrowTextarea
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                placeholder="The revised claim…"
                aria-label="Revised claim"
              />
              <button
                type="button"
                onClick={handleRevised}
                disabled={!revisionText.trim()}
                style={{
                  marginTop: '12px',
                  background: revisionText.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: revisionText.trim() ? '#0f0f0f' : 'var(--text-tertiary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: revisionText.trim() ? 'pointer' : 'not-allowed',
                  minHeight: '48px',
                }}
              >
                Save revised proposition
              </button>
            </div>
          )}

          {/* Suspended inline form */}
          {choice === 'suspended' && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>
                What would resolve this? <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
              </p>
              <AutoGrowTextarea
                value={suspensionNote}
                onChange={(e) => setSuspensionNote(e.target.value)}
                placeholder="When X happens, I'll revisit this…"
                aria-label="Resolution note"
              />
              <button
                type="button"
                onClick={handleSuspended}
                style={{
                  marginTop: '12px',
                  background: 'var(--accent)',
                  color: '#0f0f0f',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: '48px',
                }}
              >
                Suspend this proposition
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Review mode actions */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReEvaluate}
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              minHeight: '48px',
              textAlign: 'left',
              transition: 'background var(--transition)',
            }}
          >
            Re-evaluate this proposition
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{
                background: 'none',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                borderRadius: '6px',
                padding: '12px 20px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                minHeight: '48px',
                textAlign: 'left',
                transition: 'background var(--transition)',
              }}
            >
              Delete proposition
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Are you sure?
              </span>
              <button
                type="button"
                aria-label="Confirm delete"
                onClick={handleDelete}
                style={{
                  background: 'var(--danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                Delete
              </button>
              <button
                type="button"
                aria-label="Cancel delete"
                onClick={() => setConfirmDelete(false)}
                style={{
                  background: 'none',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  minHeight: '40px',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
