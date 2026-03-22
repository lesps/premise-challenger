/**
 * Integration: Revision Flow
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import * as storage from '../../services/storage';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

function seedPressureTestedProposition(claim: string) {
  const p = storage.createProposition(claim);
  storage.updateProposition(p.id, {
    triage: 'pressure_test',
    evidence: 'Evidence provided',
    steelman: 'Counter argument',
    falsifiability: 'What would change my mind',
  });
  return storage.getProposition(p.id)!;
}

describe('Revision Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('After pressure test, user selects "Revised" → enters new claim → new proposition created', async () => {
    const p = seedPressureTestedProposition('The original claim.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);

    // Select Revised
    await user.click(screen.getByRole('button', { name: /^revised$/i }));

    // Enter revised claim
    const revisionInput = await screen.findByRole('textbox', { name: /revised claim/i });
    await user.type(revisionInput, 'The revised claim is more nuanced.');
    await user.click(screen.getByRole('button', { name: /save revised proposition/i }));

    // Should navigate to triage for the new proposition
    await screen.findByText(/Does this warrant pressure-testing/i);
    expect(screen.getByText('The revised claim is more nuanced.')).toBeInTheDocument();
  });

  it('Original proposition status is "revised" with revision_note', async () => {
    const p = seedPressureTestedProposition('The original proposition.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^revised$/i }));

    const revisionInput = await screen.findByRole('textbox', { name: /revised claim/i });
    await user.type(revisionInput, 'The cleaner version.');
    await user.click(screen.getByRole('button', { name: /save revised proposition/i }));

    // Check original in storage
    const original = storage.getProposition(p.id)!;
    expect(original.status).toBe('revised');
    expect(original.revision_note).toBe('The cleaner version.');
  });

  it('New proposition has revised_from pointing to original ID', async () => {
    const p = seedPressureTestedProposition('Source proposition.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^revised$/i }));

    const revisionInput = await screen.findByRole('textbox', { name: /revised claim/i });
    await user.type(revisionInput, 'Refined version here.');
    await user.click(screen.getByRole('button', { name: /save revised proposition/i }));

    // All propositions: find the new one
    const all = storage.loadPropositions();
    const newP = all.find((x) => x.id !== p.id);
    expect(newP).toBeDefined();
    expect(newP!.revised_from).toBe(p.id);
    expect(newP!.claim).toBe('Refined version here.');
  });

  it('New proposition starts as "untested" at triage stage', async () => {
    const p = seedPressureTestedProposition('Goes through revision.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^revised$/i }));

    const revisionInput = await screen.findByRole('textbox', { name: /revised claim/i });
    await user.type(revisionInput, 'New untested claim.');
    await user.click(screen.getByRole('button', { name: /save revised proposition/i }));

    // Should be on triage (untested) for the new proposition
    await screen.findByText(/Does this warrant pressure-testing/i);

    const all = storage.loadPropositions();
    const newP = all.find((x) => x.id !== p.id);
    expect(newP!.status).toBe('untested');
    expect(newP!.triage).toBeNull();
  });

  it('Dashboard shows both original (revised) and new (untested) propositions', async () => {
    const p = seedPressureTestedProposition('Original to be revised.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^revised$/i }));

    const revisionInput = await screen.findByRole('textbox', { name: /revised claim/i });
    await user.type(revisionInput, 'The revised successor.');
    await user.click(screen.getByRole('button', { name: /save revised proposition/i }));

    // Navigate to triage then back to dashboard
    await screen.findByText(/Does this warrant pressure-testing/i);
    await user.click(screen.getByRole('link', { name: /back/i }));

    await screen.findByText(/Your Propositions/i);
    expect(screen.getByText(/Original to be revised/i)).toBeInTheDocument();
    expect(screen.getByText(/The revised successor/i)).toBeInTheDocument();
    // Revised status badge (multiple "Revised" matches include filter option + badge)
    expect(screen.getAllByText('Revised').length).toBeGreaterThan(0);
  });

  it('Outcome review of original shows link to revised version', async () => {
    const p = seedPressureTestedProposition('Will be revised.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^revised$/i }));

    const revisionInput = await screen.findByRole('textbox', { name: /revised claim/i });
    await user.type(revisionInput, 'Revision text shown in original.');
    await user.click(screen.getByRole('button', { name: /save revised proposition/i }));

    // Navigate back to original outcome
    await screen.findByText(/Does this warrant pressure-testing/i);
    await user.click(screen.getByRole('link', { name: /back/i }));
    await screen.findByText('Will be revised.');
    await user.click(screen.getByText('Will be revised.'));

    // Outcome view of original — shows revision note
    await screen.findByText('Will be revised.');
    expect(screen.getByText(/Revised as/i)).toBeInTheDocument();
    expect(screen.getByText('Revision text shown in original.')).toBeInTheDocument();
  });
});
