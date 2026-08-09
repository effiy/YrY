---
title: Handle a DDoS attack
aliases:
- I want to handle DDoS
- ddos-attack-journey
- traffic-flood-journey
- DDoS entry
tags:
- journeys
- ddos
- waf
- traffic-flood
- rate-limiting
- mitigation
category: oncall-sre/incident-response
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- oncall-sre
- engineer
benefit: incident is contained
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./respond-to-an-incident.md
- ../observability/set-up-observability.md
- ./prepare-a-disaster-recovery-plan.md
- ../../engineer/process/incident-response.md
review_cycle: quarterly
tacit: false
last_verified: 2026-08-07
---

# I want to handle a DDoS attack

> **As a** oncall sre, **I want to** handle a ddos attack, **so that** incident is contained. 

> "Detection + classification + bleeding-stopping + traffic scrubbing + WAF + rate limiting + fallback + reporting + retrospective" reach process + thinking + case studies within 2 hops. 

## Summary

- Process follows [incident-response-process.md](../../engineer/process/incident-response.md) + [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) + [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md)
- Thinking follows [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- monitoring follows [i-want-to-set-up-observability.md](../observability/set-up-observability.md) + [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md)
- Case studies follow [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) + [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md)

## Core viewpoints

**DDoS is a business continuity problem, not a network problem.**
The goal is not to block every malicious packet. The goal is to keep the service available for legitimate users. This distinction matters because it determines the strategy: rate limiting is not a DDoS solution if it also blocks legitimate users; blackholing all traffic from a region is not a solution if you have paying customers in that region. The DDoS response must be measured by the legitimate user experience during the attack, not by the number of packets dropped.

**The most effective DDoS defense is a well-architected system, not a bigger scrubber.**
A CDN that can absorb 10 Tbps of traffic is useless if the attack targets the origin server directly. A WAF that blocks SQL injection is useless against a volumetric attack. The defense must be layered: CDN at the edge, WAF at the application layer, rate limiting at the API gateway, and auto-scaling at the compute layer. Each layer must be independently configured and tested. The system architecture itself is the primary defense.

**DDoS attacks are reconnaissance for worse attacks.**
Many DDoS attacks are not intended to take the service down. They are intended to distract the operations team while the attacker exfiltrates data, deploys ransomware, or probes for vulnerabilities. During a DDoS response, the security team must simultaneously monitor for secondary attacks: unusual database queries, unexpected outbound connections, and credential usage anomalies. If the DDoS is the only thing you are watching, you may be missing the real attack.

**The post-attack analysis must include the cost of the attack.**
DDoS attacks that are successfully mitigated still cost money: CDN bandwidth charges, cloud compute costs from auto-scaling, and engineering time. The postmortem must quantify the financial cost of the attack and the cost of the mitigation. This data is essential for deciding whether to invest in additional DDoS protection services or to accept the risk.

## Scenario

When handling DDoS / traffic flood / CC attack / slow attack / application-layer DDoS / API abuse / crawler abuse / big-promo traffic surge / sudden hotspot / cross-border traffic / provider rate limiting blacklist, platform + SRE + security + TL + business owner need to look up process + thinking + case studies. This entry aggregates DDoS related process + thinking + case studies into 2-hop paths, avoiding "late detection / unclear classification / slow bleeding-stopping / wrong scrubbing / rate limiting false harm / missing fallback / lagging reporting / missing retrospective". 

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `work/processes/` | [incident-response-process.md](../../engineer/process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) · [oncall-rotation-process.md](../../engineer/process/oncall-rotation.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [security-audit.md](../../engineer/quality-security/quarterly-security-audit.md) · [disaster-recovery-drill-process.md](../../engineer/infrastructure/disaster-recovery-drill.md) · [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) · [capacity-planning-process.md](../../engineer/infrastructure/capacity-planning.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-think wrecks · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — attack essence · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/engineering-patterns/` | [supply-chain-hardening-pattern.md](../../engineer/process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../../engineer/quality-security/contract-test-baseline.md) · [sse-streaming-pattern.md](../../engineer/architecture-design/sse-streaming.md) · [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) · [eval-driven](../../engineer/engineering/evaluation-driven-development.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) — AI application-layer abuse · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `resources/templates/` | [runbook-template.md](../../engineer/infrastructure/write-a-runbook.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../../engineer/lessons/failure-incident-postmortem.md) · [incident-postmortem-template.md](../../engineer/lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../../engineer/lessons/failure-ai-product-launch-lessons.md) · [bugs/](../../engineer/lessons) — DDoS retrospective archive |
| `lessons/gotchas/` | [sse-ondone-guard.md](../../engineer/lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../../engineer/lessons/gotcha-macos-fsevents-silent-drop.md) · [no-lockfile-supply-chain-risk.md](../../engineer/lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lessons/wins/` | [yiai-supply-chain-hardening-win.md](../../engineer/lessons/win-yiai-supply-chain-hardening.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../../engineer/lessons) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — DDoS reporting |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — oncall owner |
| `work/collaboration/` | [raci-matrix-summary.md](../../engineer/process/raci-matrix.md) · [async-collaboration-principles-summary.md](../../engineer/process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../../engineer/process/cross-timezone-collaboration.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) — user impact |
| `lifecycle/` | [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [governance.md](../../knowledge-curator/governance/governance.md) — DDoS playbook archive |
| `projects/` | Each project's `architecture-summary.md` §capacity + `dev-standards-summary.md` §rate limiting + `adr-*` |
| `journeys/` | [./respond-to-an-incident.md](./respond-to-an-incident.md) · [../observability/set-up-observability.md](../observability/set-up-observability.md) · [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) · [../../engineer/quality-security/do-a-load-test.md](../../engineer/quality-security/do-a-load-test.md) |

## Action recommendations

1. **first principles**: First ask "attack type (L3/L4 / L7 / slow / application / API abuse) / impact / what happens if unsolved / ROI"; do not protect for the sake of protecting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **inversion**: First imagine "DDoS could go out of control (user loss / trust collapse / provider blacklist / cost explosion / false harm to real users)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **second-order effects**: One scrub → involves WAF / CDN / provider rate limiting / business route; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: The simplest solution that satisfies protection needs wins; do not pile up scrubbing devices; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **detection**: must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md); QPS / latency / error rate / source / UA / path exceptions + threshold alerts. 
6. **classification**: must run P0 / P1 / P2; classify by traffic multiple + scope + duration + user impact. 
7. **bleeding-stopping**: must stop bleeding first (switch scrubbing / rate limiting / close features / cut static fallback / cut cross region); follow [incident-response-process.md](../../engineer/process/incident-response.md). 
8. **traffic scrubbing**: must run CDN / anti-DDoS service / cloud scrubbing; cut by region. 
9. **WAF**: must run [security-audit.md](../../engineer/quality-security/quarterly-security-audit.md) + WAF rules + allowlist/blocklist + frequency control + human-machine verification. 
10. **rate limiting**: must run [rpc-envelope-pattern.md](../../engineer/architecture-design/rpc-envelope.md) + multi-layer rate limiting (edge / gateway / application / DB) + must tiered user quota. 
11. **fallback**: must run [dual-world-boundary-pattern.md](../../engineer/engineering/dual-world-boundary.md) + multi provider / multi region / multi CDN; follow [i-want-to-manage-a-vendor-relationship.md](../../engineer/engineering/manage-a-vendor-relationship.md). 
12. **provider reporting**: must run [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) + report provider + blacklist source IP. 
13. **reporting**: must run [i-want-to-handle-outage-communication.md](../../engineer/process/handle-outage-communication.md) to report sponsor + users; do not hide. 
14. **isolation**: must isolate from normal traffic (header / tenant / mark); follow [i-want-to-handle-multi-tenancy.md](../../engineer/architecture-design/handle-multi-tenancy.md). 
15. **freeze period**: During big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) with no releases (exception: bleeding-stop). 
16. **rollback**: must be able to switch back to original architecture / turn off scrubbing in seconds; follow [i-want-to-do-a-rollback-drill.md](./do-a-rollback-drill.md). 
17. **monitoring**: must run [monitoring-governance-process.md](../../engineer/process/monitoring-governance.md) + [i-want-to-set-up-observability.md](../observability/set-up-observability.md); during DDoS monitor QPS / error rate / user impact / cost. 
18. **retrospective**: must run [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) retrospective + improvement items + archive [bugs/](../../engineer/lessons). 
19. **drill**: must run [chaos-engineering-process.md](../../engineer/quality-security/chaos-engineering.md) + [i-want-to-run-a-game-day.md](./run-a-game-day.md) to simulate DDoS. 
20. **quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan WAF rules / rate limiting thresholds / scrubbing playbooks whether still accurate. 
21. **ADR**: Protection architecture must land in ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **flywheel**: DDoS handled well → confidence rises → dare to scale more; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Blocking legitimate users in the rush to stop the attack.** The most common DDoS mitigation mistake is deploying overly aggressive rate limits or geo-blocks that cut off real customers. Every mitigation action must be tested against a sample of legitimate traffic before being applied globally. The question is not "does this rule reduce attack traffic?" but "does this rule reduce attack traffic without reducing legitimate traffic?" If the mitigation causes more business impact than the attack, the mitigation is the problem.

- **Assuming the attack will stop on its own.** DDoS attacks do not fade away. They either achieve their objective and stop, or they are mitigated and stop. "Waiting it out" is never a valid strategy. The attack may last hours, days, or weeks. The cost of the attack accrues every second. The response must be active and immediate: engage the CDN provider, enable scrubbing, deploy rate limits, and contact the upstream ISP.

- **Mitigating the current attack without preparing for the next one.** After the DDoS is contained, the team often breathes a sigh of relief and moves on. But the attacker now knows your architecture and your mitigation latency. The next attack will be different. The postmortem must produce a DDoS playbook update, a review of rate limiting thresholds, and a plan for the next attack. If the same attack pattern would succeed again, the response failed.

- **Treating all traffic spikes as DDoS attacks.** A surge in legitimate traffic from a viral post, a product launch, or a seasonal event can look identical to a DDoS attack. Before engaging DDoS mitigation, verify that the traffic is actually malicious. Check the traffic patterns: is it coming from diverse IPs? Are the requests following normal user behavior? Are there bot-like patterns? Accidentally blocking legitimate viral traffic is a self-inflicted DDoS.

- **Relying solely on automated DDoS protection without human oversight.** Automated DDoS protection services can make mistakes: false positives that block legitimate traffic, false negatives that miss sophisticated attacks, and configuration drift that reduces protection over time. During a major attack, a human must be actively monitoring the mitigation and making decisions about aggressive measures. Automated protection is a tool, not a substitute for an incident commander.

## Related

- similar journey: [./respond-to-an-incident.md](./respond-to-an-incident.md) — incident response
- similar journey: [../observability/set-up-observability.md](../observability/set-up-observability.md) — monitoring
- similar journey: [./prepare-a-disaster-recovery-plan.md](../../knowledge-curator/archive/strategies-legacy/oncall-sre/prepare-a-disaster-recovery-plan.md) — disaster recovery
- similar journey: [../../engineer/quality-security/do-a-load-test.md](../../engineer/quality-security/do-a-load-test.md) — load test
- Upstream: [../../README.md](../../README.md) - processes leaf entry
