/**
 * Chat constants — quick-action buttons, default model.
 * Mirrors YiVad aiChat constants (qwen3 → qwen3.5 per user request).
 */

export interface QuickButton {
  label: string;
  content: string;
  value: string;
  template?: boolean;
}

export const QUICK_BUTTONS: QuickButton[] = [
  {
    label: 'Tech roadmap review',
    content:
      "Tech roadmap review: this quarter's investment distribution and milestone alignment across platform, middleware, and business domains",
    value: 'roadmap_review',
  },
  {
    label: 'Architecture decision records',
    content:
      'Architecture decision records: list key changes, risks, and rollback plans from recent ADRs',
    value: 'adr_review',
  }
];

export const QUICK_BUTTONS_NEW: QuickButton[] = [
  {
    label: 'Tech selection evaluation',
    content:
      'Candidate options: xxx   Evaluation dimensions: performance/cost/ecosystem/maintainability   Constraints: xxx',
    value: 'tech_selection',
    template: true,
  },
  {
    label: 'Incident postmortem',
    content:
      'Incident severity: P0/P1   Impact scope: xxx   Root cause chain: xxx   Action items: xxx',
    value: 'postmortem',
    template: true,
  },
];

export const DEFAULT_MODEL = 'qwen3.5:4b';
