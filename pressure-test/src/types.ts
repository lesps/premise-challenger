export type TriageResult = 'pressure_test' | 'confirmed_intuition';

export type PropositionStatus = 'confirmed' | 'revised' | 'suspended' | 'untested';

export interface Proposition {
  id: string;
  created_at: string;
  updated_at: string;
  claim: string;
  // 'pressure_test' → user chose to examine the claim; 'confirmed_intuition' → user skipped to act on it directly
  triage: TriageResult | null;
  evidence: string | null;
  steelman: string | null;
  falsifiability: string | null;
  status: PropositionStatus;
  // Populated when status is 'revised': stores the restated claim text
  revision_note: string | null;
  // Populated when status is 'suspended': stores the reason for suspension
  resolution_note: string | null;
  // ID of the proposition this was revised from; creates a linked chain of refinements
  revised_from: string | null;
}

export interface AppData {
  propositions: Proposition[];
}

export type SortField = 'created_at' | 'updated_at' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  status?: PropositionStatus | 'all';
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export interface ExportOptions {
  filterStatus?: PropositionStatus | 'all';
}

export type FallacyCategory = 'relevance' | 'presumption' | 'causal' | 'ambiguity' | 'formal';

export interface Fallacy {
  id: string;
  name: string;
  aka: string[];
  category: FallacyCategory;
  definition: string;
  example: string;
  // Why the example's reasoning fails — shown with the example and as quiz feedback
  flaw: string;
  // Fresh scenarios used only by the quiz, so quiz items don't repeat the library example
  quizScenarios: string[];
}

export interface QuizQuestion {
  scenario: string;
  answerId: string;
  // Fallacy IDs, shuffled, always including answerId
  optionIds: string[];
}
