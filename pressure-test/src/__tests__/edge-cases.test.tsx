/**
 * Edge Case Tests
 *
 * Covers storage edge cases, URL edge cases, and input edge cases.
 * Some tests mock localStorage behavior directly.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import * as storage from '../services/storage';
import { STORAGE_KEY } from '../constants';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('Storage Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('App loads cleanly when localStorage is empty', async () => {
    renderApp('/');
    // Should render dashboard with empty state
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
  });

  it('App loads cleanly when localStorage has corrupted JSON', async () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{{');
    renderApp('/');
    // Should still render dashboard (falls back to empty array)
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
    // No error boundary or crash
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('App loads cleanly when localStorage has valid JSON but wrong shape', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));
    renderApp('/');
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
  });

  it('Quota exceeded error is caught and a warning is surfaced', async () => {
    storage.createProposition('Some existing proposition');

    // Mock setItem to throw QuotaExceededError only for the actual data key,
    // NOT for the storage availability test key ('__storage_test__')
    const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEY) {
        throw quotaError;
      }
      // Allow the storage availability test to succeed
    });

    const user = userEvent.setup();
    renderApp('/new');

    await user.type(screen.getByRole('textbox', { name: /claim/i }), 'Triggers quota error.');
    await user.click(screen.getByRole('button', { name: /save.*continue/i }));

    // Warning banner should appear
    expect(await screen.findByText(/storage full/i)).toBeInTheDocument();
  });

  it('localStorage unavailable → isLocalStorageAvailable returns false', async () => {
    // Simulate a browser that blocks localStorage (e.g. private mode with blocked storage)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    // isLocalStorageAvailable should detect this and return false
    const { isLocalStorageAvailable } = await import('../utils/storageCheck');
    const available = isLocalStorageAvailable();
    expect(available).toBe(false);
  });
});

describe('URL Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('/triage/nonexistent-id redirects to /', async () => {
    renderApp('/triage/nonexistent-id-xyz');
    // Should redirect to dashboard
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
  });

  it('/test/nonexistent-id redirects to /', async () => {
    renderApp('/test/nonexistent-id-xyz');
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
  });

  it('/outcome/nonexistent-id redirects to /', async () => {
    renderApp('/outcome/nonexistent-id-xyz');
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
  });

  it('Unknown routes redirect to /', async () => {
    renderApp('/this-route-does-not-exist');
    expect(await screen.findByText(/Your Propositions/i)).toBeInTheDocument();
  });
});

describe('Input Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1000-character claim stores and displays correctly', async () => {
    const longClaim = 'A'.repeat(998) + ' B'; // 1000 chars, valid
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    // Use paste for large text input
    await user.click(input);
    await user.paste(longClaim);

    await user.click(screen.getByRole('button', { name: /save.*continue/i }));

    // Should navigate to triage
    await screen.findByText(/Does this warrant pressure-testing/i);

    const props = storage.loadPropositions();
    expect(props[0].claim).toBe(longClaim.trim());
    expect(props[0].claim.length).toBeGreaterThanOrEqual(1000);
  });

  it('Emoji in claim text round-trips through storage', async () => {
    const emojiClaim = 'The plan will succeed 🚀 and deliver results 💡';
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    await user.click(input);
    await user.paste(emojiClaim);

    await user.click(screen.getByRole('button', { name: /save.*continue/i }));
    await screen.findByText(/Does this warrant pressure-testing/i);

    const props = storage.loadPropositions();
    expect(props[0].claim).toBe(emojiClaim);
  });

  it('Double-click on submit creates only one proposition', async () => {
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    await user.type(input, 'Only create one of me.');

    const submitBtn = screen.getByRole('button', { name: /save.*continue/i });
    // Two rapid clicks
    await user.dblClick(submitBtn);

    // Navigate to triage to ensure we're done
    await screen.findByText(/Does this warrant pressure-testing/i);

    expect(storage.loadPropositions()).toHaveLength(1);
  });

  it('Unicode (non-emoji) in claim text works correctly', async () => {
    const unicodeClaim = 'Die Theorie ist korrekt: ∀x ∈ ℝ, x² ≥ 0';
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    await user.click(input);
    await user.paste(unicodeClaim);

    await user.click(screen.getByRole('button', { name: /save.*continue/i }));
    await screen.findByText(/Does this warrant pressure-testing/i);

    const props = storage.loadPropositions();
    expect(props[0].claim).toBe(unicodeClaim);
  });
});
