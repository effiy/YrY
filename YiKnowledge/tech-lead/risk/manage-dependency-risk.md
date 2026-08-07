---
title: Managing Dependency Risk
aliases:
- manage-dependency-risk
- dependency-risk-management
- critical-dependency
tags:
- tech-lead
- risk-management
- dependency
- vendor-management
- architecture
category: tech-lead/risk
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- tech-lead
- engineer
- executive
benefit: "Tech leads can systematically identify, assess, and mitigate critical dependency risks before they become production incidents"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./tl-risk-register-single-provider-llm-lock-in.md
- ./handle-an-outage-communication.md
- ../capacity/tl-capacity-cost-2026-08-trend.md
- ../../engineer/quality-security/do-a-vendor-security-assessment.md
tacit: false
---

# Managing Dependency Risk

> **As a** tech lead, **I want to** systematically identify, assess, and mitigate dependency risks across third-party services, internal platforms, and single-person knowledge silos, **so that** the team is not blindsided by a dependency failure that could have been anticipated and mitigated.

> Every production system depends on things outside the team's control: cloud providers, open-source libraries, internal platform teams, SaaS vendors, and individual experts. The tech lead's job is not to eliminate these dependencies — that is impossible — but to make them visible, assess their failure modes, and ensure that no single dependency failure can cause a cascading outage.

## Summary

- Dependency risk has three categories: external (vendors, cloud providers, open-source), internal cross-team (platform teams, shared services), and key-person (the one engineer who understands a critical system)
- The core framework: identify all dependencies, assess each for criticality (impact × likelihood), define a mitigation for every critical dependency, and review the register quarterly
- The #1 failure mode is invisible dependencies — dependencies that no one documents because "everyone knows" about them. When the person who knows leaves, the dependency becomes a time bomb
- Single-provider dependencies are the highest-risk category because they combine external risk (no control over the provider) with concentration risk (one failure takes down everything)
- Dependency risk management is not a one-time audit — it is a recurring process that must be embedded in sprint planning, architecture reviews, and incident postmortems

## Core viewpoints

### 1. Invisible dependencies are more dangerous than risky dependencies

A documented high-risk dependency (e.g., "we depend on a single LLM provider") can be mitigated. An undocumented dependency ("oh, only Alice knows how the billing pipeline works") cannot be mitigated because it is not visible. The first goal of dependency risk management is visibility — every dependency must be named, documented, and assigned an owner. A dependency that only exists in someone's head is not managed; it is deferred.

### 2. Every critical dependency must have a tested mitigation, not a plan

A mitigation plan that says "we would fail over to Provider B" is worse than no plan if the failover has never been tested. Untested mitigations create a false sense of security. The tech lead must ensure that every critical dependency's mitigation is exercised regularly — failing over to a backup provider, rotating the bus-factor expert off the critical path for a sprint, or running a game day where the dependency is intentionally broken. A mitigation that has not been tested in the last 90 days is not a mitigation; it is a hope.

### 3. Key-person dependency is the most overlooked and most dangerous category

Every team has at least one person who is the sole expert on a critical system. This is not a staffing problem — it is a risk management problem. The mitigation is not to hire a backup (which takes months and may not work) but to make the knowledge explicit: documented runbooks, pair rotations, and the "hit by a bus" test. If the key person were unavailable tomorrow, could the team operate the system? If the answer is no, this is a Sev1 risk that should be tracked with the same urgency as a single-provider vendor dependency.

### 4. Dependency risk compounds at integration boundaries

The most dangerous dependencies are not the ones you explicitly choose (your primary database, your cloud provider) but the transitive dependencies introduced by your direct dependencies. A library you import depends on another library, which depends on a maintainer who might stop maintaining it. A SaaS vendor you use depends on a cloud provider you did not choose. These transitive dependencies are invisible to most teams and almost never appear in risk registers. The tech lead must trace dependencies at least one level deep into the transitive graph.

### 5. The risk register is useless if it is not reviewed on a cadence

A dependency risk register created once and never updated is a compliance artifact, not a risk management tool. Dependencies change: vendors are acquired, libraries are abandoned, key people leave, and new critical dependencies are introduced with every architectural decision. The register must be reviewed at least quarterly, and every architectural decision must include a "what new dependencies does this introduce?" section. The review cadence is the difference between managing risk and documenting it.

## Key info

### Dependency risk assessment framework

| Dimension | Question | Scale |
|---|---|---|
| **Criticality** | If this dependency fails, what is the blast radius? | 1 (minor feature) to 5 (whole product down) |
| **Likelihood** | How likely is a failure in the next 6 months? | 1 (extremely unlikely) to 5 (happened before) |
| **Detectability** | How quickly would we know if it failed? | 1 (immediate alert) to 5 (customer reports it) |
| **Recoverability** | How long to recover if it fails? | 1 (minutes) to 5 (days/weeks) |
| **Substitutability** | Can we replace it, and how long would that take? | 1 (drop-in replacement) to 5 (no alternative) |

Risk score = Criticality × Likelihood × (1/Detectability) × Recoverability × Substitutability

### Risk classification thresholds

| Risk Level | Score Range | Action Required |
|---|---|---|
| **Critical** | > 200 | Active mitigation with quarterly exercise; exec visibility |
| **High** | 100-200 | Documented mitigation with semi-annual exercise; TL visibility |
| **Medium** | 50-100 | Mitigation plan documented; annual review |
| **Low** | < 50 | Monitor; review at annual dependency audit |

### Dependency categories and common examples

| Category | Examples | Typical Failure Mode |
|---|---|---|
| **Cloud provider** | AWS, Azure, GCP | Regional outage, API deprecation |
| **SaaS vendor** | Auth0, Datadog, GitHub | Service degradation, pricing change, acquisition |
| **Open-source library** | React, PyTorch, LangChain | Abandonment, breaking change, security vulnerability |
| **Internal platform** | CI/CD pipeline, design system, shared auth | Team reorg, priority shift, key person departure |
| **Key person** | Sole expert on billing, auth, or deployment | Departure, illness, vacation during incident |
| **API/Data format** | REST API, gRPC schema, database schema | Breaking change, version mismatch, schema drift |
| **Hardware/Network** | GPU quota, network path, DNS | Capacity exhaustion, misconfiguration, provider outage |

### Dependency risk register template

```markdown
| Dependency | Category | Owner | Criticality (1-5) | Likelihood (1-5) | Risk Score | Mitigation | Last Tested | Next Review |
|---|---|---|---|---|---|---|---|---|
| OpenAI API | SaaS vendor | TL | 5 | 3 | 225 | Multi-provider routing | 2026-07 | 2026-10 |
| Auth service | Internal platform | Senior Eng | 4 | 2 | 128 | Runbook + backup owner | 2026-06 | 2026-09 |
| Billing pipeline | Key person | Alice | 5 | 2 | 200 | Pair rotation Q3 | 2026-05 | 2026-08 |
```

## Action recommendations

1. **Create a dependency risk register within the first month of team formation.** List every external service, internal platform dependency, and key-person concentration. Assign an owner to each. This is the single highest-leverage risk management activity a new tech lead can perform.
2. **Run a "dependency failure" game day quarterly.** Pick one critical dependency, intentionally break it (in a controlled environment), and exercise the mitigation. If the mitigation fails, the dependency stays critical until the next successful game day.
3. **Add a "dependency impact" section to every architecture decision record.** Every ADR should answer: what new dependencies does this introduce? What existing dependencies does this change? What is the blast radius if each new dependency fails?
4. **Pair-rotate on every key-person dependency at least once per quarter.** The key person pairs with another engineer on the critical system for one sprint. The goal is not to transfer all knowledge but to ensure that at least one other person can operate the system in an emergency.
5. **Trace transitive dependencies for every critical direct dependency.** For each dependency with a risk score above 100, ask: what does this dependency depend on? Document the transitive chain and assess whether it introduces a single point of failure that is not visible in the direct dependency graph.

## Anti-patterns

- **Treating the risk register as a compliance artifact.** A risk register created for an audit and never updated is worse than no register — it creates the illusion of risk management. The register must be a living document reviewed at a regular cadence, not a PDF filed in a shared drive.
- **Accepting "we have a failover plan" as a mitigation without testing it.** A failover plan that has never been tested is a document, not a capability. Every critical dependency mitigation must be tested at least quarterly. The first time you execute a failover should not be during an incident.
- **Focusing exclusively on external dependencies while ignoring key-person risk.** The most common cause of prolonged outages is not a vendor failure but the one person who understands the system being unavailable. Key-person dependency is a risk management problem, not an HR problem, and it should be tracked in the same register as vendor dependencies.
- **Assuming open-source dependencies are risk-free because "we can fork it."** The cost of maintaining a fork of a critical library is vastly higher than most teams estimate. A fork means your team is now responsible for security patches, bug fixes, and compatibility updates — forever. The "we can fork it" mitigation should be treated as a last resort, not a default strategy.
- **Deferring dependency risk management because "we're moving too fast right now."** Early-stage teams accumulate dependencies at the highest rate and have the least visibility into them. The bus factor is typically 1 for every critical system. Deferring dependency risk management in the name of speed is like deferring brake maintenance because you're driving too fast — the speed is the reason to do it now, not the excuse to skip it.

## Related

- [Single-Provider LLM Lock-in Risk](./tl-risk-register-single-provider-llm-lock-in.md) — Specific risk register entry for LLM provider dependency
- [Handling Outage Communication](./handle-an-outage-communication.md) — Communication during dependency failures
- [Headcount Planning](../capacity/tl-capacity-cost-2026-08-trend.md) — Team sizing and key-person risk mitigation
- [Vendor Security Assessment](../../engineer/quality-security/do-a-vendor-security-assessment.md) — Evaluating vendor dependencies
- [Write a Postmortem](./write-a-postmortem.md) — Postmortem process for dependency-related incidents