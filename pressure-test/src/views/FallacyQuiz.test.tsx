import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FallacyQuiz, QUIZ_LENGTH } from './FallacyQuiz';
import type { QuizQuestion } from '../types';

vi.mock('../utils/quiz', async () => {
  const actual = await vi.importActual<typeof import('../utils/quiz')>('../utils/quiz');
  return { ...actual, buildQuiz: vi.fn() };
});

import { buildQuiz } from '../utils/quiz';

const QUIZ: QuizQuestion[] = [
  { scenario: 'Scenario one', answerId: 'straw-man', optionIds: ['straw-man', 'red-herring', 'post-hoc', 'sunk-cost'] },
  { scenario: 'Scenario two', answerId: 'post-hoc', optionIds: ['ad-hominem', 'post-hoc', 'straw-man', 'division'] },
];

function renderQuiz() {
  return render(
    <MemoryRouter>
      <FallacyQuiz />
    </MemoryRouter>
  );
}

describe('FallacyQuiz', () => {
  beforeEach(() => {
    vi.mocked(buildQuiz).mockReset();
    vi.mocked(buildQuiz).mockReturnValue(QUIZ);
  });

  it('builds a quiz of QUIZ_LENGTH from the fallacy library', () => {
    renderQuiz();
    expect(buildQuiz).toHaveBeenCalledWith(expect.any(Array), { count: QUIZ_LENGTH });
  });

  it('shows the first scenario, progress, and options', () => {
    renderQuiz();
    expect(screen.getByText('Scenario one')).toBeInTheDocument();
    expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Straw Man' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Red Herring' })).toBeInTheDocument();
  });

  it('marks a correct answer and explains it', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole('button', { name: 'Straw Man' }));
    expect(screen.getByText(/^correct/i)).toBeInTheDocument();
    expect(screen.getByText(/misrepresenting an opponent/i)).toBeInTheDocument();
  });

  it('marks a wrong answer and reveals the right one', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole('button', { name: 'Red Herring' }));
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/straw man/i);
  });

  it('locks options after answering', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole('button', { name: 'Red Herring' }));
    expect(screen.getByRole('button', { name: 'Straw Man' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Post Hoc' })).toBeDisabled();
  });

  it('hides the next button until an answer is chosen', async () => {
    const user = userEvent.setup();
    renderQuiz();
    expect(screen.queryByRole('button', { name: /next question/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Straw Man' }));
    await user.click(screen.getByRole('button', { name: /next question/i }));
    expect(screen.getByText('Scenario two')).toBeInTheDocument();
    expect(screen.getByText(/question 2 of 2/i)).toBeInTheDocument();
  });

  it('shows the score and missed questions at the end', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole('button', { name: 'Straw Man' }));
    await user.click(screen.getByRole('button', { name: /next question/i }));
    await user.click(screen.getByRole('button', { name: 'Division' }));
    await user.click(screen.getByRole('button', { name: /see results/i }));

    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Scenario two')).toBeInTheDocument();
    expect(screen.getByText(/you answered: division/i)).toBeInTheDocument();
    expect(screen.queryByText('Scenario one')).not.toBeInTheDocument();
  });

  it('try again rebuilds the quiz and restarts', async () => {
    const user = userEvent.setup();
    renderQuiz();
    await user.click(screen.getByRole('button', { name: 'Straw Man' }));
    await user.click(screen.getByRole('button', { name: /next question/i }));
    await user.click(screen.getByRole('button', { name: 'Post Hoc' }));
    await user.click(screen.getByRole('button', { name: /see results/i }));
    expect(screen.getByText(/no misses/i)).toBeInTheDocument();

    vi.mocked(buildQuiz).mockClear();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(buildQuiz).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
  });

  it('links back to the library', () => {
    renderQuiz();
    expect(screen.getByRole('link', { name: /all fallacies/i })).toHaveAttribute('href', '/fallacies');
  });
});
