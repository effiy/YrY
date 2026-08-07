---
title: JTBD + Kano Model Integration
aliases:
  - JTBD and Kano combined
  - Jobs-to-Be-Done with Kano
  - JTBD-Kano framework
tags:
  - PM
  - methodology
  - requirements
  - user-experience
  - prioritization
  - jtbd
  - kano
category: product-manager/frameworks
created: 2026-08-07
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - product-manager
  - executive
benefit: PMs can discover what users truly need (JTBD) and then prioritize features by their impact on satisfaction and dissatisfaction (Kano), creating a complete discovery-to-prioritization pipeline
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - jobs-to-be-done.md
  - kano-model.md
  - rice-ice-prioritization.md
  - product-discovery-framework.md
  - ../discovery/write-a-prd.md
tacit: false
---

# JTBD + Kano Model Integration

> **As a** product manager, **I want to** combine JTBD for discovering user needs with Kano for categorizing feature types, **so that** I discover the right jobs to solve and then prioritize features by their satisfaction impact, not just by their presence.

> JTBD answers "what job is the user hiring the product to do?" Kano answers "what type of satisfaction does this feature create?" Used together, they form a discovery-to-prioritization pipeline: JTBD identifies the opportunity space, Kano categorizes the features within that space.

## Summary

- JTBD (Jobs-to-Be-Done) and Kano are complementary, not competing frameworks. JTBD discovers the functional, emotional, and social jobs users need done; Kano classifies the features that address those jobs into Must-be, One-dimensional, Attractive, and Indifferent.
- The integration follows a four-step pipeline: (1) JTBD interview to discover jobs, (2) Map jobs to features, (3) Kano survey to categorize each feature, (4) RICE score to rank within categories.
- The combined framework prevents two common failures: JTBD without Kano produces features that address real jobs but are poorly categorized (e.g., over-investing in Attractive features while neglecting Must-be ones); Kano without JTBD categorizes features that may not address any real job.
- The emotional and social dimensions of JTBD map naturally to Kano's Attractive and One-dimensional categories, revealing that the most differentiating features often address emotional and social jobs, not functional ones.
- Time decay applies to the combined output: as the market evolves, the Kano category of a feature shifts (Attractive -> One-dimensional -> Must-be), and the JTBD itself may evolve (the job changes as substitutes emerge).

## Core viewpoints

- **JTBD without Kano is direction without calibration** -- you know what jobs to solve but not how to prioritize the features that address them. Kano provides the calibration: Must-be features are table stakes, One-dimensional features are competitive, Attractive features are differentiating.
- **Kano without JTBD is calibration without direction** -- you can categorize features but you may be categorizing features that address the wrong job entirely. JTBD ensures the feature set is grounded in real user needs.
- **Emotional and social jobs are the source of Attractive features** -- functional jobs tend to produce Must-be and One-dimensional features. Emotional jobs (feel competent, feel secure) and social jobs (look good to peers, belong to a group) produce the Attractive features that differentiate a product.
- **The combined pipeline enables a strategic portfolio view** -- by plotting features on a JTBD (x-axis) by Kano (y-axis) matrix, the PM can see which jobs are over-served (too many Attractive features for a low-priority job) and which are under-served (only Must-be features for a high-priority job).
- **Re-survey every 12-18 months** -- both JTBD and Kano decay over time. Jobs shift as substitutes emerge; Kano categories shift as user expectations rise. An annual refresh of the combined analysis prevents the product from drifting from user needs.

## Key information

### The four-step pipeline

**Step 1: JTBD Discovery**
- Conduct JTBD interviews with 10-15 users per segment
- Identify the functional, emotional, and social jobs for each user segment
- Map the job hierarchy: main job -> sub-jobs -> micro-jobs
- Output: prioritized list of jobs per segment, with the "struggling moment" (the trigger that causes the user to hire a new solution)

**Step 2: Job-to-Feature Mapping**
- For each high-priority job, brainstorm features that could address it
- Tag each feature with the job(s) it serves
- Eliminate features that serve no identified job (orphan features)
- Output: feature-to-job matrix

**Step 3: Kano Categorization**
- For each feature in the matrix, design the Kano double question (functional + dysfunctional)
- Survey 100+ target users per segment
- Compute Better/Worse coefficients and categorize each feature
- Output: Kano category for each feature (Must-be, One-dimensional, Attractive, Indifferent, Reverse)

**Step 4: RICE Prioritization**
- Within each Kano category, apply RICE scoring
- Priority order: Must-be (highest) -> One-dimensional -> Attractive -> Indifferent (cut)
- Within each category, sort by RICE score
- Output: prioritized feature roadmap

### JTBD x Kano strategy matrix

|                | Must-be (Basic)        | One-dimensional (Performance) | Attractive (Excitement)   | Indifferent       |
|----------------|------------------------|-------------------------------|---------------------------|-------------------|
| **Core job**   | MUST build (table stakes) | Build to compete           | Build to differentiate    | Review -- may be misidentified |
| **Secondary job** | Build to be complete   | Build if capacity allows    | Build for future advantage | Cut               |
| **Peripheral job** | Question -- is this job real? | Likely cut               | Build if extremely low cost  | Cut               |

**How to read the matrix**: A feature for a core job in the Must-be category is non-negotiable -- you must build it. A feature for a peripheral job in the Attractive category is a nice-to-have that may not be worth the investment. The matrix forces the PM to confront whether they are investing in the right jobs.

### Emotional and social jobs as Attractive feature sources

| Job type | Example | Kano category | Why |
|---|---|---|---|
| Functional | "Compare prices across stores" | Must-be or One-dimensional | Users expect it; presence adds value linearly |
| Emotional | "Feel confident I got the best deal" | Attractive | Not expected, but highly satisfying when present |
| Social | "Share my purchase and get peer validation" | Attractive | Social jobs are rarely Must-be; they differentiate |
| Emotional | "Avoid the anxiety of making a wrong choice" | Must-be | Anxiety reduction is a basic expectation in high-stakes purchases |

### Time decay and re-survey cadence

Both JTBD and Kano decay, but at different rates:
- **JTBD**: Jobs shift with market evolution and new substitutes. Re-interview every 18-24 months or when a major competitor enters.
- **Kano**: Categories shift from Attractive -> One-dimensional -> Must-be. Re-survey every 12-18 months or when a feature is widely adopted by competitors.
- **Combined**: Run the full pipeline annually. Run a lightweight Kano refresh (survey only, skip JTBD) every 6 months for features in active development.

### When to use the combined framework

**Use JTBD + Kano when:**
- Entering a new market or launching a new product (need to discover jobs AND categorize features)
- The product has many features but unclear which drive satisfaction (need to re-categorize)
- Competitors are catching up on feature parity (need to find new Attractive features via emotional/social jobs)
- The backlog is full but the team is unsure which features are truly differentiating

**Do NOT use JTBD + Kano when:**
- The product is a utility with well-understood jobs (e.g., a tax calculator)
- The team is in pure execution mode with a fixed roadmap and no discovery capacity
- The user base is too small to survey (fewer than 50 users)

## Action recommendations

1. Start with JTBD: interview 10-15 users per segment to discover the core, secondary, and peripheral jobs. Do not skip to Kano before understanding the jobs.
2. For each job, brainstorm 3-5 features. Tag every feature with the job it serves. Remove orphan features that serve no job.
3. Design Kano surveys for the features that serve core and secondary jobs. Skip peripheral job features unless they are trivial to build.
4. Survey 100+ users per segment. Do not let the team answer on behalf of users.
5. Plot the JTBD x Kano strategy matrix. Identify over-served and under-served jobs.
6. Prioritize: core jobs + Must-be first, then core jobs + One-dimensional, then core jobs + Attractive. Secondary job features fill capacity if available.
7. Re-run the full pipeline annually. Run a lightweight Kano refresh every 6 months.

## Anti-patterns

- **Kano without JTBD** -- categorizing features without knowing which jobs they serve. The team may be optimizing features for the wrong jobs.
- **JTBD without Kano** -- discovering jobs but building all features for all jobs. Without Kano categorization, the team cannot distinguish Must-be from Attractive and over-invests in differentiation while neglecting table stakes.
- **Surveying the wrong users** -- Kano surveys must be answered by real users, not the team. The team's guesses about Attractive vs. Must-be are systematically wrong.
- **One-time analysis** -- running the combined pipeline once and never refreshing. Both JTBD and Kano decay. An annual refresh is the minimum.
- **Ignoring emotional and social jobs** -- focusing only on functional jobs misses the Attractive features that differentiate the product. Emotional and social jobs are the primary source of competitive advantage.

## Related

- Same class: [jobs-to-be-done.md](./jobs-to-be-done.md) -- JTBD methodology in detail
- Same class: [kano-model.md](./kano-model.md) -- Kano model methodology in detail
- Same class: [rice-ice-prioritization.md](./rice-ice-prioritization.md) -- RICE scoring within Kano categories
- Same class: [product-discovery-framework.md](./product-discovery-framework.md) -- broader discovery framework
- Downstream: [../discovery/write-a-prd.md](../discovery/write-a-prd.md) -- using JTBD + Kano output in PRD writing
- References: Alan Klement -- *When Coffee and Kale Compete* (JTBD); Noriaki Kano -- *Attractive Quality and Must-Be Quality* (1984); Jared Spool -- *The Kano Model and JTBD* (UX Strategy)