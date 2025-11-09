export type EvaluationSeverity = 'hard_fail' | 'soft_warn';

export type EvaluationStatus = 'pass' | 'warn' | 'fail';

export interface EvaluationIssue {
  id: string;
  description: string;
  severity: EvaluationSeverity;
  hint?: string;
  details?: Record<string, unknown>;
}

export interface EvaluationResult {
  status: EvaluationStatus;
  score?: number; // 0..100 optional
  issues: EvaluationIssue[];
}

export interface ContrastInput {
  foregroundHex: string;
  backgroundHex: string;
  requiredRatio: number; // e.g., 4.5 for AA
}

export interface ComplexityInput {
  // A normalized complexity measure 0..1 (e.g., edge density/variance)
  complexity: number;
  maxAllowed: number; // 0..1
}

export interface RegexInput {
  text: string;
  bannedPatterns: string[];
}

export interface ReadabilityInput {
  text: string;
  targetGrade: number;
  maxExclamations: number;
  allowEmojis: boolean;
}

export interface Evaluator<TInput> {
  evaluate(input: TInput): EvaluationResult;
}

// Stubs (no-op implementations) to be replaced with real logic
export const ContrastEvaluator: Evaluator<ContrastInput> = {
  evaluate: (_input) => ({ status: 'pass', issues: [] }),
};

export const ComplexityEvaluator: Evaluator<ComplexityInput> = {
  evaluate: (_input) => ({ status: 'pass', issues: [] }),
};

export const RegexEvaluator: Evaluator<RegexInput> = {
  evaluate: (_input) => ({ status: 'pass', issues: [] }),
};

export const ReadabilityEvaluator: Evaluator<ReadabilityInput> = {
  evaluate: (_input) => ({ status: 'pass', issues: [] }),
};


