import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';

function renderLayout(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Layout>
        <div>Page content</div>
      </Layout>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('renders header with app title', () => {
    renderLayout();
    expect(screen.getAllByText('Pressure Test').length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    renderLayout();
    expect(screen.getAllByRole('link', { name: /dashboard/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /open questions|questions/i }).length).toBeGreaterThan(0);
  });

  it('renders children content', () => {
    renderLayout();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('Dashboard link is active on / route', () => {
    renderLayout('/');
    // The active link has accent color style
    const dashLinks = screen.getAllByRole('link', { name: /dashboard/i });
    const activeLink = dashLinks.find(
      (l) => (l as HTMLElement).style.color === 'var(--accent)'
    );
    expect(activeLink).toBeTruthy();
  });

  it('Open Questions link is active on /open-questions route', () => {
    renderLayout('/open-questions');
    const links = screen.getAllByRole('link', { name: /open questions|questions/i });
    const activeLink = links.find(
      (l) => (l as HTMLElement).style.color === 'var(--accent)'
    );
    expect(activeLink).toBeTruthy();
  });
});
