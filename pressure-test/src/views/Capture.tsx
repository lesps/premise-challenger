import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePropositions } from '../hooks/usePropositions';
import { HedgeWarning } from '../components/HedgeWarning';
import { detectHedgeWords, isValidClaim } from '../utils/validation';

export function Capture() {
  const navigate = useNavigate();
  const { createProposition } = usePropositions();
  const [claim, setClaim] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hedgeWords = claim.trim() ? detectHedgeWords(claim) : [];
  const validation = isValidClaim(claim);
  const canSubmit = validation.valid && !submitting;

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!canSubmit) return;
      setSubmitting(true);
      try {
        const p = createProposition(claim.trim());
        navigate(`/triage/${p.id}`);
      } catch {
        // Storage error (e.g. quota exceeded) is surfaced via the StorageContext banner.
        // Re-enable submit so the user can try again or export data.
        setSubmitting(false);
      }
    },
    [canSubmit, claim, createProposition, navigate]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
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
          transition: 'color var(--transition)',
        }}
      >
        ← Back
      </Link>

      <form onSubmit={handleSubmit}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          State your claim
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            fontSize: '1rem',
          }}
        >
          One clear sentence. No hedging.
        </p>

        <input
          type="text"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="The deadline is realistic."
          aria-label="Claim"
          style={{
            width: '100%',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: `1px solid ${hedgeWords.length > 0 ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: '6px',
            padding: '14px 16px',
            fontSize: '1.1rem',
            lineHeight: 1.5,
            transition: 'border-color var(--transition)',
          }}
        />

        <HedgeWarning words={hedgeWords} />

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            marginTop: '20px',
            background: canSubmit ? 'var(--accent)' : 'var(--bg-elevated)',
            color: canSubmit ? '#0f0f0f' : 'var(--text-tertiary)',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 28px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.5,
            minHeight: '48px',
            transition: 'background var(--transition), color var(--transition)',
          }}
        >
          Save &amp; Continue
        </button>
      </form>
    </div>
  );
}
