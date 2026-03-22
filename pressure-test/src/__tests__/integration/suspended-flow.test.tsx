/**
 * Integration: Suspended Flow
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

describe('Suspended Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('After pressure test, user selects "Suspended" with resolution note', async () => {
    const p = seedPressureTestedProposition('Needs more data.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^suspended$/i }));

    const noteInput = await screen.findByRole('textbox', { name: /resolution note/i });
    await user.type(noteInput, 'Waiting for Q4 data release.');
    await user.click(screen.getByRole('button', { name: /suspend this proposition/i }));

    // Back on dashboard — suspended badge shows
    await screen.findByText('Needs more data.');
    expect(screen.getAllByText('Suspended').length).toBeGreaterThan(0);

    // Resolution note persisted
    const updated = storage.getProposition(p.id)!;
    expect(updated.status).toBe('suspended');
    expect(updated.resolution_note).toBe('Waiting for Q4 data release.');
  });

  it('Proposition appears in Open Questions view with resolution note', async () => {
    const p = seedPressureTestedProposition('Open question claim.');
    storage.updateProposition(p.id, {
      status: 'suspended',
      resolution_note: 'When the research is published.',
    });

    const user = userEvent.setup();
    renderApp('/open-questions');

    await screen.findByText('Open question claim.');
    expect(screen.getByText('When the research is published.')).toBeInTheDocument();
  });

  it('"Suspended" without resolution note also works (note is optional)', async () => {
    const p = seedPressureTestedProposition('No note needed.');

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText(/Review your pressure test/i);
    await user.click(screen.getByRole('button', { name: /^suspended$/i }));

    // Don't type a note — just click suspend
    await screen.findByRole('button', { name: /suspend this proposition/i });
    await user.click(screen.getByRole('button', { name: /suspend this proposition/i }));

    // Back on dashboard
    await screen.findByText('No note needed.');
    expect(screen.getAllByText('Suspended').length).toBeGreaterThan(0);

    const updated = storage.getProposition(p.id)!;
    expect(updated.resolution_note).toBeNull();
  });

  it('Tapping suspended proposition in Open Questions navigates to outcome review', async () => {
    const p = storage.createProposition('Click me in Open Questions.');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'e',
      steelman: 's',
      falsifiability: 'f',
      status: 'suspended',
    });

    const user = userEvent.setup();
    renderApp('/open-questions');

    await user.click(await screen.findByText('Click me in Open Questions.'));

    // Should now be on outcome/review
    await screen.findByText('Click me in Open Questions.');
    expect(screen.getByText('Re-evaluate this proposition')).toBeInTheDocument();
  });

  it('Re-evaluating a suspended proposition resets it and redirects to triage', async () => {
    const p = storage.createProposition('Re-evaluate me.');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'old evidence',
      steelman: 'old steelman',
      falsifiability: 'old falsifiability',
      status: 'suspended',
      resolution_note: 'Old note',
    });

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText('Re-evaluate me.');
    await user.click(screen.getByRole('button', { name: /re-evaluate/i }));

    // Should be on triage
    await screen.findByText(/Does this warrant pressure-testing/i);

    // Proposition reset
    const updated = storage.getProposition(p.id)!;
    expect(updated.status).toBe('untested');
    expect(updated.triage).toBeNull();
    expect(updated.evidence).toBeNull();
    expect(updated.steelman).toBeNull();
    expect(updated.falsifiability).toBeNull();
  });
});
