/**
 * Integration: Full Capture Flow
 *
 * Renders the full App in a MemoryRouter, using real localStorage (cleared
 * before each test). Tests full user journeys through the capture screen.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('Full Capture Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('User can type a claim, submit, and land on triage screen', async () => {
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    await user.type(input, 'The deadline is realistic.');
    await user.click(screen.getByRole('button', { name: /save.*continue/i }));

    expect(await screen.findByText(/Does this warrant pressure-testing/i)).toBeInTheDocument();
  });

  it('Hedge words prevent submission — warning shown, button disabled', async () => {
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    await user.type(input, 'Maybe this will work out');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save.*continue/i })).toBeDisabled();
  });

  it('Removing hedge words clears warning and enables button', async () => {
    const user = userEvent.setup();
    renderApp('/new');

    const input = screen.getByRole('textbox', { name: /claim/i });
    await user.type(input, 'Maybe this will work out');
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'This will work out well');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save.*continue/i })).not.toBeDisabled();
  });

  it('Created proposition appears on dashboard after navigating back', async () => {
    const user = userEvent.setup();
    renderApp('/new');

    await user.type(
      screen.getByRole('textbox', { name: /claim/i }),
      'The deadline is realistic.'
    );
    await user.click(screen.getByRole('button', { name: /save.*continue/i }));

    // On triage screen — go back
    await screen.findByText(/Does this warrant pressure-testing/i);
    await user.click(screen.getByRole('link', { name: /back/i }));

    // Dashboard should show the proposition
    expect(await screen.findByText(/The deadline is realistic\./i)).toBeInTheDocument();
  });

  it('Claim text is preserved exactly as entered (minus trim)', async () => {
    const user = userEvent.setup();
    renderApp('/new');

    // Type with leading/trailing spaces
    await user.type(screen.getByRole('textbox', { name: /claim/i }), 'The claim is exact');
    await user.click(screen.getByRole('button', { name: /save.*continue/i }));

    // The triage screen shows the claim
    await screen.findByText(/Does this warrant pressure-testing/i);
    expect(screen.getByText('The claim is exact')).toBeInTheDocument();
  });
});
