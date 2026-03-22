/**
 * Integration: Full Pressure-Test Flow
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

async function captureClaim(user: ReturnType<typeof userEvent.setup>, claim: string) {
  // Navigate to /new and submit a claim
  const newBtn = screen.getByRole('button', { name: /new proposition/i });
  await user.click(newBtn);

  const input = await screen.findByRole('textbox', { name: /claim/i });
  await user.type(input, claim);
  await user.click(screen.getByRole('button', { name: /save.*continue/i }));

  // Now on triage
  await screen.findByText(/Does this warrant pressure-testing/i);
}

async function startPressureTest(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /yes.*pressure-test/i }));
  await screen.findByText(/How do you actually know this/i);
}

describe('Full Pressure-Test Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('User captures claim → triages as pressure-test → completes all 3 questions → sets status confirmed', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await captureClaim(user, 'The team is aligned on priorities.');
    await startPressureTest(user);

    // Step 1: evidence
    await user.type(
      screen.getByRole('textbox', { name: /How do you actually know this/i }),
      'We reviewed the roadmap together last week.'
    );
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: steelman
    await screen.findByText(/strongest case against/i);
    await user.type(
      screen.getByRole('textbox', { name: /strongest case against/i }),
      'Members could have different interpretations.'
    );
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: falsifiability
    await screen.findByText(/What would change your mind/i);
    await user.type(
      screen.getByRole('textbox', { name: /What would change your mind/i }),
      'If the roadmap priorities shift without team discussion.'
    );
    await user.click(screen.getByRole('button', { name: /finish/i }));

    // On outcome screen
    await screen.findByText(/Review your pressure test/i);

    // Select confirmed
    await user.click(screen.getByRole('button', { name: /^confirmed$/i }));
    await user.click(screen.getByRole('button', { name: /confirm this proposition/i }));

    // Back on dashboard — confirmed status badge
    await screen.findByText(/The team is aligned on priorities/i);
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
  });

  it('Confirmed proposition appears on dashboard with correct status', async () => {
    // Create and confirm a proposition directly in storage
    const p = storage.createProposition('Direct storage claim');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'Some evidence',
      steelman: 'Counter',
      falsifiability: 'What changes my mind',
      status: 'confirmed',
    });

    const user = userEvent.setup();
    renderApp('/');

    expect(await screen.findByText('Direct storage claim')).toBeInTheDocument();
    expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
  });

  it('User can navigate back during pressure test without losing answers', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await captureClaim(user, 'Navigation preserves answers.');
    await startPressureTest(user);

    // Step 1: type evidence
    const evidenceInput = screen.getByRole('textbox', { name: /How do you actually know this/i });
    await user.type(evidenceInput, 'My evidence text here');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2
    await screen.findByText(/strongest case against/i);
    await user.type(
      screen.getByRole('textbox', { name: /strongest case against/i }),
      'Opposing argument here'
    );

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /← back/i }));
    await screen.findByText(/How do you actually know this/i);

    // Evidence should still be there
    expect(screen.getByRole('textbox', { name: /How do you actually know this/i })).toHaveValue(
      'My evidence text here'
    );
  });

  it('User can leave and resume — answers are pre-populated on return', async () => {
    const user = userEvent.setup();

    // Create proposition with partial answers in storage
    const p = storage.createProposition('Resume test proposition.');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'Saved evidence from before',
    });

    // Navigate directly to the pressure test page
    renderApp(`/test/${p.id}`);

    await screen.findByText(/How do you actually know this/i);
    expect(screen.getByRole('textbox', { name: /How do you actually know this/i })).toHaveValue(
      'Saved evidence from before'
    );
  });

  it('Partial completion: leaving after Q1 → returning shows Q1 answer', async () => {
    const p = storage.createProposition('Partial completion test.');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'Only Q1 answered so far',
      steelman: null,
      falsifiability: null,
    });

    const user = userEvent.setup();
    renderApp(`/test/${p.id}`);

    await screen.findByText(/How do you actually know this/i);
    const input = screen.getByRole('textbox', { name: /How do you actually know this/i });
    expect(input).toHaveValue('Only Q1 answered so far');
  });
});
