---
name: business-strategy
description: Use this skill when defining organizational strategy, analyzing markets and competitors, setting OKRs and roadmaps, or making executive-level decisions. Covers market intelligence, competitive analysis, strategic planning, and leadership development. Grounds every product and engineering decision in business reality.
metadata:
  source: YiVad pipeline/business (executiver layer)
  review_cycle: monthly
  roles:
    - executiver
---

# Business Strategy Skill

Define the strategic context that drives every downstream decision. Business Strategy provides the market intelligence, competitive landscape, and organizational goals that shape product requirements, technical decisions, and operational priorities. Without a clear business foundation, product and engineering teams operate without direction.

## When to Activate

- Setting quarterly or annual OKRs and strategic goals
- Analyzing a new market or competitive landscape
- Evaluating whether to build, buy, or partner for a capability
- Reviewing industry trends for strategic planning
- Making resource allocation decisions (headcount, budget, focus)
- Preparing for a quarterly business review or board presentation
- Assessing a competitor's move and formulating a response
- Selecting technology vendors or platforms at the organizational level
- Reading and applying leadership/management frameworks

## Core Domains

The executiver role owns three domains. Identify which one the current task falls into.

| Domain | Directory | What It Contains |
|--------|-----------|-----------------|
| **Industry Intelligence** | `industry/` | Market trends, competitor analysis, industry reports (Gartner, McKinsey, a16z) |
| **Strategic Roadmap** | `roadmap/` | OKRs, quarterly reviews, annual planning, headcount/budget |
| **Leadership Reading** | `reading-list/` | Curated reading notes from management classics |

## Decision Framework

### FAIL: Skipping Business Context
```
"We should use Kubernetes because it's the industry standard."
→ Without business context: What scale? What budget? What team?
  Technology choices without business grounding are expensive hobbies.
```

### PASS: Business-Grounded Decisions
```
1. Market signal: Our competitors are shipping AI features weekly (competitor-analysis.md)
2. Org constraint: We have 3 backend engineers, $X budget (headcount-budget-planning.md)
3. Strategic goal: Launch AI feature by Q3 to defend market position (org-okr-tracking.md)
4. Decision: Buy managed AI API vs. build self-hosted → evaluate LLM vendor landscape
```

## Market Intelligence Checklist

When analyzing a market or competitive landscape:

### Market Sizing

- [ ] TAM, SAM, SOM defined with source citations
- [ ] Growth rate (YoY) from at least 2 independent sources
- [ ] Key demand drivers identified (regulatory, technological, behavioral)
- [ ] Market structure: fragmented vs. consolidated, winner-take-all vs. sustainable niche

### Competitive Analysis

- [ ] Direct competitors mapped (same product, same customer)
- [ ] Indirect competitors mapped (different product, same customer need)
- [ ] Each competitor scored on: product maturity, funding, team size, market share
- [ ] Competitive moat assessed: network effects, data advantages, switching costs, brand
- [ ] Blind spots identified: what are we NOT seeing?

### Industry Trends

- [ ] Technology trends with adoption curves (emerging → mainstream → declining)
- [ ] Regulatory trends with compliance timeline
- [ ] Talent market trends (available skills, salary benchmarks)
- [ ] Adjacent market movements that could converge

## Strategic Planning Checklist

### OKR Setting

```
FAIL: "Grow revenue" (vague, unmeasurable)
FAIL: "Ship 50 features" (output, not outcome)

PASS: "Increase monthly active users from 10k to 25k by Q4
       through AI-powered onboarding (KR1: reduce time-to-value
       from 7 days to 2 days; KR2: achieve 40% conversion from
       trial to paid)."
```

- [ ] Objectives are qualitative, inspirational, time-bound
- [ ] Key Results are quantitative, measurable, 3-5 per objective
- [ ] OKRs cascade from company → team → individual (or justify why not)
- [ ] Previous quarter's OKRs reviewed; misses understood
- [ ] Resources (headcount, budget) allocated to each KR

### Build vs. Buy vs. Partner

| Factor | Build | Buy | Partner |
|--------|-------|-----|---------|
| Core to differentiation? | Yes | No | Shared |
| In-house expertise? | Yes | No | Partial |
| Time to market | Slow | Fast | Medium |
| Long-term cost | Lower | Higher | Shared |
| Control | Full | Low | Medium |
| Risk | Execution | Vendor lock-in | Coordination |

- [ ] Decision documented with rationale (why A over B)
- [ ] If buy: vendor evaluation with risk score (see code-quality-research skill)
- [ ] If build: resource estimate with 2x buffer
- [ ] If partner: clear boundary of responsibilities

### Resource Allocation

- [ ] Headcount plan aligned with strategic priorities (not squeaky-wheel)
- [ ] Budget allocation reflects OKR priorities
- [ ] 20% slack for unexpected opportunities or crises
- [ ] Runway calculated: months of operation at current burn rate

## Industry Report Review Checklist

When reviewing an external report (Gartner, McKinsey, a16z, CAICT):

- [ ] **Source credibility**: Who funded it? What's their track record?
- [ ] **Date**: Is it current? Reports older than 12 months may be stale.
- [ ] **Methodology**: How was data collected? Sample size? Geographic scope?
- [ ] **Bias**: Is the author selling something? (Consulting → implementation; VC → investment thesis)
- [ ] **Applicability**: Does this apply to our market, scale, and geography?
- [ ] **Key takeaways**: 3 actionable insights, not just interesting facts
- [ ] **Counter-narrative**: What's the opposing view? Seek disconfirming evidence.

## Leadership Reading Checklist

When processing a management book or article for the reading list:

- [ ] **Core thesis**: One sentence — what is the author arguing?
- [ ] **Key frameworks**: 2-3 reusable mental models from the book
- [ ] **Applicability**: Which of our current challenges does this address?
- [ ] **Action items**: What can we try this week based on this reading?
- [ ] **Related readings**: Link to other entries in the reading list

## Pipeline Position

This skill feeds the **Requirements** stage (producter/) and the **Decisions** stage (leader/).

```
executiver/ (WHY + WHAT at org level)
    │
    ├─ market intelligence → producter/ (features to build)
    ├─ org strategy → producter/ (priorities)
    ├─ competitive analysis → leader/ (build vs. buy)
    └─ OKRs → leader/ (capacity planning)
```

**You are here**: The Business Strategy layer. You set the WHY. Do not define HOW to build (→ engineer/) or WHICH features to prioritize (→ producter/). Strategy informs; execution decides.

## Rules

| # | Rule | Why |
|---|------|-----|
| 1 | Every market claim needs a source and date | Markets change fast; unsourced claims are opinions |
| 2 | OKRs are outcomes, not outputs | "Ship 50 features" is output; "Increase retention 20%" is outcome |
| 3 | Competitor analysis must include blind spots | If you can't name what you're missing, you're doing cheerleading, not analysis |
| 4 | Build vs. buy decisions must be documented | Undocumented decisions get re-litigated every quarter |
| 5 | Every industry report must be read with skepticism | Every report has an agenda; identify it before applying the findings |
| 6 | Resource allocation follows strategy, not noise | The loudest stakeholder should not win by default |
| 7 | Deprecate, don't delete | Set `status: deprecated` with a pointer to the replacement |
| 8 | Update the parent INDEX.md when adding files | Unlisted files are undiscoverable |

## Borders

| Boundary | Permission |
|----------|-----------|
| YiKnowledge/executiver/** | read + write |
| YiKnowledge/producter/** | read |
| YiKnowledge/leader/** | read |
| Web Search (market data, competitor intel) | read |
| Industry report URLs (Gartner, McKinsey, a16z) | read |
| YiKnowledge/skills/** | read |
| External paid/authenticated services | no access |

## Resources

- [Executiver role index](../../executiver/INDEX.md)
- [Market trends (full report)](../../executiver/industry/market-trends/README.md)
- [Competitor analysis](../../executiver/industry/competitors/README.md)
- [Industry reports](../../executiver/industry/reports/README.md)
- [Strategic roadmap](../../executiver/roadmap/README.md)
- [Reading list](../../executiver/reading-list/README.md)
- [code-quality-research skill](../code-quality-research/SKILL.md) — for evaluating specific tools