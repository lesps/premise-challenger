/**
 * Integration: Delete Flow
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

describe('Delete Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Deleting from dashboard removes proposition from list', async () => {
    storage.createProposition('Delete from dashboard.');

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText('Delete from dashboard.');

    // Click delete icon
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    // Confirm
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Delete from dashboard.')).not.toBeInTheDocument();
    });
    expect(storage.loadPropositions()).toHaveLength(0);
  });

  it('Delete requires confirmation — cancel preserves the proposition', async () => {
    storage.createProposition('Should survive cancel.');

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText('Should survive cancel.');

    // Click delete icon
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    // Cancel
    await user.click(screen.getByRole('button', { name: /cancel delete/i }));

    // Proposition still there
    expect(screen.getByText('Should survive cancel.')).toBeInTheDocument();
    expect(storage.loadPropositions()).toHaveLength(1);
  });

  it('Deleting a proposition that has revisions does NOT cascade-delete the revision', async () => {
    const original = storage.createProposition('Original to delete.');
    storage.updateProposition(original.id, {
      status: 'revised',
      revision_note: 'The revision',
    });
    const revision = storage.createProposition('The revision.');
    storage.updateProposition(revision.id, { revised_from: original.id });

    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText('Original to delete.');

    // Delete the original (the one with "Revised" status)
    // Find the right card — find by the claim text and its delete button
    const cards = screen.getAllByRole('button', { name: /delete proposition/i });
    // Click first delete button (original proposition card)
    await user.click(cards[0]);
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));

    // The revision should still exist
    await waitFor(() => {
      expect(screen.getByText('The revision.')).toBeInTheDocument();
    });
    expect(storage.loadPropositions()).toHaveLength(1);
    expect(storage.loadPropositions()[0].claim).toBe('The revision.');
  });

  it('Deleting from outcome review navigates back to dashboard', async () => {
    const p = storage.createProposition('Delete from outcome.');
    storage.updateProposition(p.id, {
      triage: 'pressure_test',
      evidence: 'e',
      steelman: 's',
      falsifiability: 'f',
      status: 'confirmed',
    });

    const user = userEvent.setup();
    renderApp(`/outcome/${p.id}`);

    await screen.findByText('Delete from outcome.');

    // Click delete in outcome review mode
    await user.click(screen.getByRole('button', { name: /delete proposition/i }));
    await user.click(screen.getByRole('button', { name: /confirm delete/i }));

    // Should be back on dashboard
    await screen.findByText(/Your Propositions/i);
    expect(screen.queryByText('Delete from outcome.')).not.toBeInTheDocument();
  });
});
