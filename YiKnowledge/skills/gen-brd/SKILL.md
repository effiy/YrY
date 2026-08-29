---
title: yry-gen-brd
name: yry-gen-brd
description: >
  Generate a single complete BRD (Business Requirements Document) entry in the
  YiVad BRD management system. Reads the YiKnowledge BRD template and YiVad
  meta-schemas as context, then generates structured meta fields + full
  markdown body content, and creates the entry via the TopicEntry API.
  Triggered by `/yry-gen-brd`. Supports specifying business domain, country,
  brand, priority, and business context as input.
user_invocable: true
lifecycle: active
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/gen-brd
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - ai
  - brd
  - requirements
chip: ai-methodology
---
# yry-gen-brd

> Generate a single BRD document entry — structured metadata + full markdown body — and persist it through the YiVad TopicEntry API. Reads YiKnowledge BRD resources and YiVad meta-schemas for domain context.

## Quick Start

```
/yry-gen-brd
  --domain after_sales
  --country de
  --brand "Brand A"
  --priority p1
  --context "After-sales ticketing platform for EU markets"
```

## Pipeline

```
read-context  →  generate-meta  →  generate-content  →  create-entry  →  verify
```

| # | Step | Responsibility |
|---|------|----------------|
| ① | **Read context** | Load `YiKnowledge/curator/templates/brd.md` (BRD template), `YiKnowledge/aier/methodology/prompts/brd-generation.md` (generation rules), and `YiVad/src/views/brd/meta-schemas.ts` (field definitions) |
| ② | **Generate meta** | Produce all structured `meta` fields for the `brd-documents` topic per the meta-schemas definition |
| ③ | **Generate content** | Produce the full markdown body following the BRD template structure, with placeholders filled from user input and generated context |
| ④ | **Create entry** | Call `createTopicEntry("brd", "brd-documents", { title, meta, content })` via the project API |
| ⑤ | **Verify** | Confirm the entry appears in the BRD documents list page |

## Input Parameters

| Parameter | Required | Type | Description | Example |
|-----------|:--------:|------|-------------|---------|
| `--domain` | ✓ | string | Business domain (value from `DOMAIN_OPTIONS`) | `after_sales` |
| `--country` | | string | Target country/region (value from `COUNTRY_OPTIONS`) | `de` |
| `--brand` | | string | Applicable brand(s), comma-separated | `"Brand A, Brand B"` |
| `--priority` | | string | Business priority (p0/p1/p2/p3) | `p1` |
| `--department` | | string | Originating department (value from `DEPARTMENT_OPTIONS`) | `after_sales` |
| `--business_owner` | | string | Business owner/sponsor name and title | `"Dr. Zhang Wei — Director, After-Sales EU"` |
| `--author` | | string | Author name and role | `"Li Ming — Business Analyst"` |
| `--context` | ✓ | string | Free-text description of the business context, problem, or opportunity | See examples below |
| `--scope` | | string | Scope description — what's in and out of scope | `"Phase 1: DE + FR markets, Tier-2 workflow"` |
| `--regulatory` | | string | Applicable regulations | `"GDPR Art. 5(1)(c), EU Data Act 2025"` |
| `--language` | | string | Output language for markdown content (en/zh) | `en` |

## Context Files

The skill reads these files for domain knowledge:

### BRD Knowledge Base (`YiKnowledge/brd/`)

| File | Purpose |
|------|---------|
| `brd/domains/{domain}.md` | **Primary context** — 10 domain files with KPIs, pain points, roles, regulations, terminology per business domain |
| `brd/scenarios/scn-*.md` | Reusable business scenario patterns with As-Is/To-Be flows, quantified impacts, acceptance criteria |
| `brd/terminology/general.md` | General BRD & project management terminology (EN/ZH bilingual) |
| `brd/terminology/automotive.md` | Automotive industry terminology (EN/ZH/DE trilingual) |
| `brd/reference/countries.md` | Country/region profiles — market characteristics, data protection, labour laws |
| `brd/reference/regulations.md` | Regulatory frameworks by country & domain — GDPR, EU Data Act, IFRS, etc. |
| `brd/reference/systems.md` | Common enterprise systems and integration patterns |
| `brd/examples/example-after-sales-ticketing.md` | Complete BRD example — both meta fields and 12-section markdown body |

### Legacy Resources

| File | Purpose |
|------|---------|
| `YiKnowledge/curator/templates/brd.md` | Bilingual BRD template — 7 sections: Document Info, Background & Objectives, Business Scenarios, Countries/Modules, Rules & Constraints, Timeline, Acceptance Criteria, Attachments, Approvals |
| `YiKnowledge/aier/methodology/prompts/brd-generation.md` | BRD chapter generation prompt — system prompt rules, input variables, output format expectations, temperature/token settings, and YiAi integration notes |
| `YiVad/src/views/brd/meta-schemas.ts` | Meta field definitions for `brd-documents` topic — 30+ fields across Document Control, Business Context, Planning & Resources, Risk & Impact, and Attachments & Glossary sections |

### Context Load Order

```
1. Read brd/domains/{domain}.md     → Get domain KPIs, pain points, roles, regulations, terminology
2. Read brd/scenarios/              → Match suitable scenario patterns as As-Is/To-Be reference
3. Read brd/terminology/            → Use accurate domain and industry terminology
4. Read brd/reference/countries.md   → Match target market characteristics
5. Read brd/reference/regulations.md → Match applicable regulatory frameworks
6. Read brd/examples/               → Reference example output format and detail level
7. Read YiKnowledge BRD template    → Confirm section structure completeness
8. Read YiVad meta-schemas.ts       → Confirm all required fields
```

## Generated Meta Fields

The skill populates all fields defined in `brdMetaSchemas["brd-documents"].metaFields`:

### Document Control
- `document_id` — Auto-generated: `BRD-YYYY-NNN` (year + sequential or timestamp-based)
- `title` — Generated from domain + context summary
- `version` — `"1.0"` (initial draft)
- `version_date` — Today's date
- `change_summary` — `"Initial draft — generated by yry-gen-brd skill"`
- `business_owner` — From `--business_owner` or generated
- `author` — From `--author` or `"Claude Code — yry-gen-brd skill"`
- `department` — From `--department` or inferred from `--domain`
- `domain` — From `--domain`
- `priority` — From `--priority`, default `p2`
- `status` — `"draft"` (new entries start as draft)
- `country` — From `--country`
- `brand` — From `--brand`
- `expected_golive` — Estimated based on priority (p0: +1 month, p1: +3 months, p2: +6 months, p3: +12 months)
- `related_brds` — Empty (to be linked manually)
- `created_date` — Today's date
- `last_reviewed_date` — Today's date
- `regulatory_context` — From `--regulatory` or generated from domain
- `executive_summary` — Generated 3–5 sentence overview

### Business Context
- `business_background` — Generated market/organisational context with metrics
- `current_state` — Generated as-is process description with pain points
- `business_problem` — Generated problem statement with quantified impact
- `proposed_solution` — Generated high-level solution description
- `expected_outcomes` — Generated 3–5 quantified outcomes
- `key_constraints` — Generated constraints, assumptions, dependencies

### Planning & Resources
- `budget_info` — Estimated or `"TBC — pending business case approval"`
- `urgency_level` — From `--priority` (mapped to urgency)
- `estimated_effort` — `"TBC — pending technical assessment"`

### Risk & Impact
- `risk_summary` — Generated top 3–5 risks with mitigations
- `impact_assessment` — Generated change impact across teams/processes/systems

### Attachments & Glossary
- `attachment_links` — Placeholder structure (user fills in actual links)
- `glossary_terms` — Auto-populated with common domain acronyms

## Content Generation Rules

The markdown body (`content`) follows the YiKnowledge BRD template structure with 12 sections:

1. **Document Control** — Metadata table + version history
2. **Executive Summary** — Business problem, proposed solution, expected outcomes, key constraints
3. **Business Context & Problem Statement** — Current state, problem/opportunity, why now
4. **Project Scope** — In scope, out of scope, future phases
5. **Stakeholder Analysis** — Role/persona table (placeholder for stakeholder register)
6. **Requirements Overview** — Functional, non-functional, integration requirements
7. **Business Rules Summary** — Rule ID table (placeholder for rules register)
8. **Constraints, Assumptions & Dependencies** — Detailed breakdown
9. **Business Objectives & Success Metrics** — Objective/KPI/baseline/target table
10. **Risk Assessment** — Risk ID/description/likelihood/impact/mitigation table
11. **Milestone Plan (High-Level)** — Phase/target date/deliverables/owner table
12. **Glossary & References** — Terms, documents, links

### Generation Rules (from brd-generation-prompt.md)

| # | Rule |
|---|------|
| 1 | Be concise and concrete. Avoid filler ("in order to", "it is worth noting") |
| 2 | If user input lacks information for a required field, write `[TBD / TBC]` instead of fabricating |
| 3 | Use proper business analysis terminology; quantify impact where possible |
| 4 | Placeholder sections (Stakeholders, Rules, Acceptance Criteria) reference their respective registers; don't duplicate |
| 5 | Version history starts with `0.1 — Initial draft (generated by yry-gen-brd)` |
| 6 | All dates use ISO 8601 format (`YYYY-MM-DD`) |
| 7 | BRD ID format: `BRD-YYYY-NNN` where NNN is sequential or timestamp-based |
| 8 | Output language matches `--language` parameter (default: `en`) |

## API Contract

The skill creates the entry through the project's existing API layer:

```
POST /  body: {
  "module_name": "services.database.data_service",
  "method_name": "create_document",
  "parameters": {
    "cname": "brd_brd-documents",
    "data": {
      "key": "brd_brd-documents_<generated>",
      "topic": "brd-documents",
      "title": "<generated title>",
      "tags": ["<domain>", "<country>", "<brand>", ...],
      "meta": { <all structured fields> },
      "contentPath": "brd/brd-documents/brd_brd-documents_<key>.md",
      "createdAt": <timestamp>,
      "updatedAt": <timestamp>
    }
  }
}
```

Plus a file write for the markdown body:
```
POST /write-file  body: {
  "target_file": "YiKnowledge/brd/brd-documents/brd_brd-documents_<key>.md",
  "content": "<full markdown body>"
}
```

> **Note**: Alternatively, use `createTopicEntry("brd", "brd-documents", {...})` from `@/api/modules/topic.ts` which handles both the MongoDB document creation and the YiKnowledge file write in one call.

## Workflow

### Step 1: Read Context

```
Read YiKnowledge/curator/templates/brd.md → understand the BRD structure
Read YiKnowledge/aier/methodology/prompts/brd-generation.md → understand generation rules
Read YiVad/src/views/brd/meta-schemas.ts → understand required meta fields
```

### Step 2: Generate Meta Fields

Based on user input (`--context`, `--domain`, etc.), generate all meta fields. Use the domain knowledge from the BRD template to produce realistic, professional content:

- **After-Sales domain**: ticket management, warranty claims, parts logistics, dealer communication, customer satisfaction, SLA tracking, repair workflows
- **Sales/CRM domain**: lead management, pipeline tracking, customer 360, opportunity scoring, territory management
- **Marketing domain**: campaign orchestration, customer segmentation, multi-channel attribution, budget management
- **Supply Chain domain**: inventory optimization, demand forecasting, supplier management, logistics tracking
- **Finance domain**: financial reporting, budgeting/forecasting, expense management, revenue recognition
- **HR domain**: employee lifecycle, performance management, learning & development, workforce planning
- **Data/Analytics domain**: data pipeline, dashboard/reporting, ML model serving, data governance
- **IT/Infra domain**: service desk, incident management, change management, asset management
- **Security/Compliance domain**: access control, audit logging, vulnerability management, policy enforcement
- **Legal domain**: contract management, regulatory tracking, case management, e-discovery

### Step 3: Generate Markdown Content

Produce the full 12-section markdown body. Each section should be:

- **Concrete and quantified** — use realistic numbers, timeframes, and metrics
- **Domain-appropriate** — use terminology and scenarios from the specified business domain
- **Self-contained** — someone reading only one section should understand its context
- **Honest about gaps** — use `[TBD / TBC]` for information not derivable from user input

### Step 4: Create the Entry

```
Call createTopicEntry("brd", "brd-documents", {
  title: generated_title,
  meta: generated_meta_fields,
  content: generated_markdown_body,
  tags: [domain, country, brand, ...]
})
```

### Step 5: Verify

```
GET /brd/brd-documents → confirm the new entry appears
GET /brd/brd-documents/detail/<key> → confirm meta fields and content render correctly
```

## Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Missing `--context` | Prompt user for business context — this is the primary input for generation |
| Missing `--domain` | Prompt user to select from `DOMAIN_OPTIONS` (12 domains) |
| Unknown domain value | Suggest closest match from `DOMAIN_OPTIONS`, ask user to confirm |
| `--country` not in `COUNTRY_OPTIONS` | Accept free-text but warn it won't match the select filter |
| API call fails (network error) | Retry once; if still failing, output the generated meta + content so user can manually create |
| Content file write fails | The MongoDB document may still be created; attempt file write retry, warn if inconsistent |
| Duplicate `document_id` | Append `-2` or `-b` suffix; log warning |

## Example

### Input

```
/yry-gen-brd
  --domain after_sales
  --country de
  --brand "Brand A"
  --priority p1
  --business_owner "Dr. Zhang Wei — Director, After-Sales EU"
  --context "EU after-sales operations handle ~15,000 tickets/month across 5 markets. Current process uses Zendesk (DE/FR) and manual email/phone (IT/ES/NL), with average first-response time of 8.3 hours and 23% SLA breach rate. Agents must switch between 3 systems to resolve one ticket. Need a unified platform to reduce resolution time to under 2 hours."
  --scope "Phase 1: DE + FR markets, Tier-2 agent workflow, critical ticket routing"
  --regulatory "GDPR Art. 5(1)(c) data minimisation, EU Data Act 2025"
```

### Output

A complete BRD document entry with:
- **Meta**: 30+ structured fields populated with after-sales domain context
- **Title**: "Unified After-Sales Ticketing Platform — EU Phase 1 (DE/FR)"
- **Document ID**: `BRD-2026-007`
- **Content**: 12-section markdown body (~3,000–5,000 words) covering the complete BRD template
- **Tags**: `["after_sales", "de", "brand-a", "ticketing", "phase-1"]`

## Borders

| Boundary | Permission |
|----------|-----------|
| `YiKnowledge/brd/domains/*.md` | read (domain knowledge — primary context) |
| `YiKnowledge/brd/scenarios/*.md` | read (scenario patterns) |
| `YiKnowledge/brd/terminology/*.md` | read (terminology & glossary) |
| `YiKnowledge/brd/reference/*.md` | read (countries, regulations, systems) |
| `YiKnowledge/brd/examples/*.md` | read (complete BRD examples) |
| `YiKnowledge/curator/templates/brd.md` | read (legacy template) |
| `YiKnowledge/aier/methodology/prompts/brd-generation.md` | read (generation rules) |
| `YiVad/src/views/brd/meta-schemas.ts` | read (field definitions) |
| `YiVad/src/api/modules/topic.ts` | read (API contract reference) |
| YiAi backend (via HTTP POST) | write (create BRD entry) |
| `YiKnowledge/brd/brd-documents/` | write (markdown content file) |

## Related Skills

- [[yry-init]] — Project initialization; generates CLAUDE.md + README.md
- [[yry-optimize-meta-columns]] — Optimize table column widths for any ProTable page

## References

### Knowledge Base
- [BRD Knowledge Base README](../../../YiKnowledge/brd/README.md) — Full knowledge base overview and usage guide
- [Domain Index](../../../YiKnowledge/brd/domains/README.md) — 10 business domain files with KPIs, pain points, roles, regulations, terminology
- [Scenario Index](../../../YiKnowledge/brd/scenarios/README.md) — Reusable business scenario patterns
- [General Terminology](../../../YiKnowledge/brd/terminology/general.md) — BRD & project management terms (EN/ZH)
- [Automotive Terminology](../../../YiKnowledge/brd/terminology/automotive.md) — Automotive industry terms (EN/ZH/DE)
- [Country Profiles](../../../YiKnowledge/brd/reference/countries.md) — Market characteristics per country
- [Regulatory Frameworks](../../../YiKnowledge/brd/reference/regulations.md) — Regulations by country & domain
- [Systems Reference](../../../YiKnowledge/brd/reference/systems.md) — Common enterprise systems & brands
- [Complete BRD Example](../../../YiKnowledge/brd/examples/example-after-sales-ticketing.md) — Full BRD with meta + content

### Code & Templates
- [BRD Template](../../../YiKnowledge/curator/templates/brd.md) — Bilingual BRD document template
- [BRD Generation Prompt](../../../YiKnowledge/aier/methodology/prompts/brd-generation.md) — YiAi BRD agent chapter generation prompt
- [Meta Schemas](../../../YiVad/src/views/brd/meta-schemas.ts) — BRD topic field definitions
- [Topic API](../../../YiVad/src/api/modules/topic.ts) — Generic topic CRUD
