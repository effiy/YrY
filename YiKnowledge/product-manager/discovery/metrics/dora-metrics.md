---
title: DORA Metrics for Engineering Teams
aliases:
  - DORA metrics
  - DevOps metrics
  - Engineering productivity metrics
  - Deployment frequency
  - Lead time for changes
tags:
  - metrics
  - engineering
  - devops
  - dora
  - delivery
  - productivity
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
  - tech-lead
  - engineer
benefit: PMs can measure and improve engineering delivery performance using the industry-standard DORA metrics, enabling data-driven conversations about velocity and quality
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - north-star-metric.md
  - retention-and-churn.md
  - ../../../engineer/process/engineering-productivity-metrics.md
  - ../../delivery/run-a-sprint.md
tacit: false
---

# DORA Metrics for Engineering Teams

> **As a** product manager, **I want to** understand and apply DORA metrics to measure engineering delivery performance, **so that** I can have data-driven conversations about velocity, quality, and trade-offs with the engineering team.

> DORA (DevOps Research and Assessment) metrics are the industry standard for measuring software delivery performance. They are not about individual productivity; they are about system-level throughput and stability. The goal is not to maximize each metric but to balance speed and stability.

## Summary

- DORA metrics were developed by the DevOps Research and Assessment team (acquired by Google Cloud in 2018) based on six years of research across 32,000+ engineering professionals. The four key metrics: Deployment Frequency, Lead Time for Changes, Mean Time to Restore (MTTR), and Change Failure Rate.
- Teams are classified into four performance tiers: Elite, High, Medium, and Low. The 2023 benchmarks show Elite teams deploy on-demand (multiple times per day), have lead times under one day, restore service in under one hour, and have change failure rates below 5%.
- The four metrics are pairwise: Deployment Frequency and Lead Time for Changes measure throughput; MTTR and Change Failure Rate measure stability. Elite teams achieve both high throughput and high stability -- they are not trade-offs.
- DORA metrics are system-level, not individual-level. They measure the performance of the delivery pipeline, not the performance of individual engineers. Using DORA metrics for individual performance evaluation is a misuse.
- The metrics are most useful when tracked over time (trends) rather than as absolute numbers. A team improving from Low to Medium in six months is succeeding, even if they are not yet Elite.

## Core viewpoints

- **Speed and stability are not trade-offs** -- the DORA research shows that Elite teams are both faster (throughput) and more stable (reliability) than Low teams. High-performing teams do not sacrifice stability for speed; they achieve both through better practices.
- **DORA metrics are system metrics, not people metrics** -- they measure the performance of the CI/CD pipeline, deployment process, and incident response system. They should never be used for individual performance reviews. Doing so creates perverse incentives (e.g., avoiding deployments to protect the change failure rate).
- **The absolute number matters less than the trend** -- a team moving from deploying once a month to once a week is a significant improvement, even if the Elite benchmark is multiple times per day. Celebrate the trajectory, not the absolute tier.
- **Deployment frequency is the leading indicator** -- teams that deploy more frequently tend to have shorter lead times, lower MTTR, and lower change failure rates. Smaller, more frequent deployments reduce risk. If you can only improve one metric, focus on deployment frequency.
- **DORA metrics are useless without context** -- a team with low deployment frequency because they work on a monolith with a quarterly release cycle is not "low performing" if that is the appropriate release cadence for their product. Context matters.

## Key information

### The four key metrics

| Metric | Definition | How to measure | Elite benchmark (2023) |
|---|---|---|---|
| Deployment Frequency | How often code is deployed to production or released to end users | Count deployments per day/week/month | On-demand (multiple deploys per day) |
| Lead Time for Changes | The time from code committed to code successfully running in production | Timestamp of commit -> timestamp of deploy | Less than one day |
| Mean Time to Restore (MTTR) | The time to restore service after an incident or failure | Timestamp of incident start -> timestamp of resolution | Less than one hour |
| Change Failure Rate | The percentage of deployments that cause a failure in production | (Deployments causing failure / total deployments) x 100 | 0-5% |

### Performance tiers (2023 benchmarks)

| Tier | Deployment Frequency | Lead Time for Changes | MTTR | Change Failure Rate |
|---|---|---|---|---|
| Elite | On-demand (multiple per day) | < 1 day | < 1 hour | 0-5% |
| High | Between once per day and once per week | 1 day - 1 week | < 1 day | 5-10% |
| Medium | Between once per week and once per month | 1 week - 1 month | 1 day - 1 week | 10-15% |
| Low | Between once per month and once per 6 months | 1 month - 6 months | 1 week - 1 month | 15-30% |

### The fifth metric: Reliability (added in 2023)

In addition to the four core metrics, DORA research now emphasizes reliability as a holistic construct that includes:
- Availability: uptime as a percentage (target 99.9%+)
- Latency: P95 response time for critical user journeys
- Throughput: requests per second the system can handle
- Saturation: resource utilization as a percentage of capacity

### How PMs should use DORA metrics

| PM activity | DORA metric used | How to use it |
|---|---|---|
| Sprint planning | Deployment Frequency + Lead Time | How much work can reasonably be committed based on historical throughput? |
| Quarterly planning | Deployment Frequency trend | Is the team's delivery velocity improving, stable, or declining? |
| Incident post-mortem | MTTR + Change Failure Rate | How quickly did the team recover? What can be done to reduce MTTR next time? |
| Trade-off discussions | All four metrics | If we ask for more features (throughput), are we seeing reduced stability? |
| Stakeholder communication | Performance tier | "Our team is at the High tier and improving toward Elite" is a data-driven way to communicate delivery capability |

### Capabilities that drive DORA metric improvement

DORA research identifies technical and cultural capabilities that correlate with higher performance:

| Capability | Impact on metrics | PM role |
|---|---|---|
| Continuous integration | Higher deployment frequency, lower change failure rate | Protect CI time; do not pressure the team to skip CI |
| Continuous delivery | Shorter lead time, higher deployment frequency | Prioritize CD pipeline improvements as product work |
| Loosely coupled architecture | Higher deployment frequency, lower MTTR | Support architectural investments that reduce coupling |
| Monitoring and observability | Lower MTTR, lower change failure rate | Fund observability as a feature, not overhead |
| Trunk-based development | Shorter lead time, higher deployment frequency | Support the team's branching strategy decisions |
| Westrum generative culture | All metrics improve | Foster psychological safety; blame-free post-mortems |
| Continuous testing | Lower change failure rate | Protect QA time; do not pressure to skip testing |

### When DORA metrics are appropriate vs. inappropriate

**DORA metrics are appropriate when:**
- The team practices continuous delivery or is moving toward it
- The product is a software service with regular deployments
- The team wants to have a data-driven conversation about delivery performance
- The metrics are used at the team level, not the individual level

**DORA metrics are inappropriate when:**
- The product is not a software service (e.g., firmware, embedded systems, hardware)
- The team uses a waterfall or quarterly release model (DORA metrics assume CD practices)
- The metrics are used for individual performance evaluation
- The team has fewer than 5 engineers (the metrics are too noisy at small scale)

## Action recommendations

1. Start by measuring the four DORA metrics for your team. Use the deployment tool (GitHub, GitLab, Jenkins) to extract deployment frequency, lead time, and change failure rate. Use the incident management tool for MTTR.
2. Determine the team's current performance tier using the 2023 benchmarks. Share the result with the team as a baseline, not a judgment.
3. Identify the metric with the most room for improvement. If the team deploys once a month, focus on deployment frequency first. If the change failure rate is 20%, focus on testing and CI first.
4. Invest in the capabilities that drive the targeted metric. For deployment frequency: CI/CD pipeline, loosely coupled architecture. For lower change failure rate: automated testing, code review.
5. Track the trend over four quarters. The goal is improvement, not hitting Elite. Celebrate moving from Low to Medium.
6. Never use DORA metrics for individual performance evaluation. If individual engineers are being compared on deployment frequency, the metrics will be gamed (trivial deploys, avoiding risky changes).
7. Pair DORA metrics with product metrics (North Star, AARRR) to ensure that delivery speed is translating into user value.

## Anti-patterns

- **Using DORA metrics for individual performance reviews** -- the most dangerous misuse. DORA metrics measure the system, not the individual. Using them for performance reviews creates perverse incentives and destroys psychological safety.
- **Comparing teams on DORA metrics without context** -- a team maintaining a legacy monolith with regulatory constraints will have different DORA metrics than a team building a new microservice. Context is everything.
- **Maximizing deployment frequency at the expense of change failure rate** -- deploying broken code faster is not improvement. The metrics must be balanced. Track all four, not just the one that looks good.
- **DORA as a vanity metric** -- "we are Elite" without any action to sustain or improve. The tier is a trailing indicator; the capabilities are the leading indicators. Invest in capabilities, not the score.
- **Ignoring the cultural capabilities** -- DORA is not just about tools and processes. Generative culture (psychological safety, blameless post-mortems) is one of the strongest predictors of performance.

## Related

- Same class: [north-star-metric.md](./north-star-metric.md) -- product North Star vs. engineering DORA; both are system-level metrics
- Same class: [retention-and-churn.md](./retention-and-churn.md) -- retention metrics for the product side
- Cross-reference: [../../../engineer/process/engineering-productivity-metrics.md](../../../engineer/process/engineering-productivity-metrics.md) -- engineering productivity metrics from the engineering perspective
- Cross-reference: [../../delivery/run-a-sprint.md](../../delivery/run-a-sprint.md) -- sprint execution and DORA metrics relationship
- References: DORA -- *State of DevOps Report* (annual, 2014-2023); Google Cloud -- *DORA Metrics Documentation*; Nicole Forsgren, Jez Humble, Gene Kim -- *Accelerate: The Science of Lean Software and DevOps* (2018)