import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HedgeWarning } from './HedgeWarning';

describe('HedgeWarning', () => {
  it('renders nothing when no words provided', () => {
    const { container } = render(<HedgeWarning words={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows detected words', () => {
    render(<HedgeWarning words={['maybe', 'i think']} />);
    expect(screen.getByText(/maybe/i)).toBeInTheDocument();
    expect(screen.getByText(/i think/i)).toBeInTheDocument();
  });

  it('shows the rephrase prompt', () => {
    render(<HedgeWarning words={['probably']} />);
    expect(screen.getByText(/try stating this as a direct claim/i)).toBeInTheDocument();
  });

  it('has role=alert for accessibility', () => {
    render(<HedgeWarning words={['maybe']} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders single detected word', () => {
    render(<HedgeWarning words={['perhaps']} />);
    expect(screen.getByText(/perhaps/i)).toBeInTheDocument();
  });
});
