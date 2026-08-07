---
title: Porter's Five Forces
aliases:
- Porter Five Forces
- Five Forces Model
- Porter's Five Forces
tags:
- strategy
- competition
- five forces
- industry analysis
- product management
category: executive/strategy
created: 2026-07-31
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
roles:
- executive
- product-manager
benefit: strategy aligned
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./business-model-canvas.md
- ./blue-ocean.md
- ./product-strategy-framework.md
- ../industry/competitors/README.md
tacit: false
---

# Porter's Five Forces

> **As an** executive, **I want to** porter five forces, **so that** strategy aligned.

> Break industry competition into five forces to see the overall industry attractiveness and profit margin — not competitor comparison, but industry structure.

## Summary

- Proposed by Michael Porter (1979, HBR); industry profit margin is determined by the five forces
- The five forces: existing competitors, supplier bargaining power, buyer bargaining power, threat of new entrants, threat of substitutes
- Output: three strategic choices — cost leadership / differentiation / focus
- Complementary to blue ocean: five forces ask "what industry is this"; blue ocean asks "switch to a different market"

## Core viewpoints

- **Industry structure determines profit margin more than competitive positioning within the industry.** The five forces framework asks a different question than competitor analysis: not "how do we beat competitors?" but "is this industry worth competing in?" An industry where suppliers have high bargaining power, buyers can switch at zero cost, and substitutes are abundant will destroy margins regardless of how well a company executes. The framework's first job is to answer the question "should we be in this business at all?"

- **The five forces must be analyzed as a system, not as five independent checklists.** A force that appears weak in isolation may be strong when combined with another: low barriers to entry combined with powerful buyers creates a race-to-the-bottom dynamic where new entrants undercut on price and buyers capture all the surplus. The analysis must identify the interaction effects between forces, not just the strength of each force individually.

- **Strategic positioning is about choosing the link in the value chain where the five forces are weakest.** If supplier power is the dominant force, backward integration neutralizes it. If buyer power is the dominant force, differentiation and switching costs neutralize it. The strategy is not "be better than competitors" — it is "position the company where the forces are weakest." The worst strategic choice is to compete head-on in a segment where all five forces are strong.

- **The five forces framework is a snapshot, not a forecast — and industries evolve.** A force that is weak today may strengthen as technology changes, regulations shift, or new entrants redefine the competitive landscape. The analysis must be repeated periodically, and the strategic position must be re-evaluated against the current force structure. A strategy that was optimal five years ago may be fighting the last war.

- **The output of the five forces analysis is the choice among three generic strategies: cost leadership, differentiation, or focus.** A company that tries to pursue more than one generic strategy simultaneously is "stuck in the middle" and achieves none. Cost leadership requires scale, process efficiency, and tight cost control. Differentiation requires R&D, brand investment, and premium positioning. Focus requires deep domain expertise in a narrow segment. The five forces analysis reveals which strategy is defensible given the industry structure.

## Key information

### Concept breakdown: five forces

| Force | Meaning |
|---|---|
| Intensity of existing competitors | degree of rivalry among peers |
| Supplier bargaining power | how much the upstream can squeeze your price |
| Buyer bargaining power | how much the downstream can squeeze your price |
| Threat of new entrants | height of barriers for new players to enter |
| Threat of substitutes | completely different solutions replacing you |

### Analysis points per force

**Existing competitors**: industry growth rate, fixed-cost structure, degree of differentiation, exit barriers
**Supplier bargaining**: supplier concentration, switching cost, forward-integration threat, input uniqueness
**Buyer bargaining**: buyer concentration, switching cost, backward-integration threat, product importance to the buyer
**New entrants**: economies-of-scale barrier, capital requirement, channel and brand advantage, policy and licensing, switching cost
**Substitutes**: price-performance of alternative solutions, customer switching cost, substitute industry profit margin

### Key parameters: five-forces assessment for the AI BRD generation tool

| Force | Strength | Assessment |
|---|---|---|
| Existing competition | medium | OpenAI / Anthropic / general chatbots can substitute |
| Supplier bargaining | strong | LLM API pricing controlled by a few vendors |
| Buyer bargaining | medium | enterprise customer concentration is medium |
| New entrants | high | a general LLM plus a prompt can enter; low barrier |
| Substitutes | high | manual + Excel, consultancy services |

Conclusion: industry profit margin is squeezed; strategically, differentiation is needed (vertical BRD + multi-language + business knowledge base).

### Comparison with other frameworks

| Framework | Lens | Suits |
|---|---|---|
| Porter's Five Forces | industry structure | strategic positioning |
| SWOT | internal + external | strategy review |
| Business Model Canvas | full business-model picture | description and diagnosis |
| Blue Ocean Strategy | redefine market boundaries | innovation direction |

### Applicable scenarios

- Must-do before evaluating a new business
- Run five forces first during strategy review
- When industry boundaries are clear (fuzzy boundaries distort the analysis)

## Action recommendations

1. **Define the industry boundary**: be clear about "what industry is this"
2. **Assess each force separately**: mark each as strong / medium / weak
3. **Find the strongest and the weakest force**: avoid the strong link when positioning
4. **Project the industry profit margin**: synthesize and judge attractiveness
5. **Formulate the strategy**: cost leadership / differentiation / focus — pick one
6. **Annual review**: the forces three years ago have changed; static analysis is invalid
7. **Pair with Now/Next/Later roadmap**: five forces give strategic choice, the roadmap lands it

## Anti-patterns

- **Listing only competitors and ignoring suppliers, substitutes, buyers, and new entrants.** The framework is called Five Forces, not One Force. A competitive analysis that only maps direct rivals and ignores the threat of substitutes (e.g., Excel replacing a SaaS tool) or the bargaining power of a concentrated supplier base produces a dangerously incomplete picture of industry profitability. All five forces must be assessed for the analysis to be valid.
- **Treating the five-forces analysis as a one-time exercise and never revisiting it.** The forces that shaped an industry three years ago -- supplier concentration, entry barriers, substitute availability -- have almost certainly changed. A static analysis from a past strategy review is worse than no analysis at all because it gives a false sense of understanding. The five-forces assessment must be refreshed annually as part of the strategy review cycle.
- **Running the analysis without defining the industry boundary first.** Porter's framework is meaningless if the analyst cannot answer "what industry is this?" Mixing SaaS tools, consulting services, and internal IT departments into one analysis creates a blur that produces no actionable insight. The industry boundary must be defined with enough specificity that the buyers, suppliers, and substitutes are clearly identifiable.
- **Evaluating the five forces without producing a strategic choice.** A five-forces analysis that concludes with "the industry is moderately attractive" without recommending cost leadership, differentiation, or focus has failed its purpose. The framework exists to drive a decision, not to produce a report. Every analysis must end with an explicit strategic recommendation and the rationale for why that strategy fits the force profile.
- **Using the five-forces framework for industries with rapidly shifting boundaries.** When the industry itself is being redefined -- platforms absorbing adjacent markets, regulations redrawing sector lines, technology collapsing previously separate categories -- the five-forces model breaks down because the "industry" is a moving target. In these cases, blue ocean strategy or scenario planning is a better fit. The five-forces framework assumes a stable industry structure, and applying it to a fluid one produces misleading conclusions.

## Related

- Peer: [business-model-canvas-summary.md](./business-model-canvas.md) — business-model description
- Peer: [blue-ocean-strategy-summary.md](./blue-ocean.md) — redefine market boundaries (anti-Five-Forces)
- Peer: [product-strategy-framework-summary.md](./product-strategy-framework.md) — strategy layers
- Downstream: [now-next-later-roadmap-summary.md](./now-next-later-roadmap.md) — strategy landing
- Downstream: [../industry/competitors/README.md](../industry/competitors/README.md) — competitor benchmarking
- References: Michael Porter — *How Competitive Forces Shape Strategy* (HBR, 1979); *Competitive Strategy* (1980)
