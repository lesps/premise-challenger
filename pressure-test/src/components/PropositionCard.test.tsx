import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PropositionCard } from './PropositionCard';
import type { Proposition } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeProposition(overrides: Partial<Proposition> = {}): Proposition {
  return {
    id: 'test-id',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    claim: 'The deadline is realistic.',
    triage: null,
    evidence: null,
    steelman: null,
    falsifiability: null,
    status: 'untested',
    revision_note: null,
    resolution_note: null,
    revised_from: null,
    ...overrides,
  };
}

function renderCard(proposition: Proposition, onDelete = vi.fn()) {
  return render(
    <MemoryRouter>
      <PropositionCard proposition={proposition} onDelete={onDelete} />
    </MemoryRouter>
  );
}

describe('PropositionCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders the proposition claim', () => {
    renderCard(makeProposition({ claim: 'This market will grow.' }));
    expect(screen.getByText('This market will grow.')).toBeInTheDocument();
  });

  it('truncates long claims at 120 chars', () => {
    const longClaim = 'A'.repeat(150);
    renderCard(makeProposition({ claim: longClaim }));
    expect(screen.getByText('A'.repeat(120) + '…')).toBeInTheDocument();
  });

  it('renders StatusBadge', () => {
    renderCard(makeProposition({ status: 'confirmed' }));
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders relative date', () => {
    renderCard(makeProposition());
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('navigates to /triage/:id when untested and no triage', async () => {
    const user = userEvent.setup();
    const p = makeProposition({ status: 'untested', triage: null });
    renderCard(p);
    await user.click(screen.getByRole('button', { name: /proposition: the deadline/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/triage/test-id');
  });

  it('navigates to /test/:id when untested and triage=pressure_test', async () => {
    const user = userEvent.setup();
    const p = makeProposition({ status: 'untested', triage: 'pressure_test' });
    renderCard(p);
    await user.click(screen.getByRole('button', { name: /proposition: the deadline/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/test/test-id');
  });

  it('navigates to /outcome/:id for confirmed proposition', async () => {
    const user = userEvent.setup();
    const p = makeProposition({ status: 'confirmed', triage: 'pressure_test' });
    renderCard(p);
    await user.click(screen.getByRole('button', { name: /proposition: the deadline/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/outcome/test-id');
  });

  it('shows delete button', () => {
    renderCard(makeProposition());
    expect(screen.getByRole('button', { name: /delete proposition/i })).toBeInTheDocument();
  });

  it('shows confirmation on delete click', async () => {
    const user = userEvent.setup();
    renderCard(makeProposition());
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel delete/i })).toBeInTheDocument();
  });

  it('calls onDelete with id on confirm', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderCard(makeProposition(), onDelete);
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(onDelete).toHaveBeenCalledWith('test-id');
  });

  it('cancels delete confirmation on cancel click', async () => {
    const user = userEvent.setup();
    renderCard(makeProposition());
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    await user.click(screen.getByRole('button', { name: /cancel delete/i }));
    expect(screen.queryByRole('button', { name: /confirm delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete proposition/i })).toBeInTheDocument();
  });
});
