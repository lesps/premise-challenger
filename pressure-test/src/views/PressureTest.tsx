import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePropositions } from '../hooks/usePropositions';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { HelperPrompt } from '../components/HelperPrompt';
import { AutoGrowTextarea } from '../components/AutoGrowTextarea';
import * as storage from '../services/storage';

type Step = 1 | 2 | 3;

interface StepConfig {
  heading: string;
  description: string;
  helper: string;
  field: 'evidence' | 'steelman' | 'falsifiability';
}

const STEPS: Record<Step, StepConfig> = {
  1: {
    heading: 'How do you actually know this?',
    description:
      'List the specific observations, data points, or experiences that produced this claim. Concrete and observable — not interpretations yet.',
    helper:
      "What did you actually see, hear, or experience? Avoid 'because it felt like' or 'I assumed' — what's the raw input?",
    field: 'evidence',
  },
  2: {
    heading: "What's the strongest case against this?",
    description:
      'Argue the opposing position as well as you can. What would someone who disagreed point to?',
    helper:
      "You're not trying to disprove your claim — you're finding its weakest point. What evidence could someone use to challenge it?",
    field: 'steelman',
  },
  3: {
    heading: 'What would change your mind?',
    description:
      'Describe the specific observation or evidence that would cause you to revise or abandon this claim.',
    helper:
      "If you can't answer this, you may be holding a conviction rather than a belief. Both are fine — but knowing which is which matters.",
    field: 'falsifiability',
  },
};

export function PressureTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposition, updateProposition } = usePropositions();

  const proposition = id ? getProposition(id) : null;

  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState({ evidence: '', steelman: '', falsifiability: '' });

  // Refs so the unmount cleanup can access latest values without stale closure
  const answersRef = useRef(answers);
  const stepRef = useRef(step);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (!proposition) {
      navigate('/', { replace: true });
      return;
    }
    setAnswers({
      evidence: proposition.evidence ?? '',
      steelman: proposition.steelman ?? '',
      falsifiability: proposition.falsifiability ?? '',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save current step answer on unmount (e.g. browser back button)
  useEffect(() => {
    return () => {
      if (!id) return;
      const currentStep = stepRef.current;
      const field = STEPS[currentStep].field;
      const value = answersRef.current[field];
      if (value.trim()) {
        try {
          storage.updateProposition(id, { [field]: value });
        } catch {
          // Silently ignore errors on unmount (component is leaving)
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!proposition) return null;

  const config = STEPS[step];
  const currentAnswer = answers[config.field];
  const canAdvance = currentAnswer.trim().length > 0;

  const saveCurrentStep = useCallback(() => {
    if (!id) return;
    updateProposition(id, { [config.field]: answers[config.field] });
  }, [id, config.field, answers, updateProposition]);

  const handleBack = () => {
    saveCurrentStep();
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleNext = () => {
    if (!canAdvance) return;
    saveCurrentStep();
    setStep((s) => (s + 1) as Step);
  };

  const handleFinish = () => {
    if (!canAdvance || !id) return;
    updateProposition(id, { [config.field]: answers[config.field] });
    navigate(`/outcome/${id}`);
  };

  return (
    <div>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          marginBottom: '24px',
          textDecoration: 'none',
        }}
      >
        ← Back to Dashboard
      </Link>

      <ProgressIndicator current={step} total={3} />

      {/* Reference claim */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '28px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          {proposition.claim}
        </p>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          color: 'var(--text-primary)',
          marginBottom: '10px',
        }}
      >
        {config.heading}
      </h2>
      <p
        style={{
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          lineHeight: 1.6,
        }}
      >
        {config.description}
      </p>

      <HelperPrompt text={config.helper} />

      <AutoGrowTextarea
        value={currentAnswer}
        onChange={(e) =>
          setAnswers((prev) => ({ ...prev, [config.field]: e.target.value }))
        }
        placeholder="Type your response…"
        aria-label={config.heading}
      />

      {/* Sticky navigation */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          background: 'var(--bg-primary)',
          paddingTop: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            style={{
              background: 'none',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px 20px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              minHeight: '48px',
            }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
            style={{
              background: canAdvance ? 'var(--accent)' : 'var(--bg-elevated)',
              color: canAdvance ? '#0f0f0f' : 'var(--text-tertiary)',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              opacity: canAdvance ? 1 : 0.5,
              minHeight: '48px',
              transition: 'background var(--transition)',
            }}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={!canAdvance}
            style={{
              background: canAdvance ? 'var(--accent)' : 'var(--bg-elevated)',
              color: canAdvance ? '#0f0f0f' : 'var(--text-tertiary)',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              opacity: canAdvance ? 1 : 0.5,
              minHeight: '48px',
              transition: 'background var(--transition)',
            }}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
