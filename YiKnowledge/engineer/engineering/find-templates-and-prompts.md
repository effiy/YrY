---
title: Find templates and prompts
aliases:
- i-want-to-find-templates-and-prompts
- templates prompts entry
tags:
- journeys
- template
- prompt
- prompt-engineering
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- engineer
benefit: context is reachable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../knowledge-curator/templates/README.md
- ../../ai-engineer/methodology/prompts--README.md
- ../../ai-engineer/methodology/prompt-engineering-guide.md
review_cycle: quarterly
tacit: false
---

# I want to find templates and prompts

> **As an** engineer, **I want to** find templates and prompts, **so that** context is reachable.

> "I want to write X, is there a ready template / is there a prompt" reach the template and prompt library within 2 hops.

## Summary
- 10 common documentation templates (PRD/BRD/tech design/selection/ADR/retrospective/meeting notes/1on1/user research/usability)
- 7 engineering prompts (BRD/RAG/Agent/SQL/Code Review/translation/weekly report)
- Prompt engineering methodology and injection defense companion index

## Core viewpoints

- **Templates are not about saving time — they are about preventing omission** — The most common failure mode in documentation is not bad writing; it is missing sections. A template forces the writer to consider every section, even if the answer is "not applicable." The PRD template forces the writer to consider user research; the ADR template forces the writer to consider alternatives. The template is a checklist, not a form.

- **Prompts are code, and they need the same rigor as code** — A prompt that generates a BRD is a piece of software: it has inputs (context), logic (instructions), and outputs (structured text). It needs version control, testing (evaluation set), and code review. A prompt that is copy-pasted from a chat session and never versioned is a piece of software without source control.

- **The template library is the single most important onboarding artifact** — A new hire who doesn't know what a BRD looks like can read the template. A new hire who doesn't know what an ADR should contain can read the template. The template library is the organization's institutional memory made tangible. A missing template is a missing piece of institutional memory.

- **Prompt injection defense is not a security afterthought — it is a prompt design constraint** — A prompt that accepts user input without sanitization is vulnerable to injection attacks. The defense must be designed into the prompt, not added after the first incident. Every prompt in the library should include injection defense as a standard section.

- **The template-prompt boundary is a design decision, not a convention** — A template (BRD, ADR, tech design) defines the structure of the output; a prompt (BRD generation, code review) defines the instructions for generating the output. The boundary is: templates are for humans writing documents; prompts are for AI generating documents. A template that is turned into a prompt is a template that is now code, with all the rigor that implies.

## Key info

- **Template library catalog (10 templates with use cases)**: (1) BRD — business requirements, answers "should we invest?"; (2) PRD — product requirements, answers "how do we build?"; (3) Tech Design — technical architecture, answers "what is the system design?"; (4) Tech Selection Evaluation — vendor/tool comparison, 8 evaluation dimensions with weights; (5) ADR — architecture decision record, documents alternatives considered and rationale; (6) Retrospective — sprint/project retrospective, Keep/Drop/Try format; (7) Meeting Notes — structured meeting minutes with decisions and action items; (8) 1-on-1 — manager-report meeting template, 5 segments; (9) User Research Interview — interview guide with opening/core/probing/closing; (10) Usability Test Report — test results with task completion rates and severity ratings. All templates are in `knowledge-curator/templates/` and follow the Yi-family unified template format.
- **Prompt library catalog (7 prompts with evaluation metrics)**: (1) BRD Generation — role + domain knowledge + 3 few-shot examples + user requirements, ~2000 tokens, evaluated on completeness/actionability/risk coverage; (2) RAG System — role + rules + citation enforcement + fallback behavior, ~500 tokens, evaluated on faithfulness/answer relevance; (3) Agent Tool Use — role + tool definitions + tool selection rules + error handling, ~1000 tokens, evaluated on tool selection accuracy/parameter correctness; (4) SQL Generation — role + schema context + query rules + safety constraints, ~800 tokens, evaluated on query correctness/safety; (5) Code Review — role + review guidelines + output format, ~500 tokens, evaluated on issue detection rate/false positive rate; (6) Multilingual Translation — role + language pairs + quality rules, ~300 tokens, evaluated on BLEU/COMET; (7) Weekly Report — role + report structure + aggregation rules, ~600 tokens, evaluated on completeness/decision-orientation. All prompts are in `ai-engineer/methodology/prompts--` and are versioned with the code.
- **Template vs. prompt selection decision tree**: Is the output for humans to read and act on? → Template. Is the output for AI to generate? → Prompt. Is the output a structured document with sections? → Template (for structure) + Prompt (for generation). Is the output a conversation or API response? → Prompt. Is the output a decision record? → Template (ADR, Tech Design). Is the output a creative or analytical text? → Prompt. The boundary is not always clean: a BRD has both a template (the structure) and a prompt (the generation instructions). The template is the contract for the output format; the prompt is the contract for the generation behavior.
- **Template freshness and maintenance protocol**: Each template has a `review_cycle` field (quarterly/biannual/annual) and a `last_verified` date. Templates are reviewed for: (1) Relevance — is this template still used? If not used in 2 review cycles, archive it; (2) Completeness — are there sections that should be added or removed? (3) Alignment — does the template match the current team process? (4) Examples — are the examples up to date? Templates that have not been reviewed within their cycle are flagged as "stale." The Yi-family templates were last verified 2026-08-07; next review is 2026-11-07.
- **Prompt versioning and evaluation protocol**: Each prompt is versioned in git alongside the code. A prompt change follows the same process as a code change: (1) Identify failure mode from production logs or eval results; (2) Hypothesize a fix; (3) Run evaluation against the full eval set; (4) Compare against baseline; (5) If no regressions, deploy behind feature flag with canary. The prompt version is recorded in the application config so that the exact prompt used for each response is traceable. The Yi-family prompts are versioned with the YiAi codebase; prompt changes are deployed via YiAi server restart.
- **Yi-family template and prompt usage (2026-08)**: Most-used templates: BRD (20+ generated BRDs), ADR (9+ ADRs across YiAi/YiVad), Weekly Report (weekly instance); Least-used templates: User Research Interview, Usability Test Report (no formal user research conducted). Most-used prompts: BRD Generation (primary BRD creation tool), RAG System (all aiChat responses), Code Review (per-PR code review); Least-used prompts: SQL Generation, Multilingual Translation (not yet integrated into any product). The gap: User Research and Usability templates are in place but unused; the first user research project should exercise them and feed back improvements.

## Scenario

When new hires write documentation, engineers take AI tasks, PMs start new requirements, the most frequently asked question is "is there a ready template". This entry aggregates template/prompt resources from `resources/templates/`, `resources/prompts/`, `methodology/ai-specific/` and `../../product-manager/delivery/` into a 2-hop path.

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `../../knowledge-curator/templates` | [prd.md](../../knowledge-curator/templates/prd.md) · [brd.md](../../knowledge-curator/templates/brd.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) · [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) · [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) |
| `../../ai-engineer/methodology/prompts` | [brd-generation-prompt.md](../../ai-engineer/methodology/prompts--brd-generation.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [multilingual-translation-prompt.md](../../ai-engineer/methodology/prompts--multilingual-translation.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts--weekly-report.md) |
| `../../ai-engineer/methodology` | [prompt-engineering-guide-summary.md](../../ai-engineer/methodology/prompt-engineering-guide.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `../../product-manager/meetings` | [weekly-meeting-template.md](../../product-manager/delivery/weekly-meeting.md) · [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-meeting-template.md](../../product-manager/delivery/retrospective-meeting.md) |

## Action recommendations

1. Before writing new documentation, first check whether `resources/templates/` already has a corresponding template, to avoid starting from scratch
2. For AI tasks, prioritize existing prompts in `resources/prompts/`, combined with `prompt-engineering-guide-summary.md` for tuning
3. After writing a new template/prompt, put it back into the corresponding catalog, with frontmatter tagged `lifecycle: reference` + `type: template|prompt`
4. Add a row to this entry's quick reference table to ensure it can be reached within 2 hops
5. When AI involves external input, must check `prompt-injection-defense-summary.md` to add defense section

## Anti-patterns

- **Creating a new document from scratch without checking the template library** — The most common failure mode is not knowing that a template exists. A new hire writes a PRD from scratch, missing the user research section, because they didn't know the PRD template existed. Always check `resources/templates/` before starting a new document.

- **Copy-pasting prompts from chat sessions without version control** — A prompt that generates a BRD is software. Copy-pasting it from a chat session and never versioning it means it has no source control, no test suite, and no code review. Every prompt used in production must be versioned in `resources/prompts/`.

- **Using a template without understanding its sections** — A template is a checklist, not a form. Filling in every section with "N/A" misses the point: the template exists to force the writer to consider each section. If a section is genuinely not applicable, explain why, don't just skip it.

- **Deploying prompts without injection defense** — A prompt that accepts user input without sanitization is vulnerable to injection attacks. The defense must be designed into the prompt, not added after the first incident. Every prompt involving external input must include injection defense.

- **Treating templates and prompts as write-once artifacts** — A template or prompt that is never reviewed becomes stale. The BRD template from 2024 may be missing the AI-specific sections that are critical in 2026. Templates and prompts need review cycles, just like code.

## Related

- similar journey: [../lessons/learn-pm-frameworks.md](../lessons/learn-pm-frameworks.md) — PRD / retrospective methodology
- similar journey: [./find-ai-deployment-cases.md](./find-ai-deployment-cases.md) — RAG / Agent landing
- upstream: [../../knowledge-curator/diagrams/user-journey.md](../../knowledge-curator/diagrams/user-journey.md) — journey design basis
- downstream: [../../knowledge-curator/diagrams/directory-blueprint.md](../../knowledge-curator/diagrams/directory-blueprint.md) — directory blueprint
