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

// ── BRD topic schemas ───────────────────────────────────────────────────────

export const brdMetaSchemas: Record<string, TopicMetaSchema> = {

  // ── BRD Documents (core registry) ──────────────────────────────────────
  "brd-documents": {
    metaColumns: [
      { key: "document_id", label: "BRD ID", width: 120 },
      { key: "title", label: "Document Title", minWidth: 180 },
      { key: "version", label: "Version", width: 80 },
      { key: "business_owner", label: "Business Owner", width: 130 },
      { key: "department", label: "Department", width: 130, enum: DEPARTMENT_OPTIONS },
      {
        key: "priority",
        label: "Priority",
        width: 90,
        enum: PRIORITY_OPTIONS,
        tagTypeFn: priorityTag
      },
      {
        key: "status",
        label: "Status",
        width: 130,
        enum: STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "country", label: "Country / Region", width: 110, enum: COUNTRY_OPTIONS },
      { key: "expected_golive", label: "Target Go-Live", width: 120 }
    ],
    metaFields: [
      { key: "document_id", label: "BRD Identifier", type: "input", placeholder: "e.g. BRD-2026-001", required: true, colSpan: 8 },
      { key: "title", label: "Document Title", type: "input", placeholder: "e.g. After-Sales Ticketing Platform — Phase 2 Enhancement", required: true, colSpan: 16 },
      { key: "version", label: "Version", type: "input", placeholder: "e.g. 1.0, 2.1-draft", required: true, colSpan: 8 },
      { key: "business_owner", label: "Business Owner", type: "input", placeholder: "e.g. Dr. Zhang Wei — Director, After-Sales EU", required: true, colSpan: 8 },
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
      { key: "brand", label: "Applicable Brand(s)", type: "input", placeholder: "e.g. Brand A, Brand B, All Brands", colSpan: 8 },
      { key: "expected_golive", label: "Target Go-Live Date", type: "date", colSpan: 8 },
      { key: "created_date", label: "Created Date", type: "date", colSpan: 8 },
      { key: "last_reviewed_date", label: "Last Reviewed Date", type: "date", colSpan: 8 },
      { key: "executive_summary", label: "Executive Summary", type: "textarea", rows: 4, placeholder: "Brief overview: business problem, proposed solution scope, expected benefits, and key constraints. 3–5 sentences.", colSpan: 24 }
    ]
  },

  // ── Business Objectives ─────────────────────────────────────────────────
  "brd-objectives": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "objective_id", label: "Obj ID", width: 90 },
      { key: "objective_summary", label: "Objective", minWidth: 220 },
      {
        key: "type",
        label: "Type",
        width: 110,
        enum: OBJECTIVE_TYPE_OPTIONS
      },
      { key: "kpi", label: "KPI / Measure", minWidth: 160 },
      { key: "target_value", label: "Target", width: 120 },
      {
        key: "priority",
        label: "Priority",
        width: 90,
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
    ]
  },

  // ── Stakeholders / Core Users ───────────────────────────────────────────
  "brd-stakeholders": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "role_title", label: "Role / Persona", minWidth: 170 },
      { key: "department", label: "Department", width: 130, enum: DEPARTMENT_OPTIONS },
      {
        key: "influence",
        label: "Influence Level",
        width: 130,
        enum: INFLUENCE_OPTIONS
      },
      {
        key: "frequency",
        label: "Usage Frequency",
        width: 120,
        enum: FREQUENCY_OPTIONS
      },
      { key: "country", label: "Country", width: 100, enum: COUNTRY_OPTIONS }
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
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "rule_id", label: "Rule ID", width: 100 },
      { key: "rule_name", label: "Rule Name", minWidth: 170 },
      {
        key: "priority",
        label: "Priority",
        width: 90,
        enum: RULE_PRIORITY_OPTIONS,
        tagTypeFn: rulePriorityTag
      },
      {
        key: "category",
        label: "Category",
        width: 150,
        enum: RULE_CATEGORY_OPTIONS
      },
      { key: "source", label: "Source", width: 130 }
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
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "ac_id", label: "AC ID", width: 90 },
      { key: "criteria_summary", label: "Acceptance Criteria", minWidth: 220 },
      {
        key: "priority",
        label: "Priority",
        width: 90,
        enum: [
          { label: "Must", value: "must" },
          { label: "Should", value: "should" }
        ],
        tagTypeFn: rulePriorityTag
      },
      {
        key: "type",
        label: "Type",
        width: 110,
        enum: AC_TYPE_OPTIONS
      },
      { key: "related_rule", label: "Related Rule", width: 120 }
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
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "milestone_name", label: "Milestone", minWidth: 170 },
      {
        key: "phase",
        label: "Phase",
        width: 140,
        enum: MILESTONE_PHASE_OPTIONS
      },
      { key: "expected_date", label: "Target Date", width: 120 },
      {
        key: "status",
        label: "Status",
        width: 110,
        enum: MILESTONE_STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "owner", label: "Owner", width: 120 }
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
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      {
        key: "role",
        label: "Approval Role",
        width: 170,
        enum: APPROVAL_ROLE_OPTIONS
      },
      { key: "approver_name", label: "Approver", width: 120 },
      { key: "review_date", label: "Review Date", width: 120 },
      {
        key: "result",
        label: "Result",
        width: 130,
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
