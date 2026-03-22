import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

function renderFilterBar(overrides = {}) {
  const props = {
    statusFilter: 'all' as const,
    sortOrder: 'newest' as const,
    onStatusChange: vi.fn(),
    onSortChange: vi.fn(),
    onExport: vi.fn(),
    ...overrides,
  };
  return { ...render(<FilterBar {...props} />), props };
}

describe('FilterBar', () => {
  it('renders status filter select', () => {
    renderFilterBar();
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument();
  });

  it('renders sort toggle button', () => {
    renderFilterBar();
    expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
  });

  it('renders export button', () => {
    renderFilterBar();
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
  });

  it('calls onStatusChange when status filter changes', async () => {
    const user = userEvent.setup();
    const { props } = renderFilterBar();
    await user.selectOptions(screen.getByRole('combobox'), 'confirmed');
    expect(props.onStatusChange).toHaveBeenCalledWith('confirmed');
  });

  it('calls onSortChange when sort button clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderFilterBar();
    await user.click(screen.getByRole('button', { name: /sort/i }));
    expect(props.onSortChange).toHaveBeenCalledWith('oldest');
  });

  it('calls onExport when export button clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderFilterBar();
    await user.click(screen.getByRole('button', { name: /export json/i }));
    expect(props.onExport).toHaveBeenCalled();
  });

  it('shows "Oldest" text when sortOrder is oldest', () => {
    renderFilterBar({ sortOrder: 'oldest' });
    expect(screen.getByRole('button', { name: /sort/i })).toHaveTextContent(/oldest/i);
  });
});
