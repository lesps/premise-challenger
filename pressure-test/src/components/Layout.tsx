import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)' as const,
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 400,
    textDecoration: 'none',
    paddingBottom: '2px',
    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'color var(--transition), border-color var(--transition)',
  });

  const mobileLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '3px',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-sans)' as const,
    padding: '4px 16px',
    textDecoration: 'none',
    minHeight: '48px',
    justifyContent: 'center',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Desktop header — hidden on mobile */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-primary)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            padding: '0 var(--padding-desktop)',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Pressure Test
          </span>
          <nav aria-label="Main navigation" className="header-nav" style={{ gap: '24px' }}>
            <NavLink to="/" end style={navLinkStyle}>
              Dashboard
            </NavLink>
            <NavLink to="/open-questions" style={navLinkStyle}>
              Open Questions
            </NavLink>
            <NavLink to="/fallacies" style={navLinkStyle}>
              Fallacies
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          maxWidth: 'var(--max-width)',
          width: '100%',
          margin: '0 auto',
          padding: '32px var(--padding-desktop) 80px',
        }}
      >
        {children}
      </main>

      {/* Bottom nav — mobile only via media query simulation */}
      <nav
        aria-label="Mobile navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
          zIndex: 100,
        }}
        className="bottom-nav"
      >
        <NavLink
          to="/"
          end
          style={mobileLinkStyle}
          aria-label="Dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="16" height="2.5" rx="1" fill="currentColor" opacity="0.8" />
            <rect x="2" y="8.75" width="16" height="2.5" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="2" y="13.5" width="10" height="2.5" rx="1" fill="currentColor" opacity="0.3" />
          </svg>
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/open-questions"
          style={mobileLinkStyle}
          aria-label="Open Questions"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <text x="10" y="14.5" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="sans-serif">?</text>
          </svg>
          <span>Questions</span>
        </NavLink>
        <NavLink to="/fallacies" style={mobileLinkStyle} aria-label="Fallacies">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2.5 18 17H2L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="9.25" y="7.5" width="1.5" height="5" rx="0.75" fill="currentColor" />
            <circle cx="10" cy="14.5" r="0.9" fill="currentColor" />
          </svg>
          <span>Fallacies</span>
        </NavLink>
      </nav>
    </div>
  );
}
