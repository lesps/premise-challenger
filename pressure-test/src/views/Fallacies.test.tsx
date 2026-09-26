import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Fallacies } from './Fallacies';
import { FALLACIES } from '../data/fallacies';

function renderFallacies() {
  return render(
    <MemoryRouter>
      <Fallacies />
    </MemoryRouter>
  );
}

describe('Fallacies', () => {
  it('lists every fallacy by default', () => {
    renderFallacies();
    expect(screen.getAllByRole('article')).toHaveLength(FALLACIES.length);
    expect(screen.getByRole('heading', { name: 'Straw Man' })).toBeInTheDocument();
  });

  it('links to the quiz', () => {
    renderFallacies();
    expect(screen.getByRole('link', { name: /take the quiz/i })).toHaveAttribute('href', '/fallacies/quiz');
  });

  it('hides examples until expanded', async () => {
    const user = userEvent.setup();
    renderFallacies();
    const card = screen.getByRole('heading', { name: 'Straw Man' }).closest('article') as HTMLElement;
    const toggle = within(card).getByRole('button', { name: /show example/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(card).queryByText(/why it fails/i)).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(card).getByText(/why it fails/i)).toBeInTheDocument();
    expect(within(card).getByText(/bubble wrap/i)).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    renderFallacies();
    await user.click(screen.getByRole('button', { name: 'Formal' }));
    expect(screen.getByRole('button', { name: 'Formal' })).toHaveAttribute('aria-pressed', 'true');
    const expected = FALLACIES.filter((f) => f.category === 'formal').length;
    expect(screen.getAllByRole('article')).toHaveLength(expected);
    expect(screen.queryByRole('heading', { name: 'Straw Man' })).not.toBeInTheDocument();
  });

  it('filters by search text', async () => {
    const user = userEvent.setup();
    renderFallacies();
    await user.type(screen.getByRole('searchbox', { name: /search fallacies/i }), 'whataboutism');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Tu Quoque' })).toBeInTheDocument();
  });

  it('shows an empty message when nothing matches', async () => {
    const user = userEvent.setup();
    renderFallacies();
    await user.type(screen.getByRole('searchbox', { name: /search fallacies/i }), 'zzzzqqq');
    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/no fallacies match/i)).toBeInTheDocument();
  });
});
