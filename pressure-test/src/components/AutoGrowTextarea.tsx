import { useRef, useEffect, type TextareaHTMLAttributes } from 'react';

interface AutoGrowTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  value: string;
}

export function AutoGrowTextarea({ value, ...props }: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      style={{
        width: '100%',
        minHeight: '120px',
        resize: 'none',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        fontSize: '1rem',
        lineHeight: '1.6',
        color: 'var(--text-primary)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '12px 16px',
        transition: 'border-color var(--transition)',
        display: 'block',
      }}
      {...props}
    />
  );
}
