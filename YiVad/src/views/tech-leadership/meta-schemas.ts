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
      { key: "decider", label: "Decider", width: 130 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "supersedes", label: "Supersedes", type: "input", placeholder: "e.g. ADR-003" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# ADR: [Title]

## Context
[What is the problem we're solving? What constraints apply?]

## Decision
[What did we choose? Be specific: version, deployment mode, configuration.]

## Options Considered
| Option | Pros | Cons |
|--------|------|------|
| | | |

## Consequences
- **Positive:** [What improves?]
- **Negative:** [What trade-offs are we making?]

## Risk & Rollback
- **Risk:** [What could go wrong?]
- **Rollback plan:** [How would we revert?]

## Review Schedule
- **Next review:** [Date or trigger condition]

---
> References: YiKnowledge → [ADR Template](resources/templates/adr-template.md) | [ADR Summary](resources/templates/adr-summary.md)
> Related projects: YiAi · YiVad · YiPet
`
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
      { key: "evaluator", label: "Evaluator", width: 120 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "adr_ref", label: "ADR Reference", type: "input", placeholder: "e.g. ADR-007" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Tech Selection: [Capability]

## Context
[What capability are we selecting for? What problem does it solve?]

## Non-Negotiable Constraints
- [e.g. Must run on-prem, no data egress, budget < ¥X/mo, team already knows TypeScript]

## Candidates

| Candidate | Type | License | Community | Notes |
|-----------|------|---------|-----------|-------|
| | | | | |

## Evaluation Matrix (1-5 score, weighted)

| Dimension | Weight | Candidate A | Candidate B | Candidate C |
|-----------|--------|-------------|-------------|-------------|
| Performance | | | | |
| Cost (3yr TCO) | | | | |
| Ecosystem | | | | |
| Maintainability | | | | |
| Risk | | | | |
| **Weighted Total** | | | | |

## PoC Results
[Key findings from proof-of-concept testing.]

## Decision
- **Selected:** [Winner]
- **Fallback:** [Runner-up]
- **Rationale:** [Why winner over fallback]

## Review Trigger
[Condition or date to re-evaluate this decision.]

---
> References: YiKnowledge → [Tech Selection Evaluation Summary](resources/templates/tech-selection-evaluation-summary.md) | [Selection Template](resources/templates/tech-selection-evaluation-template.md) | [ADR Template](resources/templates/adr-template.md)
> Related: [YiVad Vite → Rsbuild migration](lessons/gotchas/vite-to-rsbuild-migration.md) | [YiPet React 15 → 18 migration]
`
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
      { key: "repayment_cost", label: "Repayment", width: 90 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "repayment_cost", label: "Repayment Cost (person-days)", type: "input", placeholder: "e.g. 8" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Tech Debt: [Title]

## Debt Item
[What is the suboptimal decision? When / why was it made?]

## Classification
- **Type:** [Deliberate / Accidental / Reckless]
- **Domain:** [Code / Test / Architecture / Dependency / Data / Docs / Deploy / Monitoring]
- **Severity:** [High — blocks daily dev / Medium — affects specific modules / Low — cosmetic]

## Impact
- **Interest rate:** [person-days lost per month due to this debt]
- **Affected modules:** [Which parts of the codebase?]
- **Downstream effects:** [Does this slow onboarding? Increase bug rate? Block features?]

## Repayment Plan
- **Estimated cost:** [person-days to repay]
- **Approach:** [Incremental via strangler fig / Big-bang migration / Opportunistic]
- **Target quarter:** [e.g. 2026 Q3]
- **Dependencies:** [Any prerequisite work?]

## Verification
[How do we confirm the debt is repaid? What metric improves?]

---
> References: YiKnowledge → [Tech Debt Inventory Summary](tech/infra/tech-debt-inventory-summary.md) | [Inventory Template](tech/infra/tech-debt-inventory-template.md) | [Quarterly Repayment Process](work/processes/quarterly-tech-debt-process.md)
> Known debts: YiAi lacks tests + linter | YiPet has dual ApiClient implementations | YiVad RSS body in MongoDB before offload
`
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
      { key: "owner", label: "Owner", width: 110 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Risk: [Title]

## Risk Description
[What could go wrong? Be specific about the scenario.]

## Assessment
- **Probability:** [High / Medium / Low]
- **Impact:** [Critical / Major / Minor]
- **Category:** [e.g. Security, Vendor, Schedule, Data Loss, Compliance]
- **Exposure:** Probability × Impact = [qualitative assessment]

## Mitigation
[What are we doing now to reduce the probability or impact?]

## Contingency
[Plan B if the risk materializes. Who does what?]

## Tracking
- **Owner:** [Name / role]
- **Next review:** [Date]
- **Trigger signal:** [What early warning would indicate this risk is increasing?]

## Status
[Open / In Progress / Resolved / Closed]

---
> References: YiKnowledge → [Dependency Upgrade Process](work/processes/dependency-upgrade-process.md) | [Quarterly Security Audit](work/processes/quarterly-security-audit-process.md) | [Data Compliance](work/processes/data-compliance-process.md)
> Yi family risks: YiAi auth disabled by default | YiAi no test/lint coverage | macOS FSEvents silent drop → polling fallback
`
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
      { key: "duration", label: "Duration", width: 110 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "detection_method", label: "Detection Method", type: "input", placeholder: "e.g. PagerDuty alert, user report" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Postmortem: [Incident Title]

## Incident Summary
- **Date:** [YYYY-MM-DD]
- **Severity:** [P0 / P1 / P2]
- **Duration:** [minutes]
- **Impact:** [Users affected, revenue impact, data loss]
- **Detection:** [How was it discovered?]

## Timeline (UTC)
| Time | Event |
|------|-------|
| HH:MM | [Discovery] |
| HH:MM | [Response began] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Service restored] |

## Root Cause Chain (5-Why)
1. **Why** did [symptom] happen? → [answer]
2. **Why** [answer]? → [answer]
3. **Why** [answer]? → [answer]
4. **Why** [answer]? → [answer]
5. **Why** [answer]? → **[ROOT CAUSE]**

## Contributing Factors
- [Monitoring gap / Process gap / Human error / External dependency]

## What Went Well
- [Actions that limited damage or sped recovery]

## What Went Wrong
- [Actions that delayed recovery or worsened impact]

## Where We Got Lucky
- [Factors outside our control that helped]

## Action Items
| # | Action | Owner | Due | Priority |
|---|--------|-------|-----|----------|
| 1 | | | | P0/P1/P2 |

---
> References: YiKnowledge → [Incident Postmortem Summary](lessons/failures/incident-postmortem-summary.md) | [Postmortem Template](lessons/failures/incident-postmortem-template.md) | [Incident Response Process](work/processes/incident-response-process.md)
> Blameless principle: ask "how did the system allow this?" not "who caused this?"
`
  },

  // ── Oncall Handover ─────────────────────────────────────────────────────
  "oncall-handover": {
    metaColumns: [
      { key: "shift_period", label: "Shift", width: 160 },
      { key: "from", label: "From", width: 110 },
      { key: "to", label: "To", width: 110 },
      { key: "project", label: "Project", width: 100, clickable: true }
    ],
    metaFields: [
      { key: "shift_period", label: "Shift Period", type: "input", placeholder: "e.g. 2026-W31", required: true },
      { key: "from_engineer", label: "From Engineer", type: "input", placeholder: "e.g. Alice" },
      { key: "to_engineer", label: "To Engineer", type: "input", placeholder: "e.g. Bob" },
      { key: "ongoing_incidents", label: "Ongoing Incidents", type: "number", min: 0 },
      { key: "pending_alerts", label: "Pending Alerts", type: "number", min: 0 },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Oncall Handover: [Shift Period]

## Shift Info
- **Period:** [e.g. 2026-W31]
- **From:** [Outgoing engineer]
- **To:** [Incoming engineer]
- **Handover date:** [YYYY-MM-DD]

## Ongoing Incidents
| # | Incident | Severity | Status | Next Step |
|---|----------|----------|--------|-----------|
| 1 | | | | |

## Pending Alerts / Known Issues
- [Alert that triggered but hasn't been fully resolved]
- [Known flaky alert to watch]

## Recent Changes (last 7 days)
- [Deploy / config change / migration that could cause issues]

## Monitoring Dashboard
- [Link to key dashboards]
- [Any unusual trends to watch]

## Escalation Contacts
- **Secondary oncall:** [Name]
- **Service owners:** [Name — service]
- **Manager:** [Name]

---
> References: YiKnowledge → [Oncall Process](work/processes/oncall-rotation-process.md) | [Monitoring Governance](work/processes/monitoring-governance-process.md) | [Incident Response](work/processes/incident-response-process.md)
`
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
      },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Org Diagnose: [Team] — [Dimension]

## Assessment Context
- **Team:** [Name / scope]
- **Dimension:** [Delivery / Quality / Collaboration / Tooling & Automation / Knowledge Sharing]
- **Current maturity:** [L1 — Initial / L2 — Managed / L3 — Defined / L4 — Measured / L5 — Optimising]

## Observations
[What evidence supports this maturity level? What does the team do well? What's missing?]

## Gap Analysis
| Capability | Current State | Desired State | Gap |
|------------|---------------|---------------|-----|
| | | | |

## Improvement Recommendations
1. **[Action]** — [Rationale, expected impact]
2. **[Action]** — [Rationale, expected impact]

## Related Metrics
- [DORA metrics, delivery lead time, bug rate, etc.]

---
> References: YiKnowledge → [Org Productivity Diagnosis Summary](work/processes/org-productivity-diagnosis-summary.md) | [Diagnosis Template](work/processes/org-productivity-diagnosis-template.md) | [Team Topologies](work/processes/org-productivity-diagnosis-summary.md)
> Yi family teams: YiAi (backend) | YiVad (frontend) | YiPet (extension)
`
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
      { key: "critical_cves", label: "Critical CVEs", width: 120 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "unmaintained", label: "Unmaintained", type: "number", min: 0 },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Dependency Audit: [Ecosystem] — [Date]

## Audit Summary
- **Ecosystem:** [npm / pip / cargo / Go modules / Other]
- **Audit date:** [YYYY-MM-DD]
- **Tool used:** [npm audit / pip-audit / cargo-audit / govulncheck]
- **Total dependencies:** [N]

## Findings

### Critical CVEs
| Package | Installed | Patched | CVE | Severity | Action |
|---------|-----------|---------|-----|----------|--------|
| | | | | | |

### Outdated (major version behind)
| Package | Current | Latest | Breaking changes | Migration effort |
|---------|---------|--------|------------------|------------------|
| | | | | |

### Unmaintained / Deprecated
| Package | Last release | Risk | Replacement |
|---------|-------------|------|-------------|
| | | | |

## Recommendations
1. **[Action]** — [Priority / timeline]

---
> References: YiKnowledge → [Dependency Upgrade Process](work/processes/dependency-upgrade-process.md) | [Quarterly Security Audit](work/processes/quarterly-security-audit-process.md)
> Yi family: YiVad (npm/Element Plus/Rsbuild) | YiPet (npm/React/Ant Design) | YiAi (pip/FastAPI/Motor/llama_index)
`
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
      { key: "owner", label: "Owner", width: 110 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "owner", label: "Owner", type: "input", placeholder: "e.g. FE Lead" },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Roadmap Review: [Quarter]

## Initiative
[Brief description of the initiative.]

## Investment Distribution (this quarter)

| Domain | Investment (person-months) | vs Last Q | Strategic Alignment (1-5) |
|--------|---------------------------|-----------|---------------------------|
| Platform (inference / gateway / observability) | | | |
| Middleware (vector DB / message / cache) | | | |
| Business (BRD / chat / code review) | | | |
| Infrastructure (deploy / monitoring / security) | | | |

## Milestone Alignment
| Milestone | Target Date | Status | Blocker? |
|-----------|-------------|--------|----------|
| | | | |

## Risks & Blockers
- [Risk / dependency / resource gap]

## Decision
- **Keep:** [Initiatives to continue]
- **Adjust:** [Initiatives to modify]
- **Drop:** [Initiatives to deprioritize or stop]

## Next Quarter Preview
[Key focus areas for next quarter.]

---
> References: YiKnowledge → [Roadmap Review Summary](work/processes/tech-roadmap-review-summary.md) | [Review Template](work/processes/tech-roadmap-review-template.md)
> Related: [OKR Design](methodology/pm-frameworks/okr-design-summary.md) | [Now/Next/Later](product/strategy/now-next-later-roadmap-summary.md)
`
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
      },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      { key: "projected_growth_pct", label: "Projected Growth (%)", type: "number", min: 0, max: 1000 },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Capacity Plan: [System] — [Period]

## Baseline
- **System:** [Service / cluster name]
- **Resource:** [Compute / Memory / Storage / Network / GPU]
- **Planning period:** [e.g. 2026 Q3]

## Current State
- **Current capacity:** [e.g. 200 cores, 800 GB]
- **Peak utilization:** [% at peak]
- **Average utilization:** [% avg]
- **Bottleneck resource:** [CPU / IO / GPU / Memory]

## Projected Demand
- **Growth driver:** [New feature / user growth / data growth]
- **Projected growth:** [% over planning period]
- **Required capacity:** [current × (1 + growth%) × safety factor 1.5]
- **Headroom:** [Required − Current]

## Scaling Triggers
| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU > 70% | 5 min | Auto-scale |
| GPU > 80% | 5 min | Scale or throttle |

## Recommendations
1. **[Action]** — [Timeline / cost estimate]

---
> References: YiKnowledge → [Capacity & Cost Summary](tech/infra/capacity-and-cost-summary.md) | [Capacity Planning Process](work/processes/capacity-planning-process.md)
> Yi family services: YiAi (Ollama inference, GPU-bound) | MongoDB (memory-bound) | OSS (storage-bound)
`
  },

  // ── Capacity & Cost (FinOps) ────────────────────────────────────────────
  "capacity-cost": {
    metaColumns: [
      { key: "report_period", label: "Period", width: 110 },
      { key: "system", label: "System", width: 130 },
      { key: "monthly_cost", label: "Monthly Cost", width: 120 },
      { key: "project", label: "Project", width: 100, clickable: true }
    ],
    metaFields: [
      { key: "report_period", label: "Report Period", type: "input", placeholder: "e.g. 2026-07", required: true },
      { key: "system", label: "System / Service", type: "input", placeholder: "e.g. YiAi + YiVad + YiPet" },
      { key: "monthly_cost", label: "Monthly Cost (¥)", type: "number", min: 0 },
      { key: "budget_variance_pct", label: "Budget Variance (%)", type: "number" },
      { key: "compute_pct", label: "Compute (%)", type: "number", min: 0, max: 100 },
      { key: "api_pct", label: "3rd-party API (%)", type: "number", min: 0, max: 100 },
      { key: "storage_pct", label: "Storage (%)", type: "number", min: 0, max: 100 },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# FinOps Report: [System] — [Period]

## Overview
- **Period:** [e.g. 2026-07]
- **System / Service:** [e.g. YiAi + YiVad + YiPet]
- **Monthly cost:** ¥[amount]
- **Budget:** ¥[amount]
- **Variance:** [±% vs budget]

## Cost Breakdown
| Category | Cost (¥) | % of Total | vs Last Month |
|----------|----------|------------|---------------|
| GPU Inference | | | |
| CPU / Memory | | | |
| Storage | | | |
| Network | | | |
| 3rd-party API | | | |
| **Total** | | 100% | |

## Unit Economics
- **Cost per chat request:** ¥[amount]
- **Cost per RAG query:** ¥[amount]
- **Cost per GB stored:** ¥[amount]

## Optimization Opportunities
| # | Opportunity | Est. Monthly Saving | Effort | Priority |
|---|-------------|--------------------|--------|----------|
| 1 | | | | |
| 2 | | | | |

## Health Indicators
- CPU utilization: [%] (target: 50-80%)
- GPU utilization: [%] (target: 60-90%)
- Cache hit rate: [%] (target: >50%)

---
> References: YiKnowledge → [Capacity & Cost Summary](tech/infra/capacity-and-cost-summary.md) | [FinOps Template](tech/infra/capacity-and-cost-template.md)
> Yi family cost drivers: Ollama GPU inference (~50%) | MongoDB Atlas / self-hosted | OSS storage
`
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
      },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Maturity Assessment: [Practice Area]

## Practice Area
[CI/CD / Testing & Quality / Observability / Security / Architecture / Documentation]

## Current State
- **Current level:** [L1 / L2 / L3 / L4 / L5]
- **Evidence:** [What practices are in place today?]

## Target State
- **Target level:** [L1 / L2 / L3 / L4 / L5]
- **Rationale:** [Why this target? Business need? Industry benchmark?]

## Gap Analysis
| Capability | L1 | L2 | L3 | L4 | L5 | Current | Target | Gap |
|------------|----|----|----|----|----|---------|--------|-----|
| | | | | | | | | |

## Improvement Plan
| # | Action | From → To | Effort | Timeline | Owner |
|---|--------|-----------|--------|----------|-------|
| 1 | | | | | |
| 2 | | | | | |

## Progress Tracking
- **Assessment date:** [YYYY-MM-DD]
- **Next review:** [YYYY-MM-DD]

---
> References: YiKnowledge → [DORA Metrics](work/processes/engineering-productivity-metrics-summary.md) | [Quarterly Tech Debt Process](work/processes/quarterly-tech-debt-process.md)
> Maturity levels: L1=Ad-hoc | L2=Managed | L3=Defined | L4=Measured | L5=Optimising
`
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
      { key: "period", label: "Period", width: 120 },
      { key: "project", label: "Project", width: 100, clickable: true }
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
      },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# DORA Metric: [Metric Type]

## Measurement
- **Metric:** [Deployment Frequency / Lead Time for Changes / MTTR / Change Failure Rate]
- **Period:** [e.g. 2026-07]
- **Current value:** [e.g. 4/day, 3h, 45min, 5%]
- **Target value:** [e.g. on-demand, <1h, <1h, <15%]
- **Elite benchmark:** [On-demand / <1h / <1h / 0-15%]

## Trend
[↑ Improving / ↓ Degrading / → Flat]

## Contributing Factors
- [What practices / tooling / process changes explain the current value?]

## Lead Time Breakdown (if applicable)
| Phase | Duration | % of Total | Bottleneck? |
|-------|----------|------------|-------------|
| Idea → Dev start | | | |
| Dev → PR merged | | | |
| PR merged → Deploy | | | |
| **Total Lead Time** | | 100% | |

## Improvement Actions
| # | Action | Expected Impact | Timeline |
|---|--------|----------------|----------|
| 1 | | | |
| 2 | | | |

---
> References: YiKnowledge → [Engineering Productivity Metrics Summary](work/processes/engineering-productivity-metrics-summary.md) | [Metrics Template](work/processes/engineering-productivity-metrics-template.md)
> Remember: all 4 DORA metrics must be tracked together. High deploy frequency + high failure rate = not real velocity.
> Yi family: YiVad (SPA, manual deploy) | YiPet (Chrome extension, review-gated release) | YiAi (server, no CI/CD pipeline)
`,
  },

  // ── Mentorship & growth ──────────────────────────────────────────────────
  "mentorship-growth": {
    metaColumns: [
      { key: "engineer", label: "Engineer", minWidth: 160 },
      { key: "level", label: "Level", width: 100 },
      { key: "track", label: "Track", width: 140 },
      { key: "current_quarter_focus", label: "Quarter Focus", minWidth: 200 },
      { key: "growth_area", label: "Growth Area", width: 160 },
      { key: "last_review_at", label: "Last Review", width: 140 },
      { key: "owner", label: "Mentor", width: 120 },
      { key: "project", label: "Project", width: 100, clickable: true }
    ],
    metaFields: [
      { key: "engineer", label: "Engineer", type: "input", required: true, colSpan: 12, placeholder: "Name" },
      { key: "level", label: "Level", type: "input", colSpan: 6, placeholder: "e.g. L3, Senior" },
      { key: "track", label: "Track", type: "select", colSpan: 6, options: [
        { label: "Individual contributor (IC)", value: "ic" },
        { label: "Tech lead", value: "tech-lead" },
        { label: "Engineering management", value: "em" },
        { label: "Hybrid", value: "hybrid" }
      ] },
      { key: "mentor", label: "Mentor", type: "input", required: true, colSpan: 12, placeholder: "Senior engineer / manager accountable for growth" },
      { key: "team", label: "Team", type: "input", colSpan: 12 },
      { key: "current_quarter_focus", label: "Current Quarter Focus", type: "textarea", required: true, colSpan: 24, placeholder: "What this engineer is intentionally growing this quarter" },
      { key: "growth_area", label: "Growth Area", type: "select", required: true, colSpan: 8, options: [
        { label: "Technical depth", value: "depth" },
        { label: "Technical breadth", value: "breadth" },
        { label: "Scope / autonomy", value: "scope" },
        { label: "Leadership / influence", value: "leadership" },
        { label: "Cross-team collaboration", value: "collaboration" },
        { label: "Execution / delivery", value: "execution" },
        { label: "Communication", value: "communication" },
        { label: "Domain knowledge", value: "domain" }
      ] },
      { key: "aspiration", label: "Career Aspiration (12-18mo)", type: "textarea", colSpan: 24, placeholder: "What the engineer aspires to — including roles, scope, technologies" },
      { key: "strengths", label: "Strengths", type: "textarea", colSpan: 24, placeholder: "What they do better than peers — concrete examples" },
      { key: "growth_edges", label: "Growth Edges", type: "textarea", colSpan: 24, placeholder: "Where they're stretched — concrete examples" },
      { key: "stretch_opportunities", label: "Stretch Opportunities", type: "textarea", colSpan: 24, placeholder: "Projects / roles that will move them forward" },
      { key: "support_needed", label: "Support Needed", type: "textarea", colSpan: 24, placeholder: "Mentoring, training, sponsorship, shield from noise" },
      { key: "last_review_at", label: "Last Review At", type: "date", colSpan: 12 },
      { key: "next_review_at", label: "Next Review At", type: "date", colSpan: 12 },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — growth plateau, manager vs mentor split, sponsorship gaps." },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Mentorship & Growth — [engineer]

## Profile
- Level: [level] · Track: [track] · Team: [team]
- Mentor: [mentor]

## Current Quarter Focus
[current_quarter_focus]

## Growth Area
[growth_area]

## Aspiration (12-18 months)
[aspiration]

## Strengths
[strengths]

## Growth Edges
[growth_edges]

## Stretch Opportunities
[stretch_opportunities]

## Support Needed
[support_needed]

## Cadence
- Last review: [last_review_at] · Next: [next_review_at]

## Notes
[notes]`
  },

  // ── Project handoffs ─────────────────────────────────────────────────────
  "project-handoffs": {
    metaColumns: [
      { key: "handoff_id", label: "Handoff ID", width: 140 },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "from", label: "From", width: 140 },
      { key: "to", label: "To", width: 140 },
      { key: "status", label: "Status", width: 140, tagTypeFn: statusTag },
      { key: "planned_at", label: "Planned", width: 140 },
      { key: "completed_at", label: "Completed", width: 140 },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "handoff_id", label: "Handoff ID", type: "input", required: true, colSpan: 8, placeholder: "e.g. HO-2026-001" },
      { key: "project", label: "Project", type: "input", required: true, colSpan: 16 },
      { key: "from", label: "From", type: "input", required: true, colSpan: 8, placeholder: "Outgoing owner / team" },
      { key: "to", label: "To", type: "input", required: true, colSpan: 8, placeholder: "Incoming owner / team" },
      { key: "owner", label: "Handback Coordinator", type: "input", required: true, colSpan: 8, placeholder: "Person accountable for handoff" },
      { key: "status", label: "Status", type: "select", required: true, colSpan: 8, options: [
        { label: "Drafted", value: "draft" },
        { label: "In progress", value: "in_progress" },
        { label: "Knowledge transfer done", value: "kt-done" },
        { label: "Completed", value: "delivered" },
        { label: "Deferred", value: "deferred" }
      ] },
      { key: "planned_at", label: "Planned Handoff Date", type: "date", colSpan: 12 },
      { key: "completed_at", label: "Completed At", type: "date", colSpan: 12 },
      { key: "scope", label: "Scope", type: "textarea", required: true, colSpan: 24, placeholder: "What is being handed off — code, on-call, ownership, roadmap, vendor relationship" },
      { key: "artifacts", label: "Artifacts", type: "textarea", colSpan: 24, placeholder: "Repos, dashboards, docs, runbooks, ADRs, secrets" },
      { key: "open_work", label: "Open Work / WIP", type: "textarea", colSpan: 24, placeholder: "In-flight PRs / branches / tickets with status" },
      { key: "known_issues", label: "Known Issues / Landmines", type: "textarea", colSpan: 24, placeholder: "Things the incoming owner must know" },
      { key: "stakeholders", label: "Stakeholders to Notify", type: "textarea", colSpan: 24, placeholder: "Internal + external parties" },
      { key: "kt_plan", label: "Knowledge Transfer Plan", type: "textarea", colSpan: 24, placeholder: "Pairing sessions, shadow on-call, code walkthroughs" },
      { key: "acceptance_criteria", label: "Acceptance Criteria", type: "textarea", colSpan: 24, placeholder: "How we know the handoff is complete" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — hidden context, tribal knowledge, undocumented consumers, midnight pages." }
    ],
    templateContent: `# Project Handoff — [handoff_id]

## Parties
- Project: [project]
- From: [from] → To: [to]
- Coordinator: [owner]
- Status: [status]

## Scope
[scope]

## Artifacts
[artifacts]

## Open Work / WIP
[open_work]

## Known Issues / Landmines
[known_issues]

## Stakeholders to Notify
[stakeholders]

## Knowledge Transfer Plan
[kt_plan]

## Acceptance Criteria
[acceptance_criteria]

## Timing
- Planned: [planned_at] · Completed: [completed_at]

## Notes
[notes]`
  },

  // ── Dependency adoption ───────────────────────────────────────────────────
  "dependency-adoption": {
    metaColumns: [
      { key: "dependency", label: "Dependency", minWidth: 200 },
      { key: "category", label: "Category", width: 160 },
      { key: "phase", label: "Phase", width: 160, tagTypeFn: statusTag },
      { key: "risk", label: "Risk", width: 100, enum: [
        { label: "Critical", value: "critical" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" }
      ], tagTypeFn: riskTag },
      { key: "owner", label: "Owner", width: 120 },
      { key: "decided_at", label: "Decided", width: 140 },
      { key: "updated_at", label: "Updated", width: 140 },
      { key: "project", label: "Project", width: 100, clickable: true }
    ],
    metaFields: [
      { key: "dependency", label: "Dependency", type: "input", required: true, colSpan: 16, placeholder: "Package / service / framework name + version" },
      { key: "category", label: "Category", type: "select", required: true, colSpan: 8, options: [
        { label: "Library / framework", value: "library" },
        { label: "Service / SaaS", value: "saas" },
        { label: "Infrastructure / runtime", value: "infra" },
        { label: "Tooling (build / lint / format)", value: "tooling" },
        { label: "Database / storage", value: "storage" },
        { label: "Observability vendor", value: "observability" }
      ] },
      { key: "phase", label: "Phase", type: "select", required: true, colSpan: 8, options: [
        { label: "Proposed", value: "proposed" },
        { label: "Evaluating", value: "evaluating" },
        { label: "Decided", value: "decided" },
        { label: "Adopting", value: "in_progress" },
        { label: "Adopted", value: "delivered" },
        { label: "Deferred", value: "deferred" },
        { label: "Rejected", value: "deprecated" }
      ] },
      { key: "owner", label: "Owner", type: "input", required: true, colSpan: 8 },
      { key: "team", label: "Team", type: "input", colSpan: 8 },
      { key: "decided_by", label: "Decided By", type: "input", colSpan: 8, placeholder: "e.g. Architecture Council" },
      { key: "use_case", label: "Use Case", type: "textarea", required: true, colSpan: 24, placeholder: "What problem this dependency solves + why now" },
      { key: "alternatives", label: "Alternatives Considered", type: "textarea", colSpan: 24, placeholder: "Build vs buy vs OSS; other vendors; why this won" },
      { key: "scoring", label: "Scoring / Decision Matrix", type: "textarea", colSpan: 24, placeholder: "Weighted criteria — maintainability, security, cost, lock-in, community" },
      { key: "risk_assessment", label: "Risk Assessment", type: "textarea", colSpan: 24, placeholder: "Supply chain, license, CVE history, bus factor, lock-in" },
      { key: "poc_link", label: "POC Link", type: "input", colSpan: 12, placeholder: "Link to POC / spike results" },
      { key: "security_review_link", label: "Security Review", type: "input", colSpan: 12, placeholder: "TPRM / SIG / scan results" },
      { key: "rollout_plan", label: "Rollout Plan", type: "textarea", colSpan: 24, placeholder: "Pilot → wave → fleet-wide; feature flag if needed" },
      { key: "exit_plan", label: "Exit Plan", type: "textarea", colSpan: 24, placeholder: "How we would leave if it goes sideways — abstraction, dual-write, replace" },
      { key: "decided_at", label: "Decided At", type: "date", colSpan: 12 },
      { key: "adopted_at", label: "Adopted At", type: "date", colSpan: 12 },
      { key: "updated_at", label: "Last Updated", type: "date", colSpan: 12 },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — sunk cost, license cliffs, surprise true-ups, vendor lock-in delay." },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Dependency Adoption — [dependency]

## Profile
- Category: [category] · Phase: [phase] · Owner: [owner]
- Decided by: [decided_by] on [decided_at]

## Use Case
[use_case]

## Alternatives Considered
[alternatives]

## Scoring
[scoring]

## Risk Assessment
[risk_assessment]

## Reviews
- POC: [poc_link]
- Security: [security_review_link]

## Rollout & Exit
- Rollout: [rollout_plan]
- Exit: [exit_plan]

## Timing
- Decided: [decided_at] · Adopted: [adopted_at] · Updated: [updated_at]

## Notes
[notes]`
  },

  // ── Project bootstrap ─────────────────────────────────────────────────────
  "project-bootstrap": {
    metaColumns: [
      { key: "project_name", label: "Project", minWidth: 180 },
      { key: "stack", label: "Stack", width: 200 },
      { key: "phase", label: "Phase", width: 160, tagTypeFn: statusTag },
      { key: "owner", label: "Owner", width: 120 },
      { key: "target_ga_at", label: "Target GA", width: 140 },
      { key: "updated_at", label: "Updated", width: 140 },
      { key: "project", label: "Cross Project", width: 100, clickable: true }
    ],
    metaFields: [
      { key: "project_name", label: "Project Name", type: "input", required: true, colSpan: 12 },
      { key: "stack", label: "Stack", type: "input", required: true, colSpan: 12, placeholder: "Languages / frameworks / services" },
      { key: "phase", label: "Phase", type: "select", required: true, colSpan: 8, options: [
        { label: "Charter", value: "proposed" },
        { label: "Repo + CI scaffold", value: "evaluating" },
        { label: "Skeleton app runs", value: "decided" },
        { label: "First feature shipped", value: "in_progress" },
        { label: "GA / 1.0", value: "delivered" },
        { label: "Deferred", value: "deferred" },
        { label: "Cancelled", value: "deprecated" }
      ] },
      { key: "owner", label: "Owner", type: "input", required: true, colSpan: 8 },
      { key: "team", label: "Team", type: "input", colSpan: 8 },
      { key: "target_ga_at", label: "Target GA Date", type: "date", colSpan: 12 },
      { key: "first_release_at", label: "First Release At", type: "date", colSpan: 12 },
      { key: "charter", label: "Charter", type: "textarea", required: true, colSpan: 24, placeholder: "Problem, scope, success criteria, non-goals" },
      { key: "principles", label: "Guiding Principles", type: "textarea", colSpan: 24, placeholder: "Architecture direction, conventions, iron laws" },
      { key: "repo_checklist", label: "Repo Bootstrap Checklist", type: "textarea", colSpan: 24, placeholder: "README, LICENSE, CI, lint, format, pre-commit, secrets scan, dep bot, ADR dir" },
      { key: "runtime_checklist", label: "Runtime Checklist", type: "textarea", colSpan: 24, placeholder: "Local dev quick-start, env vars, seed data, smoke test" },
      { key: "observability_checklist", label: "Observability Checklist", type: "textarea", colSpan: 24, placeholder: "Logs, metrics, traces, health endpoint, error reporting" },
      { key: "release_checklist", label: "Release Checklist", type: "textarea", colSpan: 24, placeholder: "Version policy, changelog, semver, rollback plan" },
      { key: "owners_and_roles", label: "Owners & Roles", type: "textarea", colSpan: 24, placeholder: "Codeowner, oncall, security, release captain" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — premature platform, missing golden path, tool drift between projects." },
      { key: "project", label: "Cross Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Project Bootstrap — [project_name]

## Profile
- Stack: [stack] · Phase: [phase]
- Owner: [owner] ([team])
- Target GA: [target_ga_at] · First release: [first_release_at]

## Charter
[charter]

## Guiding Principles
[principles]

## Checklists
### Repo
[repo_checklist]

### Runtime
[runtime_checklist]

### Observability
[observability_checklist]

### Release
[release_checklist]

## Owners & Roles
[owners_and_roles]

## Notes
[notes]`
  },

  // ── Knowledge evolution ──────────────────────────────────────────────────
  "knowledge-evolution": {
    metaColumns: [
      { key: "area", label: "Area", minWidth: 200 },
      { key: "change_type", label: "Change Type", width: 160 },
      { key: "status", label: "Status", width: 140, tagTypeFn: statusTag },
      { key: "owner", label: "Owner", width: 120 },
      { key: "updated_at", label: "Updated", width: 140 },
      { key: "project", label: "Project", width: 100, clickable: true }
    ],
    metaFields: [
      { key: "area", label: "Knowledge Area", type: "input", required: true, colSpan: 16, placeholder: "e.g. YiKnowledge/tech/ai-foundations/" },
      { key: "change_type", label: "Change Type", type: "select", required: true, colSpan: 8, options: [
        { label: "New — bootstrap area", value: "new" },
        { label: "Refresh — stale content update", value: "refresh" },
        { label: "Restructure — taxonomy change", value: "restructure" },
        { label: "Merge — consolidate duplicates", value: "merge" },
        { label: "Split — break into leaves", value: "split" },
        { label: "Archive — superseded", value: "archive" },
        { label: "Delete — wrong / harmful", value: "delete" }
      ] },
      { key: "status", label: "Status", type: "select", required: true, colSpan: 8, options: [
        { label: "Proposed", value: "proposed" },
        { label: "In progress", value: "in_progress" },
        { label: "Done", value: "delivered" },
        { label: "Deferred", value: "deferred" },
        { label: "Cancelled", value: "deprecated" }
      ] },
      { key: "owner", label: "Owner", type: "input", required: true, colSpan: 8 },
      { key: "team", label: "Team", type: "input", colSpan: 8 },
      { key: "rationale", label: "Rationale", type: "textarea", required: true, colSpan: 24, placeholder: "Why this change now — drivers, evidence, urgency" },
      { key: "current_state", label: "Current State", type: "textarea", colSpan: 24, placeholder: "What the area looks like now — files, drift, gaps" },
      { key: "target_state", label: "Target State", type: "textarea", colSpan: 24, placeholder: "What it should look like after — structure, metadata, lifecycle" },
      { key: "migration", label: "Migration Plan", type: "textarea", colSpan: 24, placeholder: "Sequence of edits, redirects, cross-references, verification" },
      { key: "affected_consumers", label: "Affected Consumers", type: "textarea", colSpan: 24, placeholder: "aicr, story, bug, aiChat, onboarding — surfaces that read this" },
      { key: "review_cycle", label: "Review Cycle", type: "input", colSpan: 12, placeholder: "e.g. quarterly knowledge audit" },
      { key: "last_audit_at", label: "Last Audit At", type: "date", colSpan: 12 },
      { key: "started_at", label: "Started On", type: "date", colSpan: 8 },
      { key: "delivered_at", label: "Delivered At", type: "date", colSpan: 8 },
      { key: "updated_at", label: "Last Updated", type: "date", colSpan: 8 },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, placeholder: "Quirks — link rot, stale YAML frontmatter, silent taxonomy drift, no owner." },
      { key: "project", label: "Project", type: "input", colSpan: 12, placeholder: "Cross-domain join key — links to BRD entries + bugs with the same project" }
    ],
    templateContent: `# Knowledge Evolution — [area]

## Change
- Type: [change_type] · Status: [status]
- Owner: [owner] ([team])

## Rationale
[rationale]

## Current State
[current_state]

## Target State
[target_state]

## Migration Plan
[migration]

## Affected Consumers
[affected_consumers]

## Audit Cadence
- Review cycle: [review_cycle] · Last audit: [last_audit_at]
- Started: [started_at] · Delivered: [delivered_at] · Updated: [updated_at]

## Notes
[notes]`
  }
};
