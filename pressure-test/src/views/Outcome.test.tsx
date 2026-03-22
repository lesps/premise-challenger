import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Outcome } from './Outcome';
import type { Proposition } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockGetProposition = vi.fn();
const mockUpdateProposition = vi.fn();
const mockCreateProposition = vi.fn();
const mockDeleteProposition = vi.fn();

vi.mock('../hooks/usePropositions', () => ({
  usePropositions: vi.fn(),
}));

import { usePropositions } from '../hooks/usePropositions';

function makeProposition(overrides: Partial<Proposition> = {}): Proposition {
  return {
    id: 'prop-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    claim: 'The rollout will succeed.',
    triage: 'pressure_test',
    evidence: 'We ran 5 pilots successfully.',
    steelman: 'Three pilots failed at scale.',
    falsifiability: 'If adoption < 40%, I am wrong.',
    status: 'untested',
    revision_note: null,
    resolution_note: null,
    revised_from: null,
    ...overrides,
  };
}

function setupMock(proposition: Proposition | null = makeProposition()) {
  mockGetProposition.mockReturnValue(proposition);
  const created = proposition ? { ...proposition, id: 'new-id' } : null;
  mockCreateProposition.mockReturnValue(created ?? makeProposition({ id: 'new-id' }));
  mockUpdateProposition.mockReturnValue(proposition ?? makeProposition());
  vi.mocked(usePropositions).mockReturnValue({
    propositions: proposition ? [proposition] : [],
    filteredPropositions: proposition ? [proposition] : [],
    filters: {},
    setFilters: vi.fn(),
    createProposition: mockCreateProposition,
    updateProposition: mockUpdateProposition,
    deleteProposition: mockDeleteProposition,
    getProposition: mockGetProposition,
    exportData: vi.fn(),
  });
}

function renderOutcome(id = 'prop-1') {
  return render(
    <MemoryRouter initialEntries={[`/outcome/${id}`]}>
      <Routes>
        <Route path="/outcome/:id" element={<Outcome />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Outcome — decision mode', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetProposition.mockReset();
    mockUpdateProposition.mockReset();
    mockCreateProposition.mockReset();
    mockDeleteProposition.mockReset();
  });

  it('shows summary of all three answers', () => {
    setupMock();
    renderOutcome();
    expect(screen.getByText('We ran 5 pilots successfully.')).toBeInTheDocument();
    expect(screen.getByText('Three pilots failed at scale.')).toBeInTheDocument();
    expect(screen.getByText('If adoption < 40%, I am wrong.')).toBeInTheDocument();
  });

  it('three status buttons are visible', () => {
    setupMock();
    renderOutcome();
    expect(screen.getByRole('button', { name: /confirmed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revised/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suspended/i })).toBeInTheDocument();
  });

  it('confirmed: sets status and navigates home', async () => {
    const user = userEvent.setup();
    setupMock();
    renderOutcome();
    await user.click(screen.getByRole('button', { name: /^confirmed/i }));
    await user.click(screen.getByRole('button', { name: /confirm this proposition/i }));
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', { status: 'confirmed' });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('revised: shows restatement field and creates new proposition', async () => {
    const user = userEvent.setup();
    setupMock();
    renderOutcome();
    await user.click(screen.getByRole('button', { name: /^revised/i }));
    const textarea = screen.getByRole('textbox', { name: /revised claim/i });
    await user.type(textarea, 'The rollout will succeed with phased approach.');
    await user.click(screen.getByRole('button', { name: /save revised/i }));
    expect(mockCreateProposition).toHaveBeenCalledWith('The rollout will succeed with phased approach.');
    expect(mockUpdateProposition).toHaveBeenCalledWith('new-id', { revised_from: 'prop-1' });
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', {
      status: 'revised',
      revision_note: 'The rollout will succeed with phased approach.',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/triage/new-id');
  });

  it('suspended: shows optional note field and saves status', async () => {
    const user = userEvent.setup();
    setupMock();
    renderOutcome();
    await user.click(screen.getByRole('button', { name: /^suspended/i }));
    const textarea = screen.getByRole('textbox', { name: /resolution note/i });
    await user.type(textarea, 'Waiting for Q4 data.');
    await user.click(screen.getByRole('button', { name: /suspend this/i }));
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', {
      status: 'suspended',
      resolution_note: 'Waiting for Q4 data.',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects if proposition not found', () => {
    setupMock(null);
    renderOutcome('nonexistent');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});

describe('Outcome — review mode', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetProposition.mockReset();
    mockUpdateProposition.mockReset();
    mockDeleteProposition.mockReset();
  });

  it('shows status badge in review mode', () => {
    setupMock(makeProposition({ status: 'confirmed' }));
    renderOutcome();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('revised proposition shows revision note', () => {
    setupMock(
      makeProposition({
        status: 'revised',
        revision_note: 'The phased rollout will succeed.',
      })
    );
    renderOutcome();
    expect(screen.getByText('The phased rollout will succeed.')).toBeInTheDocument();
  });

  it('suspended shows resolution note when present', () => {
    setupMock(
      makeProposition({
        status: 'suspended',
        resolution_note: 'Waiting for Q4 data.',
      })
    );
    renderOutcome();
    expect(screen.getByText('Waiting for Q4 data.')).toBeInTheDocument();
  });

  it('re-evaluate resets proposition and navigates to triage', async () => {
    const user = userEvent.setup();
    setupMock(makeProposition({ status: 'confirmed' }));
    renderOutcome();
    await user.click(screen.getByRole('button', { name: /re-evaluate/i }));
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', {
      status: 'untested',
      triage: null,
      evidence: null,
      steelman: null,
      falsifiability: null,
    });
    expect(mockNavigate).toHaveBeenCalledWith('/triage/prop-1');
  });

  it('delete with confirmation works', async () => {
    const user = userEvent.setup();
    setupMock(makeProposition({ status: 'confirmed' }));
    renderOutcome();
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(mockDeleteProposition).toHaveBeenCalledWith('prop-1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
