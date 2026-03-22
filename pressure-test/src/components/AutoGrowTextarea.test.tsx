import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AutoGrowTextarea } from './AutoGrowTextarea';

describe('AutoGrowTextarea', () => {
  it('renders a textarea element', () => {
    render(<AutoGrowTextarea value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    render(<AutoGrowTextarea value="Hello world" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Hello world');
  });

  it('forwards placeholder prop', () => {
    render(<AutoGrowTextarea value="" placeholder="Type here…" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Type here…')).toBeInTheDocument();
  });

  it('forwards disabled prop', () => {
    render(<AutoGrowTextarea value="" disabled onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('has resize: none style', () => {
    const { container } = render(<AutoGrowTextarea value="" onChange={() => {}} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.resize).toBe('none');
  });
});
