/**
 * Code-review topics — extracted from the original Quick Buttons arrays
 * (`QUICK_BUTTONS` / `QUICK_BUTTONS_NEW`).
 * Each topic becomes its own view folder under
 * `src/views/code-review/<value>/` with a list page and a detail page.
 */
export interface TopicConfig {
  value: string;
  label: string;
  category: string;
  template?: boolean;
  content: string;
}

export const CODE_REVIEW_TOPICS: TopicConfig[] = [
  {
    value: "summary",
    label: "Summarize this file",
    category: "Review",
    content: "Summarize this file: what it does, key entry points, and main responsibilities"
  },
  {
    value: "bugs",
    label: "Find potential bugs",
    category: "Review",
    content:
      "Review this file for potential bugs: edge cases, null dereferences, off-by-one errors, race conditions, and unhandled error paths"
  },
  {
    value: "explain",
    label: "Explain the logic",
    category: "Review",
    content: "Walk me through the core logic of this file step by step, focusing on the non-obvious branches"
  },
  {
    value: "security",
    label: "Security review",
    category: "Review",
    content:
      "Security review this file: injection risks, auth/permission gaps, secret leakage, and unsafe deserialization"
  },
  {
    value: "dependency_risk",
    label: "Dependency risk",
    category: "Review",
    content: "Dependency risk: outdated, unmaintained, or risky transitive deps in this file"
  },
  {
    value: "access_review",
    label: "Access review",
    category: "Review",
    content: "Access review: who can call this code path, and what privilege boundary it crosses"
  },
  {
    value: "refactor",
    label: "Refactor suggestions",
    category: "Health",
    template: true,
    content: "Suggest refactor candidates: extract   Current pain points: xxx   Expected outcome: xxx"
  },
  {
    value: "perf",
    label: "Performance analysis",
    category: "Health",
    content: "Performance analysis: hot paths, unnecessary allocations, N+1 queries, and async/await misuse"
  },
  {
    value: "tests",
    label: "Generate tests",
    category: "Health",
    content: "Generate unit test cases for the public functions in this file, covering happy paths and edge cases"
  },
  {
    value: "style",
    label: "Naming & style",
    category: "Health",
    content: "Review naming, comments, and code style against the surrounding codebase conventions; flag inconsistencies"
  },
  {
    value: "api_contract",
    label: "API contract check",
    category: "Health",
    template: true,
    content: "API contract check: inputs ___   outputs ___   error cases ___   backward-compat ___"
  },
  {
    value: "observability_gap",
    label: "Observability gap",
    category: "Health",
    content: "Observability gap: what logs/metrics/traces this file should emit vs currently does"
  },
  {
    value: "concurrency",
    label: "Concurrency review",
    category: "Review",
    content: "Concurrency review: data races, deadlocks, TOCTOU, async ordering, goroutine/promise leaks, stale reads"
  },
  {
    value: "error_handling",
    label: "Error handling review",
    category: "Review",
    content: "Error handling review: silent swallows, generic catches, unpropagated errors, retry storms, lost stack, user-facing leaks"
  },
  {
    value: "dead_code",
    label: "Dead code review",
    category: "Health",
    content: "Dead code review: unused exports, functions, files, imports, CSS classes — with confidence + removal plan"
  },
  {
    value: "backward_compat",
    label: "Backward compat review",
    category: "Review",
    content: "Backward compat review: API / DB schema / config / event / file / behavior changes — breaking risk, migration path, rollback"
  },
  {
    value: "i18n_a11y",
    label: "i18n / a11y review",
    category: "Review",
    content: "i18n / a11y review: hardcoded strings, untranslated keys, missing aria, keyboard traps, contrast, focus order, screen-reader verification"
  }
];

export function topicSlug(value: string): string {
  return value.replace(/_/g, "-");
}

export function findTopicConfig(value: string): TopicConfig | undefined {
  return CODE_REVIEW_TOPICS.find(t => t.value === value);
}
