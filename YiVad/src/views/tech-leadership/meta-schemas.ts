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
      { key: "to", label: "To", width: 110 }
    ],
    metaFields: [
      { key: "shift_period", label: "Shift Period", type: "input", placeholder: "e.g. 2026-W31", required: true },
      { key: "from_engineer", label: "From Engineer", type: "input", placeholder: "e.g. Alice" },
      { key: "to_engineer", label: "To Engineer", type: "input", placeholder: "e.g. Bob" },
      { key: "ongoing_incidents", label: "Ongoing Incidents", type: "number", min: 0 },
      { key: "pending_alerts", label: "Pending Alerts", type: "number", min: 0 }
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
`
  }
};
