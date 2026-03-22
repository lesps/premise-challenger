import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { OpenQuestions } from './OpenQuestions';
import type { Proposition } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../hooks/usePropositions', () => ({
  usePropositions: vi.fn(),
}));

import { usePropositions } from '../hooks/usePropositions';

function makeProposition(overrides: Partial<Proposition> = {}): Proposition {
  return {
    id: 'prop-1',
    created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    claim: 'The market will recover.',
    triage: 'pressure_test',
    evidence: 'Some evidence.',
    steelman: 'Some counter.',
    falsifiability: 'If X.',
    status: 'suspended',
    revision_note: null,
    resolution_note: null,
    revised_from: null,
    ...overrides,
  };
}

function setupMock(propositions: Proposition[] = []) {
  vi.mocked(usePropositions).mockReturnValue({
    propositions,
    filteredPropositions: propositions,
    filters: {},
    setFilters: vi.fn(),
    createProposition: vi.fn(),
    updateProposition: vi.fn(),
    deleteProposition: vi.fn(),
    getProposition: vi.fn(),
    exportData: vi.fn(),
  });
}

function renderOpenQuestions() {
  return render(
    <MemoryRouter>
      <OpenQuestions />
    </MemoryRouter>
  );
}

describe('OpenQuestions', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('shows only suspended propositions', () => {
    setupMock([
      makeProposition({ id: 'p1', claim: 'Suspended claim', status: 'suspended' }),
      makeProposition({ id: 'p2', claim: 'Confirmed claim', status: 'confirmed' }),
    ]);
    renderOpenQuestions();
    expect(screen.getByText('Suspended claim')).toBeInTheDocument();
    expect(screen.queryByText('Confirmed claim')).not.toBeInTheDocument();
  });

  it('displays claim and relative date for each', () => {
    setupMock([makeProposition({ claim: 'This may shift.' })]);
    renderOpenQuestions();
    expect(screen.getByText('This may shift.')).toBeInTheDocument();
    expect(screen.getByText(/ago/i)).toBeInTheDocument();
  });

  it('shows resolution note when present', () => {
    setupMock([makeProposition({ resolution_note: 'Waiting for Q4 data.' })]);
    renderOpenQuestions();
    expect(screen.getByText('Waiting for Q4 data.')).toBeInTheDocument();
    expect(screen.getByText(/waiting for:/i)).toBeInTheDocument();
  });

  it('does not show resolution note section when absent', () => {
    setupMock([makeProposition({ resolution_note: null })]);
    renderOpenQuestions();
    expect(screen.queryByText(/waiting for:/i)).not.toBeInTheDocument();
  });

  it('tap navigates to outcome review', async () => {
    const user = userEvent.setup();
    setupMock([makeProposition({ id: 'q-1' })]);
    renderOpenQuestions();
    await user.click(screen.getByRole('button', { name: /open question/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/outcome/q-1');
  });

  it('shows empty state when no suspended propositions', () => {
    setupMock([
      makeProposition({ status: 'confirmed' }),
      makeProposition({ status: 'revised' }),
    ]);
    renderOpenQuestions();
    expect(screen.getByText(/no suspended propositions/i)).toBeInTheDocument();
  });

  it('empty state shown when list is completely empty', () => {
    setupMock([]);
    renderOpenQuestions();
    expect(screen.getByText(/no suspended propositions/i)).toBeInTheDocument();
  });
});
