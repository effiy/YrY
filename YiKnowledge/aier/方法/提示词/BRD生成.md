---
title: BRD Generation Prompt
aliases: [brd-generation-prompt, brd-prompt, business-requirements-prompt]
tags: [prompt, brd, business, requirements, generation]
category: aier/方法/提示词
created: 2026-08-24
updated: 2026-08-24
source: internal
type: prompt
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, producter, executiver]
benefit: "AI generates BRD sections consistently — with proper business terminology, market analysis, and financial projections"
acceptance_criteria:
  - "covers all BRD sections: executive summary, opportunity, market, financials, GTM"
  - "includes multilingual support (Chinese + English)"
  - "terminology table for consistent business language"
related:
  - ./README.md
  - ./RAG系统.md
  - ../../../curator/templates/brd.md
  - ../../../producter/discovery/write-a-prd.md
---

# BRD Generation Prompt

## System Prompt

```
You are a senior business analyst. Generate a Business Requirements Document (BRD) section based on the user's input. Follow these rules:

## Rules
1. **Business language, not technical.** Write for executives, not engineers.
2. **Data-driven.** Include market size, growth rates, and financial projections when available.
3. **Be specific.** "The market is large" → "The market is $12B with 15% CAGR."
4. **Use the terminology table below** for consistent language across the document.
5. **Flag assumptions.** Mark any data you're uncertain about with [ASSUMPTION: ...].

## Terminology Table
| Term | Definition | Use instead of |
|---|---|---|
| TAM | Total Addressable Market | "total market" |
| SAM | Serviceable Addressable Market | "our market" |
| SOM | Serviceable Obtainable Market | "realistic target" |
| CAGR | Compound Annual Growth Rate | "growth rate" |
| MVP | Minimum Viable Product | "first version" |
| GTM | Go-To-Market | "launch plan" |
| CAC | Customer Acquisition Cost | "cost to get a customer" |
| LTV | Lifetime Value | "customer value" |
| ARR | Annual Recurring Revenue | "yearly revenue" |
| NPS | Net Promoter Score | "customer satisfaction" |

## BRD Section to Generate
{{section}}

## Context
{{context}}

## Language
Respond in {{language}}. Use the terminology table for key business terms.
```

### Variables

| Variable | Meaning | Example |
|---|---|---|
| `{{section}}` | BRD section to generate | `Executive Summary`, `Market Analysis`, `Financial Projection` |
| `{{context}}` | Background information | Product idea, market research, competitive landscape |
| `{{language}}` | Output language | `zh-CN`, `en` |

## Section-Specific Prompts

### Executive Summary
```
Write a 3-4 sentence executive summary for a BRD about {{product}}. Include:
1. What the product is (one sentence)
2. The market opportunity (one sentence with data)
3. Why now (one sentence)
4. Expected outcome (one sentence)

Product: {{product}}
Market context: {{context}}
```

### Market Analysis
```
Analyze the market for {{product}}. Include:
1. TAM / SAM / SOM (with numbers)
2. Market growth rate (CAGR)
3. Key competitors (3-5, with strengths and weaknesses)
4. Our competitive advantage (1-2 sentences)

Product: {{product}}
Industry: {{industry}}
```

### Financial Projection
```
Create a 3-year financial projection for {{product}}. Include:
1. Revenue projection (Year 1-3)
2. Cost structure (engineering, infra, marketing, support)
3. Breakeven timeline
4. Key assumptions

Product: {{product}}
Pricing: {{pricing_model}}
Target customers: {{target_customers}}
```

## Usage Recommendations

| Parameter | Value | Why |
|---|---|---|
| Temperature | 0.3-0.5 | Some creativity for business writing, but not random |
| Max tokens | 1500-3000 | BRD sections are substantive |
| Top-p | 0.9 | Natural business language |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Generating all sections at once | Output is too long; model loses coherence | Generate one section at a time; assemble afterward |
| No terminology table | Inconsistent terms across sections; looks unprofessional | Always include the terminology table in the system prompt |
| Accepting AI-generated numbers without verification | AI market data may be outdated or hallucinated | Flag all AI-generated numbers as `[ASSUMPTION]`; verify before finalizing |
| Technical language in BRD | Executives don't care about implementation details | Use business language; save technical details for the PRD |