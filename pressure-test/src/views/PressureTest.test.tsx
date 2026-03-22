import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PressureTest } from './PressureTest';
import type { Proposition } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockGetProposition = vi.fn();
const mockUpdateProposition = vi.fn();

vi.mock('../hooks/usePropositions', () => ({
  usePropositions: vi.fn(),
}));

import { usePropositions } from '../hooks/usePropositions';

function makeProposition(overrides: Partial<Proposition> = {}): Proposition {
  return {
    id: 'prop-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    claim: 'This architecture will scale.',
    triage: 'pressure_test',
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

function setupMock(proposition: Proposition | null = makeProposition()) {
  mockGetProposition.mockReturnValue(proposition);
  mockUpdateProposition.mockReturnValue(proposition ?? makeProposition());
  vi.mocked(usePropositions).mockReturnValue({
    propositions: proposition ? [proposition] : [],
    filteredPropositions: proposition ? [proposition] : [],
    filters: {},
    setFilters: vi.fn(),
    createProposition: vi.fn(),
    updateProposition: mockUpdateProposition,
    deleteProposition: vi.fn(),
    getProposition: mockGetProposition,
    exportData: vi.fn(),
  });
}

function renderTest(id = 'prop-1') {
  return render(
    <MemoryRouter initialEntries={[`/test/${id}`]}>
      <Routes>
        <Route path="/test/:id" element={<PressureTest />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PressureTest', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetProposition.mockReset();
    mockUpdateProposition.mockReset();
  });

  it('renders step 1 by default', () => {
    setupMock();
    renderTest();
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByText(/how do you actually know this/i)).toBeInTheDocument();
  });

  it('shows proposition claim as reference', () => {
    setupMock();
    renderTest();
    expect(screen.getByText('This architecture will scale.')).toBeInTheDocument();
  });

  it('progress indicator shows "Question 1 of 3"', () => {
    setupMock();
    renderTest();
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
  });

  it('"Next" is disabled when textarea is empty', () => {
    setupMock();
    renderTest();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('"Next" saves response and advances to step 2', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTest();
    await user.type(screen.getByRole('textbox'), 'We measured throughput at 10k rps.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', {
      evidence: 'We measured throughput at 10k rps.',
    });
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
  });

  it('"Back" on step 2 returns to step 1 with response preserved', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTest();
    await user.type(screen.getByRole('textbox'), 'Some evidence.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /← back/i }));
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Some evidence.');
  });

  it('helper prompt toggles open/closed', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTest();
    const helperBtn = screen.getByRole('button', { name: /need a prompt/i });
    await user.click(helperBtn);
    expect(screen.getByText(/what did you actually see/i)).toBeInTheDocument();
    await user.click(helperBtn);
    expect(screen.queryByText(/what did you actually see/i)).not.toBeInTheDocument();
  });

  it('step 3 shows "Finish" instead of "Next"', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTest();
    // step 1
    await user.type(screen.getByRole('textbox'), 'Evidence here.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    // step 2
    await user.type(screen.getByRole('textbox'), 'Steelman here.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    // step 3
    expect(screen.queryByRole('button', { name: /^next/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument();
  });

  it('"Finish" saves and navigates to outcome', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTest();
    await user.type(screen.getByRole('textbox'), 'Evidence here.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByRole('textbox'), 'Steelman here.');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByRole('textbox'), 'If X happens, I would revise.');
    await user.click(screen.getByRole('button', { name: /finish/i }));
    expect(mockUpdateProposition).toHaveBeenLastCalledWith('prop-1', {
      falsifiability: 'If X happens, I would revise.',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/outcome/prop-1');
  });

  it('pre-populates textareas when resuming', () => {
    setupMock(
      makeProposition({
        evidence: 'Pre-existing evidence.',
        steelman: 'Pre-existing steelman.',
        falsifiability: null,
      })
    );
    renderTest();
    expect(screen.getByRole('textbox')).toHaveValue('Pre-existing evidence.');
  });

  it('redirects if proposition not found', () => {
    setupMock(null);
    renderTest('nonexistent');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
