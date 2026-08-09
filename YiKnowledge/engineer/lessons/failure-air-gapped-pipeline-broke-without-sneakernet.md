---
title: Air-gapped environment Day 1 — pipeline broke because sneakernet ISO was not designed
aliases: [air-gapped-pipeline-broke-without-sneakernet, no-sneakernet-failure, first-boot-failure]
tags: [retrospective, air-gap, sneakernet, first-boot, pipeline-failure, pki, ntp, secrets, weights]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, devops, oncall-sre]
benefit: "failure does not repeat"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
---

# Air-gapped environment Day 1 — pipeline broke because sneakernet ISO was not designed

> **As an** engineer, **I want to** no sneakernet failure, **so that** failure does not repeat.

> On Day 1 at a regulated customer site, FDE did not design a signed sneakernet ISO → weights / package mirror / cert / PKI key — one missing → customer approval takes 4-8 weeks to re-send → project delayed / scrapped. This retrospective is the basis for [ADR Air-gap-first](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) §decision #5 + §risk #5-#7.

## Summary

- **Symptom**: Day 1 missing weights / mirror / cert / PKI key → customer approval 4-8 weeks to re-send → project collapses
- **Root cause**: sneakernet ISO not designed; first-boot checklist not rehearsed
- **Root-cause chain**: 5-Why down to the system layer (first-boot process lacks rehearsal + ADR lacks enforcement)
- **Action**: Day -7 rehearsal + signed sneakernet ISO + checklist + SHA-256 verify
- **Reusable**: FDE Practice "first-boot 4-class trap injection" rehearsal SOP

## Core viewpoints

- **The sneakernet ISO is not a logistics detail -- it is the single point of failure that determines whether Day 1 succeeds or the project dies**: In an air-gapped environment, there is no "quick fix" for a missing dependency. Every artifact that the pipeline needs must be on that ISO before the engineer boards the plane. The 4-8 week customer approval cycle for re-sending means the first boot is the only boot that matters.

- **Discovery calls that only capture the happy path are worse than no discovery at all**: A discovery that confirms the customer's desired architecture but does not surface the physical constraints of the deployment environment (no internet, no package manager, no CI/CD) creates false confidence. The FDE engineer arrives on-site believing they are prepared when they are actually walking into a trap.

- **The 5-Why root cause chain inevitably terminates at a process gap, not a human error**: Why did the project collapse? Missing weights. Why were weights missing? No sneakernet ISO. Why no ISO? Discovery didn't mention it. Why? SOP not enforced. Why? ADR missing. The chain always ends at the system layer -- no individual was negligent, the process never required the right thing.

- **Rehearsal is not a nice-to-have for air-gapped deployments -- it is the only verification that works**: A Day -7 rehearsal with the actual ISO on an actual air-gapped machine is the only way to discover that the PKI key, the NTP server config, or the model weights are missing. Paper checklists catch syntax errors; rehearsals catch semantic gaps.

- **The "cleared engineer" role is a specialized function, not a task assignment**: An engineer who can operate in a regulated facility with no internet, no phone, and no ability to ask for help is a different profile from a standard field engineer. The training manual, the runbook, and the ISO must all assume zero connectivity and zero external support -- because in an air-gapped environment, that is exactly what they will have.

## Key info

- **FDE air-gapped deployment failure timeline (FDE-AG-001, P1 severity)**: Week 0 — Discovery call did not mention sneakernet ISO; Week 4 — Day 1 kickoff, missing weights discovered on-site; Week 5 — customer approval to re-send weights (4-week approval cycle); Week 8 — weights arrived, PKI key also missing; Week 9 — customer approval to re-send PKI key; Week 12 — project collapsed, customer renewal deadlocked. Total delay: 8+ weeks from first missing artifact to project death.
- **5-Why root cause chain terminating at process layer**: Why 1: Project collapsed → Day 1 missing weights/PKI key. Why 2: Missing → sneakernet ISO not designed. Why 3: Not designed → Discovery call did not mention sneakernet. Why 4: Not mentioned → FDE Practice Discovery SOP not enforced. Why 5: Not enforced → ADR air-gap-first missing + first-boot rehearsal missing. Root cause type: process gap (Discovery SOP does not enforce sneakernet) + design gap (first-boot checklist + rehearsal missing). No individual negligence — the process never required the right thing.
- **Sneakernet ISO mandatory artifact checklist (7 items, each with SHA-256 hash)**: (1) Model weights — full model artifact bundle (weights + tokenizer + config + inference code) as versioned bundle; (2) Package mirrors — complete pip/npm/cargo mirrors for the target environment; (3) PKI certificates — all certificates needed for internal service communication; (4) NTP server configs — time synchronization configuration for the air-gapped network; (5) Secrets — API keys, signing keys, encryption keys; (6) Inference code — specific version of the inference library used to train the model; (7) Runbook and documentation — first-boot runbook with 4-class trap injection and remediation steps. Clean-room build: ISO must be built on a clean VM/Docker container with no internet, then tested by booting an air-gapped VM with only the ISO mounted.
- **Day -7 rehearsal with 4-class trap injection protocol**: The rehearsal must run on an actual air-gapped machine with the full sneakernet ISO. The "trap injection" phase deliberately removes one artifact at a time (remove PKI key → verify runbook detects it, remove weights → verify runbook detects it, remove NTP config → verify runbook detects it, remove cert → verify runbook detects it) to verify the first-boot runbook actually works. A rehearsal that only tests the happy path is a ceremony, not a verification. Schedule as non-negotiable milestone in every air-gapped project plan.
- **Customer re-approval cycle as schedule risk**: Security approvals are per-artifact, not per-project. Any change to the ISO after customer security approval triggers a new 4-8 week approval cycle. The initial ISO must be treated as immutable after approval — any update is a schedule risk, not a minor update. Project plan must include buffer for the re-approval cycle.
- **Yi-family air-gapped deployment relevance (2026-08)**: No Yi-family project currently deploys to air-gapped environments. The FDE Practice retrospective is documented for when regulated customer deployments begin. Related ADR: [ADR Air-gap-first](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) §decision #5 + §risk #5-#7. The "cleared engineer" training manual and first-boot runbook templates are in development (due 2026-10-15).

## 1. Basic info

| Field | Content |
|---|---|
| Event ID | FDE-AG-001 |
| Title | Air-gapped environment Day 1 — pipeline broke because sneakernet ISO was not designed |
| Severity | P1 |
| Date | 2026-08-05 (retrospective)  |
| Reporter | FDE Practice Lead |
| Related project | FDE Playbook (regulated customer retrospective)  |
| Related ADR | [ADR Air-gap-first](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) |

## 2. Impact scope

| Dimension | Impact |
|---|---|
| Project cadence | Delayed 4-8 weeks |
| Customer patience | Lost after 4 weeks |
| Contract renewal | Deadlock |
| FDE Practice reputation | "Day 1 breakdown" tag |

## 3. Event timeline

| Time | Event | Operator | Source |
|---|---|---|---|
| Week 0 | Discovery call did not mention sneakernet ISO | FDE | Recording retrospective |
| Week 4 | Day 1 kickoff; missing weights | FDE | On-site record |
| Week 5 | Customer approval to re-send weights | FDE + customer legal | Ticket |
| Week 8 | Weights arrived; PKI key also missing | FDE | On-site record |
| Week 9 | Customer approval to re-send PKI key | FDE + customer legal | Ticket |
| Week 12 | Project collapsed; customer renewal deadlock | CTO | Renewal meeting |

## 4. Root-cause chain (5-Why)

| Why level | Symptom | Direct cause |
|---|---|---|
| Why 1 | Project collapsed | Day 1 missing weights / PKI key |
| Why 2 | Missing | sneakernet ISO not designed |
| Why 3 | Not designed | Discovery call did not mention sneakernet |
| Why 4 | Not mentioned | FDE Practice Discovery SOP not enforced |
| Why 5 | Not enforced | ADR air-gap-first missing + first-boot rehearsal missing |

**Root-cause type** (multi-select):
- [x] Process gap (Discovery SOP does not enforce sneakernet)
- [x] Design gap (first-boot checklist + rehearsal missing)
- [ ] Code defect
- [ ] Configuration error
- [ ] Insufficient capacity
- [ ] Monitoring gap
- [ ] Third-party dependency
- [ ] Human operation

## 5. Temporary and root-cause measures

| Type | Measure | Owner | Due date | State |
|---|---|---|---|---|
| Temporary | Send cleared engineer to re-send at existing customer | FDE Practice Lead | 2026-08-15 | To-do |
| Root | Discovery SOP enforces mentioning sneakernet ISO | FDE Practice Lead | 2026-08-30 | To-do |
| Root | Day -7 rehearsal of 4-class trap injection | FDE Practice Lead | 2026-09-15 | To-do |
| Root | Signed sneakernet ISO + checklist + SHA-256 verify template | FDE Practice Lead | 2026-09-30 | To-do |

## 6. Action items

| # | Action item | Type | Owner | Due date | Acceptance method | State |
|---|---|---|---|---|---|---|
| 1 | Add mandatory mention of sneakernet ISO to Discovery SOP | Process | FDE Practice Lead | 2026-08-30 | SOP launch | To-do |
| 2 | Day -7 rehearsal of 4-class trap injection | Process | FDE Practice Lead | 2026-09-15 | Rehearsal report | To-do |
| 3 | sneakernet ISO template (signature + checklist + SHA-256)  | Documentation | FDE Practice Lead | 2026-09-30 | Template launch | To-do |
| 4 | Cleared engineer training manual | Documentation | FDE Practice Lead | 2026-10-15 | Manual launch | To-do |
| 5 | First-boot runbook with 4-class traps + remediation steps | Documentation | FDE Practice Lead | 2026-10-15 | Runbook launch | To-do |

## 7. Lessons learned

- ✅ Done well: MVA 30-day design; correct compliance certification identification
- ❌ To improve: Discovery did not mention sneakernet; first-boot checklist not rehearsed; Day -7 rehearsal missing
- 🧠 Reusable: FDE Practice "first-boot 4-class trap injection" rehearsal SOP

## 8. Monitoring metric regression

| Metric | Before event | During event | Current | Goal |
|---|---|---|---|---|
| Day 1 kickoff success rate | — | 0% | — | ≥ 90% |
| sneakernet re-send count | — | ≥ 2 / project | — | 0 / project |
| Customer patience months | — | 4 weeks | — | ≥ 12 weeks |

## 9. Notification and archival

- Notification recipients: CTO, customer CISO, legal, PMO
- Notification date: 2026-08-10
- Archive path: `lessons/failures/air-gapped-pipeline-broke-without-sneakernet.md`
- Related ADR / TD: [ADR Air-gap-first](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md)

## 10. Retrospective meeting metadata

- Duration: 60 minutes
- Blameless: yes
- Action item completion rate from previous follow-up: N/A (first time)



- **Discovery does not mention sneakernet** — Day 1 will miss something; project collapses
- **First-boot checklist not rehearsed** — Day -7 must rehearse 4-class trap injection
- **sneakernet ISO not signed** — tampered in transit; supply-chain attack
- **cleared engineer not trained** — on-site operation errors; missing sign-off
- **First-boot runbook not stored** — customer internal owner does not know how to fix

## Action recommendations

1. **Build the sneakernet ISO on a clean VM (or Docker container) with no internet access and verify every artifact in the first-boot checklist before any new air-gapped deployment.** The lesson from this failure is that development machines have cached packages, globally installed tools, and implicit dependencies that are invisible to the engineer. The clean-room build is the only verification that catches missing dependencies. Schedule this build at least 7 days before the engineer boards the plane to allow time for fixes.

2. **Add a mandatory "sneakernet ISO content" section to the Discovery SOP template that must be completed before the MVA phase begins.** The Discovery call is where the sneakernet ISO should have been mentioned, but wasn't, because the SOP didn't require it. The new section should list: model weights, tokenizer, inference code, package mirrors, PKI certificates, NTP server configs, and secrets. Each item must have a checked box and a SHA-256 hash before the Discovery call is considered complete.

3. **Run a Day -7 rehearsal on an actual air-gapped machine with the full sneakernet ISO, including a "trap injection" phase where one artifact is deliberately removed.** The rehearsal that only tests the happy path is a ceremony, not a verification. The trap injection phase (remove the PKI key, verify the runbook detects it, remove the weights, verify the runbook detects it) is the only way to discover that the first-boot runbook actually works. Schedule the rehearsal as a non-negotiable milestone in every air-gapped project plan.

4. **Create a "cleared engineer training manual" that assumes zero connectivity and zero external support, and require every FDE deploying to an air-gapped environment to complete it.** The manual should cover: how to diagnose missing artifacts from the runbook alone, how to communicate with the customer's security team through the air-gap approval process, and how to verify artifact integrity (SHA-256) without internet access. The training should be completed before the engineer is assigned to an air-gapped project.

5. **Treat the sneakernet ISO as immutable after customer security approval, and factor the 4-8 week re-approval cycle into the project timeline for any post-approval change.** The assumption that a re-send ISO would be approved quickly because the initial ISO was already approved is what caused the project to collapse. The project plan must include a buffer for the re-approval cycle, and the initial ISO must be treated as the only ISO -- any change after approval is a schedule risk, not a minor update.

## Anti-patterns

- **Building the sneakernet ISO on the same internet-connected machine that was used for development, without verifying that the ISO is self-contained.** Development machines have cached packages, globally installed tools, and implicit dependencies that are not on the ISO. The ISO must be built on a clean machine (or in a clean Docker container) and then tested by booting an air-gapped VM with only the ISO mounted. Anything that fails to install in the air-gapped VM is missing from the ISO.
- **Including model weights on the ISO but not including the model's tokenizer, configuration file, and inference code.** Weights without a tokenizer are a binary blob that cannot be used. Weights without the specific version of the inference library that was used to train the model may fail to load. The ISO must include the full model artifact (weights + tokenizer + config + inference code) as a versioned bundle, not just the weights file.
- **Conducting the Day -7 rehearsal but only testing the happy path where all artifacts are present.** The rehearsal's purpose is to discover what is missing, not to confirm that everything is present. The rehearsal must include a "trap injection" phase where the FDE deliberately removes one artifact (e.g., the PKI key) and verifies that the first-boot runbook correctly detects and reports the missing artifact. A rehearsal that only tests the happy path is a ceremony, not a verification.
- **Assuming that the customer's security approval for the initial ISO covers subsequent ISOs with the same contents.** Security approvals are per-artifact, not per-project. If the weights file is updated between the initial ISO and the re-send ISO, the customer's security team must re-approve the new ISO, which may take another 4-8 weeks. The initial ISO must be treated as immutable after approval; any update requires a new approval cycle.
- **Storing the sneakernet ISO checklist in the FDE's personal notes rather than in the FDE Practice template repository.** When the FDE who built the last ISO leaves the team, the checklist leaves with them. The next FDE builds a new ISO from memory and repeats the same class of omissions. The checklist must be a versioned document in the FDE Practice repository, updated after every deployment with lessons learned from that specific air-gapped environment.

## Related

- Same class: [./fde-day-two-without-internal-owner.md](failure-fde-day-two-without-internal-owner.md) — FDE retrospective class
- Triggering trap: [Air-gapped first-boot 4-class traps](gotcha-air-gap-first-boot-surprise.md)
- Upstream: [Air-gapped deployment](../process/deploy-to-an-air-gapped-environment.md) §first-boot
- Design basis: [ADR Air-gap-first](../../tech-lead/decisions/fde--air-gap-first-for-regulated-clients.md) §decision #5
