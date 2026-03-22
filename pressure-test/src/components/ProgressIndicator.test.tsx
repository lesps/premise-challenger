import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('shows correct question count text', () => {
    render(<ProgressIndicator current={1} total={3} />);
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
  });

  it('shows question 2 of 3', () => {
    render(<ProgressIndicator current={2} total={3} />);
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
  });

  it('shows question 3 of 3', () => {
    render(<ProgressIndicator current={3} total={3} />);
    expect(screen.getByText('Question 3 of 3')).toBeInTheDocument();
  });

  it('renders correct number of step indicators', () => {
    const { container } = render(<ProgressIndicator current={1} total={3} />);
    const steps = container.querySelectorAll('[aria-hidden="true"]');
    expect(steps).toHaveLength(3);
  });
});
