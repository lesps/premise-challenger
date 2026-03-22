import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropositions } from '../hooks/usePropositions';
import { PropositionCard } from '../components/PropositionCard';
import { FilterBar } from '../components/FilterBar';
import { EmptyState } from '../components/EmptyState';
import type { PropositionStatus } from '../types';

type StatusFilter = PropositionStatus | 'all';
type SortOrder = 'newest' | 'oldest';

export function Dashboard() {
  const navigate = useNavigate();
  const { propositions, deleteProposition, exportData } = usePropositions();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const filtered = propositions
    .filter((p) => statusFilter === 'all' || p.status === statusFilter)
    .sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });

  const handleExport = () => {
    exportData(statusFilter !== 'all' ? { filterStatus: statusFilter } : undefined);
  };

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            color: 'var(--text-primary)',
          }}
        >
          Your Propositions
        </h1>
        <button
          type="button"
          onClick={() => navigate('/new')}
          style={{
            background: 'var(--accent)',
            color: '#0f0f0f',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '48px',
            transition: 'opacity var(--transition)',
          }}
        >
          + New Proposition
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar
        statusFilter={statusFilter}
        sortOrder={sortOrder}
        onStatusChange={setStatusFilter}
        onSortChange={setSortOrder}
        onExport={handleExport}
      />

      {/* Content */}
      {propositions.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '48px 0' }}>
          No propositions match this filter.
        </p>
      ) : (
        <div>
          {filtered.map((p) => (
            <PropositionCard
              key={p.id}
              proposition={p}
              onDelete={deleteProposition}
            />
          ))}
        </div>
      )}
    </div>
  );
}
