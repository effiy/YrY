---
title: McKinsey AI report summary
aliases:
- mckinsey-ai-report
- mckinsey-state-of-ai
- mckinsey-ai-economic-impact
tags:
- AI
- mckinsey
- economic-impact
- enterprise-adoption
- industry-trends
category: executive/industry/reports
created: 2026-08-07
updated: 2026-08-07
source: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- executive
- tech-lead
- product-manager
benefit: "executives can understand the economic impact of AI, adoption trends, and industry-specific insights from McKinsey's research"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./gartner-ai-hype-cycle.md
- ./a16z-ai-outlook.md
- ../market-trends/ai-market-trend-first-half.md
- ../competitors/llm-vendor-landscape.md
tacit: false
---

# McKinsey AI report summary

> **As an** executive, **I want to** understand the key findings from McKinsey's AI research, **so that** I can align our AI strategy with proven adoption patterns and economic impact projections.

> McKinsey's annual State of AI report provides the most comprehensive data on enterprise AI adoption, economic impact, and industry-specific trends. The 2025-2026 reports highlight a shift from experimentation to production, with GenAI adoption surging but ROI still concentrated in traditional AI use cases.

## Summary

- McKinsey estimates AI could add $13-22 trillion to the global economy by 2030, with GenAI contributing $2.6-4.4 trillion annually.
- Enterprise AI adoption has reached 72% (up from 55% in 2023), but GenAI adoption specifically is 65% (up from 33% in 2023).
- The biggest gap is between adoption and value capture: 65% of organizations use GenAI, but only 15% report meaningful bottom-line impact.
- High-performing AI organizations invest in data infrastructure, MLOps, and talent, not just models. The ROI gap between AI leaders and laggards is widening.
- Industry-specific insights: financial services, technology, and healthcare lead in adoption; manufacturing and construction lag.

## Core viewpoints

### 1. Adoption is surging, but value capture is lagging

The jump from 33% to 65% GenAI adoption in one year is unprecedented for any enterprise technology. However, only 15% of organizations report meaningful bottom-line impact. The adoption-to-value gap is caused by: lack of data readiness, insufficient change management, and deploying GenAI for the wrong use cases (generation vs. classification/prediction where traditional AI is more cost-effective).

### 2. The ROI of GenAI is most concentrated in specific functions

McKinsey identifies four functions where GenAI delivers the most value: customer operations (30% of total potential), marketing and sales (25%), software engineering (20%), and R&D (15%). Within these functions, the value is concentrated in specific use cases: customer self-service, content generation, code generation, and document summarization. Broad "transform everything with AI" initiatives fail; targeted function-specific deployments succeed.

### 3. AI leaders are pulling away from the pack

The top quartile of AI adopters (AI leaders) derive 20%+ of EBIT from AI initiatives. They share three characteristics: (1) they invest in data infrastructure before AI models, (2) they have dedicated MLOps/platform teams, and (3) they reskill rather than replace employees. The gap between leaders and laggards is widening because AI creates compounding advantages: better data leads to better models, which leads to more usage, which generates more data.

### 4. Traditional AI still delivers more ROI than GenAI

Despite the GenAI hype, traditional AI (predictive models, classification, optimization) still accounts for the majority of AI-driven value. GenAI is transformative for content generation and conversational interfaces, but traditional AI is more cost-effective for structured data problems (fraud detection, demand forecasting, pricing optimization). The highest-performing organizations use GenAI and traditional AI together: GenAI for the user interface, traditional AI for the backend analytics.

## Key info

### AI economic impact by function

| Function | Total AI value potential ($T) | GenAI share | Traditional AI share | Top use cases |
|---|---|---|---|---|
| Customer operations | $4.4T | 70% | 30% | Self-service, agent assist, sentiment analysis |
| Marketing and sales | $3.3T | 60% | 40% | Content generation, personalization, lead scoring |
| Software engineering | $2.6T | 50% | 50% | Code generation, testing, documentation |
| R&D | $2.0T | 40% | 60% | Literature review, molecule design, simulation |
| Supply chain | $1.5T | 20% | 80% | Demand forecasting, route optimization, inventory |
| HR | $1.2T | 30% | 70% | Resume screening, onboarding, sentiment analysis |
| Finance | $1.0T | 20% | 80% | Fraud detection, risk modeling, report generation |

### AI adoption by industry

| Industry | AI adoption rate | GenAI adoption rate | Leading use case |
|---|---|---|---|
| Technology | 90% | 80% | Code generation, customer support |
| Financial services | 85% | 70% | Fraud detection, document processing |
| Healthcare | 75% | 55% | Clinical documentation, drug discovery |
| Retail | 70% | 60% | Personalization, inventory management |
| Manufacturing | 55% | 35% | Predictive maintenance, quality inspection |
| Construction | 40% | 20% | Project planning, safety monitoring |

### Characteristics of AI leaders

1. **Data infrastructure first**: AI leaders invest 2x more in data infrastructure (data pipelines, data quality, data governance) than AI laggards.
2. **Dedicated platform teams**: AI leaders have MLOps/platform teams that build reusable infrastructure (model serving, monitoring, feature stores) shared across use cases.
3. **Reskill, don't replace**: AI leaders reskill 60%+ of affected employees; AI laggards replace or downsize. Reskilling leads to higher adoption and better outcomes.
4. **Top-down sponsorship**: AI leaders have C-suite sponsorship (CEO, CDO, or CAIO) with dedicated AI budget, not distributed across departments.
5. **Build vs. buy balance**: AI leaders buy for commodity capabilities (LLM APIs, cloud AI services) and build for differentiating capabilities (fine-tuned models, proprietary data pipelines).

### Key data points (2025-2026)

- Global AI market expected to exceed $1.2T by 2027 (40% CAGR)
- 65% of organizations use GenAI in at least one business function
- 15% of organizations report meaningful bottom-line impact from GenAI
- AI leaders derive 20%+ of EBIT from AI initiatives
- Cost savings from GenAI average 15-25% in targeted functions
- AI talent demand exceeds supply by 3:1 for senior roles
- Organizations with dedicated AI governance report 2x higher ROI

## Action recommendations

1. Focus GenAI investments on the top four value functions: customer operations, marketing/sales, software engineering, and R&D.
2. Invest in data infrastructure before AI models: data quality, data pipelines, and data governance are prerequisites for AI ROI.
3. Build a centralized MLOps/platform team to provide reusable infrastructure across AI use cases; avoid each team building their own stack.
4. Prioritize reskilling for AI-affected employees; reskilled employees drive higher adoption and better AI outcomes.
5. Use traditional AI for structured data problems (forecasting, classification, optimization); use GenAI for content generation and conversational interfaces.
6. Track bottom-line impact, not adoption metrics: "65% adoption" is not a success metric; "15% EBIT improvement" is.

## Anti-patterns

- **GenAI for everything** -- deploying GenAI for structured data problems where traditional AI is more accurate and cost-effective.
- **Adoption as a success metric** -- "we have deployed AI to 10 departments" is meaningless if none of them show measurable impact.
- **No data infrastructure investment** -- deploying AI models on poor-quality data produces poor-quality results. Data infrastructure must come first.
- **Replace instead of reskill** -- replacing employees with AI creates organizational resistance and misses the opportunity to combine human expertise with AI capabilities.
- **No C-suite sponsorship** -- distributed AI initiatives without central coordination result in duplicated effort, incompatible tools, and no shared learning.
- **Copying AI leaders without the foundation** -- AI leaders' success comes from years of data infrastructure investment. Copying their use cases without the foundation will not replicate their results.

## Related

- Same category: [./gartner-ai-hype-cycle.md](./gartner-ai-hype-cycle.md) -- Gartner AI Hype Cycle analysis
- Same category: [./a16z-ai-outlook.md](./a16z-ai-outlook.md) -- a16z AI investment outlook
- Same category: [../market-trends/ai-market-trend-first-half.md](../market-trends/ai-market-trend-first-half.md) -- 2026 H1 market trends
- Upstream: [../competitors/llm-vendor-landscape.md](../competitors/llm-vendor-landscape.md) -- LLM vendor landscape
- Downstream: [../../../ai-engineer/methodology/evaluate-an-llm-app.md](../../../ai-engineer/platform/evaluate-an-llm-app.md) -- LLM evaluation

## References

- McKinsey -- The State of AI (annual report)
- McKinsey -- The Economic Potential of Generative AI (2024)
- McKinsey -- AI Adoption Survey (annual)