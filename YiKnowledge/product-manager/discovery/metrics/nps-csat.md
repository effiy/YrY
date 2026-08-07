---
title: NPS and CSAT Measurement
aliases:
  - NPS
  - CSAT
  - Net Promoter Score
  - Customer Satisfaction
  - Survey design
tags:
  - metrics
  - nps
  - csat
  - survey
  - customer-experience
  - product-management
category: product-manager/discovery/metrics
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
benefit: PMs can design and interpret NPS and CSAT surveys to measure customer sentiment, identify detractors, and drive product improvements from voice-of-customer data
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - north-star-metric.md
  - retention-and-churn.md
  - aarrr-metrics.md
  - ../../ux/README.md
  - ../../../executive/strategy/README.md
tacit: false
---

# NPS and CSAT Measurement

> **As a** product manager, **I want to** design and interpret NPS and CSAT surveys to measure customer sentiment, **so that** I can identify detractors, track loyalty trends, and drive product improvements from structured voice-of-customer data.

> NPS tells you whether customers would recommend you. CSAT tells you whether a specific interaction was satisfactory. CES tells you whether the interaction was easy. Together, they form a three-lens view of customer sentiment: loyalty, satisfaction, and effort.

## Summary

- NPS (Net Promoter Score) measures customer loyalty with one question: "How likely are you to recommend [product] to a friend or colleague?" (0-10 scale). Promoters (9-10) minus Detractors (0-6) = NPS. Range: -100 to +100.
- CSAT (Customer Satisfaction Score) measures satisfaction with a specific interaction or transaction: "How satisfied were you with [interaction]?" (1-5 scale). Reported as % of satisfied responses (4-5).
- CES (Customer Effort Score) measures the effort required to complete a task: "How easy was it to [complete task]?" (1-7 scale). Lower effort strongly correlates with higher loyalty.
- NPS is a relationship metric (overall brand loyalty); CSAT and CES are transactional metrics (specific interaction quality). They answer different questions and should be used together, not in isolation.
- The survey itself is only 20% of the value. The other 80% is: closing the loop with detractors, analyzing verbatim comments for themes, and taking action on the insights.

## Core viewpoints

- **NPS is a loyalty metric, not a satisfaction metric** -- it measures whether customers would put their reputation on the line to recommend you. A customer can be satisfied (CSAT = 5) but not loyal (NPS = 7). The two metrics measure different dimensions.
- **The score is useless without the "why"** -- an NPS score of 30 tells you nothing about what to improve. The follow-up question ("What is the primary reason for your score?") is the most important part of the survey. Analyze verbatim comments for themes.
- **Detractors are your most valuable data source** -- promoters tell you what you are doing right; detractors tell you what you are doing wrong. Closing the loop with detractors (contacting them, understanding the issue, fixing it) is the highest-ROI action from any survey program.
- **Survey fatigue is real and destructive** -- sending too many surveys, sending surveys at the wrong time, or sending surveys that are too long will reduce response rates and bias results toward extreme opinions. Target 1-3 questions, sent at the right moment, no more than once per quarter for relationship surveys.
- **CSAT and CES are more actionable for PMs than NPS** -- NPS is a strategic metric that changes slowly. CSAT and CES are tactical metrics that change quickly with product changes. For PMs driving feature improvements, CSAT and CES provide faster feedback loops.

## Key information

### NPS methodology

**The question**: "How likely are you to recommend [product/service] to a friend or colleague?" (0-10 scale)

| Score range | Category | Definition |
|---|---|---|
| 9-10 | Promoters | Loyal enthusiasts who will keep buying and refer others |
| 7-8 | Passives | Satisfied but unenthusiastic; vulnerable to competitive offerings |
| 0-6 | Detractors | Unhappy customers who can damage the brand through negative word-of-mouth |

**NPS calculation**: NPS = % Promoters - % Detractors (range: -100 to +100)

**NPS benchmarks by industry** (2023, Satmetrix):
- Software/SaaS: 30-40 (good), 40-70 (excellent)
- E-commerce: 40-50 (good), 50-70 (excellent)
- Financial services: 30-40 (good), 40-60 (excellent)
- Telecommunications: 20-30 (good), 30-50 (excellent)
- Healthcare: 30-40 (good), 40-60 (excellent)

Note: NPS varies significantly by industry and geography. Compare against your industry benchmark, not the absolute number.

### CSAT methodology

**The question**: "How satisfied were you with [specific interaction]?" (1-5 scale)

**CSAT calculation**: CSAT = (Number of 4 and 5 responses / Total responses) x 100

**CSAT benchmarks**:
- 80%+ is generally considered good
- 90%+ is excellent
- Below 70% requires immediate investigation

### CES methodology

**The question**: "How easy was it to [complete specific task]?" (1-7 scale, where 1 = very difficult, 7 = very easy)

**CES calculation**: CES = Average of all responses

**CES benchmark**: 5.0+ is generally considered good (low effort)

### When to use each metric

| Metric | When to use | Survey timing | Question example |
|---|---|---|---|
| NPS | Relationship/strategic check-in | Quarterly, semi-annually, or after key milestones | "How likely are you to recommend our product?" |
| CSAT | After a specific interaction | Immediately after support ticket resolution, purchase, or feature use | "How satisfied were you with your support experience today?" |
| CES | After a specific task | Immediately after task completion | "How easy was it to set up your account?" |

### Survey design best practices

1. **One metric at a time**: NPS + CSAT in the same survey confuses respondents. Separate relationship surveys (NPS) from transactional surveys (CSAT/CES).
2. **Always include the "why"**: Follow the rating question with an open-ended "What is the primary reason for your score?" This is the most valuable data.
3. **Keep it short**: Target 1-3 questions. Response rates drop significantly after 3 questions.
4. **Time it right**: Transactional surveys must be sent immediately after the interaction (within minutes, not days). Relationship surveys should be sent at a predictable cadence (quarterly).
5. **Segment by persona**: NPS varies by user persona. A power user's NPS of 40 is different from a casual user's NPS of 40. Segment and analyze separately.
6. **Track trends, not absolutes**: NPS of 30 one quarter is meaningless. NPS moving from 25 to 30 to 35 over three quarters is a clear positive trend.

### Closing the loop

The most important part of any survey program is what happens after the survey:

**For Detractors (0-6)**:
1. Within 24 hours, a real person contacts the detractor.
2. "Thank you for your feedback. I'd like to understand your experience better."
3. Listen, do not defend. The detractor is giving you a gift.
4. Fix the issue if possible. Follow up when it is fixed.
5. Track: what % of detractors were contacted? What % of issues were resolved?

**For Passives (7-8)**:
1. Analyze the verbatim comments for themes. What is preventing them from becoming promoters?
2. Target the most common theme with a product improvement.

**For Promoters (9-10)**:
1. Thank them. Ask if they would be willing to provide a testimonial or case study.
2. Identify what they love. Protect those features and experiences.

### NPS and CSAT for AI products

AI products introduce specific considerations:

| Consideration | NPS impact | CSAT/CES impact |
|---|---|---|
| Hallucination | Major detractor driver: "it made things up" | Low CSAT on specific interactions where hallucination occurred |
| Latency | Slow response times reduce NPS over time | Low CES: "it took too long" |
| Tool call failures | Erodes trust, creating passives who do not complain | Low CSAT on interactions where the tool failed silently |
| Over-helpfulness | AI that provides too much information creates effort | Low CES: "it gave me too much to read" |
| Tone/Personality | AI that is too formal or too casual alienates segments | CSAT varies by user preference |

### DIY vs. platform

| Approach | Pros | Cons | Best for |
|---|---|---|---|
| DIY (Google Forms, Typeform) | Free, fast to set up, full control | No automation, manual analysis, hard to scale | Small teams, one-off surveys |
| NPS platform (Delighted, SurveyMonkey) | Automated distribution, dashboards, benchmarking | Cost ($50-500/month), less flexibility | Growing teams, ongoing NPS programs |
| Full CX platform (Qualtrics, Medallia) | Advanced analytics, text analysis, closed-loop workflows | High cost ($10K+/year), complex setup | Enterprise, large customer bases |

## Action recommendations

1. Start with NPS (relationship) and CSAT (transactional) as two separate survey programs. Do not combine them.
2. Send NPS surveys quarterly to all active users. Include the "why" follow-up question. Target 20%+ response rate.
3. Send CSAT surveys immediately after key interactions (support ticket resolution, purchase, feature use). Target 10%+ response rate.
4. Close the loop with every detractor within 24 hours. A real person contacts them. Track contact rate and resolution rate.
5. Analyze verbatim comments for themes every quarter. The most common theme is the highest-priority improvement.
6. Segment NPS by user persona, plan tier, and tenure. A high-NPS segment that is growing is a signal to double down.
7. Do not set NPS targets for individual employees or teams. NPS is a company-level metric. Individual targets create gaming.
8. For AI products, add a specific follow-up question: "Did the AI provide accurate information?" This captures hallucination-related dissatisfaction.

## Anti-patterns

- **Obsessing over the score, ignoring the "why"** -- the NPS number is a headline. The verbatim comments are the story. Read every comment.
- **Surveying too often** -- sending weekly NPS surveys. Users will ignore them or give lower scores out of annoyance. Quarterly is the maximum frequency for relationship surveys.
- **Closing the loop only with promoters** -- thanking promoters feels good but does not improve the product. Detractors are the source of improvement. Prioritize detractor outreach.
- **Using NPS for individual performance reviews** -- NPS is a company-level metric influenced by many factors. Holding an individual accountable for NPS is unfair and creates gaming.
- **Comparing NPS across industries** -- "Company X has NPS of 70, so our NPS of 30 is bad." NPS varies by industry. Compare to your industry benchmark, not to Apple or Amazon.
- **No action after the survey** -- collecting feedback and doing nothing with it. Users who take the time to respond and see no change are more likely to become detractors.

## Related

- Same class: [north-star-metric.md](./north-star-metric.md) -- NPS and CSAT are guardrail metrics for the North Star; they ensure growth does not come at the expense of customer satisfaction
- Same class: [retention-and-churn.md](./retention-and-churn.md) -- NPS is a leading indicator of churn; low NPS predicts future churn
- Same class: [aarrr-metrics.md](./aarrr-metrics.md) -- NPS is the primary metric for the Referral stage of AARRR
- Upstream: [../../ux/README.md](../ux/README.md) -- UX research methods that complement NPS/CSAT with qualitative insights
- Upstream: [../../../executive/strategy/README.md](../../../executive/strategy/README.md) -- NPS as a strategic KPI
- References: Fred Reichheld -- *The Ultimate Question 2.0* (NPS); Bain & Company -- *NPS Benchmarks*; Gartner -- *Customer Effort Score Research*; Qualtrics -- *CX Measurement Best Practices*