# plan-metrics — North-star metric catalog

> A curated catalog of north-star metrics organized by project
> type. The 90d themes and long-term bets in a plan each need a
> single north-star metric — the one number that proves the work
> mattered. This catalog gives the user a starting point so they
> don't default to "lines of code" or "commits per week".

## How to use

1. Identify the project type from the list below.
2. Pick one metric per 90d theme and one per long-term bet.
3. Make sure the metric is measurable from data the project
   already produces (logs, db, analytics) — if it requires new
   instrumentation, add that as a 30d work item first.
4. Avoid vanity metrics (registered users, page views) unless
   they directly tie to the bet's hypothesis.

## Project types

### SaaS / B2B subscription

| Metric | What it measures | When to use |
|--------|-----------------|-------------|
| Monthly recurring revenue (MRR) | Revenue recognized through the service | Always — the default north star |
| Net revenue retention | Expansion + contraction + churn | When expansion motion is part of the 90d thrust |
| Feature adoption rate | % of accounts using a shipped feature | When the 90d theme is a specific feature launch |
| Time-to-value | Hours from signup to first meaningful action | When the 30d thrust is onboarding friction |
| Trial-to-paid conversion | % of trials that convert | When the 90d thrust is sales-cycle compression |

### Infrastructure / platform

| Metric | What it measures | When to use |
|--------|-----------------|-------------|
| p99 latency | Tail latency for the critical path | Always for reliability themes |
| Error rate | Requests returning 5xx / total requests | Always for reliability themes |
| Uptime | % of time the service is healthy | When the SLA is the contract |
| Deploy frequency | Deploys per week | When the 90d thrust is delivery velocity |
| MTTR | Mean time to recovery from incident | When the 90d thrust is incident response |
| Cost per request | Infra cost / request count | When the 90d thrust is efficiency |

### Consumer / end-user

| Metric | What it measures | When to use |
|--------|-----------------|-------------|
| Day-7 retention | % of users active on day 7 after signup | Always — the default north star |
| DAU / MAU ratio | Stickiness | When the 90d thrust is engagement |
| Session duration | Median minutes per session | When the feature is content-consuming |
| Conversion funnel step rate | % completing a specific funnel step | When the 90d theme is a specific funnel |
| NPS | Net promoter score | When the 90d thrust is satisfaction (lagging indicator) |

### Marketplace / two-sided

| Metric | What it measures | When to use |
|--------|-----------------|-------------|
| Liquidity (match rate) | % of listings that find a match within N hours | Always — the marketplace health metric |
| GMV | Gross merchandise value | When the 90d thrust is supply growth |
| Take rate | Platform revenue / GMV | When the 90d thrust is monetization |
| Supply demand balance | Ratio of active supply to active demand | When the 90d thrust is balancing |
| Time-to-first-match | Median minutes from listing to first match | When the 30d thrust is onboarding friction |

### Developer platform / API

| Metric | What it measures | When to use |
|--------|-----------------|-------------|
| API calls per day | Volume | When the 90d thrust is scale |
| % of users hitting 4xx errors | Integration quality | When the 90d thrust is developer experience |
| Time-to-first-call | Minutes from signup to first successful API call | When the 30d thrust is onboarding |
| Retention by SDK version | % still active 30d after adopting a version | When the 90d thrust is SDK adoption |
| Webhook delivery success rate | % of webhooks delivered within SLA | When the product exposes webhooks |

### Internal tooling

| Metric | What it measures | When to use |
|--------|-----------------|-------------|
| Weekly active users (internal) | Employees using the tool | Always — adoption is the story |
| Time saved per task | Median minutes saved vs the old flow | When the 90d thrust is a workflow replacement |
| Error rate in user flows | % of sessions that hit an error | When the 30d thrust is reliability |
| Ticket deflection | Reduction in support tickets to the owning team | When the 90d thrust is self-service |

## Anti-metrics (do NOT use as north stars)

| Metric | Why not |
|--------|---------|
| Lines of code | Measures volume, not value |
| Commit count | Measures activity, not outcome |
| Story points shipped | Measures estimation, not impact |
| Registered users | Vanity — active users is the real signal |
| PRs merged | Measures process, not result |
| Test count | Measures coverage quantity, not coverage quality |

## Picking a metric when stuck

1. State the bet's hypothesis: "We believe that <doing X> will
   result in <measurable change>."
2. The measurable change is the metric.
3. If you can't state the hypothesis, the bet isn't ready — go
   back to the long-term tier.
4. If the metric requires new instrumentation, add a 30d work
   item to ship the instrumentation first. A metric you can't
   measure is fiction.

## Metric hygiene

- **One metric per theme / bet.** Not three. If you need three,
  the theme is too broad — split it.
- **Absolute or rate, never both.** Pick one form and stick to
  it across the plan so comparisons are possible.
- **Baseline + target.** Every north-star metric should have a
  current baseline (from the report mode data) and a target
  (the 90d exit criterion). A metric without a target is just a
  number.
- **Review cadence.** Long-term bets should specify "reviewed
  quarterly" in their DoD. A metric that isn't reviewed drifts.
