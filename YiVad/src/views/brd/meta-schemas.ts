/**
 * Per-topic meta column + form field definitions for BRD (Business Requirements
 * Document) management topics.
 *
 * Each topic gets domain-specific table columns (rendered from row.meta) and
 * structured form fields in the detail page.
 */
import type { MetaColumn } from "@/components/TopicListPage/index.vue";
import type { MetaField } from "@/components/TopicDetailPage/index.vue";

export interface TopicMetaSchema {
  metaColumns: MetaColumn[];
  metaFields: MetaField[];
  templateContent?: string;
}

// ── Shared options ──────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { label: "P0 — Critical / Must-have", value: "p0" },
  { label: "P1 — High / Should-have", value: "p1" },
  { label: "P2 — Medium / Could-have", value: "p2" },
  { label: "P3 — Low / Nice-to-have", value: "p3" }
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Under Review", value: "in_review" },
  { label: "Approved", value: "approved" },
  { label: "In Development", value: "in_development" },
  { label: "Delivered", value: "delivered" },
  { label: "Rejected", value: "rejected" },
  { label: "On Hold", value: "on_hold" }
];

const DOMAIN_OPTIONS = [
  { label: "After-Sales / Customer Service", value: "after_sales" },
  { label: "Sales / CRM", value: "sales" },
  { label: "Marketing / Campaign", value: "marketing" },
  { label: "Supply Chain / Logistics", value: "supply_chain" },
  { label: "Finance / Accounting", value: "finance" },
  { label: "Human Resources", value: "hr" },
  { label: "Data Platform / Analytics", value: "data" },
  { label: "IT Infrastructure", value: "infra" },
  { label: "Security / Compliance", value: "security" },
  { label: "Legal / Regulatory", value: "legal" },
  { label: "Cross-domain", value: "cross_domain" },
  { label: "Other", value: "other" }
];

const COUNTRY_OPTIONS = [
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "United Kingdom", value: "uk" },
  { label: "Italy", value: "it" },
  { label: "Spain", value: "es" },
  { label: "Netherlands", value: "nl" },
  { label: "Poland", value: "pl" },
  { label: "China", value: "cn" },
  { label: "United States", value: "us" },
  { label: "Japan", value: "jp" },
  { label: "Global / Multi-region", value: "global" },
  { label: "Other", value: "other" }
];

const RULE_PRIORITY_OPTIONS = [
  { label: "Must — mandatory, non-negotiable constraint", value: "must" },
  { label: "Should — strongly recommended, exceptions require approval", value: "should" },
  { label: "Could — desirable but optional", value: "could" }
];

const RULE_CATEGORY_OPTIONS = [
  { label: "Data Validation & Integrity", value: "data_validation" },
  { label: "Process / Workflow Orchestration", value: "process" },
  { label: "Access Control / Permissions", value: "permission" },
  { label: "Integration / API Contract", value: "integration" },
  { label: "Notification & Alerting", value: "notification" },
  { label: "Compliance / Regulatory", value: "compliance" },
  { label: "Business Calculation / Logic", value: "calculation" },
  { label: "Audit Trail & Logging", value: "audit" },
  { label: "Localization / i18n", value: "localization" },
  { label: "Other", value: "other" }
];

const MILESTONE_STATUS_OPTIONS = [
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "in_progress" },
  { label: "At Risk", value: "at_risk" },
  { label: "Completed", value: "done" },
  { label: "Blocked", value: "blocked" },
  { label: "Cancelled", value: "cancelled" }
];

const APPROVAL_RESULT_OPTIONS = [
  { label: "Approved — unconditional sign-off", value: "approved" },
  { label: "Rejected — does not meet requirements", value: "rejected" },
  { label: "Conditional — approved with mandatory changes", value: "conditional" },
  { label: "Pending — awaiting review", value: "pending" }
];

const APPROVAL_ROLE_OPTIONS = [
  { label: "Business Owner / Sponsor", value: "business_owner" },
  { label: "EU HUB ITBP", value: "eu_hub_itbp" },
  { label: "RSC Business Lead", value: "rsc_business" },
  { label: "HQ Counterpart", value: "hq_counterpart" },
  { label: "Product Manager", value: "product_manager" },
  { label: "Technical Lead / Architect", value: "tech_lead" },
  { label: "Architecture Review Board", value: "arch_review" },
  { label: "Security Review", value: "security_review" },
  { label: "Compliance Officer", value: "compliance" },
  { label: "Data Privacy Officer (DPO)", value: "dpo" }
];

const FREQUENCY_OPTIONS = [
  { label: "Daily — core operational tool", value: "daily" },
  { label: "Weekly — regular reporting / review", value: "weekly" },
  { label: "Monthly — periodic oversight", value: "monthly" },
  { label: "Quarterly — strategic review", value: "quarterly" },
  { label: "On-demand — triggered by specific events", value: "on_demand" }
];

const SCOPE_OPTIONS = [
  { label: "All Markets / Global", value: "all" },
  { label: "Specific Markets / Regional", value: "partial" }
];

const DEPARTMENT_OPTIONS = [
  { label: "After-Sales Operations", value: "after_sales" },
  { label: "Sales & Distribution", value: "sales" },
  { label: "Marketing", value: "marketing" },
  { label: "Supply Chain / Logistics", value: "supply_chain" },
  { label: "Finance & Controlling", value: "finance" },
  { label: "HR & Administration", value: "hr" },
  { label: "IT / Digital", value: "it" },
  { label: "Data & Analytics", value: "data" },
  { label: "Legal & Compliance", value: "legal" },
  { label: "Executive Office", value: "executive" },
  { label: "R&D / Product", value: "rd" },
  { label: "Other", value: "other" }
];

const OBJECTIVE_TYPE_OPTIONS = [
  { label: "Strategic — long-term business goal", value: "strategic" },
  { label: "Tactical — mid-term capability improvement", value: "tactical" },
  { label: "Operational — process efficiency / cost reduction", value: "operational" },
  { label: "Compliance — regulatory / audit requirement", value: "compliance" }
];

const AC_TYPE_OPTIONS = [
  { label: "Functional — user-facing behaviour", value: "functional" },
  { label: "Data — reporting, accuracy, integrity", value: "data" },
  { label: "UX / Visual — interaction design & layout", value: "ux" },
  { label: "Performance — response time, throughput, scalability", value: "performance" },
  { label: "Security — authentication, authorization, data protection", value: "security" },
  { label: "Integration — API contract, data exchange", value: "integration" }
];

const MILESTONE_PHASE_OPTIONS = [
  { label: "Discovery & Analysis", value: "discovery" },
  { label: "Design & Prototyping", value: "design" },
  { label: "Development", value: "development" },
  { label: "System Testing (SIT)", value: "sit" },
  { label: "User Acceptance Testing (UAT)", value: "uat" },
  { label: "Deployment & Go-Live", value: "deployment" },
  { label: "Post-Go-Live Hypercare", value: "hypercare" },
  { label: "Project Closure", value: "closure" }
];

const INFLUENCE_OPTIONS = [
  { label: "Decision Maker — has approval authority", value: "decision_maker" },
  { label: "Key Influencer — strongly shapes outcomes", value: "key_influencer" },
  { label: "End User — directly uses the system", value: "end_user" },
  { label: "Informed — requires status visibility", value: "informed" }
];

const LIKELIHOOD_OPTIONS = [
  { label: "High — >60% probability or near-certain", value: "high" },
  { label: "Medium — 20–60% probability", value: "medium" },
  { label: "Low — <20% probability", value: "low" }
];

const IMPACT_OPTIONS = [
  { label: "High — project failure, regulatory breach, or major revenue loss", value: "high" },
  { label: "Medium — significant delay, budget overrun, or degraded user experience", value: "medium" },
  { label: "Low — minor inconvenience, workaround available", value: "low" }
];

const URGENCY_OPTIONS = [
  { label: "P0 — Critical: regulatory deadline / revenue at immediate risk", value: "p0" },
  { label: "P1 — High: significant business impact within 1–3 months", value: "p1" },
  { label: "P2 — Medium: important but no hard deadline", value: "p2" },
  { label: "P3 — Low: nice-to-have / operational improvement", value: "p3" }
];

// ── Tag type helpers ────────────────────────────────────────────────────────

function priorityTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { p0: "danger", p1: "warning", p2: "info", p3: "" };
  return (m[v] || "") as any;
}

function statusTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = {
    draft: "info", in_review: "warning", approved: "success",
    in_development: "primary", delivered: "success", rejected: "danger",
    on_hold: "info", not_started: "info", in_progress: "primary",
    at_risk: "warning", done: "success", blocked: "danger", cancelled: "info",
    pending: "warning", conditional: "warning"
  };
  return (m[v] || "") as any;
}

function resultTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { approved: "success", rejected: "danger", conditional: "warning", pending: "info" };
  return (m[v] || "") as any;
}

function rulePriorityTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { must: "danger", should: "warning", could: "info" };
  return (m[v] || "") as any;
}

function likelihoodTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { high: "danger", medium: "warning", low: "info" };
  return (m[v] || "") as any;
}

function impactTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { high: "danger", medium: "warning", low: "info" };
  return (m[v] || "") as any;
}

// ── BRD topic schemas ───────────────────────────────────────────────────────

export const brdMetaSchemas: Record<string, TopicMetaSchema> = {

  // ── BRD Documents (core registry) ──────────────────────────────────────
  "brd-documents": {
    metaColumns: [
      { key: "version", label: "Version", width: 100 },
      { key: "business_owner", label: "Business Owner", width: 160 },
      { key: "domain", label: "Business Domain", width: 140, enum: DOMAIN_OPTIONS },
      {
        key: "priority",
        label: "Priority",
        width: 120,
        enum: PRIORITY_OPTIONS,
        tagTypeFn: priorityTag
      },
      {
        key: "status",
        label: "Status",
        width: 120,
        enum: STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "country", label: "Country / Region", width: 160, enum: COUNTRY_OPTIONS }
    ],
    metaFields: [
      { key: "document_id", label: "BRD Identifier", type: "input", placeholder: "e.g. BRD-2026-001 or BRD-EU-AFS-001", required: true, colSpan: 8 },
      { key: "title", label: "Document Title", type: "input", placeholder: "e.g. After-Sales Ticketing Platform — Phase 2 Enhancement", required: true, colSpan: 16 },
      { key: "version", label: "Version", type: "input", placeholder: "e.g. 1.0, 2.1-draft", required: true, colSpan: 8 },
      { key: "version_date", label: "Version Date", type: "date", colSpan: 8 },
      { key: "change_summary", label: "Change Summary", type: "textarea", rows: 2, placeholder: "What changed in this version? e.g. v1.1 — Added France market scope, updated SLA targets per Q3 steering committee decision", colSpan: 24 },
      { key: "business_owner", label: "Business Owner / Sponsor", type: "input", placeholder: "e.g. Dr. Zhang Wei — Director, After-Sales EU", required: true, colSpan: 8 },
      { key: "author", label: "Author", type: "input", placeholder: "e.g. Li Ming — Business Analyst", colSpan: 8 },
      {
        key: "department",
        label: "Originating Department",
        type: "select",
        options: DEPARTMENT_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "priority",
        label: "Business Priority",
        type: "select",
        options: PRIORITY_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "status",
        label: "Document Status",
        type: "select",
        options: STATUS_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "domain",
        label: "Business Domain",
        type: "select",
        options: DOMAIN_OPTIONS,
        colSpan: 8
      },
      { key: "country", label: "Target Country / Region", type: "select", options: COUNTRY_OPTIONS, colSpan: 8 },
      { key: "brand", label: "Applicable Brand(s)", type: "input", placeholder: "e.g. Brand A, Brand B, All Brands (comma-separated)", colSpan: 8 },
      { key: "expected_golive", label: "Target Go-Live Date", type: "date", colSpan: 8 },
      { key: "related_brds", label: "Related BRDs / Documents", type: "input", placeholder: "e.g. BRD-2026-003 (CRM Integration Phase 1), PRD-2026-012 (Mobile App R1)", colSpan: 8 },
      { key: "created_date", label: "Created Date", type: "date", colSpan: 8 },
      { key: "last_reviewed_date", label: "Last Reviewed / Updated Date", type: "date", colSpan: 8 },
      { key: "regulatory_context", label: "Regulatory Context", type: "textarea", rows: 2, placeholder: "Applicable regulations and their impact on requirements. e.g. GDPR Art. 5(1)(c) — data minimisation constrains customer profile fields; EU Data Act 2025 — data sharing obligations for connected vehicle data", colSpan: 24 },
      { key: "executive_summary", label: "Executive Summary", type: "textarea", rows: 4, placeholder: "Concise overview: business problem, proposed solution, expected benefits, and key constraints. 3–5 sentences. This is the most-read section of any BRD — make it self-contained.", colSpan: 24 },

      // ── Business Context ──────────────────────────────────────────────
      { key: "business_background", label: "Business Background", type: "textarea", rows: 4, placeholder: "Describe the current business landscape: market conditions, organisational context, existing systems and processes, and strategic initiatives that frame this requirement. Include relevant metrics: volumes, turnaround times, headcount, error rates. e.g. 'EU after-sales operations currently handle ~15,000 tickets/month across 5 markets using a mix of Zendesk (DE/FR) and manual email/phone (IT/ES/NL). Average first-response time is 8.3 hours with 23% SLA breach rate.'", colSpan: 24 },
      { key: "current_state", label: "Current State (As-Is)", type: "textarea", rows: 4, placeholder: "Document the current process, tools, workarounds, and operational reality. What systems, spreadsheets, or manual steps are used today? Who does what, in what order? What are the known pain points, bottlenecks, and failure modes? Use concrete examples. e.g. 'Tier-2 agents must log into 3 separate systems (Zendesk, SAP Parts Master, Dealer Portal) to resolve one escalated ticket. Parts availability lookup requires manually copy-pasting VIN numbers between browser tabs — average 4.2 minutes per ticket, with 8% error rate.'", colSpan: 24 },
      { key: "business_problem", label: "Business Problem / Opportunity Statement", type: "textarea", rows: 3, placeholder: "Articulate the core problem or opportunity with quantified impact. Why does the current state need to change? What is the cost of inaction? e.g. 'Fragmented ticket resolution process costs an estimated €1.2M/year in agent productivity (120 FTE hours/week × €200/hour fully-loaded cost). Manual data entry errors cause 15–20 incorrect parts shipments per month (€350 avg cost per incident). Competitor brands achieve < 2-hour resolution times; our 8.3-hour average impacts NPS score (-12 pts vs benchmark).'", colSpan: 24 },
      { key: "proposed_solution", label: "Proposed Solution Summary", type: "textarea", rows: 4, placeholder: "High-level description of the proposed solution. What will change, and how will it address the problem? Include key design decisions, scope boundaries, and architectural approach (at business level, not technical). e.g. 'Unified After-Sales Ticketing Platform (single pane of glass) integrating Zendesk migration, SAP parts API real-time lookup, and dealer portal SSO. Phase 1 (this BRD): DE + FR markets, Tier-2 agent workflow, critical ticket routing. Phase 2: IT/ES/NL rollout, Tier-1 self-service portal, AI-assisted ticket classification.'", colSpan: 24 },
      { key: "expected_outcomes", label: "Expected Business Outcomes", type: "textarea", rows: 3, placeholder: "Quantified expected benefits with timeline. List 3–5 measurable outcomes tied to business objectives. e.g.\n1. Average ticket resolution time: 8.3h → < 2h (within 6 months of go-live)\n2. SLA breach rate: 23% → < 5%\n3. Agent tool-switching: 3→1 system (single pane of glass)\n4. Parts data entry errors: 8% → < 1%\n5. Estimated annual savings: €1.2M (productivity + error reduction)", colSpan: 24 },
      { key: "key_constraints", label: "Key Constraints, Assumptions & Dependencies", type: "textarea", rows: 4, placeholder: "Document constraints, assumptions, and external dependencies that shape the solution space.\n\nConstraints (hard limits):\n• Budget: [CapEx / OpEx ceiling]\n• Timeline: [Hard deadline — e.g. regulatory effective date, system EOL]\n• Technology: [Must use X, must not use Y]\n• Regulatory: [Which regulations, which specific articles]\n\nAssumptions (things we believe to be true):\n• [Assumption 1 — what happens if it proves false?]\n• [Assumption 2]\n\nExternal Dependencies:\n• [Dependency — owner team, delivery date, impact if delayed]\n• [Dependency — vendor SLA, fallback plan]", colSpan: 24 },

      // ── Planning & Resources ───────────────────────────────────────────
      { key: "budget_info", label: "Budget Information", type: "input", placeholder: "e.g. CapEx €450K approved in 2026 budget; OpEx €120K/year recurring (licensing + maintenance)", colSpan: 8 },
      {
        key: "urgency_level",
        label: "Urgency Level",
        type: "select",
        options: URGENCY_OPTIONS,
        colSpan: 8
      },
      { key: "estimated_effort", label: "Estimated Effort (Person-Months)", type: "input", placeholder: "e.g. 18 PM (6 dev × 3 months), or 'TBC — pending technical assessment'", colSpan: 8 },

      // ── Risk & Impact ─────────────────────────────────────────────────
      { key: "risk_summary", label: "Key Risks & Mitigations (Summary)", type: "textarea", rows: 3, placeholder: "Top 3–5 risks at a glance. Detailed risk entries (with likelihood, impact, mitigation strategy, contingency plans, and trigger indicators) are maintained in the Risk Assessment register (brd-risks).\ne.g.\n1. SAP API v2 delay (Likelihood: Medium, Impact: High) → Mitigation: Fallback to batch-file import\n2. Key SME unavailability (Likelihood: Low, Impact: Medium) → Mitigation: Backup SME identified: Anna Schmidt\n3. Multi-market regulatory divergence (Likelihood: Medium, Impact: High) → Mitigation: Phase 1 limited to DE + FR", colSpan: 24 },
      { key: "impact_assessment", label: "Change Impact Assessment", type: "textarea", rows: 3, placeholder: "Which teams, processes, systems, and user groups are affected by this change? What training, communication, or migration effort is required?\ne.g.\n• After-Sales Operations (DE + FR): ~80 Tier-2 agents need 4-hour training + 2-week hypercare\n• IT Platform Team: New integration endpoints, monitoring dashboards\n• Dealer Network: No direct impact (dealer portal unchanged in Phase 1)\n• Reporting: Existing PowerBI dashboards need 2 new data sources\n• Migration: ~50K historical tickets from Zendesk → new platform (estimated 4-week migration window)", colSpan: 24 },

      // ── Attachments & Glossary ─────────────────────────────────────────
      { key: "attachment_links", label: "Attachments & References", type: "textarea", rows: 3, placeholder: "List all supporting documents, diagrams, prototypes, and reference materials. Include URLs or file paths.\ne.g.\n• Business Process Flowchart (As-Is): [link to Lucidchart / attachment]\n• Business Process Flowchart (To-Be): [link]\n• Wireframes / Prototypes: [Figma link]\n• Technical Feasibility Assessment: [Confluence link]\n• Market Analysis Report: [attachment path]\n• Regulatory Assessment — GDPR Art. 5 + EU Data Act: [attachment path]", colSpan: 24 },
      { key: "glossary_terms", label: "Glossary / Key Terms", type: "textarea", rows: 3, placeholder: "Define domain-specific acronyms, terms, and concepts used throughout this BRD. One term per line: Term = Definition.\ne.g.\nSIT = System Integration Testing\nUAT = User Acceptance Testing\nTier-2 Agent = Technical escalation support agent handling complex issues beyond first-line resolution\nVIN = Vehicle Identification Number (17-character unique identifier)\nDPIA = Data Protection Impact Assessment (GDPR requirement)\nHypercare = 2–4 week period post go-live with enhanced support and monitoring", colSpan: 24 }
    ],
    templateContent: `# Business Requirements Document

---

## Document Control

| Field | Value |
|-------|-------|
| **BRD ID** | [BRD-YYYY-NNN] |
| **Version** | [1.0] |
| **Status** | [Draft / Under Review / Approved] |
| **Author** | [Name — Role] |
| **Business Owner** | [Name — Role, Department] |
| **Created** | [YYYY-MM-DD] |
| **Last Reviewed** | [YYYY-MM-DD] |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | [YYYY-MM-DD] | [Name] | Initial draft |
| 1.0 | [YYYY-MM-DD] | [Name] | First approved version |

---

## 1. Executive Summary

**Business Problem**: [One sentence — what problem are we solving?]

**Proposed Solution**: [One sentence — how will we solve it, at a high level?]

**Expected Outcomes**: [2–3 quantified business outcomes — revenue, cost savings, efficiency gains, compliance achievement]

**Key Constraints**: [Budget, timeline, regulatory, technology — one line each]

---

## 2. Business Context & Problem Statement

### 2.1 Current State

[Describe the current business process, system landscape, and operational context. What tools, manual processes, or workarounds are in use today? Include relevant metrics: volumes, error rates, turnaround times, headcount.]

### 2.2 Problem / Opportunity

[What specific pain points, inefficiencies, risks, or missed opportunities does this initiative address? Quantify the impact: e.g. "Current manual data entry costs ~120 FTE hours/week across EU markets."]

### 2.3 Why Now?

[Business urgency — regulatory deadline, competitive pressure, system end-of-life, strategic initiative alignment. What is the cost of inaction?]

---

## 3. Project Scope

### 3.1 In Scope

- [Capability / feature / process area — be specific]
- [Market / region / brand coverage]
- [User personas / roles covered]

### 3.2 Out of Scope (Explicitly Excluded)

- [Capability that stakeholders might expect but is deferred or owned by another initiative]
- [Market / region NOT covered in this phase]

### 3.3 Future Phases (if applicable)

- [Phase 2 / roadmap items — at a high level]

---

## 4. Stakeholder Analysis

| Role / Persona | Department | Influence | Key Needs & Expectations |
|----------------|------------|-----------|--------------------------|
| [e.g. Customer Support Agent — Tier 2] | After-Sales | Decision Maker | [What do they need the system to do?] |
| [e.g. Regional Operations Manager] | After-Sales | Key Influencer | [Reporting, oversight, SLA monitoring] |

> Detailed stakeholder profiles are maintained in the Stakeholders register.

---

## 5. Requirements Overview

### 5.1 Functional Requirements

[High-level summary. Link to detailed acceptance criteria register.]

| ID | Requirement | Priority | Linked AC |
|----|-------------|----------|-----------|
| FR-001 | [Description] | Must / Should / Could | AC-001, AC-002 |

### 5.2 Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| Performance | [e.g. Page load time] | [e.g. < 2 seconds for 95th percentile] |
| Availability | [e.g. System uptime] | [e.g. 99.9% during business hours] |
| Security | [e.g. Authentication method] | [e.g. SSO with MFA] |
| Scalability | [e.g. Concurrent users] | [e.g. 500 concurrent users across EU] |
| Usability | [e.g. Training requirement] | [e.g. < 2 hours training for Tier-2 agent proficiency] |
| Data Retention | [e.g. Ticket data retention] | [e.g. 7 years per local tax regulations] |

### 5.3 Integration Requirements

| System / Endpoint | Direction | Purpose | Owner |
|-------------------|-----------|---------|-------|
| [e.g. SAP ECC — Parts Master] | Inbound | Real-time parts availability lookup | Core Platform Team |
| [e.g. Zendesk API] | Outbound | Ticket status sync to existing CRM | CRM Integration Team |

---

## 6. Business Rules Summary

[High-level summary. Detailed rules are maintained in the Business Rules register.]

| Rule ID | Rule | Priority |
|---------|------|----------|
| BR-001 | [Rule definition — one sentence] | Must / Should / Could |

---

## 7. Constraints, Assumptions & Dependencies

### 7.1 Constraints

- **Budget**: [CapEx / OpEx budget, if known]
- **Timeline**: [Hard deadline, if any — e.g. regulatory effective date]
- **Technology**: [Must use existing platform X, must not use cloud service Y]
- **Regulatory**: [GDPR, SOX, industry-specific regulations — which articles / sections apply]

### 7.2 Key Assumptions

- [Assumption 1 — e.g. "Backend API v2 will be production-ready by Q1 2027"]
- [Assumption 2 — e.g. "EU markets will share a single instance; no market-specific customizations required"]
- [State what happens if an assumption proves false]

### 7.3 External Dependencies

- [Dependency 1 — owner team, expected delivery date, impact if delayed]
- [Dependency 2 — third-party vendor, SLA, fallback plan]

---

## 8. Business Objectives & Success Metrics

| Objective ID | Objective | KPI | Baseline | Target | Measurement Method |
|--------------|-----------|-----|----------|--------|--------------------|
| OBJ-001 | [Objective] | [KPI] | [Current] | [Target] | [How measured, cadence, owner] |

> Detailed objectives are maintained in the Business Objectives register.

---

## 9. Risk Assessment

> Detailed risks are maintained in the Risk Assessment register (brd-risks).

| Risk ID | Risk Description | Likelihood | Impact | Mitigation | Owner |
|---------|------------------|------------|--------|------------|-------|
| RK-001 | [What could go wrong?] | High / Med / Low | High / Med / Low | [How we reduce likelihood or impact] | [Name] |

---

## 10. Milestone Plan (High-Level)

| Milestone | Phase | Target Date | Key Deliverables | Owner |
|-----------|-------|-------------|------------------|-------|
| [e.g. BRD Approved] | Discovery | [YYYY-MM-DD] | Signed BRD by all approvers | [Name] |
| [e.g. MVP Build Complete] | Development | [YYYY-MM-DD] | Deployed to staging, smoke tests passing | [Name] |
| [e.g. UAT Sign-off — EU Markets] | UAT | [YYYY-MM-DD] | UAT report signed by business owners | [Name] |
| [e.g. Go-Live] | Deployment | [YYYY-MM-DD] | Production deployment, hypercare started | [Name] |

> Detailed milestones are maintained in the Milestones register.

---

## 11. Glossary

| Term | Definition |
|------|------------|
| [Acronym or domain term] | [Plain-language definition] |

---

## 12. References

| Document | Link / Location | Description |
|----------|----------------|-------------|
| [e.g. Technical Architecture Decision — ADR-042] | [URL or path] | [What it covers] |
| [e.g. GDPR Art. 5 Assessment] | [URL or path] | [Relevance] |

---

*This is a living document. All substantive changes must be reflected in the Version History table above and re-approved per the Approval Records register.*`
  },

  // ── Business Objectives ─────────────────────────────────────────────────
  "brd-objectives": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      { key: "objective_id", label: "Obj ID", width: 90 },
      { key: "objective_summary", label: "Objective", minWidth: 110 },
      {
        key: "type",
        label: "Type",
        width: 90,
        enum: OBJECTIVE_TYPE_OPTIONS
      },
      { key: "kpi", label: "KPI / Measure", minWidth: 140 },
      { key: "target_value", label: "Target", width: 90 },
      {
        key: "priority",
        label: "Priority",
        width: 120,
        enum: PRIORITY_OPTIONS,
        tagTypeFn: priorityTag
      }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "objective_id", label: "Objective ID", type: "input", placeholder: "e.g. OBJ-001", required: true, colSpan: 8 },
      {
        key: "type",
        label: "Objective Type",
        type: "select",
        options: OBJECTIVE_TYPE_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "objective_summary", label: "Objective Statement", type: "textarea", rows: 2, placeholder: "e.g. Reduce average after-sales ticket resolution time from 5.3 hours to under 2 hours within 6 months of go-live", required: true, colSpan: 24 },
      { key: "kpi", label: "Key Performance Indicator (KPI)", type: "input", placeholder: "e.g. Average ticket resolution time (hours)", required: true, colSpan: 8 },
      { key: "target_value", label: "Target Value", type: "input", placeholder: "e.g. < 2 hours", required: true, colSpan: 8 },
      { key: "baseline_value", label: "Current Baseline", type: "input", placeholder: "e.g. 5.3 hours (Q2 2026 average)", colSpan: 8 },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: PRIORITY_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "measurement_method", label: "Measurement & Verification Method", type: "textarea", rows: 2, placeholder: "How will success be measured? Data source, reporting cadence, responsible party. e.g. Monthly extract from Zendesk Explore dashboard, validated by After-Sales Operations Manager", colSpan: 24 },
      { key: "success_criteria", label: "Success Criteria", type: "textarea", rows: 2, placeholder: "What conditions must be met for this objective to be considered achieved? e.g. Resolution time < 2h sustained for 3 consecutive months across all EU markets", colSpan: 24 }
    ],
    templateContent: `## Business Objective

**Objective Statement**: [What do we want to achieve?]

**Why this matters**: [Business context and urgency]

**How we'll measure success**:
- KPI: [Metric name]
- Target: [Target value]
- Baseline: [Current state]

**Measurement Method**: [Data source, reporting cadence, responsible party]

**Success Criteria**: [Conditions that must be met to consider this objective achieved]`
  },

  // ── Risk Assessment ─────────────────────────────────────────────────────
  "brd-risks": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      { key: "risk_id", label: "Risk ID", width: 80 },
      { key: "risk_description", label: "Risk Description", minWidth: 160 },
      {
        key: "likelihood",
        label: "Likelihood",
        width: 100,
        enum: LIKELIHOOD_OPTIONS,
        tagTypeFn: likelihoodTag
      },
      {
        key: "impact",
        label: "Impact",
        width: 100,
        enum: IMPACT_OPTIONS,
        tagTypeFn: impactTag
      },
      {
        key: "status",
        label: "Status",
        width: 110,
        enum: [
          { label: "Active", value: "active" },
          { label: "Mitigated", value: "mitigated" },
          { label: "Closed", value: "closed" },
          { label: "Materialised", value: "materialized" }
        ],
        tagTypeFn: statusTag
      },
      { key: "owner", label: "Risk Owner", width: 100 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "risk_id", label: "Risk ID", type: "input", placeholder: "e.g. RK-001", required: true, colSpan: 8 },
      { key: "risk_description", label: "Risk Description", type: "textarea", rows: 3, placeholder: "What could go wrong? Be specific about the scenario, trigger conditions, and affected scope. e.g. 'SAP API v2 delivery delayed beyond 2026-10-01 — downstream integration testing window compressed by 4 weeks, risking incomplete SIT coverage for DE + FR markets.'", required: true, colSpan: 24 },
      {
        key: "likelihood",
        label: "Likelihood",
        type: "select",
        options: LIKELIHOOD_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "impact",
        label: "Impact Severity",
        type: "select",
        options: IMPACT_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "status",
        label: "Risk Status",
        type: "select",
        options: [
          { label: "Active — monitoring in progress", value: "active" },
          { label: "Mitigated — controls in place, residual risk accepted", value: "mitigated" },
          { label: "Closed — no longer relevant", value: "closed" },
          { label: "Materialised — risk event occurred", value: "materialized" }
        ],
        required: true,
        colSpan: 8
      },
      { key: "mitigation", label: "Mitigation Strategy", type: "textarea", rows: 3, placeholder: "How do we reduce likelihood or impact? Include specific actions, owners, and timelines. e.g. 1. Automated data validation in sprint 4 (dev team) — reduces data entry errors by ~80%. 2. Fallback to batch-file import if API v2 delayed (Core Platform team committed to 2026-10-01 delivery)", required: true, colSpan: 24 },
      { key: "owner", label: "Risk Owner", type: "input", placeholder: "e.g. Dr. Zhang Wei — After-Sales Director EU", required: true, colSpan: 8 },
      { key: "review_date", label: "Last Review Date", type: "date", colSpan: 8 },
      { key: "contingency_plan", label: "Contingency / Fallback Plan", type: "textarea", rows: 2, placeholder: "What happens if the risk materialises? What is the recovery or workaround plan? e.g. If API v2 is not delivered by Oct 2026, revert to batch-file import (integration test already completed, fallback tested in staging environment)", colSpan: 12 },
      { key: "trigger_indicators", label: "Trigger Indicators / Early Warnings", type: "textarea", rows: 2, placeholder: "What metrics, events, or conditions signal that this risk is becoming more likely? e.g. API v2 milestone missed by > 2 weeks; test environment instability > 3 incidents/week; key SME extended leave", colSpan: 12 }
    ]
  },

  // ── Stakeholders / Core Users ───────────────────────────────────────────
  "brd-stakeholders": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      { key: "role_title", label: "Role / Persona", minWidth: 160 },
      { key: "department", label: "Department", width: 140, enum: DEPARTMENT_OPTIONS },
      {
        key: "influence",
        label: "Influence Level",
        width: 190,
        enum: INFLUENCE_OPTIONS
      },
      {
        key: "frequency",
        label: "Usage Frequency",
        width: 190,
        enum: FREQUENCY_OPTIONS
      },
      { key: "country", label: "Country", width: 120, enum: COUNTRY_OPTIONS }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "role_title", label: "Role / Persona Title", type: "input", placeholder: "e.g. Customer Support Agent — Tier 2 (Technical Escalation)", required: true, colSpan: 8 },
      { key: "contact_person", label: "Contact Person", type: "input", placeholder: "e.g. Anna Schmidt — Team Lead", colSpan: 8 },
      {
        key: "department",
        label: "Department",
        type: "select",
        options: DEPARTMENT_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "influence",
        label: "Influence Level",
        type: "select",
        options: INFLUENCE_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "frequency",
        label: "System Usage Frequency",
        type: "select",
        options: FREQUENCY_OPTIONS,
        colSpan: 8
      },
      { key: "country", label: "Country / Region", type: "select", options: COUNTRY_OPTIONS, colSpan: 8 },
      { key: "brand", label: "Applicable Brand(s)", type: "input", placeholder: "e.g. Brand A, All Brands", colSpan: 8 },
      {
        key: "scope",
        label: "Impact Scope",
        type: "select",
        options: SCOPE_OPTIONS,
        colSpan: 8
      },
      { key: "role_description", label: "Role Description & Context", type: "textarea", rows: 3, placeholder: "Describe this stakeholder's responsibilities, daily workflow, system interaction context, and decision-making authority. What do they need the system to do for them?", required: true, colSpan: 24 },
      { key: "pain_points", label: "Current Pain Points / Unmet Needs", type: "textarea", rows: 2, placeholder: "What problems do they face today? What workarounds do they use? e.g. Must switch between 3 systems to resolve one ticket; no visibility into parts availability", colSpan: 24 }
    ]
  },

  // ── Business Rules ──────────────────────────────────────────────────────
  "brd-rules": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      { key: "rule_id", label: "Rule ID", width: 100 },
      { key: "rule_name", label: "Rule Name", minWidth: 110 },
      {
        key: "priority",
        label: "Priority",
        width: 120,
        enum: RULE_PRIORITY_OPTIONS,
        tagTypeFn: rulePriorityTag
      },
      {
        key: "category",
        label: "Category",
        width: 120,
        enum: RULE_CATEGORY_OPTIONS
      },
      { key: "source", label: "Source", width: 90 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "rule_id", label: "Rule Identifier", type: "input", placeholder: "e.g. BR-001", required: true, colSpan: 8 },
      { key: "rule_name", label: "Rule Name", type: "input", placeholder: "e.g. Ticket routing by brand and severity", required: true, colSpan: 8 },
      {
        key: "priority",
        label: "Rule Priority (MoSCoW)",
        type: "select",
        options: RULE_PRIORITY_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "category",
        label: "Rule Category",
        type: "select",
        options: RULE_CATEGORY_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "description", label: "Rule Definition", type: "textarea", rows: 3, placeholder: "Precisely describe what the rule enforces or constrains. Use declarative language: 'The system SHALL…', 'Users MUST…', 'When X occurs, the system SHALL respond with Y within Z seconds.'", required: true, colSpan: 24 },
      { key: "trigger_condition", label: "Trigger Condition", type: "textarea", rows: 2, placeholder: "What event(s) or condition(s) cause this rule to fire? e.g. A ticket is created with severity = 'Critical' AND brand = 'Brand A'", colSpan: 12 },
      { key: "exception_scenario", label: "Exception Scenario", type: "textarea", rows: 2, placeholder: "Under what circumstances does this rule NOT apply? e.g. This rule is waived for tickets originating from VIP customers (routed via dedicated concierge queue instead)", colSpan: 12 },
      { key: "rationale", label: "Business Rationale", type: "textarea", rows: 2, placeholder: "Why does this rule exist? Business justification, risk it mitigates, or opportunity it enables", colSpan: 12 },
      { key: "source", label: "Authority / Source", type: "input", placeholder: "e.g. GDPR Art. 5(1)(c), Internal Policy CP-12, EU After-Sales SOP v3.2 §4.1", colSpan: 12 },
      { key: "related_rules", label: "Related Rules", type: "input", placeholder: "e.g. BR-003, BR-012 (data retention dependencies)", colSpan: 12 }
    ]
  },

  // ── Acceptance Criteria ─────────────────────────────────────────────────
  "brd-acceptance": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      { key: "ac_id", label: "AC ID", width: 80 },
      { key: "criteria_summary", label: "Acceptance Criteria", minWidth: 200 },
      {
        key: "priority",
        label: "Priority",
        width: 120,
        enum: [
          { label: "Must", value: "must" },
          { label: "Should", value: "should" }
        ],
        tagTypeFn: rulePriorityTag
      },
      {
        key: "type",
        label: "Type",
        width: 90,
        enum: AC_TYPE_OPTIONS
      },
      { key: "related_rule", label: "Related Rule", width: 140 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "ac_id", label: "Acceptance Criteria ID", type: "input", placeholder: "e.g. AC-001", required: true, colSpan: 8 },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Must — go-live gate; cannot ship without passing", value: "must" },
          { label: "Should — important but can be deferred with documented workaround", value: "should" }
        ],
        required: true,
        colSpan: 8
      },
      {
        key: "type",
        label: "Criteria Type",
        type: "select",
        options: AC_TYPE_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "related_rule", label: "Related Business Rule", type: "input", placeholder: "e.g. BR-001", colSpan: 8 },
      { key: "criteria_summary", label: "Acceptance Criteria Statement", type: "textarea", rows: 3, placeholder: "Clear, testable statement. e.g. A Tier-2 support agent can create and assign a ticket within 3 clicks from the customer profile page, and the ticket appears in the assigned queue within 5 seconds.", required: true, colSpan: 24 },
      { key: "given_when_then", label: "Given / When / Then Scenario", type: "textarea", rows: 4, placeholder: "Formal BDD-style scenario:\nGiven <precondition / initial state>\nWhen <trigger / action>\nThen <expected outcome>\n\nExample:\nGiven a logged-in Tier-2 agent viewing a customer profile with at least one active contract\nWhen the agent clicks 'Create Ticket' and selects severity 'Critical'\nThen a ticket is created, assigned to the Critical queue, and the agent sees a confirmation with the ticket number", colSpan: 24 },
      { key: "automated_test", label: "Automated Test Reference", type: "input", placeholder: "e.g. TEST-AC-001 (Cypress E2E), or 'Manual — requires test data setup'", colSpan: 12 }
    ]
  },

  // ── Milestones ──────────────────────────────────────────────────────────
  "brd-milestones": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      { key: "milestone_name", label: "Milestone", minWidth: 110 },
      {
        key: "phase",
        label: "Phase",
        width: 100,
        enum: MILESTONE_PHASE_OPTIONS
      },
      { key: "expected_date", label: "Target Date", width: 130 },
      {
        key: "status",
        label: "Status",
        width: 110,
        enum: MILESTONE_STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "owner", label: "Owner", width: 80 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "milestone_name", label: "Milestone Name", type: "input", placeholder: "e.g. BRD Approved by All Stakeholders, MVP Build Complete, UAT Sign-off — EU Markets", required: true, colSpan: 16 },
      {
        key: "phase",
        label: "Project Phase",
        type: "select",
        options: MILESTONE_PHASE_OPTIONS,
        required: true,
        colSpan: 8
      },
      {
        key: "status",
        label: "Milestone Status",
        type: "select",
        options: MILESTONE_STATUS_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "expected_date", label: "Target Date", type: "date", required: true, colSpan: 8 },
      { key: "actual_date", label: "Actual Completion Date", type: "date", colSpan: 8 },
      { key: "owner", label: "Owner / Responsible Person", type: "input", placeholder: "e.g. Dr. Zhang Wei — After-Sales Director EU", required: true, colSpan: 8 },
      { key: "completion_pct", label: "Completion %", type: "number", placeholder: "0–100", min: 0, max: 100, colSpan: 8 },
      { key: "deliverables", label: "Key Deliverables / Exit Criteria", type: "textarea", rows: 3, placeholder: "What artifacts, decisions, or outcomes must be produced for this milestone to be considered complete? e.g.\n• BRD document signed by all 8 approval roles\n• Architecture decision record for integration pattern\n• Deployed to staging environment and smoke tests passing", required: true, colSpan: 24 },
      { key: "dependencies", label: "Dependencies", type: "textarea", rows: 2, placeholder: "What other milestones, teams, or external factors does this milestone depend on? e.g. API v2 endpoint from Core Platform team (due 2026-09-15), GDPR DPIA approval from Legal", colSpan: 12 },
      { key: "blockers_risks", label: "Blockers / Risks", type: "textarea", rows: 2, placeholder: "What could prevent this milestone from being met? Include likelihood and mitigation. e.g. Key SME on leave until Oct 2026 — mitigation: recorded knowledge transfer session available; backup contact: Anna Schmidt", colSpan: 12 }
    ]
  },

  // ── Approval Records ────────────────────────────────────────────────────
  "brd-approvals": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 100 },
      {
        key: "role",
        label: "Approval Role",
        width: 170,
        enum: APPROVAL_ROLE_OPTIONS
      },
      { key: "approver_name", label: "Approver", width: 100 },
      { key: "review_date", label: "Review Date", width: 130 },
      {
        key: "result",
        label: "Result",
        width: 110,
        enum: APPROVAL_RESULT_OPTIONS,
        tagTypeFn: resultTag
      }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      {
        key: "role",
        label: "Approval Role",
        type: "select",
        options: APPROVAL_ROLE_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "approver_name", label: "Approver Name", type: "input", placeholder: "e.g. Dr. Zhang Wei — Director, After-Sales EU", required: true, colSpan: 8 },
      { key: "review_date", label: "Review Date", type: "date", colSpan: 8 },
      { key: "approval_date", label: "Formal Approval Date", type: "date", colSpan: 8 },
      {
        key: "result",
        label: "Approval Result",
        type: "select",
        options: APPROVAL_RESULT_OPTIONS,
        required: true,
        colSpan: 8
      },
      { key: "review_comments", label: "Review Comments & Conditions", type: "textarea", rows: 3, placeholder: "Detailed review feedback. If Conditional: list mandatory changes required before final approval. If Rejected: state the specific reason(s) and what would change the decision.", colSpan: 24 },
      { key: "escalation_path", label: "Escalation Path", type: "input", placeholder: "e.g. If blocked > 5 business days, escalate to EU After-Sales Steering Committee (steering-committee@example.com)", colSpan: 12 }
    ]
  }
};
