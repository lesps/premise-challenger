import { useState } from 'react';

interface HelperPromptProps {
  text: string;
}

export function HelperPrompt({ text }: HelperPromptProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'color var(--transition)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1px solid var(--text-secondary)',
            textAlign: 'center',
            lineHeight: '14px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ?
        </span>
        Need a prompt?
      </button>
      {open && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px 16px',
            background: 'var(--bg-surface)',
            borderRadius: '4px',
            borderLeft: '2px solid var(--accent-muted)',
            animation: 'slideDown 150ms ease',
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
