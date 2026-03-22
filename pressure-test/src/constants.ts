import type { PropositionStatus } from './types';

export const STORAGE_KEY = 'pressure-test-propositions';

export const HEDGE_WORDS: string[] = [
  'maybe',
  'probably',
  'perhaps',
  'might',
  'possibly',
  'i think',
  'i guess',
  'i feel like',
  'sort of',
  'kind of',
  'kinda',
  'sorta',
  'it seems',
  'it feels',
  'arguably',
  'i believe',
  'i suppose',
];

export const STATUS_META: Record<PropositionStatus, { label: string; description: string }> = {
  confirmed: {
    label: 'Confirmed',
    description: 'Evidence holds. Proceed with confidence.',
  },
  revised: {
    label: 'Revised',
    description: 'The pressure-test changed the claim.',
  },
  suspended: {
    label: 'Suspended',
    description: 'Not enough data yet.',
  },
  untested: {
    label: 'Untested',
    description: 'Captured but not yet examined.',
  },
};
