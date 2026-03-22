import { HEDGE_WORDS } from '../constants';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectHedgeWords(claim: string): string[] {
  const trimmed = claim.trim();
  if (!trimmed) return [];

  const found: string[] = [];
  for (const phrase of HEDGE_WORDS) {
    const escaped = escapeRegex(phrase);
    // Use word boundaries for single words; space/start/end anchors for multi-word phrases
    const pattern = phrase.includes(' ')
      ? `(?:^|\\s)${escaped}(?:\\s|$)`
      : `\\b${escaped}\\b`;
    const regex = new RegExp(pattern, 'i');
    if (regex.test(trimmed)) {
      found.push(phrase);
    }
  }
  return found;
}

export function isValidClaim(claim: string): { valid: boolean; reason?: string } {
  const trimmed = claim.trim();

  if (!trimmed) {
    return { valid: false, reason: 'Claim cannot be empty.' };
  }

  if (trimmed.length < 5) {
    return { valid: false, reason: 'Claim must be at least 5 characters long.' };
  }

  const hedges = detectHedgeWords(trimmed);
  if (hedges.length > 0) {
    return {
      valid: false,
      reason: `Claim contains hedging language: "${hedges.join('", "')}". State your belief directly.`,
    };
  }

  return { valid: true };
}
