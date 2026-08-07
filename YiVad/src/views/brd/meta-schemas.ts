/**
 * Per-topic meta column + form field definitions for the 8-role BRD tree.
 *
 * Mirrors the 2026-08-04 YiKnowledge user-story restructure — every leaf is
 * keyed by `brd-<role>` and carries role-appropriate structured fields.
 */
import type { MetaColumn } from "@/components/TopicListPage/index.vue";
import type { MetaField } from "@/components/TopicDetailPage/index.vue";

export interface TopicMetaSchema {
  metaColumns: MetaColumn[];
  metaFields: MetaField[];
  templateContent?: string;
  /**
   * Role-specific placeholder for the built-in title input on the detail page.
   * `title` is rendered by TopicDetailPage itself, so it must NOT appear in
   * `metaFields` (doing so produces a duplicate title input).
   */
  titlePlaceholder?: string;
  /**
   * Role-specific placeholder for the built-in tags select on the detail page.
   * `tags` is rendered by TopicDetailPage itself, so it must NOT appear in
   * `metaFields` (doing so produces a duplicate tags input).
   */
  tagsHint?: string;
}

// ── Shared options ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "In Progress", value: "in_progress" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Adopted", value: "adopted" },
  { label: "Archived", value: "archived" }
];

const PRIORITY_OPTIONS = [
  { label: "P0 — Critical", value: "p0" },
  { label: "P1 — High", value: "p1" },
  { label: "P2 — Medium", value: "p2" },
  { label: "P3 — Low", value: "p3" }
];

const SEVERITY_OPTIONS = [
  { label: "SEV-1 — Critical", value: "sev1" },
  { label: "SEV-2 — High", value: "sev2" },
  { label: "SEV-3 — Medium", value: "sev3" },
  { label: "SEV-4 — Low", value: "sev4" }
];

const SCOPE_OPTIONS = [
  { label: "Team", value: "team" },
  { label: "Project", value: "project" },
  { label: "Org", value: "org" },
  { label: "Company", value: "company" }
];

const TIME_HORIZON_OPTIONS = [
  { label: "Quarterly", value: "quarterly" },
  { label: "Half-year", value: "half_year" },
  { label: "Annual", value: "annual" },
  { label: "Multi-year", value: "multi_year" }
];

const SOURCE_TYPE_OPTIONS = [
  { label: "Tacit — Interview", value: "tacit_interview" },
  { label: "Tacit — Observation", value: "tacit_observation" },
  { label: "Explicit — Document", value: "explicit_document" },
  { label: "Explicit — Log/Data", value: "explicit_data" }
];

const REVIEW_CYCLE_OPTIONS = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Half-yearly", value: "half_yearly" },
  { label: "Yearly", value: "yearly" }
];

// ── 8 role schemas ───────────────────────────────────────────────────────────

export const brdMetaSchemas: Record<string, TopicMetaSchema> = {
  "brd-engineer": {
    // `title` / `tags` / `updatedAt` are rendered by TopicListPage (built-in
    // columns on the topic entry), so meta columns must not duplicate them.
    // `key_metrics` is a textarea field — too verbose for the list view, kept
    // in metaFields for the detail/edit form only.
    metaColumns: [
      { key: "brd_id", label: "BRD ID", width: 130 },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "domain", label: "Domain", width: 160 },
      { key: "quarter", label: "Quarter", width: 100 },
      { key: "priority", label: "Priority", width: 100, enum: PRIORITY_OPTIONS },
      { key: "tech_stack", label: "Tech Stack", minWidth: 180 },
      { key: "owner", label: "Owner", width: 140 },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS }
    ],
    // `title` and `tags` are rendered as built-in fields by TopicDetailPage;
    // their role-specific placeholders are surfaced via `titlePlaceholder` /
    // `tagsHint` so the hints are not lost when the duplicates are removed.
    titlePlaceholder: "BRD-2026-058 Async Processing Platform & Event Stream Governance",
    tagsHint: "engineer, yipet, platform, l3-maturity",
    metaFields: [
      { key: "brd_id", label: "BRD ID", type: "input", colSpan: 8, required: true, placeholder: "BRD-2026-058" },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "domain", label: "Domain", type: "input", colSpan: 8, placeholder: "Async Processing" },
      { key: "quarter", label: "Quarter", type: "input", colSpan: 8, placeholder: "2026 Q3" },
      { key: "priority", label: "Priority", type: "select", colSpan: 8, options: PRIORITY_OPTIONS },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "owner", label: "Owner", type: "input", colSpan: 12, placeholder: "Stream Platform Team" },
      { key: "code_link", label: "Code Link", type: "input", colSpan: 12, placeholder: "https://github.com/..." },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "engineer/projects/yipet/brd/brd-2026-058-async-processing" },
      { key: "tech_stack", label: "Tech Stack", type: "input", colSpan: 24, placeholder: "Kafka, Flink, Schema Registry, OpenTelemetry" },
      { key: "key_metrics", label: "Key Metrics", type: "textarea", colSpan: 24, rows: 3, placeholder: "Onboarding time 5d→1d; change failure rate 18%→5%; MTTR 52min→15min" },
      { key: "acceptance_criteria", label: "Acceptance Criteria", type: "textarea", colSpan: 24, rows: 4, placeholder: "Verifiable acceptance criteria, e.g.: new team onboarding <1d; P0 incidents = 0" },
      { key: "stakeholders", label: "Stakeholders", type: "textarea", colSpan: 24, rows: 3, placeholder: "CTO Office, Platform Team, 5 business teams, SRE, Security & Compliance, Finance, HR, Architecture Committee" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, risks, and decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**BRD ID**: ${brd_id}  |  **Project**: ${project}  |  **Domain**: ${domain}  |  **Quarter**: ${quarter}",
      "**Priority**: ${priority}  |  **Status**: ${status}  |  **Owner**: ${owner}",
      "**KB Source**: ${kb_path}  |  **Code**: ${code_link}",
      "",
      "## Context",
      "${notes}",
      "",
      "## Objectives & Key Metrics",
      "${key_metrics}",
      "",
      "## Acceptance Criteria",
      "${acceptance_criteria}",
      "",
      "## Stakeholders",
      "${stakeholders}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **engineer/ subdirs** (per `YiKnowledge/README.md`): `patterns` / `processes` / `lessons` / `tools` / `projects` / `strategies`",
      ""
    ].join("\n")
  },

  "brd-tech-lead": {
    metaColumns: [
      { key: "adr_id", label: "ADR ID", width: 130 },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "domain", label: "Domain", width: 170 },
      { key: "decision_type", label: "Decision Type", width: 140, enum: [
        { label: "Architectural", value: "architectural" },
        { label: "Process", value: "process" },
        { label: "Hiring", value: "hiring" },
        { label: "Vendor", value: "vendor" }
      ] },
      { key: "team_size", label: "Team Size", width: 100 },
      { key: "status", label: "Status", width: 110, enum: [
        { label: "Proposed", value: "proposed" },
        { label: "In Progress", value: "in_progress" },
        { label: "Accepted", value: "accepted" },
        { label: "Superseded", value: "superseded" },
        { label: "Deprecated", value: "deprecated" }
      ] },
      { key: "owner", label: "Owner", width: 150 }
    ],
    titlePlaceholder: "ADR — YiAi BRD Agent 5-Phase Launch Methodology",
    tagsHint: "adr, yi-ai, brd-agent, 5-phase",
    metaFields: [
      { key: "adr_id", label: "ADR ID", type: "input", colSpan: 8, required: true, placeholder: "ADR-Brd-Agent-Launch" },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "domain", label: "Domain", type: "input", colSpan: 8, placeholder: "BRD Agent Launch" },
      { key: "decision_type", label: "Decision Type", type: "select", colSpan: 8, options: [
        { label: "Architectural", value: "architectural" },
        { label: "Process", value: "process" },
        { label: "Hiring", value: "hiring" },
        { label: "Vendor", value: "vendor" }
      ] },
      { key: "team_size", label: "Team Size", type: "number", colSpan: 8, min: 1, placeholder: "5" },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: [
        { label: "Proposed", value: "proposed" },
        { label: "In Progress", value: "in_progress" },
        { label: "Accepted", value: "accepted" },
        { label: "Superseded", value: "superseded" },
        { label: "Deprecated", value: "deprecated" }
      ] },
      { key: "owner", label: "Owner", type: "input", colSpan: 12, placeholder: "YiAi lead owner" },
      { key: "review_cycle", label: "Review Cycle", type: "select", colSpan: 12, options: REVIEW_CYCLE_OPTIONS },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "tech-lead/decisions/yiai/brd-agent-launch.md" },
      { key: "context", label: "Context", type: "textarea", colSpan: 24, rows: 3, placeholder: "Decision context: why now? what constraints apply? what was the trigger?" },
      { key: "decision", label: "Decision", type: "textarea", colSpan: 24, rows: 4, placeholder: "We decided to… (one-sentence decision statement, actionable and verifiable)" },
      { key: "alternatives", label: "Alternatives Considered", type: "textarea", colSpan: 24, rows: 3, placeholder: "Alternatives considered A / B / C, and reasons rejected" },
      { key: "risks", label: "Risks & Mitigations", type: "textarea", colSpan: 24, rows: 3, placeholder: "Risk 1 → mitigation; Risk 2 → mitigation" },
      { key: "rollback", label: "Rollback Plan", type: "textarea", colSpan: 24, rows: 3, placeholder: "Rollback trigger conditions, rollback steps, rollback verification method" },
      { key: "stakeholders", label: "Stakeholders", type: "textarea", colSpan: 24, rows: 3, placeholder: "CTO, YiAi lead owner, Architecture Group, BRD business owner, QA" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**ADR ID**: ${adr_id}  |  **Project**: ${project}  |  **Domain**: ${domain}  |  **Decision Type**: ${decision_type}",
      "**Status**: ${status}  |  **Team Size**: ${team_size}  |  **Owner**: ${owner}  |  **Review Cycle**: ${review_cycle}",
      "**KB Source**: ${kb_path}",
      "",
      "## Context",
      "${context}",
      "",
      "## Decision",
      "${decision}",
      "",
      "## Alternatives Considered",
      "${alternatives}",
      "",
      "## Risks & Mitigations",
      "${risks}",
      "",
      "## Rollback Plan",
      "${rollback}",
      "",
      "## Stakeholders",
      "${stakeholders}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **tech-lead/ subdirs** (per `YiKnowledge/README.md`): `architecture` / `capacity` / `decisions` / `roadmap` / `risk`",
      ""
    ].join("\n")
  },

  "brd-product-manager": {
    metaColumns: [
      { key: "prd_id", label: "PRD ID", width: 120 },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "domain", label: "Domain", width: 160 },
      { key: "priority", label: "Priority", width: 100, enum: PRIORITY_OPTIONS },
      { key: "target_metric", label: "Target Metric", width: 180 },
      { key: "country", label: "Country", width: 100 },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS },
      { key: "owner", label: "Owner", width: 140 }
    ],
    titlePlaceholder: "PRD — API Whitelist Dynamic Routing",
    tagsHint: "pm, prd, api, whitelist",
    metaFields: [
      { key: "prd_id", label: "PRD ID", type: "input", colSpan: 8, placeholder: "PRD-2026-001" },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "domain", label: "Domain", type: "input", colSpan: 8, placeholder: "API Whitelist / After-Sales" },
      { key: "priority", label: "Priority", type: "select", colSpan: 8, options: PRIORITY_OPTIONS },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "country", label: "Target Country", type: "input", colSpan: 8, placeholder: "Germany / Netherlands / ..." },
      { key: "owner", label: "Owner", type: "input", colSpan: 12, placeholder: "PM Owner" },
      { key: "expected_golive", label: "Expected Go-Live", type: "date", colSpan: 12 },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "product-manager/projects/..." },
      { key: "business_objective", label: "Business Objective", type: "textarea", colSpan: 24, rows: 3, placeholder: "Why now? Business goal and north-star metric" },
      { key: "user_segment", label: "User Segment", type: "textarea", colSpan: 24, rows: 2, placeholder: "End user / Dealer / Internal team" },
      { key: "target_metric", label: "Target Metric", type: "input", colSpan: 24, placeholder: "DAU +10% / CSAT 4.5+ / P95 <500ms" },
      { key: "success_criteria", label: "Success Criteria", type: "textarea", colSpan: 24, rows: 4, placeholder: "Quantifiable success criteria + measurement method + measurement cadence" },
      { key: "stakeholders", label: "Stakeholders", type: "textarea", colSpan: 24, rows: 3, placeholder: "Business owner, Engineering, Design, Operations, Legal, Compliance, etc." },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, risks, and decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**PRD ID**: ${prd_id}  |  **Project**: ${project}  |  **Domain**: ${domain}  |  **Priority**: ${priority}",
      "**Status**: ${status}  |  **Country**: ${country}  |  **Owner**: ${owner}  |  **Go-Live**: ${expected_golive}",
      "**KB Source**: ${kb_path}",
      "",
      "## Business Objective",
      "${business_objective}",
      "",
      "## User Segment",
      "${user_segment}",
      "",
      "## Target Metric",
      "${target_metric}",
      "",
      "## Success Criteria",
      "${success_criteria}",
      "",
      "## Stakeholders",
      "${stakeholders}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **product-manager/ subdirs** (per `YiKnowledge/README.md`): `frameworks` / `product` / `meetings` / `industry-cases` / `processes` / `projects`",
      ""
    ].join("\n")
  },

  "brd-ai-engineer": {
    metaColumns: [
      { key: "model", label: "Model", width: 160 },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "task_type", label: "Task Type", width: 130, enum: [
        { label: "Chat", value: "chat" },
        { label: "Embedding", value: "embedding" },
        { label: "RAG", value: "rag" },
        { label: "Code Gen", value: "code_gen" },
        { label: "Eval", value: "eval" },
        { label: "Agent", value: "agent" }
      ] },
      { key: "framework", label: "Framework", width: 140 },
      { key: "dataset", label: "Dataset", width: 160 },
      { key: "eval_metric", label: "Eval Metric", width: 130 },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS },
      { key: "owner", label: "Owner", width: 140 }
    ],
    titlePlaceholder: "Embedding Model Selection — bge-m3 vs OpenAI",
    tagsHint: "ai-engineer, llm, ragas, evaluation",
    metaFields: [
      { key: "model", label: "Model", type: "input", colSpan: 8, placeholder: "claude-sonnet-4-6 / bge-m3 / gpt-4o" },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "task_type", label: "Task Type", type: "select", colSpan: 8, options: [
        { label: "Chat", value: "chat" },
        { label: "Embedding", value: "embedding" },
        { label: "RAG", value: "rag" },
        { label: "Code Gen", value: "code_gen" },
        { label: "Eval", value: "eval" },
        { label: "Agent", value: "agent" }
      ] },
      { key: "framework", label: "Framework", type: "input", colSpan: 8, placeholder: "llama_index / LangChain / PyTorch" },
      { key: "dataset", label: "Dataset", type: "input", colSpan: 8, placeholder: "internal-eval-2026-08" },
      { key: "eval_metric", label: "Eval Metric", type: "input", colSpan: 8, placeholder: "F1 / BLEU / ragas 4-indicator / human-eval" },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "owner", label: "Owner", type: "input", colSpan: 12, placeholder: "AI Engineer" },
      { key: "sample_size", label: "Sample Size", type: "number", colSpan: 12, min: 1, placeholder: "50" },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "ai-engineer/methodology/prompts/brd-generation.md" },
      { key: "context", label: "Context", type: "textarea", colSpan: 24, rows: 3, placeholder: "Evaluation context, dataset source, comparison scope" },
      { key: "methodology", label: "Methodology", type: "textarea", colSpan: 24, rows: 4, placeholder: "Evaluation flow, prompt template, sampling method, confidence interval" },
      { key: "baseline", label: "Baseline", type: "textarea", colSpan: 24, rows: 3, placeholder: "Current metrics, e.g.: F1 0.72 / ragas faithfulness 0.65" },
      { key: "target", label: "Target", type: "textarea", colSpan: 24, rows: 3, placeholder: "Target metrics, e.g.: F1 0.85 / ragas faithfulness 0.80" },
      { key: "risks", label: "Risks & Mitigations", type: "textarea", colSpan: 24, rows: 3, placeholder: "Hallucination / data leakage / cost overrun / model drift → corresponding mitigations" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**Model**: ${model}  |  **Project**: ${project}  |  **Task Type**: ${task_type}  |  **Framework**: ${framework}  |  **Status**: ${status}",
      "**Dataset**: ${dataset}  |  **Eval Metric**: ${eval_metric}  |  **Sample Size**: ${sample_size}  |  **Owner**: ${owner}",
      "**KB Source**: ${kb_path}",
      "",
      "## Context",
      "${context}",
      "",
      "## Methodology",
      "${methodology}",
      "",
      "## Baseline → Target",
      "- **Baseline**: ${baseline}",
      "- **Target**: ${target}",
      "",
      "## Risks & Mitigations",
      "${risks}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **ai-engineer/ subdirs** (per `YiKnowledge/README.md`): `foundations` / `platform` / `methodology` / `data`",
      ""
    ].join("\n")
  },

  "brd-new-hire": {
    metaColumns: [
      { key: "role_track", label: "Role Track", width: 130, enum: [
        { label: "Frontend", value: "frontend" },
        { label: "Backend", value: "backend" },
        { label: "AI/ML", value: "ai_ml" },
        { label: "DevOps/SRE", value: "devops_sre" },
        { label: "Product", value: "product" }
      ] },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "day_count", label: "Day #", width: 80 },
      { key: "mentor", label: "Mentor", width: 140 },
      { key: "buddy", label: "Buddy", width: 140 },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS }
    ],
    titlePlaceholder: "Onboard as a New Engineer — Day 1 to 90",
    tagsHint: "new-hire, onboarding, day-1",
    metaFields: [
      { key: "role_track", label: "Role Track", type: "select", colSpan: 8, options: [
        { label: "Frontend", value: "frontend" },
        { label: "Backend", value: "backend" },
        { label: "AI/ML", value: "ai_ml" },
        { label: "DevOps/SRE", value: "devops_sre" },
        { label: "Product", value: "product" }
      ] },
      { key: "project", label: "Assigned Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "day_count", label: "Day #", type: "number", colSpan: 8, min: 1, placeholder: "1" },
      { key: "mentor", label: "Mentor", type: "input", colSpan: 8, placeholder: "name@company.com" },
      { key: "buddy", label: "Buddy", type: "input", colSpan: 8, placeholder: "buddy@company.com" },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "new-hire/onboarding/yivad/onboarding.md" },
      { key: "first_week_tasks", label: "First Week Tasks", type: "textarea", colSpan: 24, rows: 4, placeholder: "Environment setup / repo clone / first PR / read-along README / 1:1 intro meetings" },
      { key: "environment_setup", label: "Environment Setup", type: "textarea", colSpan: 24, rows: 3, placeholder: "Node / pnpm / Python / MongoDB / IDE plugins / .env config" },
      { key: "reading_list", label: "Reading List", type: "textarea", colSpan: 24, rows: 3, placeholder: "CLAUDE.md / architecture overview / key ADRs / historical Win & Gotcha" },
      { key: "checkpoint", label: "Checkpoint (Day 30 / 60 / 90)", type: "textarea", colSpan: 24, rows: 4, placeholder: "Day 30: complete small tasks independently; Day 60: lead a module; Day 90: mentor a newcomer" },
      { key: "goals", label: "90-Day Goals", type: "textarea", colSpan: 24, rows: 3, placeholder: "OKR-aligned goals, quantifiable" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, risks, and decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**Role Track**: ${role_track}  |  **Project**: ${project}  |  **Day #**: ${day_count}  |  **Status**: ${status}",
      "**Mentor**: ${mentor}  |  **Buddy**: ${buddy}",
      "**KB Source**: ${kb_path}",
      "",
      "## First Week Tasks",
      "${first_week_tasks}",
      "",
      "## Environment Setup",
      "${environment_setup}",
      "",
      "## Reading List",
      "${reading_list}",
      "",
      "## Checkpoint (Day 30 / 60 / 90)",
      "${checkpoint}",
      "",
      "## 90-Day Goals",
      "${goals}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **new-hire/ subdirs** (per `YiKnowledge/README.md`): `onboarding`",
      ""
    ].join("\n")
  },

  "brd-knowledge-curator": {
    metaColumns: [
      { key: "doc_type", label: "Doc Type", width: 130, enum: [
        { label: "Template", value: "template" },
        { label: "Diagram", value: "diagram" },
        { label: "Archive", value: "archive" },
        { label: "Note", value: "note" },
        { label: "Stakeholder", value: "stakeholder" },
        { label: "Expert", value: "expert" }
      ] },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "source_type", label: "Source Type", width: 160, enum: SOURCE_TYPE_OPTIONS },
      { key: "review_cycle", label: "Review Cycle", width: 120, enum: REVIEW_CYCLE_OPTIONS },
      { key: "tacit_explicit", label: "T/E", width: 80, enum: [
        { label: "Tacit", value: "tacit" },
        { label: "Explicit", value: "explicit" }
      ] },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS },
      { key: "owner", label: "Curator", width: 140 }
    ],
    titlePlaceholder: "Knowledge Map — YiKnowledge Directory Blueprint",
    tagsHint: "knowledge, template, diagram",
    metaFields: [
      { key: "doc_type", label: "Doc Type", type: "select", colSpan: 8, options: [
        { label: "Template", value: "template" },
        { label: "Diagram", value: "diagram" },
        { label: "Archive", value: "archive" },
        { label: "Note", value: "note" },
        { label: "Stakeholder", value: "stakeholder" },
        { label: "Expert", value: "expert" }
      ] },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "source_type", label: "Source Type", type: "select", colSpan: 8, options: SOURCE_TYPE_OPTIONS },
      { key: "review_cycle", label: "Review Cycle", type: "select", colSpan: 8, options: REVIEW_CYCLE_OPTIONS },
      { key: "tacit_explicit", label: "Tacit / Explicit", type: "select", colSpan: 8, options: [
        { label: "Tacit", value: "tacit" },
        { label: "Explicit", value: "explicit" }
      ] },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "owner", label: "Curator", type: "input", colSpan: 8, placeholder: "Knowledge Curator" },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "knowledge-curator/templates/adr.md" },
      { key: "audience", label: "Audience", type: "textarea", colSpan: 24, rows: 2, placeholder: "engineer / tech-lead / new-hire / ..." },
      { key: "lifecycle_stage", label: "Lifecycle Stage", type: "input", colSpan: 24, placeholder: "draft / active / reviewed / archived" },
      { key: "summary", label: "Summary", type: "textarea", colSpan: 24, rows: 4, placeholder: "Document summary: purpose, key points, relationship to other files in the same directory" },
      { key: "related_docs", label: "Related Documents", type: "textarea", colSpan: 24, rows: 3, placeholder: "ADR / BRD / Win / Gotcha paths" },
      { key: "review_notes", label: "Review Notes", type: "textarea", colSpan: 24, rows: 3, placeholder: "Last review conclusion, next review date, content to be supplemented" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**Doc Type**: ${doc_type}  |  **Project**: ${project}  |  **Source**: ${source_type}  |  **Review**: ${review_cycle}  |  **T/E**: ${tacit_explicit}",
      "**Status**: ${status}  |  **Curator**: ${owner}  |  **Lifecycle**: ${lifecycle_stage}",
      "**KB Source**: ${kb_path}",
      "",
      "## Audience",
      "${audience}",
      "",
      "## Summary",
      "${summary}",
      "",
      "## Related Documents",
      "${related_docs}",
      "",
      "## Review Notes",
      "${review_notes}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **knowledge-curator/ subdirs** (per `YiKnowledge/README.md`): `governance` / `diagrams` / `archive` / `templates` / `people` / `notes`",
      ""
    ].join("\n")
  },

  "brd-executive": {
    metaColumns: [
      { key: "decision_type", label: "Decision Type", width: 130, enum: [
        { label: "Strategic", value: "strategic" },
        { label: "Investment", value: "investment" },
        { label: "Org Change", value: "org_change" },
        { label: "Partnership", value: "partnership" }
      ] },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "scope", label: "Scope", width: 110, enum: SCOPE_OPTIONS },
      { key: "time_horizon", label: "Time Horizon", width: 120, enum: TIME_HORIZON_OPTIONS },
      { key: "strategic_theme", label: "Strategic Theme", width: 170 },
      { key: "okr", label: "OKR", width: 140 },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS },
      { key: "owner", label: "Owner", width: 140 }
    ],
    titlePlaceholder: "Strategic Decision — Yi Family 2026 H2 Direction",
    tagsHint: "executive, strategic, investment",
    metaFields: [
      { key: "decision_type", label: "Decision Type", type: "select", colSpan: 8, options: [
        { label: "Strategic", value: "strategic" },
        { label: "Investment", value: "investment" },
        { label: "Org Change", value: "org_change" },
        { label: "Partnership", value: "partnership" }
      ] },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "scope", label: "Scope", type: "select", colSpan: 8, options: SCOPE_OPTIONS },
      { key: "time_horizon", label: "Time Horizon", type: "select", colSpan: 8, options: TIME_HORIZON_OPTIONS },
      { key: "strategic_theme", label: "Strategic Theme", type: "input", colSpan: 8, placeholder: "AI Native / Global Expansion / Cost Discipline" },
      { key: "okr", label: "OKR", type: "input", colSpan: 8, placeholder: "O1: ... / KR1: ..." },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "owner", label: "Owner", type: "input", colSpan: 12, placeholder: "CTO / CEO / VP" },
      { key: "investment_size", label: "Investment Size", type: "input", colSpan: 12, placeholder: "$200K / 2 FTE × 12 months" },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "executive/strategy/..." },
      { key: "context", label: "Context", type: "textarea", colSpan: 24, rows: 4, placeholder: "Decision context: market shifts, internal data, strategic triggers" },
      { key: "decision", label: "Decision", type: "textarea", colSpan: 24, rows: 4, placeholder: "We decided to… (one-sentence decision statement)" },
      { key: "alternatives", label: "Alternatives Considered", type: "textarea", colSpan: 24, rows: 3, placeholder: "Alternatives considered and reasons rejected" },
      { key: "expected_outcomes", label: "Expected Outcomes", type: "textarea", colSpan: 24, rows: 3, placeholder: "Quantifiable outcomes within 12 months + key milestones" },
      { key: "stakeholders", label: "Stakeholders", type: "textarea", colSpan: 24, rows: 3, placeholder: "Decision makers / stakeholders / executors / reviewers" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, risks, and decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**Decision Type**: ${decision_type}  |  **Project**: ${project}  |  **Scope**: ${scope}  |  **Horizon**: ${time_horizon}  |  **Status**: ${status}",
      "**Strategic Theme**: ${strategic_theme}  |  **OKR**: ${okr}  |  **Owner**: ${owner}  |  **Investment**: ${investment_size}",
      "**KB Source**: ${kb_path}",
      "",
      "## Context",
      "${context}",
      "",
      "## Decision",
      "${decision}",
      "",
      "## Alternatives Considered",
      "${alternatives}",
      "",
      "## Expected Outcomes",
      "${expected_outcomes}",
      "",
      "## Stakeholders",
      "${stakeholders}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **executive/ subdirs** (per `YiKnowledge/README.md`): `strategy` / `industry` / `roadmap` / `reading-list`",
      ""
    ].join("\n")
  },

  "brd-oncall-sre": {
    metaColumns: [
      { key: "incident_id", label: "Incident ID", width: 130 },
      { key: "project", label: "Project", width: 100, clickable: true },
      { key: "severity", label: "Severity", width: 120, enum: SEVERITY_OPTIONS },
      { key: "incident_type", label: "Incident Type", width: 130, enum: [
        { label: "Outage", value: "outage" },
        { label: "Degradation", value: "degradation" },
        { label: "Data Loss", value: "data_loss" },
        { label: "Security", value: "security" }
      ] },
      { key: "blast_radius", label: "Blast Radius", width: 140 },
      { key: "mttr", label: "MTTR", width: 100 },
      { key: "status", label: "Status", width: 110, enum: STATUS_OPTIONS },
      { key: "owner", label: "Oncall", width: 140 }
    ],
    titlePlaceholder: "Incident — 2026-08-05 SSE stream aborted forward leak",
    tagsHint: "sre, oncall, incident, sse",
    metaFields: [
      { key: "incident_id", label: "Incident ID", type: "input", colSpan: 8, placeholder: "INC-2026-08-05-001" },
      { key: "project", label: "Project", type: "select", colSpan: 8, options: [
        { label: "YiPet", value: "yipet" },
        { label: "YiAi", value: "yiai" },
        { label: "YiVad", value: "yivad" },
        { label: "YiKnowledge", value: "yiknowledge" }
      ] },
      { key: "severity", label: "Severity", type: "select", colSpan: 8, options: SEVERITY_OPTIONS },
      { key: "incident_type", label: "Incident Type", type: "select", colSpan: 8, options: [
        { label: "Outage", value: "outage" },
        { label: "Degradation", value: "degradation" },
        { label: "Data Loss", value: "data_loss" },
        { label: "Security", value: "security" }
      ] },
      { key: "status", label: "Status", type: "select", colSpan: 8, options: STATUS_OPTIONS },
      { key: "owner", label: "Oncall", type: "input", colSpan: 8, placeholder: "Oncall SRE name" },
      { key: "mttr", label: "MTTR (minutes)", type: "number", colSpan: 8, min: 0, placeholder: "20" },
      { key: "blast_radius", label: "Blast Radius", type: "input", colSpan: 8, placeholder: "5% users / 3 services / all" },
      { key: "kb_path", label: "KB Source Path", type: "input", colSpan: 24, placeholder: "oncall-sre/incident-response/respond-to-an-incident.md" },
      { key: "runbook_link", label: "Runbook Link", type: "input", colSpan: 24, placeholder: "https://wiki.../runbook" },
      { key: "summary", label: "Summary", type: "textarea", colSpan: 24, rows: 3, placeholder: "One-paragraph summary: trigger time, impact scope, current status" },
      { key: "timeline", label: "Timeline", type: "textarea", colSpan: 24, rows: 4, placeholder: "HH:MM — detected / acknowledged / triaged / mitigated / recovered / reviewed" },
      { key: "root_cause", label: "Root Cause", type: "textarea", colSpan: 24, rows: 3, placeholder: "Root cause (5 whys) + trigger conditions" },
      { key: "action_items", label: "Action Items", type: "textarea", colSpan: 24, rows: 4, placeholder: "Action | owner | due date | status (per line)" },
      { key: "slo_impact", label: "SLO Impact", type: "textarea", colSpan: 24, rows: 2, placeholder: "SLO breach ×2 / error budget 30% consumed" },
      { key: "notes", label: "Notes", type: "textarea", colSpan: 24, rows: 6, placeholder: "Supplementary background, dependencies, decision rationale" }
    ],
    templateContent: [
      "# ${title}",
      "",
      "**Incident ID**: ${incident_id}  |  **Project**: ${project}  |  **Severity**: ${severity}  |  **Type**: ${incident_type}  |  **Status**: ${status}",
      "**Oncall**: ${owner}  |  **MTTR**: ${mttr} min  |  **Blast Radius**: ${blast_radius}",
      "**KB Source**: ${kb_path}",
      "**Runbook**: ${runbook_link}",
      "",
      "## Summary",
      "${summary}",
      "",
      "## Timeline",
      "${timeline}",
      "",
      "## Root Cause",
      "${root_cause}",
      "",
      "## Action Items",
      "${action_items}",
      "",
      "## SLO Impact",
      "${slo_impact}",
      "",
      "## References",
      "- **KB Source**: `YiKnowledge/${kb_path}`",
      "- **Runbook**: ${runbook_link}",
      "- **oncall-sre/ subdirs** (per `YiKnowledge/README.md`): `incident-response` / `observability` / `release`",
      ""
    ].join("\n")
  }
};
