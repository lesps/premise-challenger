import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelperPrompt } from './HelperPrompt';

describe('HelperPrompt', () => {
  it('renders toggle button', () => {
    render(<HelperPrompt text="Some helper text here." />);
    expect(screen.getByRole('button', { name: /need a prompt/i })).toBeInTheDocument();
  });

  it('is collapsed by default — helper text not visible', () => {
    render(<HelperPrompt text="Some helper text here." />);
    expect(screen.queryByText('Some helper text here.')).not.toBeInTheDocument();
  });

  it('expands to show helper text on click', async () => {
    const user = userEvent.setup();
    render(<HelperPrompt text="Some helper text here." />);
    await user.click(screen.getByRole('button', { name: /need a prompt/i }));
    expect(screen.getByText('Some helper text here.')).toBeInTheDocument();
  });

  it('collapses on second click', async () => {
    const user = userEvent.setup();
    render(<HelperPrompt text="Some helper text here." />);
    const btn = screen.getByRole('button', { name: /need a prompt/i });
    await user.click(btn);
    expect(screen.getByText('Some helper text here.')).toBeInTheDocument();
    await user.click(btn);
    expect(screen.queryByText('Some helper text here.')).not.toBeInTheDocument();
  });

  it('button has aria-expanded=false when collapsed', () => {
    render(<HelperPrompt text="Some helper text." />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('button has aria-expanded=true when expanded', async () => {
    const user = userEvent.setup();
    render(<HelperPrompt text="Some helper text." />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });
});
