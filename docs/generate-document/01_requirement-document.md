# generate-document

> **Document Version**: v1.0 | **Last Updated**: 2026-05-02 | **Maintainer**: Claude | **Tool**: Claude Code
>
> **Related Documents**: [Requirement Tasks](./02_requirement-tasks.md) | [Design Document](./03_design-document.md) | [Usage Document](./04_usage-document.md) | [CLAUDE.md](../../CLAUDE.md)
>

[Feature Overview](#feature-overview) | [User Stories](#user-stories) | [Acceptance Criteria](#acceptance-criteria) | [Feature Details](#feature-details)

---

## Feature Overview

`generate-document` is the documentation-generation orchestrator for this repository. It creates or updates the full numbered document set (01-05, 07) under `docs/<feature-name>/` without modifying source code. The skill drives a 7-stage pipeline with mandatory review gates and enforces `import-docs` followed by `wework-bot` at termination. It supports project initialization (`init`), feature documentation (`<feature-name>-<description>`), weekly reports (`weekly`), and weekly decomposition (`from-weekly`).

**Core Values**
- 🎯 Traceable documentation: every technical fact links to upstream documents or code
- ⚡ Incremental updates: T1/T2/T3 change-level detection avoids full regeneration for minor edits
- 📖 Self-improving pipeline: weekly reports trigger automatic self-improvement proposals

---

## User Stories and Feature Requirements

**Priority icons**: 🔴 P0 - must have | 🟡 P1 - should have | 🟢 P2 - nice to have

| User Story | Acceptance Criteria | Process Generated Docs | Produced Smart Docs |
|------------|---------------------|------------------------|---------------------|
| 🔴 As a developer, I want automated documentation generation for each feature, so that requirement documents, design documents, and checklists remain consistent and traceable.<br/><br/>**Main Operation Scenarios**:<br/>- Initialize a new project with base files and a full document set<br/>- Generate a feature document set from a feature name and description<br/>- Generate a weekly report and decompose it into feature document sets | 1. One command produces a complete numbered document set (01-05, 07)<br/>2. All documents reference upstream specs and shared contracts<br/>3. Impact analysis closes dependency chains before design conclusions<br/>4. `import-docs` and `wework-bot` execute at termination without exception | [Requirement Tasks](./02_requirement-tasks.md)<br/>[Design Document](./03_design-document.md)<br/>[Project Report](./07_project-report.md) | [Generate Document Skill](../../.claude/skills/generate-document/SKILL.md)<br/>[Requirement Document Specification](../../.claude/skills/generate-document/rules/requirement-document.md)<br/>[Requirement Document Template](../../.claude/skills/generate-document/templates/requirement-document.md)<br/>[Requirement Document Checklist](../../.claude/skills/generate-document/checklists/requirement-document.md) |

---

## Document Spec

- **One numbered set per user story**: each feature gets its own `docs/<feature-name>/` directory containing 01-05, 07 (06 is written only by `implement-code`)
- **Anti-hallucination**: uncertain content must be labeled `> TBD (reason: …)`; all technical facts traceable to upstream documents or repository files per `shared/evidence-and-uncertainty.md`
- **Source-of-truth priority**: `SKILL.md` > `shared/evidence-and-uncertainty.md` > `rules/*.md` > `checklists/*.md` > `templates/*.md` > `README.md`

---

## Feature Details

> Only write "what to do / what not to do", not implementation details.

### Document Generation Pipeline

- **Description**: A 7-stage pipeline that plans, discovers, analyzes, designs, generates, curates, and delivers documentation. Stages 0-4 produce content; Stage 5 saves and curates knowledge; Stage 6 syncs and notifies.
- **Boundaries and Exceptions**: Does not modify project source code. If P0 prerequisites (`02_requirement-tasks.md`, `03_design-document.md`, `05_dynamic-checklist.md`) are missing, generation stops and writes a blocking `06_process-summary.md`.
- **Value/Motivation**: Eliminates inconsistent or ad-hoc documentation by enforcing spec-driven generation with three-layer review gates.

### Project Initialization (`init`)

- **Description**: Scans repository structure and generates 10 project base files (`CLAUDE.md`, `README.md`, `docs/architecture.md`, etc.) plus a full numbered set under `docs/project-init/`.
- **Boundaries and Exceptions**: Re-init supports T1/T2/T3 incremental updates with sentinel-block safe rewrite (`<!-- AUTO-GENERATED:BEGIN/END -->`).
- **Value/Motivation**: New projects get a standardized documentation foundation in one command.

### Weekly Reporting (`weekly` / `from-weekly`)

- **Description**: `weekly` generates a report for the current natural week under `docs/weekly/<natural-week>/weekly.md`. `from-weekly` decomposes a weekly report into multiple feature document sets.
- **Boundaries and Exceptions**: `weekly` automatically triggers `self-improve.js` after completion. `from-weekly` aborts if the weekly file is invalid or contains no actionable items.
- **Value/Motivation**: Bridges planning and execution by turning weekly goals into traceable feature documentation.

### Incremental Update Modes

- **Description**: T1 (minor wording), T2 (partial feature changes), T3 (scope/architecture changes). Each level determines which stages are skipped or trimmed.
- **Boundaries and Exceptions**: Change-level downgrading is prohibited. T1/T2 must not trigger full-project impact rescans.
- **Value/Motivation**: Saves time on small edits while ensuring scope changes get full analysis.

---

## Acceptance Criteria

### P0 - Must Pass
- [ ] **Item 1**: `/generate-document <feature-name>-<description>` creates `docs/<feature-name>/` with 01-05, 07 present and readable
- [ ] **Item 2**: `/generate-document init` creates 10 base files + `docs/project-init/01-07`
- [ ] **Item 3**: Every generated document ends with `import-docs` then `wework-bot`; neither is skipped on interruption or completion
- [ ] **Item 4**: P0 documents (`02`, `03`, `05`) exist before design conclusions are written

### P1 - Should Pass
- [ ] **Item 5**: Three-layer review gate (Mermaid syntax, design quality, markdown test) executes before save
- [ ] **Item 6**: T1/T2/T3 change level is correctly detected and stage skipping/trimming follows the matrix in `rules/workflow.md`
- [ ] **Item 7**: Impact analysis closes dependency chains across upstream, reverse, and transitive dimensions

### P2 - Nice to Have
- [ ] **Item 8**: `weekly` command appends a self-improvement proposal section automatically
- [ ] **Item 9**: Re-init preserves manual additions outside `<!-- AUTO-GENERATED:BEGIN/END -->` blocks

---

## Usage Scenario Examples

#### 📋 Scenario 1: Initialize a New Project

> **Background**: A new repository has been created and needs standardized documentation.
>
> **Operation**: Run `/generate-document init` in the project root.
>
> **Result**: `CLAUDE.md`, `README.md`, and 8 `docs/` base files are created, plus `docs/project-init/01-07`.

#### 📋 Scenario 2: Generate Feature Documentation

> **Background**: A developer is starting work on a user-login feature with phone OTP.
>
> **Operation**: Run `/generate-document user-login-phone-otp`.
>
> **Result**: `docs/user-login-phone-otp/` is created with 01-05, 07 populated from templates, rules, and code analysis.

#### 📋 Scenario 3: Update an Existing Feature Document

> **Background**: A requirement in `docs/payment-gateway/01_requirement-document.md` has been clarified.
>
> **Operation**: Run `/generate-document payment-gateway-refund-flow` after editing the requirement.
>
> **Result**: The skill detects the existing directory, grades the change as T2, and rewrites changed chapters in 01 while syncing corresponding entries in 02-05.

---

## Postscript: Future Planning & Improvements
