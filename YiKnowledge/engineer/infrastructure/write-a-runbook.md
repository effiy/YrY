---
title: Write a runbook
aliases:
- i-want-to-write-a-runbook
- runbook-journey
- sop-journey
- operations-manual-entry
tags:
- journeys
- runbook
- sop
- operations
- oncall
- incident-response
category: engineer/infrastructure
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: knowledge is captured
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../oncall-sre/incident-response/respond-to-an-incident.md
- ../../oncall-sre/observability/set-up-observability.md
- ../../new-hire/onboarding/onboard-as-a-new-engineer.md
- ../../README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to write a runbook

> **As an** engineer, **I want to** write a runbook, **so that** knowledge is captured. 

> "Operations manual / SOP / incident handling / daily operations / capacity operations / backup recovery" reach within 2 hops: process + oncall + monitoring + retrospective + template. 

## Summary

- Process via `work/processes/`: [incident-response-process.md](../process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [oncall-rotation-process.md](../process/oncall-rotation.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md)
- Retrospective via [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) + [sprint-retrospective-template.md](../process/sprint-retrospective.md)
- Documentation template via [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) + [tech-design-template.md](../../knowledge-curator/templates/tech-design.md)
- Thinking via [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md)

## Core viewpoints

**A runbook is written for the on-call engineer at 3 AM, not for the system's author at 10 AM.** The on-call engineer is sleep-deprived, stressed, and unfamiliar with the system they are debugging. The runbook must assume zero context: every command must be copy-pasteable, every expected output must be shown, and every decision point must be a binary choice with clear criteria. A runbook that says "check the logs for anomalies" is a runbook that assumes the reader knows what an anomaly looks like.

**The runbook is a living document that degrades without maintenance.** A runbook that was written 6 months ago and has not been updated since is a runbook that contains outdated commands, stale paths, and wrong expected outputs. Every incident that uses the runbook must produce an update to the runbook. Every quarterly drill must validate the runbook's steps. The runbook's accuracy is measured by the last time it was successfully executed.

**A runbook without a rollback section is a runbook that assumes every operation succeeds.** Every step that modifies the system (restart, config change, data migration) must have a corresponding rollback step that returns the system to its previous state. The rollback step must be tested in the same drill that tests the forward step. An operation that cannot be rolled back must be clearly marked as irreversible, and the runbook must specify the escalation path for when the irreversible operation fails.

**The runbook's escalation path is as important as its operational steps.** The on-call engineer who follows the runbook and finds that step 3 does not work needs to know what to do next. The runbook must specify: when to escalate (P0/P1/P2 criteria), who to escalate to (primary and backup contacts), and what information to include in the escalation (the runbook step that failed, the observed output, the expected output). The escalation path is the runbook's safety net.

**The runbook must be findable, not just written.** A runbook that is buried in a wiki 5 clicks deep is a runbook that will not be found during an incident. The runbook must be linked from the monitoring alert, the on-call dashboard, and the incident response process. The discoverability of the runbook is as important as the content of the runbook.

## Key info

- **Runbook template structure (7 sections)**: (1) Metadata — system name, owner, last updated, last tested date, runbook ID for alert linking; (2) Alert trigger — which monitoring alert fires, what the alert message looks like, how to acknowledge and silence; (3) Triage (first 5 minutes) — 3-5 yes/no questions that narrow down the root cause (e.g., "Is the database reachable? Run: `ping db.internal`"); (4) Diagnosis steps — ordered by likelihood, each step has: command to run (copy-pasteable), expected output (screenshot or exact text), decision point (if output matches X, go to step Y; if output matches Z, escalate); (5) Remediation steps — ordered by severity, each step has: action (copy-pasteable command or click path), expected outcome, rollback action, time estimate; (6) Escalation path — P0/P1/P2 criteria, primary contact (name + phone + chat), backup contact, escalation template (subject line, information to include); (7) Post-incident — what to document, where to file the postmortem, how to update the runbook.
- **Runbook writing rule: the 3 AM test** — Give the runbook to an engineer who has never seen the system, at 3 AM, after they've been asleep for 2 hours. If they can follow the runbook and resolve the incident within the SLA without asking anyone for help, the runbook passes. If they need to ask a question, the runbook fails at the point where the question was asked, and that point must be improved. The 3 AM test is the only valid quality metric for a runbook.
- **Runbook maintenance triggers**: (1) Every incident — the runbook used during an incident must be updated within 24 hours with any discrepancies found (wrong command, missing step, outdated expected output); (2) Quarterly drill — the runbook must be executed end-to-end in a planned drill, and any step that fails must be fixed; (3) System change — any deployment that changes a command, path, configuration, or dependency must include a runbook update in the same PR; (4) Personnel change — when the runbook owner or escalation contacts change, the runbook must be updated within the same week. A runbook whose `last_tested` date is >90 days ago is considered stale and must be re-validated.
- **Runbook discoverability requirements**: (1) Linked from the monitoring alert description — the alert payload includes the runbook URL or ID; (2) Pinned in the on-call chat channel — the runbook index is the pinned message; (3) Searchable by system name, alert name, and symptom — the runbook repository has a search index; (4) Available offline — the runbook is cached in the on-call mobile device or printed in the on-call room. The Yi-family projects currently store runbooks in YiKnowledge under `oncall-sre/` with a 2-hop reachability path from the incident response entry.
- **Runbook drill scoring**: (1) Time to triage — from alert receipt to root cause hypothesis, target <5 minutes; (2) Time to remediate — from root cause to system restored, target <15 minutes for common incidents; (3) Steps executed correctly — percentage of steps followed without deviation, target >90%; (4) Escalation correctness — escalation triggered at the right time with the right information; (5) Runbook accuracy — percentage of steps that produced the expected output, target 100%. The drill score is tracked quarterly; a declining score indicates the runbook is degrading faster than it's being maintained.
- **Yi-family runbook coverage**: YiAi — runbooks for: knowledge watcher failure (MongoDB connection loss, file sync failure), LLM provider outage (multi-provider failover procedure), RAG pipeline degradation (hybrid retrieval fallback). YiVad — runbooks for: SSE streaming failure (nginx buffer issue, parser error), frontend build failure (Rsbuild config, dependency mismatch). YiPet — runbooks for: Chrome extension update failure (Web Store review rejection, manifest compatibility), chat controller failure (SSE parser, dual-world boundary). Coverage gap: no runbooks exist for database failover, DNS issues, or certificate expiry.

## Scenario

When writing operations runbook / SOP / incident handling manual / daily operations manual / disaster recovery process, SRE + oncall + platform + main owner need to look up process + oncall + monitoring + retrospective + template. This entry aggregates runbook-related process + case studies + templates into a 2-hop path, avoiding "runbook scattered across wiki / can't find during incident / oncall relies on memory / steps outdated without retrospective". 

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [incident-response-process.md](../process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [oncall-rotation-process.md](../process/oncall-rotation.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [disaster-recovery-drill-process.md](disaster-recovery-drill.md) · [chaos-engineering-process.md](../quality-security/chaos-engineering.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [data-migration-process.md](../infrastructure/data-migration.md) · [dependency-upgrade-process.md](../engineering/dependency-upgrade.md) · [quarterly-security-audit-process.md](../quality-security/quarterly-security-audit.md) · [canary-release-process.md](../../oncall-sre/release/canary-release.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — historical incident archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [react-jsxdev-mismatch.md](../lessons/gotcha-react-jsxdev-mismatch.md) · [vite-to-rsbuild-migration.md](../lessons/gotcha-vite-to-rsbuild-migration.md) — common incident root causes |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) — operations landing experience |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — keep steps simple · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — invert misoperations · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain of operations |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `resources/templates/` | [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [one-on-one-template.md](../../knowledge-curator/templates/one-on-one.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) — runbook AI proofread |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) — AI app operations monitoring |
| `lifecycle/` | [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [governance.md](../../knowledge-curator/governance/governance.md) — runbook quarterly audit |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) — operations weekly meeting |
| `projects/` | Each project `dev-standards-summary.md` §operations commands + `architecture-summary.md` §deploy |

## Action recommendations

1. **Structure**: Trigger conditions + impact scope + steps (commands + expected output + exception handling) + validation + rollback + upgrade path; don't write prose. 
2. **First principles**: First ask "who uses this runbook / when / what state after use"; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
3. **Occam**: The fewer steps the better; the minimal version that meets needs wins; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
4. **Inversion**: First imagine "operating this runbook, how could misoperation happen / how could it blow up" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
5. **Executable**: Every step must be copy-paste executable; don't write "please refer to some doc". 
6. **Expected output**: Every step must have expected output (success / failure), for oncall judgment; don't only write commands. 
7. **Rollback**: Every write operation must have rollback steps; see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md). 
8. **Upgrade path**: Clearly define when to upgrade to P0 / summon sponsor / switch oncall; see [incident-response-process.md](../process/incident-response.md). 
9. **Oncall perspective**: Assume oncall unfamiliar with business can still run; don't assume business background. 
10. **Drill**: Quarterly run [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) + [disaster-recovery-drill-process.md](disaster-recovery-drill.md) + [chaos-engineering-process.md](../quality-security/chaos-engineering.md) to validate runbook still executable. 
11. **Retrospective update**: After each incident follow [incident-postmortem-template.md](../lessons/failure-incident-postmortem.md) retrospective + update runbook + archive [lessons/failures/bugs/](../lessons). 
12. **Quarterly audit**: Scan runbooks once whether still executable (commands / paths / interfaces / permissions may change); see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md). 
13. **AI assist**: Use [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) pattern to let AI proofread runbook steps for completeness + executability. 
14. **2-hop reachability**: Runbook must be reachable from journeys entry or oncall docs; don't be siloed. 

## Anti-patterns

- **Writing the runbook as prose instead of procedures.** A runbook that says "the system may experience latency degradation under high load, which can be mitigated by scaling the service tier" is a blog post, not a runbook. The runbook must say: "1. Check the dashboard at URL X. 2. If P99 latency > 500ms, run `kubectl scale deployment Y --replicas=Z`. 3. Expected output: 'deployment scaled'. 4. Wait 2 minutes and re-check the dashboard." Every step is a command, not a description.

- **Assuming the on-call engineer has the same access and permissions as the runbook author.** A runbook that says "run `sudo systemctl restart postgresql`" assumes the on-call engineer has sudo access to the database server. The runbook must specify the required permissions upfront, and the on-call onboarding process must verify that the on-call engineer has those permissions. A runbook step that requires access the on-call engineer does not have is a runbook step that cannot be executed.

- **Writing the runbook after the incident and never updating it.** The runbook is written during the post-incident retrospective, and then it is never touched again. The next time the same incident occurs, the runbook is outdated and the on-call engineer must debug from scratch. The runbook must be updated after every incident and validated during every quarterly drill.

- **Including too much context and not enough action.** A runbook that starts with 3 pages of system architecture explanation before the first actionable step is a runbook that the on-call engineer will not read during an incident. The context is useful for training, but it belongs in a separate document. The runbook must start with the first actionable step, and the context should be linked, not embedded.

- **Writing a single runbook for a system with multiple failure modes.** A runbook that covers "database issues" is too broad to be useful. The runbook must be specific to a failure mode: "database connection pool exhaustion," "database replication lag," "database disk full." Each failure mode has a different trigger, different diagnostic steps, and different remediation. The runbook's title should match the alert that triggers it.

## Related

- Same-class journey: [../../oncall-sre/incident-response/respond-to-an-incident.md](../../oncall-sre/incident-response/respond-to-an-incident.md) — incident response
- Same-class journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observability
- Same-class journey: [../../new-hire/onboarding/onboard-as-a-new-engineer.md](../../new-hire/onboarding/onboard-as-a-new-engineer.md) — oncall onboarding
- Same-class journey: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — documentation writing
- Upstream: [../../README.md](../../README.md) — processes leaf entry
