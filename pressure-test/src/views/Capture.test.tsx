import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Capture } from './Capture';
import type { Proposition } from '../types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCreateProposition = vi.fn();

vi.mock('../hooks/usePropositions', () => ({
  usePropositions: vi.fn(),
}));

import { usePropositions } from '../hooks/usePropositions';

function makeProposition(id = 'new-id'): Proposition {
  return {
    id,
    created_at: new Date().toISOString(),
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
  };
}

function setupMock() {
  mockCreateProposition.mockReturnValue(makeProposition());
  vi.mocked(usePropositions).mockReturnValue({
    propositions: [],
    filteredPropositions: [],
    filters: {},
    setFilters: vi.fn(),
    createProposition: mockCreateProposition,
    updateProposition: vi.fn(),
    deleteProposition: vi.fn(),
    getProposition: vi.fn(),
    exportData: vi.fn(),
  });
}

function renderCapture() {
  return render(
    <MemoryRouter>
      <Capture />
    </MemoryRouter>
  );
}

describe('Capture', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockCreateProposition.mockReset();
    setupMock();
  });

  it('renders input field', () => {
    renderCapture();
    expect(screen.getByRole('textbox', { name: /claim/i })).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderCapture();
    expect(screen.getByRole('button', { name: /save.*continue/i })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    renderCapture();
    expect(screen.getByRole('button', { name: /save.*continue/i })).toBeDisabled();
  });

  it('submit button is disabled when hedge words are present', async () => {
    const user = userEvent.setup();
    renderCapture();
    await user.type(screen.getByRole('textbox'), 'Maybe this will work');
    expect(screen.getByRole('button', { name: /save.*continue/i })).toBeDisabled();
  });

  it('HedgeWarning appears when hedge words detected', async () => {
    const user = userEvent.setup();
    renderCapture();
    await user.type(screen.getByRole('textbox'), 'I think this is true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('HedgeWarning shows specific detected words', async () => {
    const user = userEvent.setup();
    renderCapture();
    await user.type(screen.getByRole('textbox'), 'maybe this will work');
    expect(screen.getByText(/maybe/i)).toBeInTheDocument();
  });

  it('HedgeWarning disappears when hedge words removed', async () => {
    const user = userEvent.setup();
    renderCapture();
    const input = screen.getByRole('textbox');
    await user.type(input, 'Maybe this works');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'This works well');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('successful submit creates proposition and navigates to triage', async () => {
    const user = userEvent.setup();
    mockCreateProposition.mockReturnValue(makeProposition('abc-123'));
    renderCapture();
    await user.type(screen.getByRole('textbox'), 'The deadline is realistic.');
    await user.click(screen.getByRole('button', { name: /save.*continue/i }));
    expect(mockCreateProposition).toHaveBeenCalledWith('The deadline is realistic.');
    expect(mockNavigate).toHaveBeenCalledWith('/triage/abc-123');
  });

  it('back link navigates to dashboard', () => {
    renderCapture();
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/');
  });

  it('whitespace-only input keeps button disabled', async () => {
    const user = userEvent.setup();
    renderCapture();
    await user.type(screen.getByRole('textbox'), '   ');
    expect(screen.getByRole('button', { name: /save.*continue/i })).toBeDisabled();
  });

  it('submit enabled for valid claim', async () => {
    const user = userEvent.setup();
    renderCapture();
    await user.type(screen.getByRole('textbox'), 'This is a direct claim.');
    expect(screen.getByRole('button', { name: /save.*continue/i })).not.toBeDisabled();
  });
});
