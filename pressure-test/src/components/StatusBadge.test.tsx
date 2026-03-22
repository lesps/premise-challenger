import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders confirmed status label', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders revised status label', () => {
    render(<StatusBadge status="revised" />);
    expect(screen.getByText('Revised')).toBeInTheDocument();
  });

  it('renders suspended status label', () => {
    render(<StatusBadge status="suspended" />);
    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  it('renders untested status label', () => {
    render(<StatusBadge status="untested" />);
    expect(screen.getByText('Untested')).toBeInTheDocument();
  });

  it('applies correct color for confirmed status', () => {
    const { container } = render(<StatusBadge status="confirmed" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.color).toBe('var(--status-confirmed)');
  });

  it('applies correct color for suspended status', () => {
    const { container } = render(<StatusBadge status="suspended" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.color).toBe('var(--status-suspended)');
  });
});
