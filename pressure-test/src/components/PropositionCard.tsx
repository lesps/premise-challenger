import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Proposition } from '../types';
import { StatusBadge } from './StatusBadge';
import { relativeDate } from '../utils/date';

function getDestination(p: Proposition): string {
  if (p.status === 'untested' && p.triage === null) return `/triage/${p.id}`;
  if (p.status === 'untested' && p.triage === 'pressure_test') return `/test/${p.id}`;
  return `/outcome/${p.id}`;
}

interface PropositionCardProps {
  proposition: Proposition;
  onDelete: (id: string) => void;
}

export function PropositionCard({ proposition, onDelete }: PropositionCardProps) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const truncatedClaim =
    proposition.claim.length > 120
      ? proposition.claim.slice(0, 120) + '…'
      : proposition.claim;

  const handleCardClick = () => {
    if (confirmDelete) return;
    navigate(getDestination(proposition));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(proposition.id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Proposition: ${truncatedClaim}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'background var(--transition), border-color var(--transition)',
        marginBottom: '12px',
      }}
    >
      {/* Delete zone — top right */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!confirmDelete ? (
          <button
            type="button"
            aria-label="Delete proposition"
            onClick={handleDeleteClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '6px',
              minHeight: '44px',
              minWidth: '44px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 3.5h10M5.5 3.5V2.5h3V3.5M3 3.5l.7 8.5h6.6L11 3.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delete?</span>
            <button
              type="button"
              aria-label="Confirm delete"
              onClick={handleConfirmDelete}
              style={{
                background: 'var(--danger)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Yes
            </button>
            <button
              type="button"
              aria-label="Cancel delete"
              onClick={handleCancelDelete}
              style={{
                background: 'none',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Claim text */}
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1rem',
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          marginBottom: '12px',
          paddingRight: confirmDelete ? '140px' : '40px',
        }}
      >
        {truncatedClaim}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <StatusBadge status={proposition.status} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
          }}
        >
          {relativeDate(proposition.created_at)}
        </span>
      </div>
    </div>
  );
}
