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
  },
  {
    label: 'Engineering productivity metrics',
    content:
      'Engineering productivity metrics: lead time, change failure rate, MTTR, and per-capita throughput trends with attribution',
    value: 'dora_metrics',
  },
  {
    label: 'Tech debt inventory',
    content:
      'Tech debt inventory: classify core debts by domain, assess interest, and prioritize quarterly repayment',
    value: 'tech_debt',
  },
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
    label: 'Org productivity diagnosis',
    content:
      "Org productivity diagnosis: team topology, dependency topology, delivery bottlenecks, and Conway's law alignment",
    value: 'org_diagnose',
  },
  {
    label: 'Incident postmortem',
    content:
      'Incident severity: P0/P1   Impact scope: xxx   Root cause chain: xxx   Action items: xxx',
    value: 'postmortem',
    template: true,
  },
  {
    label: 'Capacity and cost',
    content:
      'Capacity and cost: resource utilization, scaling thresholds, per-request cost, and quarterly FinOps optimization items',
    value: 'capacity_cost',
  },
];

export const DEFAULT_MODEL = 'qwen3.5:4b';
