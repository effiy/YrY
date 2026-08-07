---

title: I want to prepare a threat intelligence strategy
aliases:
- I want to prepare a threat intelligence strategy
- threat-intel-journey
- ti-journey
- cti-journey
- threat intelligence entry
tags:
- journeys
- threat-intelligence
- cti
- threat-informed-defense
- isac
- diamond-model
- pyramid-of-pain
category: engineer/strategies
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: launch is safe
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
related:
- ../processes/do-a-threat-modeling.md
- ../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md
- ../../oncall-sre/incident-response/prepare-an-incident-response-plan.md
- ../../engineer/patterns/observability.md
review_cycle: quarterly
tacit: false
---

# I want to prepare a threat intelligence strategy

> **As an** engineer, **I want to** prepare a threat intelligence, **so that** launch is safe. 

> "Collection + processing + prioritization + linkage + detection + drill + information sharing + quarterly audit" reach process + thinking + case study within 2 hops. 

## Summary

- Process follows [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) + [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) + [incident-response-process.md](../../engineer/processes/incident-response.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Platform follows [observability-pattern.md](../../engineer/patterns/observability.md) + [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) + [rate-limiting-pattern.md](../../engineer/patterns/rate-limiting.md)
- Case study follows [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) + [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md)

## Scenario

When preparing threat intelligence strategy / CTI / threat-informed defense / ISAC / Diamond Model / Pyramid of Pain / IOC / TTP / MITRE ATT&CK / intel sharing / intel reporting / intel promotion freeze / quarterly intel audit / intel retrospective, TL + security + SRE + sponsor need to look up process + thinking + case study. This entry aggregates threat-intelligence-related process + thinking + case study into a 2-hop path, avoiding "collection hollow / priority messy / linkage missing / sharing little / no quarterly audit". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [quarterly-security-audit-process.md](../../engineer/processes/quarterly-security-audit.md) · [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) · [incident-response-process.md](../../engineer/processes/incident-response.md) · [code-review.md](../../engineer/processes/do-a-code-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `methodology/engineering-patterns/` | [observability-pattern.md](../../engineer/patterns/observability.md) · [supply-chain-hardening-pattern.md](../../engineer/quality-security/harden-supply-chain.md) · [rate-limiting-pattern.md](../../engineer/patterns/rate-limiting.md) · [circuit-breaker-pattern.md](../../engineer/patterns/circuit-breaker.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — intel intent · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — inversion bias · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [runbook](../../engineer/processes/write-a-runbook.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts/code-review.md) · [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/processes/collaboration/cross-timezone-collaboration.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — intel reporting |
| `people/team/` | [team-overview.md](../../knowledge-curator/people/team/team-overview.md) · [roster.md](../../knowledge-curator/people/team/roster.md) — security matrix |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/wins/yiai-supply-chain-hardening.md) · [yivad-aicr-phase-port.md](../../engineer/lessons/wins/yivad-aicr-phase-port.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failures/incident-postmortem.md) · [bugs/](../../engineer/lessons/failures/bugs) — intel incident archive |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](./../lessons/gotchas/no-lockfile-supply-chain-risk.md) · [macos-fsevents-silent-drop.md](./../lessons/gotchas/macos-fsevents-silent-drop.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `brd/` | [brd-documents](../../brd/) · [brd-risks](../../brd/) · [scenarios](../../brd/) — intel business impact |
| `projects/` | each project `architecture-summary.md` §security + `adr-*` §intel |
| `journeys/` | [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) · [../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) · [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) · [./prepare-a-zero-trust-strategy.md](./prepare-a-zero-trust-strategy.md) |

## Action recommendations

1. **First principles**: first ask "what does threat intelligence solve / what happens if not done / ROI / business impact"; do not do CTI for CTI's sake; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: first think "intel could go out of control (hollow / wrong / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: one intel -> detection changes -> another tuning; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: the simplest intel that satisfies business wins; do not pile up sources; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Collection**: must run multi-source (commercial / OSINT / ISAC / internal) + avoid single source. 
6. **Processing**: must run processing (dedup / enrichment / standardize STIX/TAXII) + avoid raw data. 
7. **Prioritization**: must run prioritization (by asset / exposure / business relevance) + avoid FIFO. 
8. **Pyramid of Pain**: must run TTP > tools > domains > IP + avoid IOC-only. 
9. **Diamond Model**: must run Diamond Model (adversary / infrastructure / capability / victim) + avoid isolated IOC. 
10. **ATT&CK**: must run MITRE ATT&CK mapping + avoid no technical classification. 
11. **Linkage**: must run linkage (SIEM / EDR / WAF / vulnerability management) + avoid silo; see [i-want-to-prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md). 
12. **Detection**: must run detection rules (Sigma / YARA / Snort / Suricata) + avoid no rules. 
13. **Drill**: must run [i-want-to-run-a-game-day.md](../../oncall-sre/incident-response/run-a-game-day.md) + must run intel drill. 
14. **Information sharing**: must run ISAC + must share internally and externally + avoid hoarding. 
15. **AI intel**: LLM must run automated processing + avoid human-only; see [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md). 
16. **RACI**: must run [raci-matrix-summary.md](../../engineer/processes/collaboration/raci-matrix.md); security / SRE / TL / sponsor owners. 
17. **Freeze period**: during promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not change intel sources. 
18. **Reporting**: must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report internally and externally.
19. **Monitoring**: must run [monitoring-governance-process.md](../../engineer/processes/monitoring-governance.md) for hit rate / false positive rate / MTTR alerts. 
20. **Retrospective**: after intel incident must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive [bugs/](../../engineer/lessons/failures/bugs). 
21. **Quarterly audit**: see [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether sources still accurate + rules still effective. 
22. **ADR**: intel decisions must be recorded in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: intel well -> detection fast -> trust rise -> more investment; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md). 

## Related

- similar journey: [../processes/do-a-threat-modeling.md](../processes/do-a-threat-modeling.md) — threat modeling
- similar journey: [../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md](../../oncall-sre/incident-response/prepare-a-vulnerability-management-strategy.md) — vulnerability management
- similar journey: [../../oncall-sre/incident-response/prepare-an-incident-response-plan.md](../../oncall-sre/incident-response/prepare-an-incident-response-plan.md) — incident response plan
- similar journey: [./prepare-a-zero-trust-strategy.md](./prepare-a-zero-trust-strategy.md) — zero trust
- Upstream: [../../engineer/patterns/README.md](../../engineer/patterns/README.md) - patterns leaf entry
