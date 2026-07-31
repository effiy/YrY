/**
 * Per-topic meta column + form field definitions for tech-leadership topics.
 *
 * Each topic gets domain-specific table columns (rendered from row.meta) and
 * structured form fields in the detail page. Template content references
 * YiKnowledge markdown files for pre-fill.
 */
import type { MetaColumn } from "@/components/TopicListPage/index.vue";
import type { MetaField } from "@/components/TopicDetailPage/index.vue";

export interface TopicMetaSchema {
  metaColumns: MetaColumn[];
  metaFields: MetaField[];
  templateContent?: string;
}

// ── Shared options ──────────────────────────────────────────────────────────

const SEVERITY_P = [
  { label: "P0 — Critical", value: "p0" },
  { label: "P1 — High", value: "p1" },
  { label: "P2 — Medium", value: "p2" },
  { label: "P3 — Low", value: "p3" }
];

const PROBABILITY_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

const IMPACT_OPTIONS = [
  { label: "Critical", value: "critical" },
  { label: "Major", value: "major" },
  { label: "Minor", value: "minor" }
];

const STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" }
];

const MATURITY_LEVELS = [
  { label: "L1 — Initial / Ad-hoc", value: "l1" },
  { label: "L2 — Managed / Repeatable", value: "l2" },
  { label: "L3 — Defined / Standardised", value: "l3" },
  { label: "L4 — Measured / Quantitatively Managed", value: "l4" },
  { label: "L5 — Optimising", value: "l5" }
];

// ── Tag type helpers ────────────────────────────────────────────────────────

function severityTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { p0: "danger", p1: "warning", p2: "info", p3: "" };
  return (m[v] || "") as any;
}

function riskTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { high: "danger", medium: "warning", low: "info" };
  return (m[v] || "") as any;
}

function statusTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = {
    open: "warning", in_progress: "primary", resolved: "success", closed: "info",
    proposed: "info", accepted: "success", deprecated: "warning", superseded: "",
    draft: "", evaluating: "warning", decided: "success", deferred: "info",
    planned: "info", delivered: "success"
  };
  return (m[v] || "") as any;
}

// ── Tech-leadership topic schemas ───────────────────────────────────────────

export const tlrMetaSchemas: Record<string, TopicMetaSchema> = {

  // ── Architecture Decision Records ──────────────────────────────────────
  "adr-review": {
    metaColumns: [
      { key: "adr_number", label: "ADR #", width: 90 },
      {
        key: "status",
        label: "Status",
        width: 120,
        enum: [
          { label: "Proposed", value: "proposed" },
          { label: "Accepted", value: "accepted" },
          { label: "Deprecated", value: "deprecated" },
          { label: "Superseded", value: "superseded" }
        ],
        tagTypeFn: statusTag
      },
      { key: "decider", label: "Decider", width: 130 }
    ],
    metaFields: [
      { key: "adr_number", label: "ADR Number", type: "input", placeholder: "e.g. ADR-007" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Proposed", value: "proposed" },
          { label: "Accepted", value: "accepted" },
          { label: "Deprecated", value: "deprecated" },
          { label: "Superseded", value: "superseded" }
        ],
        required: true
      },
      { key: "decider", label: "Decider", type: "input", placeholder: "e.g. Arch Group + FE Lead" },
      { key: "decision_date", label: "Decision Date", type: "date" },
      { key: "supersedes", label: "Supersedes", type: "input", placeholder: "e.g. ADR-003" }
    ]
  },

  // ── Tech Selection Evaluation ───────────────────────────────────────────
  "tech-selection": {
    metaColumns: [
      { key: "capability", label: "Capability", minWidth: 180 },
      {
        key: "status",
        label: "Status",
        width: 100,
        enum: [
          { label: "Draft", value: "draft" },
          { label: "Evaluating", value: "evaluating" },
          { label: "Decided", value: "decided" },
          { label: "Deferred", value: "deferred" }
        ],
        tagTypeFn: statusTag
      },
      { key: "evaluator", label: "Evaluator", width: 120 }
    ],
    metaFields: [
      { key: "capability", label: "Capability", type: "input", placeholder: "e.g. Frontend Build Tool", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Draft", value: "draft" },
          { label: "Evaluating", value: "evaluating" },
          { label: "Decided", value: "decided" },
          { label: "Deferred", value: "deferred" }
        ],
        required: true
      },
      { key: "evaluator", label: "Evaluator", type: "input", placeholder: "e.g. FE Lead" },
      { key: "candidates", label: "Candidates", type: "textarea", rows: 2, placeholder: "e.g. Rsbuild, Webpack, Vite, Turbopack" },
      { key: "conclusion", label: "Conclusion", type: "textarea", rows: 2, placeholder: "Recommendation + rationale" },
      { key: "adr_ref", label: "ADR Reference", type: "input", placeholder: "e.g. ADR-007" }
    ]
  },

  // ── Tech Debt Inventory ─────────────────────────────────────────────────
  "tech-debt": {
    metaColumns: [
      {
        key: "domain",
        label: "Domain",
        width: 120,
        enum: [
          { label: "Code", value: "code" },
          { label: "Test", value: "test" },
          { label: "Architecture", value: "arch" },
          { label: "Dependency", value: "dependency" },
          { label: "Data", value: "data" },
          { label: "Docs", value: "docs" },
          { label: "Deploy", value: "deploy" },
          { label: "Monitoring", value: "monitoring" }
        ]
      },
      {
        key: "severity",
        label: "Severity",
        width: 100,
        enum: [
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" }
        ],
        tagTypeFn: riskTag
      },
      { key: "repayment_cost", label: "Repayment", width: 90 }
    ],
    metaFields: [
      {
        key: "domain",
        label: "Domain",
        type: "select",
        options: [
          { label: "Code", value: "code" },
          { label: "Test", value: "test" },
          { label: "Architecture", value: "arch" },
          { label: "Dependency", value: "dependency" },
          { label: "Data", value: "data" },
          { label: "Documentation", value: "docs" },
          { label: "Deployment", value: "deploy" },
          { label: "Monitoring / Observability", value: "monitoring" }
        ],
        required: true
      },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: [
          { label: "High — blocks daily development", value: "high" },
          { label: "Medium — affects specific modules", value: "medium" },
          { label: "Low — cosmetic, not urgent", value: "low" }
        ],
        required: true
      },
      { key: "interest_rate", label: "Interest Rate (person-days/mo)", type: "input", placeholder: "e.g. 2" },
      { key: "repayment_cost", label: "Repayment Cost (person-days)", type: "input", placeholder: "e.g. 8" }
    ]
  },

  // ── Risk Register ───────────────────────────────────────────────────────
  "risk-register": {
    metaColumns: [
      {
        key: "probability",
        label: "Prob.",
        width: 80,
        enum: PROBABILITY_OPTIONS
      },
      {
        key: "impact",
        label: "Impact",
        width: 90,
        enum: IMPACT_OPTIONS
      },
      {
        key: "status",
        label: "Status",
        width: 100,
        enum: STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "owner", label: "Owner", width: 110 }
    ],
    metaFields: [
      {
        key: "probability",
        label: "Probability",
        type: "select",
        options: PROBABILITY_OPTIONS,
        required: true
      },
      {
        key: "impact",
        label: "Impact",
        type: "select",
        options: IMPACT_OPTIONS,
        required: true
      },
      { key: "category", label: "Category", type: "input", placeholder: "e.g. Security, Vendor, Schedule" },
      { key: "mitigation", label: "Mitigation", type: "textarea", rows: 2, placeholder: "What we're doing to reduce probability/impact" },
      { key: "contingency", label: "Contingency", type: "textarea", rows: 2, placeholder: "Plan B if the risk materialises" },
      { key: "owner", label: "Owner", type: "input", placeholder: "e.g. FE Lead" },
      { key: "review_date", label: "Next Review Date", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
        required: true
      }
    ]
  },

  // ── Postmortem ──────────────────────────────────────────────────────────
  postmortem: {
    metaColumns: [
      { key: "incident_date", label: "Date", width: 120 },
      {
        key: "severity",
        label: "Severity",
        width: 80,
        enum: SEVERITY_P,
        tagTypeFn: severityTag
      },
      { key: "duration", label: "Duration", width: 110 }
    ],
    metaFields: [
      { key: "incident_date", label: "Incident Date", type: "date", required: true },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: SEVERITY_P,
        required: true
      },
      { key: "duration_minutes", label: "Duration (minutes)", type: "number", min: 0 },
      { key: "detection_method", label: "Detection Method", type: "input", placeholder: "e.g. PagerDuty alert, user report" }
    ]
  },

  // ── Oncall Handover ─────────────────────────────────────────────────────
  "oncall-handover": {
    metaColumns: [
      { key: "shift_period", label: "Shift", width: 160 },
      { key: "from", label: "From", width: 110 },
      { key: "to", label: "To", width: 110 }
    ],
    metaFields: [
      { key: "shift_period", label: "Shift Period", type: "input", placeholder: "e.g. 2026-W31", required: true },
      { key: "from_engineer", label: "From Engineer", type: "input", placeholder: "e.g. Alice" },
      { key: "to_engineer", label: "To Engineer", type: "input", placeholder: "e.g. Bob" },
      { key: "ongoing_incidents", label: "Ongoing Incidents", type: "number", min: 0 },
      { key: "pending_alerts", label: "Pending Alerts", type: "number", min: 0 }
    ]
  },

  // ── Org Diagnose ────────────────────────────────────────────────────────
  "org-diagnose": {
    metaColumns: [
      { key: "team", label: "Team", width: 130 },
      {
        key: "dimension",
        label: "Dimension",
        width: 120,
        enum: [
          { label: "Delivery", value: "delivery" },
          { label: "Quality", value: "quality" },
          { label: "Collaboration", value: "collab" },
          { label: "Tooling", value: "tooling" },
          { label: "Knowledge", value: "knowledge" }
        ]
      },
      {
        key: "maturity_level",
        label: "Level",
        width: 70,
        enum: MATURITY_LEVELS
      }
    ],
    metaFields: [
      { key: "team", label: "Team", type: "input", placeholder: "e.g. Frontend Squad", required: true },
      {
        key: "dimension",
        label: "Dimension",
        type: "select",
        options: [
          { label: "Delivery", value: "delivery" },
          { label: "Quality", value: "quality" },
          { label: "Collaboration", value: "collab" },
          { label: "Tooling & Automation", value: "tooling" },
          { label: "Knowledge Sharing", value: "knowledge" }
        ],
        required: true
      },
      {
        key: "maturity_level",
        label: "Current Maturity",
        type: "select",
        options: MATURITY_LEVELS,
        required: true
      }
    ]
  },

  // ── Dependency Audit ────────────────────────────────────────────────────
  "dependency-audit": {
    metaColumns: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        width: 90,
        enum: [
          { label: "npm", value: "npm" },
          { label: "pip", value: "pip" },
          { label: "cargo", value: "cargo" },
          { label: "Go mod", value: "go" }
        ]
      },
      { key: "audit_date", label: "Audit Date", width: 120 },
      { key: "critical_cves", label: "Critical CVEs", width: 120 }
    ],
    metaFields: [
      {
        key: "ecosystem",
        label: "Ecosystem",
        type: "select",
        options: [
          { label: "npm / Node.js", value: "npm" },
          { label: "pip / Python", value: "pip" },
          { label: "cargo / Rust", value: "cargo" },
          { label: "Go modules", value: "go" },
          { label: "Other", value: "other" }
        ],
        required: true
      },
      { key: "audit_date", label: "Audit Date", type: "date" },
      { key: "total_deps", label: "Total Dependencies", type: "number", min: 0 },
      { key: "outdated", label: "Outdated", type: "number", min: 0 },
      { key: "vulnerable", label: "Vulnerable", type: "number", min: 0 },
      { key: "unmaintained", label: "Unmaintained", type: "number", min: 0 }
    ]
  },

  // ── Roadmap Review ──────────────────────────────────────────────────────
  "roadmap-review": {
    metaColumns: [
      { key: "quarter", label: "Quarter", width: 90 },
      { key: "initiative", label: "Initiative", minWidth: 180 },
      {
        key: "priority",
        label: "Priority",
        width: 80,
        enum: SEVERITY_P,
        tagTypeFn: severityTag
      },
      {
        key: "status",
        label: "Status",
        width: 110,
        enum: [
          { label: "Planned", value: "planned" },
          { label: "In Progress", value: "in_progress" },
          { label: "Delivered", value: "delivered" },
          { label: "Deferred", value: "deferred" }
        ],
        tagTypeFn: statusTag
      },
      { key: "owner", label: "Owner", width: 110 }
    ],
    metaFields: [
      { key: "quarter", label: "Quarter", type: "input", placeholder: "e.g. 2026 Q3", required: true },
      { key: "initiative", label: "Initiative", type: "input", placeholder: "e.g. YiVad Rsbuild Migration", required: true },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: SEVERITY_P,
        required: true
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Planned", value: "planned" },
          { label: "In Progress", value: "in_progress" },
          { label: "Delivered", value: "delivered" },
          { label: "Deferred", value: "deferred" }
        ],
        required: true
      },
      { key: "owner", label: "Owner", type: "input", placeholder: "e.g. FE Lead" }
    ]
  },

  // ── Capacity Plan ───────────────────────────────────────────────────────
  "capacity-plan": {
    metaColumns: [
      { key: "planning_period", label: "Period", width: 120 },
      { key: "system", label: "System", width: 130 },
      {
        key: "resource_type",
        label: "Resource",
        width: 110,
        enum: [
          { label: "Compute", value: "compute" },
          { label: "Memory", value: "memory" },
          { label: "Storage", value: "storage" },
          { label: "Network", value: "network" },
          { label: "GPU", value: "gpu" }
        ]
      }
    ],
    metaFields: [
      { key: "planning_period", label: "Planning Period", type: "input", placeholder: "e.g. 2026 Q3", required: true },
      { key: "system", label: "System", type: "input", placeholder: "e.g. YiAi Inference", required: true },
      {
        key: "resource_type",
        label: "Resource Type",
        type: "select",
        options: [
          { label: "Compute", value: "compute" },
          { label: "Memory", value: "memory" },
          { label: "Storage", value: "storage" },
          { label: "Network / Bandwidth", value: "network" },
          { label: "GPU", value: "gpu" }
        ],
        required: true
      },
      { key: "current_capacity", label: "Current Capacity", type: "input", placeholder: "e.g. 200 cores" },
      { key: "projected_growth_pct", label: "Projected Growth (%)", type: "number", min: 0, max: 1000 }
    ]
  },

  // ── Capacity & Cost (FinOps) ────────────────────────────────────────────
  "capacity-cost": {
    metaColumns: [
      { key: "report_period", label: "Period", width: 110 },
      { key: "system", label: "System", width: 130 },
      { key: "monthly_cost", label: "Monthly Cost", width: 120 }
    ],
    metaFields: [
      { key: "report_period", label: "Report Period", type: "input", placeholder: "e.g. 2026-07", required: true },
      { key: "system", label: "System / Service", type: "input", placeholder: "e.g. YiAi + YiVad + YiPet" },
      { key: "monthly_cost", label: "Monthly Cost (¥)", type: "number", min: 0 },
      { key: "budget_variance_pct", label: "Budget Variance (%)", type: "number" },
      { key: "compute_pct", label: "Compute (%)", type: "number", min: 0, max: 100 },
      { key: "api_pct", label: "3rd-party API (%)", type: "number", min: 0, max: 100 },
      { key: "storage_pct", label: "Storage (%)", type: "number", min: 0, max: 100 }
    ]
  },

  // ── Maturity Model ──────────────────────────────────────────────────────
  "maturity-model": {
    metaColumns: [
      {
        key: "practice_area",
        label: "Practice",
        width: 140,
        enum: [
          { label: "CI/CD", value: "ci-cd" },
          { label: "Testing", value: "testing" },
          { label: "Observability", value: "observability" },
          { label: "Security", value: "security" },
          { label: "Architecture", value: "arch" },
          { label: "Documentation", value: "docs" }
        ]
      },
      {
        key: "current_level",
        label: "Current",
        width: 80,
        enum: MATURITY_LEVELS
      },
      {
        key: "target_level",
        label: "Target",
        width: 80,
        enum: MATURITY_LEVELS
      }
    ],
    metaFields: [
      {
        key: "practice_area",
        label: "Practice Area",
        type: "select",
        options: [
          { label: "CI/CD Pipeline", value: "ci-cd" },
          { label: "Testing & Quality", value: "testing" },
          { label: "Observability", value: "observability" },
          { label: "Security", value: "security" },
          { label: "Architecture", value: "arch" },
          { label: "Documentation", value: "docs" }
        ],
        required: true
      },
      {
        key: "current_level",
        label: "Current Level",
        type: "select",
        options: MATURITY_LEVELS,
        required: true
      },
      {
        key: "target_level",
        label: "Target Level",
        type: "select",
        options: MATURITY_LEVELS,
        required: true
      }
    ]
  },

  // ── DORA Metrics ────────────────────────────────────────────────────────
  "dora-metrics": {
    metaColumns: [
      {
        key: "metric_type",
        label: "Metric",
        width: 160,
        enum: [
          { label: "Deployment Frequency", value: "deploy-freq" },
          { label: "Lead Time for Changes", value: "lead-time" },
          { label: "MTTR", value: "mttr" },
          { label: "Change Failure Rate", value: "change-fail-rate" }
        ]
      },
      { key: "current_value", label: "Current", width: 110 },
      { key: "period", label: "Period", width: 120 }
    ],
    metaFields: [
      {
        key: "metric_type",
        label: "Metric Type",
        type: "select",
        options: [
          { label: "Deployment Frequency", value: "deploy-freq" },
          { label: "Lead Time for Changes", value: "lead-time" },
          { label: "Mean Time to Restore (MTTR)", value: "mttr" },
          { label: "Change Failure Rate", value: "change-fail-rate" }
        ],
        required: true
      },
      { key: "current_value", label: "Current Value", type: "input", placeholder: "e.g. 4/day, 3h, 45min, 5%", required: true },
      { key: "target_value", label: "Target Value", type: "input", placeholder: "e.g. on-demand, <1h, <1h, <15%" },
      { key: "period", label: "Measurement Period", type: "input", placeholder: "e.g. 2026-07" },
      {
        key: "trend",
        label: "Trend",
        type: "select",
        options: [
          { label: "↑ Improving", value: "up" },
          { label: "↓ Degrading", value: "down" },
          { label: "→ Flat", value: "flat" }
        ]
      }
    ]
  }
};
