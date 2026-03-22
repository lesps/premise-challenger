/**
 * Integration: Triage Skip Flow (act on it)
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

describe('Triage Skip Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('User captures claim → triages as "act on it" → proposition marked confirmed (intuition)', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getByRole('button', { name: /new proposition/i }));
    await user.type(
      await screen.findByRole('textbox', { name: /claim/i }),
      'This decision is the right call.'
    );
    await user.click(screen.getByRole('button', { name: /save.*continue/i }));

    // On triage — choose "No, act on it"
    await screen.findByText(/Does this warrant pressure-testing/i);
    await user.click(screen.getByRole('button', { name: /no.*act on it/i }));

    // Back on dashboard — status badge shows confirmed
    await screen.findByText(/This decision is the right call/i);
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);

    // Verify triage field in storage
    const propositions = storage.loadPropositions();
    expect(propositions[0].triage).toBe('confirmed_intuition');
    expect(propositions[0].status).toBe('confirmed');
  });

  it('Proposition shows on dashboard as Confirmed, NOT in Open Questions', async () => {
    // Seed a confirmed-intuition proposition
    const p = storage.createProposition('A sure thing.');
    storage.updateProposition(p.id, {
      triage: 'confirmed_intuition',
      status: 'confirmed',
    });

    const user = userEvent.setup();
    renderApp('/');

    // On dashboard, shows as confirmed — badge appears (may be multiple matches with filter dropdown)
    await screen.findByText('A sure thing.');
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);

    // Open Questions should not show this (click first nav link matching "Open Questions")
    await user.click(screen.getAllByRole('link', { name: /open questions/i })[0]);
    await screen.findByText(/Propositions waiting for more data/i);
    expect(screen.queryByText('A sure thing.')).not.toBeInTheDocument();
  });

  it('Reviewing a confirmed-intuition proposition shows summary without pressure test answers', async () => {
    const p = storage.createProposition('Intuition was right.');
    storage.updateProposition(p.id, {
      triage: 'confirmed_intuition',
      status: 'confirmed',
    });

    const user = userEvent.setup();
    renderApp('/');

    // Click on the proposition card to view outcome
    await user.click(await screen.findByText('Intuition was right.'));

    // Outcome/review screen — no pressure test answers shown
    await screen.findByText('Intuition was right.');
    expect(screen.queryByText(/Evidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Counter-argument/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Falsifiability/i)).not.toBeInTheDocument();
  });
});
