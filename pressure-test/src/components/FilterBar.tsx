import type { PropositionStatus } from '../types';
import { STATUS_META } from '../constants';

type StatusFilter = PropositionStatus | 'all';
type SortOrder = 'newest' | 'oldest';

interface FilterBarProps {
  statusFilter: StatusFilter;
  sortOrder: SortOrder;
  onStatusChange: (s: StatusFilter) => void;
  onSortChange: (s: SortOrder) => void;
  onExport: () => void;
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: STATUS_META.confirmed.label },
  { value: 'revised', label: STATUS_META.revised.label },
  { value: 'suspended', label: STATUS_META.suspended.label },
  { value: 'untested', label: STATUS_META.untested.label },
];

export function FilterBar({
  statusFilter,
  sortOrder,
  onStatusChange,
  onSortChange,
  onExport,
}: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}
    >
      <select
        aria-label="Filter by status"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        style={{
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          minHeight: '40px',
        }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        aria-label={`Sort: ${sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}`}
        onClick={() => onSortChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
        style={{
          background: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          minHeight: '40px',
          transition: 'background var(--transition)',
          whiteSpace: 'nowrap',
        }}
      >
        {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
      </button>

      <button
        type="button"
        onClick={onExport}
        style={{
          marginLeft: 'auto',
          background: 'none',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.875rem',
          cursor: 'pointer',
          minHeight: '40px',
          transition: 'color var(--transition)',
          whiteSpace: 'nowrap',
        }}
      >
        Export JSON
      </button>
    </div>
  );
}
