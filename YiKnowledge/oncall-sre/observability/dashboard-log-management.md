---
title: log management and analytics dashboard
aliases:
- log health dashboard
- log operations dashboard
- structured logging dashboard
- log quality dashboard
tags:
- dashboard
- logging
- log-management
- observability
- structured-logging
- log-retention
- log-indexing
- log-analytics
category: oncall-sre/observability
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: weekly
roles:
- oncall-sre
- engineer
- tech-lead
benefit: log management health, quality, and cost efficiency visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- log volume, retention, indexing, structured logging, log quality, and cost efficiency defined
related:
- ./dashboard-system-health.md
- ./dashboard-observability-coverage.md
- ./dashboard-alert-tuning.md
- ./dashboard-cost-and-resource.md
- ../../engineer/quality-security/dashboard-quality-metrics.md
tacit: false
---

# log management and analytics dashboard

> **As an** SRE, **I want to** track log management health and quality, **so that** every log line is structured, searchable, and actionable, retention is cost-efficient, indexing is performant, and logs serve as a reliable debugging tool — not a write-only firehose of unstructured text.

> Logs are the most underutilized observability signal. This dashboard tracks log volume, retention compliance, indexing health, structured logging adoption, log quality, and cost efficiency — turning log management from a "collect everything, search nothing" sinkhole into a precise, cost-optimized, queryable forensic system.

## Summary

- 6 log management dimensions: log volume, retention compliance, indexing health, structured logging adoption, log quality, cost efficiency
- 42 services emitting logs; 8.2 TB/day log volume; 3.0 PB/year stored; 1,850 log sources (services, infrastructure, CDN, security)
- Log volume: 8.2 TB/day (342 GB/hr); 95th percentile ingestion lag: 2.8 seconds; 12% month-over-month volume growth
- Retention: 85% of logs within retention policy (30 days hot, 90 days warm, 365 days cold); 15% retention violations (over-retained or under-retained)
- Indexing: 92% of log fields indexed; 8% unindexed (raw text search only); average query time: 1.8s (target < 1s); 12% of queries timeout
- Structured logging: 68% of services emit structured JSON; 22% emit semi-structured (key=value); 10% emit unstructured plain text; 5 services still log to local files
- Cost: $142K/month log infrastructure (Elastic $82K, S3 $35K, ingestion pipeline $25K); $0.58/GB effective cost (target < $0.40/GB)
- Dashboard reviewed weekly; log quality audit monthly with SRE and service owners

## Core viewpoints

- Logs are a liability until they're searched — storing terabytes of logs that nobody queries is worse than not storing them; unqueried logs are dead weight that cost money, disk, and indexing capacity
- Structured logging is not optional — grep is not a log analysis tool; if your logs aren't structured JSON, they're not logs — they're text files that happen to have timestamps
- Retention is a cost-quality tradeoff — the longer you keep logs, the more you pay; but the one time you need a 6-month-old log, it's priceless; tiered retention (hot/warm/cold) is the only way to balance both
- Log quality decays over time — new services log well; old services log whatever they logged 3 years ago; log quality is a garden, not a fire-and-forget configuration

## Key information

### 6-panel log management overview

```
┌──────────────────────────────────────────────────────────────────┐
│  LOG VOLUME                         │  RETENTION COMPLIANCE               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Daily volume: 8.2 TB    │   │  │  Hot (30d): 85% compliant│   │
│  │  Hourly rate: 342 GB/hr  │   │  │  Warm (90d): 78% comply  │   │
│  │  Peak rate: 580 GB/hr    │   │  │  Cold (365d): 72% comply │   │
│  │  MoM growth: +12%        │   │  │  Retention violations:15%│   │
│  │  Log lines/sec: 1.2M     │   │  │  Over-retained: 8%        │   │
│  │  Ingestion lag: 2.8s     │   │  │  Under-retained: 7%       │   │
│  │  Volume score: B (78)    │   │  │  Retention score: B- (72) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INDEXING HEALTH                    │  STRUCTURED LOGGING                 │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Fields indexed: 92%     │   │  │  Structured JSON: 68%     │   │
│  │  Unindexed (raw): 8%     │   │  │  Semi-structured: 22%     │   │
│  │  Avg query time: 1.8s    │   │  │  Unstructured text: 10%   │   │
│  │  Query timeout rate: 12% │   │  │  Local file logging: 5 svc│   │
│  │  Index size: 42 TB       │   │  │  OpenTelemetry: 45%       │   │
│  │  Shard health: 95% green │   │  │  Correlation IDs: 72%     │   │
│  │  Indexing score: B (75)  │   │  │  Structure score: C+ (68) │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  LOG QUALITY                        │  COST EFFICIENCY                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Quality score: 72/100   │   │  │  Monthly cost: $142K     │   │
│  │  Missing timestamp: 2.5% │   │  │  Elastic: $82K (58%)     │   │
│  │  Missing level: 8%       │   │  │  S3 cold: $35K (25%)     │   │
│  │  Missing service: 5%     │   │  │  Ingestion: $25K (17%)   │   │
│  │  Missing trace ID: 38%   │   │  │  Cost/GB: $0.58           │   │
│  │  Excessive verbosity: 22%│   │  │  Waste (unqueried): 35%   │   │
│  │  PII in logs: 0.8%       │   │  │  Efficiency score: C (65)│   │
│  │  Quality score: B- (72)  │   │  │  Overall: B- (72)         │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Log volume by service

| Service | Daily volume | Log lines/sec | % of total | MoM growth | Peak multiplier | Ingestion lag | Trend |
|---|---|---|---|---|---|---|---|
| **API Gateway** | 1.85 TB | 285K | 22.6% | +8% | 2.5× | 1.2s | ↑ |
| **YiVad** | 1.25 TB | 192K | 15.2% | +15% | 3.2× | 2.5s | ↑ |
| **YiAi** | 980 GB | 150K | 11.9% | +18% | 2.8× | 3.0s | ↑ |
| **YiWeb** | 850 GB | 130K | 10.4% | +5% | 2.0× | 1.8s | → |
| **Database (primary)** | 620 GB | 95K | 7.6% | +10% | 1.5× | 0.8s | → |
| **Auth service** | 480 GB | 74K | 5.9% | +8% | 1.8× | 1.5s | → |
| **Message queue** | 420 GB | 65K | 5.1% | +12% | 2.2× | 1.0s | ↑ |
| **CDN** | 380 GB | 58K | 4.6% | +6% | 3.5× | 4.5s | → |
| **Kubernetes (system)** | 350 GB | 54K | 4.3% | +20% | 1.3× | 0.5s | ↑ |
| **Other (33 services)** | 1.05 TB | 162K | 12.8% | +8% | 2.0× | 2.5s | → |
| **Total** | **8.2 TB** | **1.26M** | | **+12%** | | **2.8s avg** | |

### Log volume by severity level

| Level | Volume % | Lines/day | Growth rate | Storage cost | Hot retention | Query frequency |
|---|---|---|---|---|---|---|
| **ERROR** | 2.5% | 205 GB | +8% | $355/mo | 30 days | High (daily) |
| **WARN** | 8.2% | 672 GB | +12% | $1,165/mo | 30 days | High (daily) |
| **INFO** | 52% | 4.26 TB | +15% | $7,390/mo | 30 days | Medium (weekly) |
| **DEBUG** | 32% | 2.62 TB | +18% | $4,550/mo | 14 days | Low (monthly) |
| **TRACE** | 5.3% | 435 GB | +22% | $755/mo | 7 days | Very low (rarely) |

### Retention compliance

| Log tier | Target retention | Actual compliance | Over-retained | Under-retained | Cost impact | Services out of compliance |
|---|---|---|---|---|---|---|
| **Hot** (Elastic) | 30 days | 85% | 10% (retained > 30d) | 5% (deleted < 30d) | +$12K/mo waste | 8 services |
| **Warm** (Elastic cold) | 90 days | 78% | 12% (retained > 90d) | 10% (deleted < 90d) | +$8K/mo waste | 12 services |
| **Cold** (S3 Glacier) | 365 days | 72% | 15% (retained > 365d) | 13% (deleted < 365d) | +$5K/mo waste | 15 services |
| **Archive** (S3 Deep) | 7 years | 58% | 28% (not archived) | 14% (premature delete) | +$3K/mo waste | 18 services |

### Top log volume offenders (excessive verbosity)

| Service | Daily volume | Excessive % | Root cause | Action | Potential savings |
|---|---|---|---|---|---|
| **API Gateway** | 1.85 TB | 28% (518 GB) | DEBUG-level request/response body logging in production | Suppress body logging for non-error responses | $9.5K/mo |
| **YiVad** | 1.25 TB | 22% (275 GB) | WebSocket frame logging at DEBUG, every message | Log only connection events, not frames | $7.2K/mo |
| **YiAi** | 980 GB | 35% (343 GB) | Full prompt + response logging at INFO for every LLM call | Sample 10% of non-error calls, log tokens not content | $10.5K/mo |
| **Kubernetes** | 350 GB | 18% (63 GB) | Kubelet heartbeats at DEBUG, pod status every 5s | Increase interval to 30s, suppress heartbeats | $2.8K/mo |
| **CDN** | 380 GB | 25% (95 GB) | Full cache-hit debug logs for every request | Drop DEBUG for cache hits, log only misses | $4.2K/mo |
| **Database** | 620 GB | 12% (74 GB) | Slow query log at 100ms threshold (too aggressive) | Raise to 500ms, log only query plans for > 1s | $3.5K/mo |

### Structured logging adoption

| Service group | Services | JSON structured | Semi-structured | Unstructured text | Local file only | OTel SDK | Correlation IDs |
|---|---|---|---|---|---|---|---|
| **YiVad + YiAi** | 12 | 10 (83%) | 2 (17%) | 0 | 0 | 8 (67%) | 11 (92%) |
| **YiWeb** | 5 | 3 (60%) | 1 (20%) | 1 (20%) | 0 | 3 (60%) | 4 (80%) |
| **YiPet** | 4 | 2 (50%) | 1 (25%) | 1 (25%) | 1 | 2 (50%) | 2 (50%) |
| **Infrastructure** | 8 | 6 (75%) | 2 (25%) | 0 | 0 | 5 (63%) | 6 (75%) |
| **Data platform** | 5 | 4 (80%) | 1 (20%) | 0 | 0 | 3 (60%) | 4 (80%) |
| **Legacy/internal** | 8 | 3 (38%) | 2 (25%) | 3 (38%) | 4 | 1 (13%) | 3 (38%) |
| **Overall** | **42** | **28 (68%)** | **9 (22%)** | **4 (10%)** | **5** | **22 (52%)** | **30 (72%)** |

### Required log fields compliance

| Field | Services compliant | Missing | Compliance rate | Target | Criticality |
|---|---|---|---|---|---|
| **timestamp** (RFC 3339) | 41/42 | 1 | 97.5% | 100% | Critical |
| **level** (ERROR/WARN/INFO/DEBUG/TRACE) | 38/42 | 4 | 92% | 100% | Critical |
| **service** (service name) | 40/42 | 2 | 95% | 100% | Critical |
| **message** (human-readable) | 42/42 | 0 | 100% | 100% | Critical |
| **trace_id** (distributed tracing) | 26/42 | 16 | 62% | 95% | High |
| **span_id** | 24/42 | 18 | 57% | 90% | High |
| **correlation_id** (request-level) | 30/42 | 12 | 72% | 90% | High |
| **user_id** (anonymized) | 22/42 | 20 | 52% | 80% | Medium |
| **error.stack** (for ERROR) | 32/42 | 10 | 76% | 95% | High |
| **duration_ms** | 18/42 | 24 | 43% | 80% | Medium |
| **http.method / http.url** | 28/42 | 14 | 67% | 90% | Medium |

### Log quality scorecard

| Quality dimension | Score | Weight | Findings | Action |
|---|---|---|---|---|
| **Field completeness** | 72/100 | 25% | 8% missing level, 5% missing service, 38% missing trace_id | Enforce required fields in log emission |
| **Structure consistency** | 68/100 | 20% | 22% semi-structured, 10% unstructured, 5 services local-only | Migrate to OTel SDK, structured JSON only |
| **Signal-to-noise** | 65/100 | 20% | 22% excessive verbosity, 32% DEBUG in production | Implement log sampling, suppress DEBUG in prod |
| **Searchability** | 75/100 | 15% | 8% unindexed fields, 12% query timeout | Add index templates, optimize shard count |
| **PII safety** | 82/100 | 10% | 0.8% of log lines contain PII (email, IP, token) | Implement PII redaction pipeline |
| **Traceability** | 62/100 | 10% | 38% missing trace_id, 43% missing duration_ms | Require trace context in all service logs |
| **Overall** | **72/100** | | | **B- (72)** |

### PII/PCI in logs — last 30 days

| PII type | Occurrences | Services affected | % of log lines | Risk | Action |
|---|---|---|---|---|---|
| **Email addresses** | 12,500 | 8 | 0.35% | High | Add email redaction rule |
| **IP addresses** (user) | 8,200 | 12 | 0.22% | Medium | Anonymize last octet |
| **Session tokens** | 3,800 | 3 | 0.10% | Critical | Redact immediately, rotate all tokens |
| **Credit card (last 4)** | 450 | 2 | 0.01% | Critical | Never log — fix payment service |
| **Phone numbers** | 1,200 | 5 | 0.03% | Medium | Redact or hash |
| **Passport/ID numbers** | 85 | 1 | 0.002% | Critical | Never log — fix identity service |
| **Total PII lines** | **28,500** | | **0.8%** | | |

### Indexing performance

| Index metric | Current | 3 months ago | Target | Notes |
|---|---|---|---|---|
| **Fields indexed** | 92% | 88% | 98% | 8% of fields only searchable via raw text scan |
| **Index refresh interval** | 5s | 10s | 1s | Near-real-time for critical indices |
| **Average query time** | 1.8s | 2.5s | < 1.0s | 28% improvement from shard optimization |
| **P95 query time** | 5.2s | 8.5s | < 2.0s | Long-tail queries still problematic |
| **Query timeout rate** | 12% | 18% | < 5% | Default 30s timeout, needs index tuning |
| **Shard count** | 1,250 | 1,450 | 800-1,000 | 200 shards over-provisioned, merged |
| **Shard health** | 95% green, 4% yellow, 1% red | 88% green | 100% green | 12 unassigned shards, 3 red |
| **Index rollover** | Daily | Daily | Daily | Managed by ILM policy |
| **Overall indexing** | **B (75)** | **C+ (68)** | **B+ (85)** | |

### Cost breakdown

| Cost category | Monthly | % of total | $/GB | Optimization potential | Action |
|---|---|---|---|---|---|
| **Elasticsearch (hot)** | $58K | 41% | $0.82 | -$15K (30%) | Right-size instances, reduce replicas |
| **Elasticsearch (warm)** | $24K | 17% | $0.35 | -$5K (20%) | Archive sooner, use frozen tier |
| **S3 (cold storage)** | $22K | 15% | $0.05 | -$3K (15%) | Lifecycle policies, Glacier Deep |
| **S3 (archive)** | $13K | 9% | $0.02 | -$2K (15%) | Deduplicate, compress |
| **Ingestion pipeline** | $18K | 13% | $0.10 | -$4K (22%) | Batch processing, sampling |
| **Data transfer** | $7K | 5% | $0.04 | -$2K (30%) | Cross-AZ optimization |
| **Total** | **$142K** | | **$0.58/GB** | **-$31K (22%)** | Target $0.40/GB |

### Log waste analysis

| Waste category | Volume | Monthly cost | % of total spend | Action |
|---|---|---|---|---|
| **Unqueried logs** (never searched) | 2.87 TB/day | $49.5K | 35% | Sample or drop, extend retention only if queried |
| **Duplicate logs** (service + sidecar) | 420 GB/day | $7.2K | 5% | Deduplicate at ingestion |
| **Over-retained** (beyond policy) | 280 GB/day | $4.8K | 3.4% | Enforce ILM policies |
| **DEBUG in production** | 2.62 TB/day | $45.2K | 32% | Suppress DEBUG, log only on demand |
| **Excessive fields** (never used) | 520 GB/day | $8.9K | 6.3% | Strip unused fields at ingestion |
| **Total waste** | | **$115.6K** | **81.7%** | |

## Action recommendations

1. **DEBUG log suppression**: 32% of log volume is DEBUG in production; implement dynamic log level (default INFO), suppress DEBUG across all production services; target 50% reduction in DEBUG volume
2. **PII redaction pipeline**: 0.8% of logs contain PII (28,500 lines/month); implement automated PII redaction at ingestion, fix payment and identity services to never log sensitive data
3. **Unstructured log migration**: 10% of services still emit unstructured text, 5 services log to local files; migrate all to OpenTelemetry SDK with structured JSON, target 95% structured by Q4 2026
4. **Log waste reduction**: 81.7% of log spend is waste ($116K/mo); drop unqueried logs, deduplicate, suppress DEBUG, strip unused fields; target $85K/mo spend ($0.35/GB)
5. **Retention compliance enforcement**: 15% retention violations; implement automated ILM policy enforcement, auto-delete over-retained, protect under-retained
6. **Trace ID coverage**: 38% missing trace_id; mandate trace context propagation in all service logs, integrate with distributed tracing, target 95% coverage
7. **Query performance optimization**: 12% timeout rate, 1.8s avg query; optimize index mappings, reduce shard count, add curated index patterns, target < 1s avg
8. **Correlation ID standardization**: 72% coverage, 28% missing; enforce correlation ID propagation across all service boundaries, add to log emission standard
9. **Log volume growth management**: 12% MoM growth is unsustainable; implement log sampling for high-volume services, rate-limit per-service log emission
10. **Weekly log quality review**: review log volume, retention, indexing, structured logging adoption, PII findings, and cost with SRE and service owners



- Log and forget → "just log everything, we'll figure it out later"; every log line costs money to ingest, store, and index — if you never query it, you're paying for nothing
- Grep-driven debugging → SSHing into production to grep log files; if your logs aren't centralized and searchable within 3 seconds, your logging infrastructure is failing its primary purpose
- The "more detail is better" trap → logging full request/response bodies, stack traces for every error, and DEBUG for every function call; verbose logging is not better logging — it's just more expensive noise
- Unstructured log proliferation → "we'll add structure later" (you won't); unstructured logs are impossible to parse, aggregate, or alert on — they're just text files with timestamps
- PII blindness → "we don't log PII" (you do, you just haven't looked); every service that handles user data eventually logs something sensitive — automated PII scanning is not optional

## Related

- Same class: [dashboard-system-health](dashboard-system-health.md) — system SLO and health
- Same class: [dashboard-observability-coverage](dashboard-observability-coverage.md) — observability coverage
- Same class: [dashboard-alert-tuning](dashboard-alert-tuning.md) — alert tuning and noise reduction
- Same class: [dashboard-cost-and-resource](dashboard-cost-and-resource.md) — cost and resource optimization
- Same class: [dashboard-quality-metrics](../../engineer/quality-security/dashboard-quality-metrics.md) — quality metrics
- References: Google SRE — *Chapter 16: Handling Overload*; Honeycomb — *Structured Logging Best Practices*; Elastic — *ILM (Index Lifecycle Management)*; OpenTelemetry — *Log Data Model*; Charity Majors — *Observability 2.0*; Splunk — *Logging Best Practices*