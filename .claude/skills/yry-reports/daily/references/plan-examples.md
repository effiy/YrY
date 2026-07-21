# plan-examples — Worked example for the three-horizon model

> A fully worked example of what `plan` mode should produce for a
> realistic mid-stage project. Use this as a reference when
> rendering — every field in the `window.PLAN_DATA` shape (defined
> in `templates/data.js`) has a concrete expansion here. Do not
> copy this content into another project's plan verbatim; use it
> to calibrate granularity and tone.

## Example project

- **Name:** `billing-service`
- **Path:** `/Users/me/code/billing-service`
- **Last commit:** `a3f9c21 feat: add proration on plan downgrade`
- **Active branches:** 4 (`main`, `feat/invoices-v2`, `fix/webhook-retry`, `chore/deps`)
- **TODO / FIXME:** 47
- **Test / src LOC ratio:** 0.31
- **Median commits/day (last 14d):** 3.5
- **Top contributors (last 14d):** Priya (42%), Marcus (28%), Liu (18%), others (12%)

## Plan diff vs prior (rendered into `{{DIFF}}`)

```
vs prior plan dated 2026-07-16

Drift verdict: AMBER — minor drift
  18 items stable · 3 changed · 2 added · 1 removed
```

**Changed items**
- `30d-M1.2` — Add exponential backoff
  - Size: `M` → `L`
  - Owner: `<unassigned>` → `Priya`
  - Files: `src/webhooks/retry.ts` → `src/webhooks/retry.ts`, `src/webhooks/backoff.ts`
- `90d-T2` — Multi-currency GA
  - Exit criteria: `5 currencies live` → `5 currencies live + finance sign-off`
- `A1` — Webhook volume stays under 2M/day
  - Validation: `T+30d` → `T+21d` (pulled forward)

**Added items**
- `+` `30d-M3.3` — Add coverage gate to CI (M)
- `+` `A6 [inferred]` — Sibling team API stable through Q3

**Removed items**
- `−` `30d-M2.3` — PDF watermark (cut — no dependents, capacity pressure)

## Context paragraph (rendered into `{{CONTEXT_PARAGRAPH}}`)

> `billing-service` is the subscription-and-invoicing backend for
> a Series-B SaaS product, currently in the "scaling" phase —
> feature velocity is high but test coverage is lagging (0.31
> test/src ratio). The 30d thrust is **stabilize** (webhook retry
> reliability, invoice PDF correctness); the 90d thrust is
> **scale** (multi-currency, usage-based pricing); the long-term
> bet is **platformize** (extract a reusable billing primitive
> for sibling products). The single biggest assumption is that
> webhook volume stays under 2M events/day through the quarter —
> if it spikes, the 90d scale theme must be reprioritized.

## Assumptions register (rendered into `{{ASSUMPTIONS}}`)

5 open · 0 validated · 0 invalidated

| ID | Assumption | Tier | Validation | Signal | Consequence | Owner | Status |
|----|-----------|------|-----------|--------|-------------|-------|--------|
| A1 | Webhook volume stays under 2M/day through the quarter | 90d | T+30d | 7-day rolling avg | Re-plan 90d-T1 around sharding | `<unassigned>` | open |
| A2 | Priya remains on the team through 90d-T1 | 90d | T+30d | HR check-in | Defer 90d-T1 to next quarter | `<unassigned>` | open |
| A3 | FX provider uptime stays ≥ 99.5% | 90d | T+14d | Provider status page | Escalate to backup provider decision | `<unassigned>` | open |
| A4 `[inferred]` | The billing-core extraction is reversible | long | T+90d | Migration rollback test | Kill LT-B1 | `<unassigned>` | open |
| A5 `[inferred]` | Customer demand for metered billing stays at current survey level | long | T+180d | Beta signup count | Kill LT-B2 | `<unassigned>` | open |

## Decision log (rendered into `{{DECISIONS}}`)

4 made · 0 superseded · 0 reversed

| ID | Date | Decision | Rationale | Alternatives considered | Reversibility | Tier | Owner | Status |
|----|------|----------|-----------|-------------------------|---------------|------|-------|--------|
| DL1 | T+0d | Cut PDF watermark from 30d-M2 | Capacity pressure; no dependents; blocks nothing in 90d | Keep (rejected: capacity); Defer (rejected: blocks 90d-T1) | reversible | 30d | `<unassigned>` | made |
| DL2 | T+0d | Use exponential backoff with jitter | Industry standard; better than linear under load; prevents thundering herd | Linear (rejected: thundering herd); No retry (rejected: poor UX) | reversible | 30d | `<unassigned>` | made |
| DL3 | T+0d | Accept webhook volume assumption (2M/day) | Current trajectory supports it; rests on A1; instrumenting first would cost a sprint and delay 30d | Instrument first (rejected: delays 30d); Plan for 5M (rejected: over-engineering) | hard to reverse | 90d | `<unassigned>` | made |
| DL4 `[inferred]` | T+0d | Single-provider FX (not dual) | Dual-provider adds a sprint of integration work; rests on A3 (provider uptime ≥ 99.5%); the fallback is escalation, not redundancy | Dual-provider (rejected: cost); Build aggregator (rejected: scope creep) | hard to reverse | 90d | `<unassigned>` | made |

## 30d tier (rendered into `{{TIER_30D}}`)

### Milestones

| ID | Name | Window | Exit criteria | Depends on | DoD |
|----|------|--------|---------------|------------|-----|
| 30d-M1 | Fix webhook retry reliability | T+0d → T+10d | Webhook retry success rate ≥ 99.5% over 7 consecutive days | — | Retry queue has a dashboard; p99 retry latency < 5s |
| 30d-M2 | Invoice PDF correctness | T+5d → T+15d | Zero open PDF-rendering bugs in tracker; e2e test covers all 4 plan types | 30d-M1 | PDF diff snapshot suite checked into CI |
| 30d-M3 | Coverage floor | T+10d → T+25d | Test/src ratio ≥ 0.40 on `src/webhooks/` and `src/invoices/` | 30d-M1, 30d-M2 | Coverage gate enforced in CI |

### Work items (30d-M1 example)

| ID | Title | Size | Owner | Dependencies | Files likely touched | Risk |
|----|-------|------|-------|--------------|----------------------|------|
| 30d-M1.1 | Audit current retry queue | S | `<unassigned>` | — | `src/webhooks/queue.ts` | low |
| 30d-M1.2 | Add exponential backoff with jitter | M | `<unassigned>` | 30d-M1.1 | `src/webhooks/retry.ts` | medium |
| 30d-M1.3 | Build retry dashboard | M | `<unassigned>` | 30d-M1.1 | `src/webhooks/dashboard.ts`, `src/webhooks/dashboard.css` | low |
| 30d-M1.4 | Load test at 2M events/day | L | `<unassigned>` | 30d-M1.2 | `tests/load/webhooks.test.ts` | high |
| 30d-M1.5 | Document runbook | S | `<unassigned>` | 30d-M1.3 | `docs/runbooks/webhooks.md` | low |

Roll-up: 30d-M1 → 90d-T1 (Reliability baseline).

## Capacity vs demand (rendered into `{{CAPACITY}}`)

```
Available: 4 committers × 22 days × 0.5 focus = 44 person-days
Demand:    19 work + 8 meetings + 4 oncall × 1.15 buffer = 35.65 person-days
Verdict:   GREEN — 8.35 person-days of slack (19% under capacity)
```

| Work item | Size | Estimate (days) | Dependents |
|-----------|------|-----------------|------------|
| 30d-M1.1 | S | 0.75 | 30d-M1.2, 30d-M1.3 |
| 30d-M1.2 | M | 2 | 30d-M1.4 |
| 30d-M1.3 | M | 2 | — |
| 30d-M1.4 | L | 4 | — |
| 30d-M1.5 | S | 0.75 | — |
| 30d-M2.1 | M | 2 | — |
| 30d-M3.1 | S | 0.75 | — |
| Meeting overhead | — | 8 | — |
| Oncall overhead | — | 4 | — |
| Buffer (15%) | — | 4.65 | — |
| **Total demand** | — | **35.65** | — |

The verdict is green because billing-service is in a "scaling"
scenario (focus factor 0.5) with 4 active committers and a
modest 30d WBS. If the team lost a committer, the verdict would
flip to amber; if two, to red with suggested cuts.

## 90d tier (rendered into `{{TIER_90D}}`)

### Themes

| ID | Name | Exit criteria | Roll-up from | Owner | North-star metric |
|----|------|---------------|--------------|-------|-------------------|
| 90d-T1 | Reliability baseline | p99 webhook latency < 5s; invoice error rate < 0.1% | 30d-M1, 30d-M2 | `<unassigned>` | Webhook success rate |
| 90d-T2 | Multi-currency GA | 5 currencies live; FX rates refreshed hourly; finance sign-off | 30d-M3 (coverage gate) | `<unassigned>` | Active currency count |
| 90d-T3 | Usage-based pricing beta | 10 design-partner accounts on metered billing; invoice accuracy ≥ 99% | 90d-T1 | `<unassigned>` | Beta accounts count |

### Epics (90d-T2 example)

| ID | Title | Size | Dependencies | Risk |
|----|-------|------|--------------|------|
| 90d-T2.E1 | FX rate provider integration | XL | — | medium |
| 90d-T2.E2 | Invoice rendering for multi-currency | XL | 90d-T2.E1 | medium |
| 90d-T2.E3 | Finance reconciliation report | L | 90d-T2.E2 | low |

Roll-up: 90d-T1 → LT-B1; 90d-T2 → LT-B2; 90d-T3 → LT-B2.

## Traceability matrix (rendered into `{{TRACEABILITY}}`)

| 30d work item | 30d milestone | 90d theme | Long-term bet | North-star metric |
|---------------|---------------|-----------|---------------|-------------------|
| 30d-M1.1 — Audit retry queue | 30d-M1 — Fix webhook retry reliability | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Webhook success rate |
| 30d-M1.2 — Add exponential backoff | 30d-M1 — Fix webhook retry reliability | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Webhook success rate |
| 30d-M1.3 — Build retry dashboard | 30d-M1 — Fix webhook retry reliability | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Webhook success rate |
| 30d-M1.4 — Load test at 2M events/day | 30d-M1 — Fix webhook retry reliability | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Webhook success rate |
| 30d-M1.5 — Document runbook | 30d-M1 — Fix webhook retry reliability | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Webhook success rate |
| 30d-M2.1 — PDF rendering audit | 30d-M2 — Invoice PDF correctness | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Invoice error rate |
| 30d-M3.1 — Coverage gate in CI | 30d-M3 — Coverage floor | 90d-T1 — Reliability baseline | LT-B1 — Billing-as-a-platform | Test/src ratio |

## Long-term tier (rendered into `{{TIER_LONG}}`)

### Bets

| ID | Name | Hypothesis | Roll-up from | North-star metric | Kill criteria | Decision point |
|----|------|-----------|--------------|-------------------|---------------|----------------|
| LT-B1 | Billing-as-a-platform | Extracting billing as a reusable primitive unlocks 2+ sibling product launches within 12 months | 90d-T1 | Sibling products onboarded | < 1 sibling product integrated by T+180d | T+180d |
| LT-B2 | Usage-based pricing becomes the default | By end of year, > 60% of new accounts choose metered billing | 90d-T2, 90d-T3 | % new accounts on metered | < 20% adoption after 2 quarters of GA | T+270d |

### Platform / architectural shifts anticipated

- Extract `billing-core` as a standalone package by T+180d
- Migrate from Stripe webhook signing to a provider-agnostic adapter by T+365d

### Project north-star metrics

- Monthly recurring revenue recognized through the service
- Engineering hours spent on billing incidents (target: trending down)

## Risks (rendered into `{{RISKS}}`)

| Risk | Tier | Likelihood | Impact | Mitigation | Owner | Trigger |
|------|------|-----------|--------|------------|-------|---------|
| Webhook volume exceeds 2M/day before 90d-T1 completes | 30d | medium | high | Load test at 3M/day in 30d-M1.4; have shard plan ready | `<unassigned>` | 7-day rolling avg > 1.8M/day |
| FX provider downtime cascades into invoice failures | 90d | medium | high | Dual-provider fallback; circuit breaker on FX calls | `<unassigned>` | FX provider uptime < 99.5% in a week |
| Sibling product team not ready by T+180d, blocks LT-B1 | long | high | high | Quarterly sync with sibling team starting T+30d; LT-B1 kill criteria agreed upfront | `<unassigned>` | Sibling team misses two consecutive sync milestones |
| Test/src ratio drops below 0.30 during 90d-T2 push | 90d | medium | medium | Coverage gate in CI (from 30d-M3); refuse merges that drop ratio | `<unassigned>` | CI coverage gate fails 3 times in a week |

## Team allocation (rendered into `{{TEAM}}`)

### Roster

| Author | Commit share | Files owned (top 3) |
|--------|-------------|---------------------|
| Priya  | 42% | `src/webhooks/queue.ts`, `src/webhooks/retry.ts`, `src/invoices/pdf.ts` |
| Marcus | 28% | `src/pricing/engine.ts`, `src/fx/rates.ts`, `src/db/schema.ts` |
| Liu    | 18% | `src/api/routes.ts`, `src/api/middleware.ts` |
| others | 12% | — |

### 30d allocation (draft)

| Work item | Suggested owner | Reviewer | Bus-factor flag |
|-----------|----------------|----------|-----------------|
| 30d-M1.1 | Priya | Marcus | yes — single-author file |
| 30d-M1.2 | Priya | Marcus | yes |
| 30d-M1.3 | Liu | Priya | no |
| 30d-M1.4 | Marcus | Priya | no |
| 30d-M1.5 | `<unassigned>` | Priya | no |

### 90d allocation (draft)

| Theme | Suggested owner |
|-------|----------------|
| 90d-T1 | Priya |
| 90d-T2 | Marcus |
| 90d-T3 | `<unassigned>` |

## DoD checklist (rendered into `{{DOD}}`)

**30d DoD**
- [ ] All 30d milestone exit criteria met
- [ ] All L / XL items have a reviewer assigned
- [ ] Test-to-src LOC ratio did not decrease vs baseline (0.31)
- [ ] No new TODO/FIXME without a linked issue

**90d DoD**
- [ ] All 90d theme exit criteria met (north-star metrics moved)
- [ ] Every 30d milestone traces to a 90d theme
- [ ] Cross-team dependencies resolved or documented
- [ ] Capacity plan reviewed vs actual velocity (3.5 commits/day baseline)

**Long-term DoD**
- [ ] Every 90d theme traces to a long-term bet
- [ ] Each bet has a kill criteria + decision point
- [ ] Platform shifts have a migration sketch (not a full plan)
- [ ] North-star metrics reviewed quarterly

## Review checklist (rendered into `{{REVIEW}}`)

**Narrative**
- [ ] Context paragraph names the thrust for all three tiers
- [ ] No marketing language or hedging
- [ ] The single biggest assumption is named in the context

**Roll-up integrity**
- [ ] Every 30d milestone traces to a 90d theme
- [ ] Every 90d theme traces to a long-term bet
- [ ] Traceability matrix has no `— ORPHAN —` cells

**Capacity**
- [ ] Capacity verdict is green or amber (or `--allow-overcommit` is documented)
- [ ] Buffer is 15% of (work + meeting + oncall)
- [ ] Focus factor matches the scenario (0.5 for scaling)

**Assumptions**
- [ ] Every assumption has a concrete consequence (not "re-evaluate")
- [ ] Every assumption has a validation date in T+Nd form
- [ ] Inferred assumptions are tagged `[inferred]`

**Risks**
- [ ] Every risk has a trigger signal
- [ ] Tier tags are present (30d / 90d / long)
- [ ] Amber and red risks have mitigations

**Sign-off**
- [ ] Author: `<unassigned>`
- [ ] Peer reviewer: `<unassigned>`
- [ ] Stakeholder: `<unassigned>`
- [ ] Review date: `T+0d` (before sharing)

## How to use this example

1. When rendering a plan for a real project, use this example to
   calibrate granularity — 30d work items should be S/M/L with
   named files; 90d should be XL epics; long-term should be bets
   with kill criteria.
2. The roll-up pattern (30d-M1 → 90d-T1 → LT-B1) is the contract.
   If you cannot trace a work item up to a bet, either drop it or
   add a parent.
3. The tone is matter-of-fact, no marketing. "Stabilize / scale /
   platformize" is the right register; "revolutionize" is not.
4. Owner placeholders are `<unassigned>` until the user confirms.
   Git-blame suggestions are labeled as draft.
5. Every risk has a trigger — a concrete signal that escalates.
   "Likelihood: high" without a trigger is not useful.
