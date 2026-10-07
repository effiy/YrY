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
    label: 'Technology roadmap review',
    content:
      'Review the current technology roadmap: assess investment distribution across platform, middleware, and business domains; identify milestone risks and alignment gaps.',
    value: 'roadmap_review',
  },
  {
    label: 'Architecture decision review',
    content:
      'Review recent architecture decision records: summarize key changes, evaluate risks and trade-offs, identify any rollback concerns.',
    value: 'adr_review',
  },
  {
    label: 'DORA metrics assessment',
    content:
      'Analyze deployment frequency, lead time for changes, change failure rate, and mean time to recovery. Identify bottlenecks and recommend improvements.',
    value: 'dora_metrics',
  },
  {
    label: 'Technical debt analysis',
    content:
      'Identify the most critical technical debt items across the codebase. Rank by impact on velocity, quality, and operational risk. Propose a prioritized remediation plan.',
    value: 'tech_debt',
  },
];

export const QUICK_BUTTONS_NEW: QuickButton[] = [
  {
    label: 'Technology selection',
    content:
      'Candidate: [name]\nEvaluation criteria: performance, cost, ecosystem maturity, maintainability, team familiarity\nConstraints: [list]\nRecommendation: [choice with rationale]',
    value: 'tech_selection',
    template: true,
  },
  {
    label: 'Incident postmortem',
    content:
      'Severity: [P0/P1/P2]\nImpact: [users affected, duration, data loss]\nTimeline: [detection → escalation → mitigation → resolution]\nRoot cause: [5-why analysis]\nAction items: [preventive measures with owners and deadlines]',
    value: 'postmortem',
    template: true,
  },
  {
    label: 'Organizational diagnostic',
    content:
      'Team: [name]\nSymptoms: [delivery delays, quality issues, attrition, communication breakdowns]\nAnalysis: [process gaps, skill gaps, tooling issues, dependencies]\nRecommendations: [actionable improvements with expected outcomes]',
    value: 'org_diagnose',
    template: true,
  },
];

export const DEFAULT_MODEL = 'qwen3.5:4b';
