---
title: Value Proposition Canvas
aliases:
- Value Proposition Canvas
- VPC
- customer-value-proposition
- jobs-pains-gains
tags:
- strategy
- value-proposition
- customer-development
- product-market-fit
- jobs-to-be-done
category: executive/strategy
created: 2026-08-07
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
benefit: "Products and services are designed around verified customer needs rather than internal assumptions"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./business-model-canvas.md
- ./blue-ocean.md
- ../product-manager/frameworks/jobs-to-be-done.md
- ../product-manager/discovery/ux--README.md
tacit: false
---

# Value Proposition Canvas

> **As a** product manager, **I want to** map customer jobs, pains, and gains to our product's value proposition, **so that** we build features that address verified needs rather than imagined ones.

> The Value Proposition Canvas (VPC) is the zoomed-in detail of the Business Model Canvas's two most important blocks: Customer Segments and Value Propositions. It forces product teams to articulate exactly which customer needs their product addresses and how.

## Summary

- Origin: Alexander Osterwalder et al. (2014), as a companion to the Business Model Canvas
- Core structure: Two sides — Customer Profile (jobs, pains, gains) + Value Map (products, pain relievers, gain creators)
- Fit occurs when the Value Map addresses the Customer Profile's most important jobs, most severe pains, and most desired gains
- Key insight: Products fail more often from lack of customer understanding than from technical failure. The VPC makes customer understanding explicit and testable.
- Best used: During new product development, feature prioritization, and pivot decisions

## Core viewpoints

### 1. Start with the customer profile, not the solution

The most common VPC mistake is starting with the Value Map (what we want to build) and retrofitting the Customer Profile to justify it. Always start with the customer: observe, interview, and validate before designing solutions. The sequence matters — customer profile first, then value map, then fit check.

### 2. Jobs are functional, emotional, and social

Customer jobs are not just functional tasks. Functional jobs are "what they need to get done." Emotional jobs are "how they want to feel." Social jobs are "how they want to be perceived." A B2B SaaS product might address the functional job of "generate a compliance report," the emotional job of "feel confident in an audit," and the social job of "look competent in front of the board."

### 3. Pain severity and gain relevance must be quantified

Not all pains are equal. Not all gains are desired equally. Rank them by severity (for pains) and relevance (for gains). The most severe pain that occurs most frequently is your primary value proposition anchor. A gain that is "nice to have" for 10% of customers is not a product pillar.

### 4. Fit is a hypothesis until validated

Drawing a VPC in a workshop produces hypotheses, not facts. Each job-pain-gain claim must be validated with customer evidence. The VPC is a tool for structuring customer discovery, not replacing it. The canvas should evolve as you learn.

### 5. The VPC nests within the Business Model Canvas

The Value Proposition Canvas is not a standalone strategy tool. It zooms into the Value Propositions ↔ Customer Segments fit within the broader Business Model Canvas. A great value proposition with a broken revenue model, wrong channels, or unsustainable cost structure still fails.

## Key info

### Customer Profile (right side)

| Component | Definition | Example (AI after-sales tool) |
|---|---|---|
| **Customer Jobs** | What customers are trying to get done | Resolve customer complaints, diagnose vehicle issues, generate service reports |
| **Pains** | Negative outcomes, risks, obstacles | Long resolution time, inconsistent diagnosis quality, language barriers in overseas markets |
| **Gains** | Positive outcomes customers want | Faster resolution, higher first-contact resolution rate, multi-language support, audit trail |

### Value Map (left side)

| Component | Definition | Example (AI after-sales tool) |
|---|---|---|
| **Products & Services** | What you offer | AI-powered diagnostic assistant, multilingual knowledge base, automated report generation |
| **Pain Relievers** | How you reduce customer pains | LLM-based diagnosis reduces time, structured knowledge base ensures consistency, real-time translation removes language barriers |
| **Gain Creators** | How you create customer gains | One-click report generation, 24/7 availability, continuous learning from resolved cases |

### Fit check questions

1. Does the Value Map address the customer's most important job?
2. Does the Value Map relieve the customer's most severe pains?
3. Does the Value Map create the customer's most desired gains?
4. Is the fit validated with evidence or still a hypothesis?

## Action recommendations

1. **Run a VPC workshop for each major customer segment**: 2-3 hours, cross-functional (product, design, engineering, sales). Use sticky notes, debate, and rank. Produce a single prioritized canvas per segment.
2. **Validate the top 3 jobs, pains, and gains with 10+ customer interviews**: Before building anything, confirm that the jobs you identified are real, the pains are actually severe, and the gains are actually desired.
3. **Use the VPC as a feature prioritization filter**: Each proposed feature must map to at least one verified pain or gain. Features that don't map to any verified customer need are deprioritized.
4. **Revisit the VPC when pivoting**: If customer feedback or market conditions change, update the canvas. The VPC is a living document, not a one-time artifact.
5. **Pair with JTBD interviews**: The VPC provides the structure; Jobs-to-Be-Done interviews provide the evidence. Use JTBD interview techniques to populate the Customer Profile with real data.

## Anti-patterns

- **Solution-first VPC**: Filling the Value Map before the Customer Profile. This is solution-in-search-of-a-problem.
- **No validation**: Treating workshop output as truth without customer evidence. The canvas is hypotheses, not facts.
- **Generic customer profiles**: "Enterprise customers" or "SMBs" without specificity. Customer profiles must be specific enough that you can name 3-5 real people who match.
- **Ignoring emotional and social jobs**: Only listing functional jobs. B2B buyers have emotional and social needs too — fear of looking bad, desire for recognition, need for career advancement.
- **Feature matching without fit**: Listing every feature as a pain reliever without checking whether it actually relieves a verified pain. Be honest about what your product does and doesn't do.
- **One canvas for everything**: Using one VPC for all customer segments. Different segments have different jobs, pains, and gains. Create one canvas per segment.

## Related

- [Business Model Canvas](./business-model-canvas.md) — Parent framework; VPC zooms into the Value Proposition ↔ Customer Segment fit
- [Blue Ocean Strategy](./blue-ocean.md) — Creating new customer value curves
- [Jobs to Be Done](../../product-manager/frameworks/jobs-to-be-done.md) — Customer interview methodology for populating the VPC
- [Product Strategy Framework](./product-strategy-framework.md) — How VPC feeds into broader product strategy
- [Write a PRD](../../product-manager/discovery/write-a-prd.md) — VPC output flows into PRD requirements