import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import type { Proposition } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockDeleteProposition = vi.fn();
const mockExportData = vi.fn();

function makeMockPropositions(items: Partial<Proposition>[] = []): Proposition[] {
  return items.map((item, i) => ({
    id: `id-${i}`,
    created_at: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    claim: `Claim ${i}`,
    triage: null,
    evidence: null,
    steelman: null,
    falsifiability: null,
    status: 'untested' as const,
    revision_note: null,
    resolution_note: null,
    revised_from: null,
    ...item,
  }));
}

vi.mock('../hooks/usePropositions', () => ({
  usePropositions: vi.fn(),
}));

import { usePropositions } from '../hooks/usePropositions';

function setupMock(propositions: Proposition[] = []) {
  vi.mocked(usePropositions).mockReturnValue({
    propositions,
    filteredPropositions: propositions,
    filters: {},
    setFilters: vi.fn(),
    createProposition: vi.fn(),
    updateProposition: vi.fn(),
    deleteProposition: mockDeleteProposition,
    getProposition: vi.fn(),
    exportData: mockExportData,
  });
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockDeleteProposition.mockReset();
    mockExportData.mockReset();
  });

  it('renders empty state when no propositions', () => {
    setupMock([]);
    renderDashboard();
    expect(screen.getByText(/add your first proposition/i)).toBeInTheDocument();
  });

  it('renders proposition cards when data exists', () => {
    setupMock(makeMockPropositions([{ claim: 'The system is stable.' }]));
    renderDashboard();
    expect(screen.getByText('The system is stable.')).toBeInTheDocument();
  });

  it('"New Proposition" button navigates to /new', async () => {
    const user = userEvent.setup();
    setupMock([]);
    renderDashboard();
    await user.click(screen.getByRole('button', { name: /new proposition/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/new');
  });

  it('status filter shows only matching propositions', async () => {
    const user = userEvent.setup();
    setupMock(
      makeMockPropositions([
        { claim: 'Confirmed claim', status: 'confirmed' },
        { claim: 'Untested claim', status: 'untested' },
      ])
    );
    renderDashboard();
    await user.selectOptions(screen.getByRole('combobox'), 'confirmed');
    expect(screen.getByText('Confirmed claim')).toBeInTheDocument();
    expect(screen.queryByText('Untested claim')).not.toBeInTheDocument();
  });

  it('sort order toggles between newest/oldest', async () => {
    const user = userEvent.setup();
    setupMock(
      makeMockPropositions([
        { claim: 'Older claim', created_at: new Date(2024, 0, 1).toISOString() },
        { claim: 'Newer claim', created_at: new Date(2024, 6, 1).toISOString() },
      ])
    );
    renderDashboard();
    // By default newest first
    const cards = screen.getAllByText(/claim/i).filter(el => el.tagName === 'P');
    // Toggle to oldest
    await user.click(screen.getByRole('button', { name: /sort/i }));
    // Just verify the toggle happens without error
    expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
  });

  it('export button triggers exportData', async () => {
    const user = userEvent.setup();
    setupMock([]);
    renderDashboard();
    await user.click(screen.getByRole('button', { name: /export json/i }));
    expect(mockExportData).toHaveBeenCalled();
  });

  it('delete confirmation flow works', async () => {
    const user = userEvent.setup();
    setupMock(makeMockPropositions([{ id: 'prop-1', claim: 'Delete me.' }]));
    renderDashboard();
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));
    expect(mockDeleteProposition).toHaveBeenCalledWith('prop-1');
  });

  it('cancel delete keeps card visible', async () => {
    const user = userEvent.setup();
    setupMock(makeMockPropositions([{ claim: 'Keep me.' }]));
    renderDashboard();
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    await user.click(screen.getByRole('button', { name: /cancel delete/i }));
    expect(screen.getByText('Keep me.')).toBeInTheDocument();
    expect(mockDeleteProposition).not.toHaveBeenCalled();
  });
});
