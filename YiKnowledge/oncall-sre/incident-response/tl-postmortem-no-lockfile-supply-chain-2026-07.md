---

title: No lockfile supply chain risk
lifecycle: active
status: stable
key: tl_postmortem_no_lockfile_supply_chain_2026_07
tags:
- incident
- supply-chain
- lockfile
- security
incident_date: '2026-07-15'
severity: p2
duration_minutes: 0
detection_method: ADR review + code review
type: summary
category: oncall-sre/incident-response
roles:
- oncall-sre
- tech-lead
benefit: incident handled
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
created: 2026-07-15
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
tacit: false
related:
  - ./dashboard-incident-trends.md
  - ./dashboard-oncall-health.md
  - ./do-a-blast-radius-analysis.md
  - ../README.md
  - ../INDEX.md
---

# Postmortem — No lockfile supply chain risk

> **As a** oncall sre, **I want to** tl_postmortem_no_lockfile_supply_chain_2026_07, **so that** incident handled. 

## Summary

- P2 supply-chain risk discovered during ADR review: YiAi had no pip lockfile, YiVad pnpm-lock was in .gitignore, creating non-deterministic dependency resolution and exposure to supply-chain CVE/poisoning attacks
- Root cause: security maturity L1 with no Security Officer role and no supply-chain hardening precondition rule; PoC-stage trade-off (skipping lockfile for flexible upgrades) continued into stable phase without a graduation gate
- The four-piece supply-chain hardening set (lockfile + pre-commit audit + min-release-age + CI gate on high CVE) is the minimum viable security baseline — each piece closes a different attack vector and deploying fewer than all four leaves a gap
- Code review caught the issue before any CVE was exploited, validating structured architectural reviews as a security checkpoint, but the catch was coincidental — the review was for a multi-provider rollout, not a security audit
- Lockfiles are not a development convenience but a supply-chain security control; internal projects pulling from public registries need the same hardening as external-facing ones

## Incident Summary

- **Date: ** 2026-07 (ongoing / non-one-time) 
- **Severity: ** P2
- **Duration: ** ongoing
- **Impact: ** No lockfile → npm install / pip install with non-deterministic versions, potential supply chain CVE / poisoning risk. 
- **Detection: ** Found via code review + supply chain hardening ADR review. 

## Timeline (UTC)

| Time | Event |
|------|-------|
| 2026-07 | ADR-LLM-Multi-Provider-Rollout Phase 1 review, supply chain hardening precondition requires lockfile |
| 2026-07 | Found YiAi has no pip lockfile, YiVad pnpm-lock is in .gitignore |
| 2026-08 | Fix: three-end lockfile into git + min-release-age + audit CI gate to be landed |

## Root Cause Chain (5-Why)

1. **Why** no lockfile? → In the early PoC stage, lockfile was skipped for flexible upgrades. 
2. **Why** still none? → No supply chain hardening precondition rule. 
3. **Why** no rule? → The supply-chain-hardening-pattern in the sse-streaming-pattern class was not completed. 
4. **Why** not completed? → Security maturity L1 (see maturity-model) . 
5. **Why** L1? → Security Officer role + veto power not established. 

**ROOT CAUSE: ** Security maturity L1, no supply chain hardening precondition rule + no Security Officer role. 

## Contributing Factors

- The early PoC stage trade-off of skipping lockfile for flexible upgrades continued into the stable phase. 
- No supply chain hardening ADR. 
- No Security Officer role (see brd-stakeholders) . 

## What Went Well

- ADR-LLM-Multi-Provider-Rollout Phase 1 review caught it before production. 
- The fix path is clear (lockfile + audit + min-release-age + allowlist four-piece set) . 

## What Went Wrong

- Not identified as a risk early. 
- Supply chain hardening ADR lagged. 

## Where We Got Lucky

- No current CVE hits (see dependency-audit) . 
- The three projects' main dependencies are all mainstream stable (React / Vue / FastAPI / Motor) . 

## Action Items

| # | Action | Owner | Due | Priority |
|---|--------|-------|-----|----------|
| 1 | Three-end lockfile into git (done)  | each project | 2026-07 | P0 |
| 2 | supply-chain-hardening-pattern ADR sediment | CTO | 2026-08-15 | P1 |
| 3 | pre-commit npm audit / pip-audit + min-release-age | each project | 2026-09-30 | P1 |
| 4 | CI gate fail on high CVE | each project | 2026-10-31 | P2 |

## Core viewpoints

- **Lockfiles are not a development convenience — they are a supply-chain security control.** Without a lockfile, every `npm install` or `pip install` resolves dependencies non-deterministically. An attacker who compromises a transitive dependency can inject malicious code that passes CI on some machines and fails on others, making the attack non-reproducible and harder to detect. The lockfile is the first line of defense against dependency confusion and typosquatting attacks.

- **Security maturity is gated by role definition, not tooling availability.** The root cause of the missing lockfile was not the absence of a tool — both npm and pip support lockfiles natively. The root cause was the absence of a Security Officer role with veto power. Without a designated person accountable for security decisions, hardening tasks are perpetually deferred in favor of feature work. Tooling is necessary but insufficient; role definition is the prerequisite.

- **PoC-stage trade-offs have an expiration date that must be enforced.** Skipping the lockfile was a reasonable decision in the early prototyping phase when dependencies changed daily. The failure was not the initial decision but the absence of a mechanism to revoke the exception when the project entered the stable phase. Every PoC shortcut needs a pre-defined graduation gate that triggers remediation before production deployment.

- **Code review is the last line of defense, and it worked as designed.** The ADR review caught the missing lockfile before any CVE was exploited. This validates the pattern of using structured architectural reviews as a security checkpoint. The review process should explicitly include a supply-chain hardening checklist item rather than relying on reviewer vigilance.

- **The four-piece supply-chain hardening set is a minimum viable security baseline.** Lockfile + pre-commit audit + min-release-age + CI gate on high CVE form a defense-in-depth chain. Each piece closes a different attack vector: lockfile prevents non-deterministic resolution, audit catches known vulnerabilities, min-release-age defeats typosquatting, and CI gate prevents regressions. Deploying fewer than all four leaves a gap that the other three cannot close.

## Action recommendations

1. **Deploy the full four-piece supply-chain hardening set on every project: lockfile committed to git, pre-commit audit, min-release-age policy, and CI gate on high-severity CVEs.** Each piece closes a different attack vector. Deploying fewer than all four leaves a gap that the other three cannot close. The lockfile prevents non-deterministic resolution; the audit catches known vulnerabilities; min-release-age defeats typosquatting; the CI gate prevents regressions.

2. **Establish a Security Officer role with veto power before reaching security maturity L2.** The root cause of the missing lockfile was not the absence of a tool -- both npm and pip support lockfiles natively. The root cause was the absence of a designated person accountable for security decisions. Without a Security Officer, hardening tasks are perpetually deferred in favor of feature work.

3. **Attach an explicit expiration date to every PoC-stage shortcut and gate production deployment on its remediation.** Skipping the lockfile was reasonable during prototyping when dependencies changed daily. The failure was the absence of a mechanism to revoke the exception when the project entered the stable phase. Every PoC shortcut needs a graduation gate that blocks production deployment until the shortcut is removed.

4. **Add a supply-chain hardening checklist item to every architectural review, not just security-specific reviews.** The missing lockfile was caught during an ADR review for a multi-provider rollout, not a security audit. The catch was coincidental. Security checks should be explicit, automated, and part of every PR and architectural review, independent of the review's primary topic.

5. **Treat internal projects with the same supply-chain hardening as external-facing ones.** Internal tools pull from public registries and are vulnerable to the same supply-chain attacks. The blast radius of a compromised internal tool includes production credentials, source code, and deployment pipelines. Internal does not mean immune.

## Anti-patterns

- **Treating lockfiles as optional for "internal" projects.** Internal tools still pull from public registries and are still vulnerable to supply-chain attacks. The blast radius of a compromised internal tool includes production credentials, source code, and deployment pipelines. Internal projects need the same supply-chain hardening as external-facing ones.

- **Deferring security hardening to a future sprint without a specific deadline.** "We'll add lockfiles later" without a calendar date is equivalent to "we won't add lockfiles." Security debt, like technical debt, compounds over time. Every sprint without hardening increases the window of exposure. The fix is to attach security tasks to a specific release milestone with a named owner.

- **Assuming that because no CVE has been exploited, the risk is theoretical.** The absence of a detected exploit is not evidence of safety — it is evidence that detection mechanisms do not exist. Without an audit CI gate, compromised dependencies would be silently installed. The fact that no incident occurred is luck, not validation.

- **Treating supply-chain security as a one-time cleanup rather than an ongoing posture.** Adding a lockfile today does not prevent tomorrow's dependency from being compromised. Supply-chain security requires continuous monitoring: automated audit on every CI run, alerts on new CVEs, and a process for rapid patching. A one-time lockfile commit without the other three pieces of the four-piece set creates a false sense of security.

- **Relying on the ADR review process as the sole security gate.** The ADR review caught this issue, but it was coincidental — the review was for a multi-provider rollout, not a security audit. Security checks should be explicit, automated, and part of every PR, not dependent on the specific topic of an architectural review.

## Related

- [Supply chain hardening pattern](../../engineer/quality-security/harden-supply-chain.md) — canonical hardening reference cited in this postmortem
- [FSEvents silent drop postmortem](./tl-postmortem-fsevents-silent-drop-2026-08.md) — another postmortem with similar 5-Why investigation methodology and platform-specific failure mode
- [YiAi dev standards](../../engineer/projects/yiai/dev-standards.md) — YiAi supply-chain hardening gap (requirements.txt not pinned, no lockfile), mirror of the same root cause
- [MongoDB query filter contract](../../engineer/infrastructure/mongodb-query-filter-contract.md) — field name contract lessons, same root cause pattern: absence of automated contract testing
- [Oncall handover W33](./tl-oncall-handover-2026-w33.md) — W33 handover tracks lockfile commit as a recent security hardening change

---
> References: YiKnowledge → engineer/quality-security/harden-supply-chain.md | lessons/gotchas/no-lockfile-supply-chain-risk.md
> Blameless principle: ask "how did the system allow this?" not "who caused this?"
