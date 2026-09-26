# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-09-26

### Added
- Logical fallacies activity (`/fallacies`): library of 30 fallacies across five categories (relevance, presumption, causal, ambiguity, formal), each with definition, aliases, example, and explanation of the flaw. Category filter and text search.
- Fallacy quiz (`/fallacies/quiz`): 10 multiple-choice questions drawn from scenarios separate from the library examples, with immediate feedback, final score, and review of missed questions.
- `utils/quiz.ts` (quiz generation, shuffling, scoring) and `utils/fallacies.ts` (filtering), with unit tests.
- "Fallacies" link in header and bottom navigation.

### Fixed
- Header nav and bottom nav both rendered at every width despite being documented as desktop-only / mobile-only. Added the missing responsive CSS (breakpoint 640px).

## [1.0.0] - 2026-03-22

### Added

#### Data layer (Session 1)
- `Proposition` data model with full TypeScript interfaces (`types.ts`)
- localStorage persistence via `services/storage.ts` — single-key JSON array storage
- CRUD operations: create, read, update, delete, filter, sort
- Hedge word detection with whole-word and phrase-boundary regex matching (`utils/validation.ts`)
- Claim validation: empty check, minimum length, hedge language rejection
- UUID generation using `crypto.randomUUID` with RFC 4122 fallback (`utils/id.ts`)
- JSON export with optional status filter (`utils/export.ts`)
- `usePropositions` hook — reactive state layer over the storage service
- Full unit test suite for all utilities, services, and the hook

#### UI and user flows (Session 2)
- Capture view: claim entry form with live hedge-word warning
- Triage view: pressure-test vs act-on-intuition decision point
- PressureTest view: 3-step flow — Evidence, Steelman, Falsifiability — with collapsible helper prompts and progress indicator
- Outcome view: dual-mode (decision and review) — confirm, revise, or suspend a proposition
- Revision flow: restated propositions linked to originals via `revised_from`
- Dashboard view: full proposition list with status filter and newest/oldest sort
- OpenQuestions view: filtered list of suspended propositions
- Layout component with desktop header and mobile bottom navigation
- Reusable components: `AutoGrowTextarea`, `EmptyState`, `FilterBar`, `HedgeWarning`, `HelperPrompt`, `ProgressIndicator`, `PropositionCard`, `StatusBadge`
- HashRouter with 6 routes; catch-all redirects to `/`
- Component-level interaction tests for all views and reusable components

#### Polish and hardening (Session 3)
- Mobile-optimized layout: bottom navigation, sticky action buttons, safe-area insets
- All interactive elements ≥ 44px touch target; all input fonts ≥ 16px (prevents iOS zoom)
- `100dvh` with `100vh` fallback for full-height layouts
- Auto-growing textareas throughout
- Relative date formatting on proposition cards
- Graceful handling of corrupted localStorage (returns empty array, no crash)
- Keyboard navigation and focus management throughout
- Dark editorial design: Newsreader + Source Sans 3 + JetBrains Mono
- CSS custom properties for all colors, spacing, and typography
- Delete confirmation flow on proposition cards

#### Documentation (Session 4)
- `CLAUDE.md`: orientation file for future contributors and AI sessions
- `CHANGELOG.md`: this file
- `README.md`: expanded with how-it-works, quick start, tech, and data sections
- `LICENSE`: MIT
- Inline doc comments on key files: `types.ts`, `constants.ts`, `storage.ts`, `validation.ts`, `usePropositions.ts`
- `package.json` updated: version `1.0.0`, description, license, `test:watch` script
