# CLAUDE.md

## Project

Proposition Pressure-Test Tool — a mobile-first SPA for structured critical thinking. No backend, no auth, browser localStorage only.

Two activities: the proposition pressure-test flow, and a logical fallacies library with a multiple-choice quiz.

## Stack

- React 18 + TypeScript (strict)
- Vite (build + dev server)
- Vitest + React Testing Library + jsdom (testing)
- React Router v6 (HashRouter)
- CSS custom properties, no framework
- Google Fonts: Newsreader, Source Sans 3, JetBrains Mono
- Zero runtime dependencies beyond React + React Router

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build → dist/
npm run test         # All tests (vitest run)
npm run test:watch   # Watch mode
npm run preview      # Serve production build locally
```

## CI / Deployment

- `.github/workflows/ci.yml` — on pull requests: `npm ci`, `npm test`, `npm run build`.
- `.github/workflows/deploy.yml` — on push to `main` (or manual dispatch): test, build, publish `pressure-test/dist` to GitHub Pages.
- `vite.config.ts` sets `base: '/premise-challenger/'` to match the Pages URL. Change both together if the repo is renamed.

## Architecture

### Directory layout

```
src/
├── types.ts              # All TypeScript interfaces — single source of truth
├── constants.ts          # Hedge words, status metadata, storage key
├── data/
│   └── fallacies.ts      # Static fallacy library: definitions, examples, quiz scenarios, categories
├── services/
│   └── storage.ts        # localStorage CRUD — only file that touches localStorage
├── utils/
│   ├── validation.ts     # Hedge word detection, claim validation
│   ├── export.ts         # JSON export/download
│   ├── fallacies.ts      # Fallacy library filtering (category + text search)
│   ├── quiz.ts           # Quiz generation, shuffling (injectable RNG), scoring
│   └── id.ts             # UUID generation (crypto.randomUUID with fallback)
├── hooks/
│   └── usePropositions.ts  # Main data hook — wraps storage service, provides reactive state
├── components/           # Reusable UI components (co-located *.test.tsx files)
├── views/                # Route-level page components (co-located *.test.tsx files)
├── styles/
│   └── global.css        # CSS reset, custom properties, base typography
├── test-setup.ts         # Vitest + Testing Library global setup
├── App.tsx               # Router config and route definitions
└── main.tsx              # Entry point — HashRouter, StrictMode, createRoot
```

### Key conventions

- **All data access goes through `services/storage.ts`.** Never import localStorage directly in components or hooks.
- **Business logic lives in `utils/` and `services/`.** Views and components are presentation only.
- **`usePropositions` hook** is the single interface between React state and the storage layer. All mutations go through it.
- **HashRouter** for offline/static hosting compatibility. All routes are `/#/path`.
- **Fallacy content is static data** in `data/fallacies.ts`, not persisted. The quiz is stateless — nothing is written to localStorage. Each fallacy's `quizScenarios` must differ from its library `example` (enforced by `data/fallacies.test.ts`).
- **Tests co-located** with source files (no separate `__tests__` directory). Test files use `*.test.ts` / `*.test.tsx`.

### Routes

| Path | Component | Notes |
|---|---|---|
| `/` | Dashboard | Lists all propositions with filter/sort |
| `/new` | Capture | Claim entry with hedge detection |
| `/triage/:id` | Triage | Pressure-test vs act-on-intuition decision |
| `/test/:id` | PressureTest | 3-step evidence/steelman/falsifiability flow |
| `/outcome/:id` | Outcome | Decision (confirm/revise/suspend) and review |
| `/open-questions` | OpenQuestions | All suspended propositions |
| `/fallacies` | Fallacies | Fallacy library with category filter, search, expandable examples |
| `/fallacies/quiz` | FallacyQuiz | 10-question multiple-choice quiz with per-question feedback and missed-question review |
| `*` | — | Redirects to `/` |

### Data model

Single localStorage key: `pressure-test-propositions`. Contains JSON array of `Proposition` objects (see `types.ts`). Schema changes require a migration — don't silently change field semantics.

Key fields:
- `triage`: `'pressure_test'` (user chose to examine) or `'confirmed_intuition'` (user acted directly)
- `revised_from`: ID of the parent proposition when this one is a revision
- `revision_note`: the restated claim text when status is `'revised'`
- `resolution_note`: reason for suspension when status is `'suspended'`

### Styling

- Dark mode only. CSS custom properties defined in `global.css`.
- Color palette: near-black bg, warm off-white text, gold accent. Status colors: sage (confirmed), gold (revised), brown (suspended), gray (untested).
- Typography: Newsreader (serif) for headings/claims, Source Sans 3 (sans) for body, JetBrains Mono for metadata/badges.
- All spacing on 8px grid. All interactive elements ≥ 44px touch target. All input fonts ≥ 16px (prevents iOS zoom).
- Navigation: header links (`.header-nav`) at >640px, fixed bottom bar (`.bottom-nav`) at ≤640px. Breakpoint lives in `global.css`.
- Use `100dvh` with `100vh` fallback for full-height layouts — never bare `100vh`.

### Testing

- Unit tests live next to source files (`*.test.ts` / `*.test.tsx`).
- Tests mock localStorage directly (not the storage service), so integration-style view tests exercise the real service layer.
- Quiz randomness is injectable (`rng` option) — use a seeded RNG in unit tests; view tests mock `buildQuiz`.
- Every utility function and hook has tests. All views and reusable components have interaction tests.

## Patterns to follow

- TDD: write or update tests when changing logic.
- No `any` types. No `@ts-ignore`. No `eslint-disable`.
- Save proposition state on every step transition to prevent data loss on back-button.
- Edge cases to preserve: corrupted localStorage → empty array (no crash), missing proposition ID in URL → redirect to `/`.

## Patterns to avoid

- Don't add external UI libraries (no Tailwind, no component library).
- Don't add a backend or authentication layer.
- Don't put business logic in React components.
- Don't access localStorage outside of `services/storage.ts`.
- Don't use bare `100vh` for full-height layouts.
