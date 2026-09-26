import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FALLACIES, getFallacy } from '../data/fallacies';
import { buildQuiz, scoreQuiz, scoreVerdict } from '../utils/quiz';
import type { QuizQuestion } from '../types';

export const QUIZ_LENGTH = 10;

const nameOf = (id: string | undefined) => (id ? getFallacy(id)?.name ?? id : '—');

const newQuiz = () => buildQuiz(FALLACIES, { count: QUIZ_LENGTH });

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-tertiary)',
};

const primaryButton = {
  background: 'var(--accent)',
  color: '#0f0f0f',
  border: 'none',
  borderRadius: '8px',
  padding: '14px 24px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  minHeight: '48px',
  width: '100%',
};

function Scenario({ text }: { text: string }) {
  return (
    <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '20px', marginBottom: '24px' }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {text}
      </p>
    </blockquote>
  );
}

function Results({
  quiz,
  answers,
  onRestart,
}: {
  quiz: QuizQuestion[];
  answers: string[];
  onRestart: () => void;
}) {
  const { correct, total } = scoreQuiz(quiz, answers);
  const missed = quiz.map((q, i) => ({ q, given: answers[i] })).filter(({ q, given }) => given !== q.answerId);

  return (
    <div>
      <p style={labelStyle}>Your score</p>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--accent)', lineHeight: 1.2 }}>
        {correct} / {total}
      </p>
      <p style={{ marginBottom: '32px' }}>{scoreVerdict(correct, total)}</p>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Review</h2>
      {missed.length === 0 ? (
        <p style={{ fontStyle: 'italic', marginBottom: '32px' }}>No misses. Nothing to review.</p>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          {missed.map(({ q, given }) => (
            <div
              key={q.scenario}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '12px',
              }}
            >
              <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {q.scenario}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>You answered: {nameOf(given)}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--status-confirmed)' }}>Answer: {nameOf(q.answerId)}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button type="button" onClick={onRestart} style={primaryButton}>
          Try again
        </button>
        <Link
          to="/fallacies"
          style={{ ...primaryButton, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 400 }}
        >
          All fallacies
        </Link>
      </div>
    </div>
  );
}

export function FallacyQuiz() {
  const [quiz, setQuiz] = useState(newQuiz);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const restart = () => {
    setQuiz(newQuiz());
    setIndex(0);
    setAnswers([]);
    setFinished(false);
  };

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <Link to="/fallacies" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        ← All fallacies
      </Link>
      {!finished && quiz.length > 0 && (
        <span style={labelStyle}>
          Question {index + 1} of {quiz.length}
        </span>
      )}
    </div>
  );

  if (finished) {
    return (
      <div>
        {header}
        <Results quiz={quiz} answers={answers} onRestart={restart} />
      </div>
    );
  }

  const question = quiz[index];
  if (!question) return <div>{header}</div>;

  const selected = answers[index];
  const answered = selected !== undefined;
  const isCorrect = selected === question.answerId;
  const answer = getFallacy(question.answerId);
  const isLast = index === quiz.length - 1;

  const choose = (id: string) => {
    if (answered) return;
    setAnswers((a) => {
      const next = [...a];
      next[index] = id;
      return next;
    });
  };

  const optionStyle = (id: string) => {
    const base = {
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '14px 20px',
      fontSize: '1rem',
      textAlign: 'left' as const,
      minHeight: '52px',
      cursor: answered ? 'default' : 'pointer',
      transition: 'background var(--transition), border-color var(--transition)',
    };
    if (!answered) return base;
    if (id === question.answerId) return { ...base, borderColor: 'var(--status-confirmed)', color: 'var(--status-confirmed)' };
    if (id === selected) return { ...base, borderColor: 'var(--danger)', color: 'var(--danger)' };
    return { ...base, opacity: 0.5 };
  };

  return (
    <div>
      {header}
      <Scenario text={question.scenario} />
      <h1 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Which fallacy is this?</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {question.optionIds.map((id) => (
          <button key={id} type="button" disabled={answered} onClick={() => choose(id)} style={optionStyle(id)}>
            {nameOf(id)}
          </button>
        ))}
      </div>

      {answered && (
        <div
          role="status"
          style={{
            background: 'var(--bg-elevated)',
            borderLeft: `3px solid ${isCorrect ? 'var(--status-confirmed)' : 'var(--danger)'}`,
            borderRadius: '4px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontWeight: 600, color: isCorrect ? 'var(--status-confirmed)' : 'var(--danger)', marginBottom: '8px' }}>
            {isCorrect ? 'Correct' : `Not quite — this is ${answer?.name ?? question.answerId}.`}
          </p>
          {answer && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{answer.definition}</p>
          )}
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={() => (isLast ? setFinished(true) : setIndex((i) => i + 1))}
          style={primaryButton}
        >
          {isLast ? 'See results' : 'Next question'}
        </button>
      )}
    </div>
  );
}
