import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Triage } from './Triage';
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
    claim: 'The system is production-ready.',
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

function setupMock(proposition: Proposition | null = makeProposition()) {
  mockGetProposition.mockReturnValue(proposition);
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

function renderTriage(id = 'prop-1') {
  return render(
    <MemoryRouter initialEntries={[`/triage/${id}`]}>
      <Routes>
        <Route path="/triage/:id" element={<Triage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Triage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetProposition.mockReset();
    mockUpdateProposition.mockReset();
  });

  it('displays the proposition claim', () => {
    setupMock();
    renderTriage();
    expect(screen.getByText('The system is production-ready.')).toBeInTheDocument();
  });

  it('"Pressure-test" button updates triage and navigates to /test/:id', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTriage();
    await user.click(screen.getByRole('button', { name: /pressure-test this/i }));
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', { triage: 'pressure_test' });
    expect(mockNavigate).toHaveBeenCalledWith('/test/prop-1');
  });

  it('"Act on it" button sets status confirmed and navigates home', async () => {
    const user = userEvent.setup();
    setupMock();
    renderTriage();
    await user.click(screen.getByRole('button', { name: /act on it/i }));
    expect(mockUpdateProposition).toHaveBeenCalledWith('prop-1', {
      triage: 'confirmed_intuition',
      status: 'confirmed',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to dashboard if proposition not found', () => {
    setupMock(null);
    renderTriage('nonexistent');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
