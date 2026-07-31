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
  { label: "P0 — Critical", value: "p0" },
  { label: "P1 — High", value: "p1" },
  { label: "P2 — Medium", value: "p2" },
  { label: "P3 — Low", value: "p3" }
];

const URGENCY_OPTIONS = [
  { label: "P0 — Critical / Emergency", value: "p0" },
  { label: "P1 — High (this quarter)", value: "p1" },
  { label: "P2 — Medium (next quarter)", value: "p2" },
  { label: "P3 — Low (nice-to-have)", value: "p3" }
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "in_review" },
  { label: "Approved", value: "approved" },
  { label: "In Development", value: "in_development" },
  { label: "Delivered", value: "delivered" },
  { label: "Rejected", value: "rejected" },
  { label: "On Hold", value: "on_hold" }
];

const DOMAIN_OPTIONS = [
  { label: "After-Sales / Service", value: "after_sales" },
  { label: "Sales / CRM", value: "sales" },
  { label: "Marketing", value: "marketing" },
  { label: "Supply Chain", value: "supply_chain" },
  { label: "Finance", value: "finance" },
  { label: "HR", value: "hr" },
  { label: "Data / Analytics", value: "data" },
  { label: "Infrastructure", value: "infra" },
  { label: "Security / Compliance", value: "security" },
  { label: "Other", value: "other" }
];

const RULE_PRIORITY_OPTIONS = [
  { label: "Must — mandatory, non-negotiable", value: "must" },
  { label: "Should — strongly recommended", value: "should" },
  { label: "Could — nice to have", value: "could" }
];

const RULE_CATEGORY_OPTIONS = [
  { label: "Data Validation", value: "data_validation" },
  { label: "Process / Workflow", value: "process" },
  { label: "Permission / Access", value: "permission" },
  { label: "Integration / API", value: "integration" },
  { label: "Notification", value: "notification" },
  { label: "Compliance / Legal", value: "compliance" },
  { label: "Calculation / Logic", value: "calculation" },
  { label: "Other", value: "other" }
];

const MILESTONE_STATUS_OPTIONS = [
  { label: "Pending Review", value: "pending_review" },
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
  { label: "Blocked", value: "blocked" },
  { label: "Cancelled", value: "cancelled" }
];

const APPROVAL_RESULT_OPTIONS = [
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Conditional — approved with changes", value: "conditional" },
  { label: "Pending", value: "pending" }
];

const APPROVAL_ROLE_OPTIONS = [
  { label: "Business Owner", value: "business_owner" },
  { label: "EU HUB ITBP", value: "eu_hub_itbp" },
  { label: "RSC Business", value: "rsc_business" },
  { label: "HQ Counterpart", value: "hq_counterpart" },
  { label: "Tech Lead", value: "tech_lead" },
  { label: "Product Manager", value: "product_manager" },
  { label: "Architecture Review", value: "arch_review" },
  { label: "Security Review", value: "security_review" },
  { label: "Compliance", value: "compliance" }
];

const FREQUENCY_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "On-demand", value: "on_demand" }
];

const COUNTRY_OPTIONS = [
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "UK", value: "uk" },
  { label: "Italy", value: "it" },
  { label: "Spain", value: "es" },
  { label: "Netherlands", value: "nl" },
  { label: "Poland", value: "pl" },
  { label: "China", value: "cn" },
  { label: "US", value: "us" },
  { label: "Japan", value: "jp" },
  { label: "Global", value: "global" },
  { label: "Other", value: "other" }
];

const SCOPE_OPTIONS = [
  { label: "All Markets", value: "all" },
  { label: "Partial / Specific Markets", value: "partial" }
];

// ── Tag type helpers ────────────────────────────────────────────────────────

function priorityTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { p0: "danger", p1: "warning", p2: "info", p3: "" };
  return (m[v] || "") as any;
}

function statusTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = {
    draft: "info", in_review: "warning", approved: "success", in_development: "primary",
    delivered: "success", rejected: "danger", on_hold: "info",
    pending_review: "warning", not_started: "info", in_progress: "primary",
    done: "success", blocked: "danger", cancelled: "info",
    pending: "warning", conditional: "warning"
  };
  return (m[v] || "") as any;
}

function resultTag(v: string): ReturnType<NonNullable<MetaColumn["tagTypeFn"]>> {
  const m: Record<string, string> = { approved: "success", rejected: "danger", conditional: "warning", pending: "info" };
  return (m[v] || "") as any;
}

// ── BRD topic schemas ───────────────────────────────────────────────────────

export const brdMetaSchemas: Record<string, TopicMetaSchema> = {

  // ── BRD Documents (core registry) ──────────────────────────────────────
  "brd-documents": {
    metaColumns: [
      { key: "brd_number", label: "BRD #", width: 110 },
      { key: "business_owner", label: "Business Owner", width: 130 },
      {
        key: "priority",
        label: "Priority",
        width: 90,
        enum: [
          { label: "P0", value: "p0" },
          { label: "P1", value: "p1" },
          { label: "P2", value: "p2" },
          { label: "P3", value: "p3" }
        ],
        tagTypeFn: priorityTag
      },
      {
        key: "status",
        label: "Status",
        width: 130,
        enum: STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "country", label: "Country", width: 100 },
      { key: "expected_golive", label: "Go-Live", width: 110 }
    ],
    metaFields: [
      { key: "brd_number", label: "BRD Number", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      { key: "business_owner", label: "Business Owner", type: "input", placeholder: "e.g. Zhang Wei", required: true },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: URGENCY_OPTIONS,
        required: true
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
        required: true
      },
      {
        key: "domain",
        label: "Business Domain",
        type: "select",
        options: DOMAIN_OPTIONS
      },
      { key: "country", label: "Country / Region", type: "select", options: COUNTRY_OPTIONS },
      { key: "brand", label: "Brand", type: "input", placeholder: "e.g. Brand A, Brand B" },
      { key: "expected_golive", label: "Expected Go-Live", type: "date" },
      { key: "created_date", label: "Created Date", type: "date" }
    ]
  },

  // ── Business Rules ──────────────────────────────────────────────────────
  "brd-rules": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "rule_id", label: "Rule ID", width: 100 },
      {
        key: "priority",
        label: "Priority",
        width: 100,
        enum: [
          { label: "Must", value: "must" },
          { label: "Should", value: "should" },
          { label: "Could", value: "could" }
        ],
        tagTypeFn: (v: string) => {
          const m: Record<string, string> = { must: "danger", should: "warning", could: "info" };
          return (m[v] || "") as any;
        }
      },
      {
        key: "category",
        label: "Category",
        width: 140,
        enum: RULE_CATEGORY_OPTIONS
      }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      { key: "rule_id", label: "Rule ID", type: "input", placeholder: "e.g. BR-001", required: true },
      { key: "description", label: "Rule Description", type: "textarea", rows: 3, placeholder: "Describe what the rule enforces or constrains", required: true },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: RULE_PRIORITY_OPTIONS,
        required: true
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: RULE_CATEGORY_OPTIONS,
        required: true
      },
      { key: "rationale", label: "Rationale", type: "textarea", rows: 2, placeholder: "Why this rule exists" },
      { key: "source", label: "Source", type: "input", placeholder: "e.g. GDPR Art.5, internal policy CP-12" }
    ]
  },

  // ── Milestones ──────────────────────────────────────────────────────────
  "brd-milestones": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      {
        key: "status",
        label: "Status",
        width: 120,
        enum: MILESTONE_STATUS_OPTIONS,
        tagTypeFn: statusTag
      },
      { key: "expected_date", label: "Expected Date", width: 130 },
      { key: "owner", label: "Owner", width: 120 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      { key: "name", label: "Milestone Name", type: "input", placeholder: "e.g. BRD Review Approved, MVP Release", required: true },
      { key: "expected_date", label: "Expected Date", type: "date", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: MILESTONE_STATUS_OPTIONS,
        required: true
      },
      { key: "owner", label: "Owner", type: "input", placeholder: "e.g. FE Lead" },
      { key: "deliverables", label: "Deliverables", type: "textarea", rows: 3, placeholder: "Key outputs or artifacts for this milestone" },
      { key: "actual_date", label: "Actual Completion Date", type: "date" },
      { key: "blockers", label: "Blockers / Risks", type: "textarea", rows: 2, placeholder: "What might prevent this milestone from being met" }
    ]
  },

  // ── Approval Records ────────────────────────────────────────────────────
  "brd-approvals": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      {
        key: "role",
        label: "Approval Role",
        width: 160,
        enum: APPROVAL_ROLE_OPTIONS
      },
      { key: "approver", label: "Approver", width: 120 },
      {
        key: "result",
        label: "Result",
        width: 120,
        enum: APPROVAL_RESULT_OPTIONS,
        tagTypeFn: resultTag
      },
      { key: "date", label: "Date", width: 120 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      {
        key: "role",
        label: "Approval Role",
        type: "select",
        options: APPROVAL_ROLE_OPTIONS,
        required: true
      },
      { key: "approver", label: "Approver Name", type: "input", placeholder: "e.g. Li Ming", required: true },
      { key: "date", label: "Approval Date", type: "date" },
      {
        key: "result",
        label: "Result",
        type: "select",
        options: APPROVAL_RESULT_OPTIONS,
        required: true
      },
      { key: "comments", label: "Comments", type: "textarea", rows: 3, placeholder: "Review comments, conditions, or rationale" }
    ]
  },

  // ── Stakeholders / Core Users ───────────────────────────────────────────
  "brd-stakeholders": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "role", label: "User Role", minWidth: 160 },
      {
        key: "frequency",
        label: "Frequency",
        width: 110,
        enum: FREQUENCY_OPTIONS
      },
      { key: "country", label: "Country", width: 100 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      { key: "role", label: "User Role", type: "input", placeholder: "e.g. Customer Support Agent", required: true },
      { key: "description", label: "Role Description", type: "textarea", rows: 2, placeholder: "What this role does, their context and needs" },
      {
        key: "frequency",
        label: "Usage Frequency",
        type: "select",
        options: FREQUENCY_OPTIONS
      },
      { key: "country", label: "Country / Region", type: "select", options: COUNTRY_OPTIONS },
      { key: "brand", label: "Brand", type: "input", placeholder: "e.g. Brand A" },
      {
        key: "scope",
        label: "Impact Scope",
        type: "select",
        options: SCOPE_OPTIONS
      }
    ]
  },

  // ── Business Objectives ─────────────────────────────────────────────────
  "brd-objectives": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "objective", label: "Objective", minWidth: 200 },
      { key: "metric", label: "Metric", minWidth: 150 },
      { key: "target", label: "Target Value", width: 130 }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      { key: "objective", label: "Business Objective", type: "textarea", rows: 2, placeholder: "e.g. Reduce average ticket resolution time", required: true },
      { key: "metric", label: "Measure / KPI", type: "input", placeholder: "e.g. Avg ticket resolution time (hours)", required: true },
      { key: "target", label: "Target Value", type: "input", placeholder: "e.g. < 2 hours", required: true },
      { key: "baseline", label: "Current Baseline", type: "input", placeholder: "e.g. 5.3 hours (Q2 2026 avg)" },
      { key: "verification_method", label: "Verification Method", type: "textarea", rows: 2, placeholder: "How will success be measured and verified?" }
    ]
  },

  // ── Acceptance Criteria ─────────────────────────────────────────────────
  "brd-acceptance": {
    metaColumns: [
      { key: "brd_ref", label: "BRD Ref", width: 130 },
      { key: "ac_id", label: "AC ID", width: 100 },
      {
        key: "priority",
        label: "Priority",
        width: 100,
        enum: [
          { label: "Must", value: "must" },
          { label: "Should", value: "should" }
        ],
        tagTypeFn: (v: string) => {
          const m: Record<string, string> = { must: "danger", should: "warning" };
          return (m[v] || "") as any;
        }
      },
      {
        key: "type",
        label: "Type",
        width: 110,
        enum: [
          { label: "Functional", value: "functional" },
          { label: "Data", value: "data" },
          { label: "UX / Visual", value: "ux" },
          { label: "Performance", value: "performance" }
        ]
      }
    ],
    metaFields: [
      { key: "brd_ref", label: "BRD Reference", type: "input", placeholder: "e.g. BRD-2026-001", required: true },
      { key: "ac_id", label: "AC ID", type: "input", placeholder: "e.g. AC-001", required: true },
      { key: "description", label: "Acceptance Criteria", type: "textarea", rows: 3, placeholder: "e.g. User can create a support ticket within 3 clicks", required: true },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Must — mandatory for go-live", value: "must" },
          { label: "Should — important but not blocking", value: "should" }
        ],
        required: true
      },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Functional", value: "functional" },
          { label: "Data / Reporting", value: "data" },
          { label: "UX / Visual", value: "ux" },
          { label: "Performance / Non-functional", value: "performance" }
        ],
        required: true
      },
      { key: "test_scenario", label: "Test Scenario", type: "textarea", rows: 2, placeholder: "Given/When/Then scenario to verify this AC" }
    ]
  }
};
