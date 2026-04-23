export type Severity = 'error' | 'warn';

export type Predicate =
  | { changed: string[] }
  | { exists: string[] }
  | { body: string[] }
  | { title: string[] }
  | { has_label: string[] }
  | { approval_count_at_least: number }
  | { file_contains: { globs: string[]; patterns: string[] } };

export type PredicateExpression =
  | Predicate
  | { all: PredicateExpression[] }
  | { any: PredicateExpression[] }
  | { not: PredicateExpression };

export interface Policy {
  id: string;
  description?: string;
  severity: Severity;
  when?: PredicateExpression;
  require: PredicateExpression;
  message: string;
}

export interface PolicyConfig {
  policies: Policy[];
}
