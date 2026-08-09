---
title: Emerging sector tracking framework
aliases:
- emerging-sector-tracking
- sector-tracking-framework
- technology-sector-evaluation
tags:
- market-trends
- emerging-technology
- sector-analysis
- framework
- evaluation
category: executive/industry/market-trends
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- executive
- product-manager
- tech-lead
benefit: "executives can systematically identify, evaluate, and monitor emerging technology sectors to inform investment and product decisions"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./regional-market-observation.md
- ./half-year-retrospective.md
- ./ai-market-trend-first-half.md
- ../reports/gartner-ai-hype-cycle.md
- ../../../tech-lead/roadmap/plan-tech-roadmap.md
tacit: false
---

# Emerging sector tracking framework

> **As an** executive, **I want to** systematically identify, evaluate, and monitor emerging technology sectors, **so that** I can make informed investment and product decisions before sectors become obvious to competitors.

> Emerging sector tracking is a structured process for identifying nascent technology markets, evaluating their potential, and monitoring their development. It moves beyond gut-feel "this is interesting" to a systematic evaluation of market signals, technology maturity, and timing.

## Summary

- Emerging sector tracking has three phases: identification (finding new sectors), evaluation (assessing potential), and monitoring (tracking development).
- The evaluation framework uses five dimensions: market size potential, technology maturity, ecosystem readiness, competitive dynamics, and timing.
- Sector tracking should be maintained as a portfolio: 3-5 sectors in active monitoring, reviewed quarterly, with clear entry/exit criteria.
- Signal sources for sector identification: venture capital investment patterns, academic research breakthroughs, regulatory changes, adjacent industry analogies, and customer pain point evolution.
- The key insight is that most sectors are identified too late (after the peak of the hype cycle) or too early (before the ecosystem is ready). The framework helps time the entry point.

## Core viewpoints

### 1. Sector identification is pattern recognition, not prediction

Emerging sectors almost always follow patterns from adjacent sectors. AI agents today follow the same adoption pattern as cloud computing in 2008-2012: infrastructure first, then platforms, then applications. AI coding assistants follow the same pattern as IDEs in the 1990s. Use historical analogies to identify where a sector is in its development trajectory, not to predict the exact outcome.

### 2. The five-dimension evaluation framework prevents single-variable decisions

Most sector evaluations fail because they focus on a single dimension (usually market size). A sector with massive TAM but immature technology is not investable today. A sector with mature technology but no ecosystem readiness cannot achieve adoption. All five dimensions -- market, technology, ecosystem, competition, timing -- must be evaluated together. The weakest dimension is the binding constraint.

### 3. Monitoring is more important than initial evaluation

The initial evaluation of an emerging sector is a snapshot. The sector will evolve: technology matures, competitors enter, regulation changes, and customer needs shift. The value of sector tracking is in the monitoring -- watching how the sector evolves and updating your assessment. A sector that was too early last quarter may be ready this quarter. Without monitoring, you miss the window.

### 4. Portfolio management prevents over-commitment to a single sector

The natural tendency is to identify a promising sector and over-commit resources. But emerging sectors are inherently uncertain. Maintain a portfolio of 3-5 sectors at different stages: 1-2 in early identification (research only), 1-2 in active evaluation (pilot investments), and 1 in active investment (committed resources). Rotate sectors through the portfolio as they mature.

## Key info

### The three-phase tracking process

**Phase 1: Identification**
- Scan for signals: VC investment patterns, research breakthroughs, regulatory changes, customer pain points, adjacent industry analogies.
- Add to the sector watchlist (a low-commitment list of potentially interesting sectors).
- Review the watchlist monthly: promote promising sectors to evaluation, drop sectors that were false signals.

**Phase 2: Evaluation**
- Apply the five-dimension framework to score the sector.
- Conduct primary research: 3-5 expert interviews, 2-3 customer conversations.
- Write a sector evaluation brief (1-2 pages) with a clear recommendation: invest now, watch and revisit, or pass.
- Set a revisit date: 3-6 months for sectors that are "watch and revisit."

**Phase 3: Monitoring**
- For active sectors, track weekly: key competitor moves, technology breakthroughs, regulatory changes, customer adoption signals.
- For watch sectors, track monthly: sector is still in identification phase, major changes only.
- Quarterly review: update the evaluation, adjust the recommendation, rotate sectors through the portfolio.

### Five-dimension evaluation framework

| Dimension | Key questions | Scoring (1-5) | Weight |
|---|---|---|---|
| Market size potential | What is the TAM/SAM/SOM? What is the growth rate? | 1 = < $100M, 5 = > $10B | 25% |
| Technology maturity | Is the core technology production-ready? What is the reliability? | 1 = research only, 5 = enterprise-grade | 25% |
| Ecosystem readiness | Are the complementary technologies, talent, and standards in place? | 1 = no ecosystem, 5 = mature ecosystem | 20% |
| Competitive dynamics | How many competitors? What is the defensibility? | 1 = winner-take-all, 5 = fragmented | 15% |
| Timing | Is now the right time to enter? (Too early, right time, too late) | 1 = too early, 5 = right time | 15% |

**Composite score interpretation:**
- 4.0-5.0: Invest now. Sector is ready for committed resources.
- 3.0-4.0: Watch and revisit. Sector is promising but not yet ready. Revisit in 3-6 months.
- 2.0-3.0: Research only. Sector is too early. Allocate research budget, no product investment.
- 1.0-2.0: Pass. Sector is not relevant or not investable.

### Sector tracking portfolio example

| Sector | Stage | Evaluation score | Next review | Action |
|---|---|---|---|---|
| AI agents | Active investment | 4.2 | Monthly | Continue investment, track reliability |
| Edge AI | Active evaluation | 3.5 | Quarterly | Monitor NPU hardware, small model progress |
| Quantum ML | Early identification | 2.0 | Semi-annual | Track research papers only |
| AI-native IDEs | Active evaluation | 3.8 | Quarterly | Pilot with internal team |
| AI in manufacturing | Early identification | 2.8 | Quarterly | Customer conversations |

### Signal sources for identification

| Signal type | Source | What to look for | Frequency |
|---|---|---|---|
| VC investment | Crunchbase, PitchBook, CB Insights | Clusters of seed/A investments in a new category | Monthly |
| Research breakthroughs | arXiv, conference proceedings | Step-function improvements in capability | Monthly |
| Regulatory changes | Government announcements, policy documents | New regulations enabling or constraining a sector | Monthly |
| Customer pain points | Sales calls, customer interviews, support tickets | Recurring pain points that existing solutions don't address | Weekly |
| Adjacent analogies | Historical technology adoption patterns | Sectors that follow the same pattern as an adjacent industry | Quarterly |
| Talent migration | LinkedIn, job postings | Where top engineers are moving | Quarterly |
| Corporate activity | M&A announcements, new business units | Large companies entering a sector | Monthly |

### Entry and exit criteria

**Entry criteria (promote from watchlist to evaluation):**
- At least 3 independent signals in the past quarter (VC investments, research papers, startup launches)
- At least 1 primary customer signal (customer asking about the technology)
- A plausible TAM of > $500M within 5 years

**Exit criteria (remove from portfolio):**
- No new signals in 2 consecutive quarters
- Technology proven to be infeasible or unreliable
- Market size proven to be smaller than initial estimate
- Competitive landscape consolidated to 1-2 dominant players (too late to enter)

## Action recommendations

1. Create a sector watchlist: start with 5-10 potentially interesting sectors based on recent signals.
2. Apply the five-dimension evaluation framework to the top 3-5 sectors on the watchlist.
3. Maintain a portfolio of 3-5 sectors at different stages: 1-2 identification, 1-2 evaluation, 1 active investment.
4. Establish a quarterly sector review cadence: update evaluations, rotate sectors, apply entry/exit criteria.
5. Use historical analogies to calibrate timing: which adjacent sector does this emerging sector resemble?
6. Conduct primary research for evaluation-phase sectors: 3-5 expert interviews and 2-3 customer conversations.
7. Document sector evaluations in a structured format; build a library of evaluations for pattern recognition.

## Anti-patterns

- **Evaluating by market size alone** -- a large TAM with immature technology is not investable. All five dimensions must be evaluated.
- **No exit criteria** -- sectors stay in the portfolio forever. Define and enforce exit criteria.
- **Over-committing to a single sector** -- emerging sectors are inherently uncertain. Maintain a portfolio to spread risk.
- **Identifying too late** -- by the time a sector is in the news, it is too late for early-mover advantage. Focus on signals that precede media coverage.
- **Identifying too early without patience** -- some sectors take 5-10 years to mature. Entering too early and running out of patience is as bad as entering too late.
- **No primary research** -- industry reports are lagging indicators. Customer conversations and expert interviews are leading indicators.
- **Tracking too many sectors** -- more sectors = less depth. Focus on 3-5 sectors with disciplined evaluation.

## Related

- Same category: [./regional-market-observation.md](./regional-market-observation.md) -- regional market observation methodology
- Same category: [./half-year-retrospective.md](./half-year-retrospective.md) -- 2026 H1 retrospective
- Same category: [./ai-market-trend-first-half.md](./ai-market-trend-first-half.md) -- 2026 H1 market trends
- Upstream: [../reports/gartner-ai-hype-cycle.md](../reports/gartner-ai-hype-cycle.md) -- Gartner AI Hype Cycle
- Downstream: [../../../tech-lead/roadmap/plan-tech-roadmap.md](../../../tech-lead/roadmap/plan-tech-roadmap.md) -- technology roadmap planning

## References

- Geoffrey Moore -- Crossing the Chasm (technology adoption lifecycle)
- Clayton Christensen -- The Innovator's Dilemma (disruptive innovation patterns)
- Gartner -- Hype Cycle methodology
- Carlota Perez -- Technological Revolutions and Financial Capital (technology cycles)