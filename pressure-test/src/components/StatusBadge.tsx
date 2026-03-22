import type { PropositionStatus } from '../types';
import { STATUS_META } from '../constants';

interface StatusBadgeProps {
  status: PropositionStatus;
}

const STATUS_COLORS: Record<PropositionStatus, string> = {
  confirmed: 'var(--status-confirmed)',
  revised: 'var(--status-revised)',
  suspended: 'var(--status-suspended)',
  untested: 'var(--status-untested)',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: STATUS_COLORS[status],
        border: `1px solid ${STATUS_COLORS[status]}`,
        borderRadius: '3px',
        padding: '2px 7px',
        lineHeight: 1.5,
      }}
    >
      {STATUS_META[status].label}
    </span>
  );
}
