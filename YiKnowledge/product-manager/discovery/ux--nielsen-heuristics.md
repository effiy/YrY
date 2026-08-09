---
title: Nielsen 10 Heuristics Evaluation
aliases:
- Nielsen 10 Heuristics
- Heuristic Evaluation
- Usability Assessment
tags:
- UX
- usability
- assessment
- heuristics
- design review
category: product-manager/discovery/ux
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- product-manager
benefit: PMs can make data-informed product decisions with clear metrics and frameworks
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./ai-product-ux-patterns.md
- ./after-sales-pad-visual-review.md
- ../../frameworks/README.md
tacit: false
---

# Nielsen 10 Heuristics Evaluation

> **As a** product manager, **I want to** nielsen heuristics, **so that** product decision clear.

> 10 general usability heuristics for evaluating interface usability — the most widely used usability checklist in the industry.

## Summary

- Jakob Nielsen (1994) proposed, 10 heuristics cover system status, user control, consistency, error prevention, etc.
- Evaluation process: choose 2-3 evaluators to independently walk through → record problems + severity (1-5) → merge and sort → fix → re-evaluate
- Cannot replace usability QA, but extremely low cost, can be done periodically
- AI products need special attention: streaming output, interruptible / regeneratable, sensitive operations with human in the loop

## Core viewpoints

- **Heuristic evaluation trades depth for speed, and that trade-off is the point.** A single evaluator finds ~35% of usability problems; 3-5 evaluators find ~75%. The method is not designed to find every problem — it is designed to find the most severe problems with the least investment. A heuristic evaluation that takes two weeks defeats the purpose. The 2-3 person, 1-2 day budget is a hard constraint, not a suggestion.

- **Independent evaluation before discussion is the single most important rule.** If evaluators discuss findings during the walk-through, the first person to speak anchors the group's perception of what constitutes a problem. Each evaluator must complete the full task walk-through and record problems independently before any merging session. The merge is where patterns emerge — when three independent evaluators all flag the same interaction as confusing, that is a signal, not noise.

- **Severity grading without a calibrated scale is random number assignment.** A scale from 1-5 is meaningless unless each level has a concrete anchor: 5 = blocks core task completion, 4 = impacts majority of users, 3 = impacts some users, 2 = minor annoyance, 1 = cosmetic. The calibration session — where evaluators rate the same 3 example problems and discuss discrepancies — must happen before the evaluation begins, or the severity numbers will be inconsistent across evaluators.

- **AI products require an extended heuristic set beyond Nielsen's original 10.** Streaming output visibility, tool-call transparency, interruptibility/re-generatability, and human-in-the-loop for sensitive operations are not covered by standard heuristics. Evaluating an AI product with only Nielsen's 10 heuristics misses the interaction patterns that define AI UX. The evaluation protocol must include AI-specific heuristics as a required supplement, not an optional add-on.

- **Heuristic evaluation is a starting point, not a substitute for usability testing with real users.** Heuristics find violations of design principles; they cannot find workflow barriers, unmet expectations, or confusion that only emerges when a real user with domain knowledge attempts a real task. The quarterly heuristic evaluation catches surface-level regressions; the annual usability test with 5 real users catches the problems that heuristics cannot reach.

## Key information

### Concept breakdown: 10 heuristics

| # | Heuristic | meaning |
|---|---|---|
| 1 | Visibility of system status | users know what the system is doing at any time |
| 2 | Match between system and real world | use language and concepts close to users, not tech-speak |
| 3 | User control and freedom | provide "emergency exit" (undo, exit) |
| 4 | Consistency and standards | same concept uses same word, follow platform conventions |
| 5 | Error prevention | prevent errors over reporting errors |
| 6 | Recognition rather than recall | choices are visible, not by memory |
| 7 | Flexibility and efficiency of use | shortcuts, customizable |
| 8 | Aesthetic and minimalist design | no irrelevant information |
| 9 | Help users recognize, diagnose, recover from errors | human-friendly error messages + solution suggestions |
| 10 | Help and documentation | provide searchable docs when needed |

### Key parameter: severity grading

| level | meaning | treatment |
|---|---|---|
| 5 | blocking core task, must fix immediately | immediately |
| 4 | impacts many users, fix this iteration | this iteration |
| 3 | impacts some users, fix next iteration | next iteration |
| 2 | minor problem, can defer | queue |
| 1 | cosmetic problem, optional | optional |

### Comparison with other evaluation methods

| method | suitable for |
|---|---|
| Heuristic evaluation | quick problem finding in early design, 2-3 people 1-2 days |
| Usability QA | 5 real users walk through, discover real barriers |
| A/B QA | quantify comparison after launch |
| Data analysis | continuous monitoring of launched features |

### AI product special focus points

| Heuristic | AI scenario special focus |
|---|---|
| System status visible | streaming output, thinking chain, tool call display |
| User control and freedom | interruptible, regeneratable, editable |
| Error prevention | sensitive operation with human in the loop |
| Consistency | multi-modality answer style consistent |
| Help recognize errors | when model errors give actionable suggestions (not tech error) |
| Help docs | model capability and limits explained |

### Apply scenarios

- early design quick problem finding (2-3 people 1-2 days)
- must run after launching new features
- quarterly periodic evaluation

## Action recommendations

1. **choose 2-3 evaluators**: independent evaluation, avoid single perspective
2. **familiarize with product + choose typical tasks**: not by page listing problems, walk by task flow
3. **each person independent walk-through**: discover problems violating heuristics
4. **record**: each problem write which heuristic violated, severity (1-5), location screenshot
5. **merge**: merge duplicates, sort by severity
6. **fix**: top severity first
7. **re-evaluate**: walk through again after fix
8. **quarterly one-shot**: designer + PM both participate

## Anti-patterns

- **Running heuristic evaluation once and never repeating.** Interfaces change with every release, and new usability problems emerge; quarterly re-evaluation is the minimum for actively developed products.

- **Evaluating without domain knowledge of the product.** Evaluators unfamiliar with the product's domain miss context-specific violations (e.g. after-sales workflow conventions, industry terminology misuse).

- **Treating heuristic evaluation as a substitute for usability testing with real users.** Heuristics find surface-level violations; only real users reveal workflow barriers, confusion, and unmet expectations.

- **Merging severity ratings across evaluators without discussion.** Disagreement on severity is a signal that the heuristic violation is ambiguous or context-dependent; discuss before merging.

- **Skipping AI-specific heuristics when evaluating AI-powered products.** Standard Nielsen heuristics miss streaming output UX, tool-call visibility, hallucination handling, and user control over generated content.

## Related

- same class: [ai-product-ux-patterns-summary.md](./ai-product-ux-patterns.md) — AI scenario UX Pattern
- same class: [after-sales-pad-visual-review-summary.md](./after-sales-pad-visual-review.md) — visual walk-through instance
- Upstream: [../../frameworks/README.md](../../frameworks/README.md) — PM framework
- reference: Nielsen Norman Group — *10 Usability Heuristics for User Interface Design*; https://www.nngroup.com/articles/ten-usability-heuristics
