# Pressure Test

A structured critical thinking tool for evaluating beliefs, decisions, and conclusions.

People with strong intuitive reasoning often arrive at conclusions quickly — but skip the internal audit. This tool provides a low-friction scaffold for that audit.

## How it works

1. **Capture** a proposition — a single, clear claim you hold.
2. **Triage** — decide if it warrants examination or if you can act on intuition.
3. **Pressure-test** with three questions:
   - How do you actually know this? *(evidence)*
   - What's the strongest case against this? *(steelman)*
   - What would change your mind? *(falsifiability)*
4. **Decide** — confirm, revise, or suspend the proposition.

No accounts. No cloud. Your data stays in your browser.

## Quick start

```bash
cd pressure-test
npm install
npm run dev
```

## Build & test

```bash
npm run build        # Production build → dist/
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run preview      # Serve production build locally
```

## Tech

React 18 · TypeScript · Vite · Vitest · React Router v6 · localStorage

No backend. No external UI libraries. Works offline after initial load.

## Data

All propositions are stored in browser localStorage under a single key. Export anytime as JSON from the dashboard. The app degrades gracefully on corrupted storage data (returns empty state rather than crashing).

## Contributing

See [CLAUDE.md](./pressure-test/CLAUDE.md) for architecture, conventions, and patterns.
