---
title: Handle a Regulatory Change
aliases: [regulatory-change, compliance-response, regulation]
tags: [strategy, compliance, regulatory, journey]
category: executiver/strategy
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [executiver, leader]
benefit: "Systematically assess the impact of new regulations, plan adaptation, and execute changes before enforcement deadlines"
related:
  - ./handle-data-compliance.md
  - ./do-a-data-retention-review.md
  - ./product-strategy-framework.md
  - ../README.md
  - ../INDEX.md
---

# Handle a Regulatory Change

> **As a** compliance owner, **I want to** respond to new or changing regulations, **so that** we adapt before enforcement begins and avoid penalties, business disruption, or market access loss.

## Trigger condition

- New regulation announced that affects your product, data, or market
- Existing regulation amended with new requirements
- Regulatory enforcement action or fine in your industry (even if not against you)
- New jurisdiction entered (new market = new regulations)
- Customer or partner requires compliance certification

## Step-by-step walkthrough

### Step 1: Initial assessment (within 48 hours of trigger)

Answer these questions:

| Question | Action |
|---|---|
| What is the regulation? | Name, jurisdiction, regulator, official reference |
| What does it require? | 3–5 sentence summary of key obligations |
| Who does it apply to? | Company size, industry, data types, geographic scope |
| When does it take effect? | Announcement date, enforcement date, any transition period |
| What happens if we don't comply? | Penalties: fines, business restrictions, criminal liability |
| Does it apply to us? | Yes / No / Maybe — be conservative; if "maybe," treat as "yes" |

Output: **One-page regulatory brief** (share with leadership within 48 hours).

### Step 2: Impact assessment (within 1–2 weeks)

Assemble a cross-functional team: legal, engineering, product, security, data.

| Area | Assessment questions |
|---|---|
| **Data** | Does this affect what data we collect, store, or process? |
| **Product** | Does this require product changes (UX, features, flows)? |
| **Engineering** | What technical changes are needed? How long will they take? |
| **Operations** | What processes need to change (support, incident response, reporting)? |
| **Business** | Does this affect our business model, pricing, or market access? |
| **Legal** | What documentation, policies, or contracts need updating? |

For each area, estimate:
- **Effort**: Person-weeks required
- **Risk**: Impact if not done by enforcement date
- **Dependency**: Does anything else depend on this being done first?

### Step 3: Gap analysis (overlaps with Step 2)

Compare current state against new requirements:

| Requirement | Current state | Gap | Severity |
|---|---|---|---|
| Must provide data portability within 30 days | No automated export; manual process takes 45 days | Must build automated export; reduce turnaround to <30 days | High |
| Must appoint a DPO | No DPO designated | Assign or hire DPO | Medium |
| Must conduct DPIAs for high-risk processing | No DPIA process exists | Create DPIA template and review process | Medium |

### Step 4: Adaptation plan

Create a prioritized roadmap:

| Gap | Action | Owner | Deadline | Effort |
|---|---|---|---|---|
| Build automated data export | Implement data portability API | Engineering lead | 60 days before enforcement | 4 pw |
| Appoint DPO | Hire or designate internal | Legal lead | 90 days before enforcement | 2 pw |
| Create DPIA process | Template + review workflow | Compliance lead | 30 days before enforcement | 1 pw |

**Critical rule**: Target completion at least 30 days before the enforcement date. This gives buffer for testing, unexpected issues, and stakeholder review.

### Step 5: Execute and monitor

1. **Weekly standup** during adaptation period: track progress against the plan
2. **Escalation path**: if a deadline is at risk, escalate to leadership immediately
3. **Evidence collection**: document every change made — you'll need this if audited
4. **External counsel review**: have a lawyer review the final state before enforcement
5. **Post-implementation review**: after enforcement date, review what went well and what didn't

### Step 6: Update the compliance baseline

After adaptation is complete, update:
- [Data compliance baseline](./handle-data-compliance.md) — new requirements are now part of ongoing compliance
- [Data retention policy](./do-a-data-retention-review.md) — if retention periods changed
- [Strategy document](./product-strategy-framework.md) — if the regulation affects strategic choices (e.g., market entry, product scope)

## Decision points and branching

| Decision point | Options | Guidance |
|---|---|---|
| Regulation may not apply to us | Ignore vs. monitor vs. prepare | Always prepare minimally (understand the requirements); err on the side of compliance |
| Compliance cost > business value in that market | Exit market vs. comply vs. accept risk | Exit if the market is marginal; never "accept risk" on regulations with criminal liability |
| Multiple regulations conflict | Comply with strictest vs. jurisdictional segmentation | Comply with the strictest unless you can segment by jurisdiction (separate products/infrastructure) |
| Enforcement date is aggressive | Minimum viable compliance vs. full compliance | Ship MVC by the deadline; document what's deferred and why; schedule the remainder |
| Regulation is unclear or still evolving | Wait for clarity vs. prepare for likely outcome | Prepare for the most likely interpretation; engage industry association for clarity |

## Key deliverables at each stage

| Stage | Deliverable | Timeline |
|---|---|---|
| Initial assessment | One-page regulatory brief | 48 hours |
| Impact assessment | Impact report with effort estimates | 1–2 weeks |
| Gap analysis | Prioritized gap list | 1–2 weeks |
| Adaptation plan | Roadmap with owners and deadlines | 2–3 weeks |
| Execution | Completed changes with evidence | Per plan |
| Closure | Post-implementation review + baseline updates | 1 week after enforcement |

## Anti-patterns and common pitfalls

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| "We'll deal with it closer to the deadline" | Compliance changes take longer than expected; you need buffer | Start immediately; target 30+ days before enforcement |
| Lawyer-only response | Legal identifies requirements but can't implement | Cross-functional team from day 1 |
| Gold-plating compliance | Building the perfect solution when MVC would suffice | Ask: "What is the minimum required to be compliant by the deadline?" |
| Ignoring the regulation until a competitor gets fined | The first enforcement action could be against you | Monitor enforcement actions but don't wait for them |
| No evidence trail | If audited, you can't prove you complied | Document every change, decision, and review; date everything |

## This product's landing instance

*To be filled in with the most recent regulatory change handled. Include the regulation name, the assessment date, the key gaps found, the adaptation timeline, and the post-implementation review outcome.*