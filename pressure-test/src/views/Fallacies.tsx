import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FALLACIES, FALLACY_CATEGORIES } from '../data/fallacies';
import { filterFallacies, type FallacyFilter } from '../utils/fallacies';
import type { Fallacy, FallacyCategory } from '../types';

const CATEGORY_OPTIONS: Array<{ value: FallacyFilter['category']; label: string }> = [
  { value: 'all', label: 'All' },
  ...(Object.keys(FALLACY_CATEGORIES) as FallacyCategory[]).map((c) => ({
    value: c,
    label: FALLACY_CATEGORIES[c].label,
  })),
];

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-tertiary)',
  display: 'block',
  marginBottom: '4px',
};

function FallacyCard({ fallacy }: { fallacy: Fallacy }) {
  const [open, setOpen] = useState(false);
  const detailsId = `fallacy-${fallacy.id}-details`;

  return (
    <article
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{fallacy.name}</h2>
        <span style={{ ...labelStyle, marginBottom: 0, flexShrink: 0 }}>
          {FALLACY_CATEGORIES[fallacy.category].label}
        </span>
      </div>
      {fallacy.aka.length > 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
          aka {fallacy.aka.join(', ')}
        </p>
      )}
      <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '8px' }}>
        {fallacy.definition}
      </p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--accent)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          padding: '12px 0',
          minHeight: '44px',
        }}
      >
        {open ? 'Hide example' : 'Show example'}
      </button>

      {open && (
        <div id={detailsId} style={{ marginTop: '4px' }}>
          <span style={labelStyle}>Example</span>
          <blockquote
            style={{
              borderLeft: '3px solid var(--accent-muted)',
              paddingLeft: '16px',
              marginBottom: '16px',
            }}
          >
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text-primary)' }}>
              {fallacy.example}
            </p>
          </blockquote>
          <span style={labelStyle}>Why it fails</span>
          <p style={{ fontSize: '0.9rem' }}>{fallacy.flaw}</p>
        </div>
      )}
    </article>
  );
}

export function Fallacies() {
  const [filter, setFilter] = useState<FallacyFilter>({ category: 'all', query: '' });
  const visible = filterFallacies(FALLACIES, filter);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Logical Fallacies</h1>
      <p style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
        {FALLACIES.length} common errors in reasoning. Learn to spot them in others' arguments — and your own.
      </p>

      <Link
        to="/fallacies/quiz"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--accent)',
          color: '#0f0f0f',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: 600,
          minHeight: '48px',
          marginBottom: '32px',
        }}
      >
        Take the quiz
      </Link>

      <input
        type="search"
        aria-label="Search fallacies"
        placeholder="Search by name or description"
        value={filter.query}
        onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
        style={{
          width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '10px 12px',
          fontSize: '16px',
          minHeight: '44px',
          marginBottom: '12px',
        }}
      />

      <div
        role="group"
        aria-label="Filter by category"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}
      >
        {CATEGORY_OPTIONS.map((opt) => {
          const active = filter.category === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter((f) => ({ ...f, category: opt.value }))}
              style={{
                background: active ? 'var(--accent)' : 'var(--bg-surface)',
                color: active ? '#0f0f0f' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {filter.category !== 'all' && (
        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '16px' }}>
          {FALLACY_CATEGORIES[filter.category].description}
        </p>
      )}

      {visible.length === 0 ? (
        <p
          style={{
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '48px 0',
          }}
        >
          No fallacies match your search.
        </p>
      ) : (
        visible.map((f) => <FallacyCard key={f.id} fallacy={f} />)
      )}
    </div>
  );
}
