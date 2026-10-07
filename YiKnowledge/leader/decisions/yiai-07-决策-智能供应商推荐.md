---
title: "ADR-2026-09-23: Smart Provider Ranking — Real-time Health-Based Engine Selection"
aliases: [adr-smart-provider-ranking, adr-translation-routing]
tags: [adr, translation, architecture, routing, health-check]
category: leader/decisions
created: 2026-09-23
updated: 2026-09-23
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer, sre]
benefit: "Records the architectural decision to add real-time health-based provider ranking for smart engine selection"
---

# ADR-2026-09-23: Smart Provider Ranking — Real-time Health-Based Engine Selection

## Status

Accepted — implemented 2026-09-23.

## Context

Users manually select translation engines. When a provider (e.g., Google, DeepL) experiences an outage, users receive errors and must manually switch engines. YiAi already tracks real-time provider health via `provider_health()` which aggregates success rates from `translation_records`.

We need a way for client applications to automatically select the healthiest translation engine without user intervention.

## Decision

Add a `provider_recommend(from_lang, to_lang)` RPC method that:

1. Reuses `provider_health(hours=24)` for real-time data — no additional data collection
2. Ranks providers by `success_rate` descending, with healthy > degraded > down ordering
3. Returns `recommended: <top healthy provider>` for automatic engine selection
4. Returns full ranked list for YiVad dashboard visualization

### Architecture

```
YiAi provider_health (real-time) → provider_recommend (sort + recommend)
  ├─→ YiVad: Smart Provider Ranking UI cards (#1-#N + Best tag)
  └─→ YiPet: TranslationService.getProviderRecommend (future smart routing)
```

### Why not language-pair-specific history?

Language-pair-specific success rates would require tracking per (from, to, provider) tuples, significantly increasing data collection complexity. The current global health metric is a simpler, sufficient proxy — a healthy provider is generally healthy across language pairs.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Language-pair-specific ranking | Over-engineered; global health is sufficient proxy |
| Client-side ranking (duplicate logic across apps) | Violates single source of truth; backend is authoritative |
| Static provider priority list | Doesn't adapt to real-time outages |
| Weighted scoring (latency + success + cost) | Premature optimization; success_rate alone is the critical signal |

## Consequences

### Positive
- Client apps can automatically fall back to healthy providers without user intervention
- YiVad dashboard shows actionable provider rankings
- Single source of truth in YiAi backend
- Zero additional data collection — reuses existing `provider_health`

### Negative
- Global ranking may not reflect language-pair-specific quality differences (e.g., Google better at EN→ZH, DeepL better at EN→DE)
- Ranking updates every 24h window — fast outages may not be reflected immediately (mitigated by circuit breaker at request level)

## References

- PRD: [YA-09-113: 智能供应商推荐](../../projects/yiai/prds/2026-09/113-需求-智能供应商推荐.md)
- Implementation: `YiAi: services/translation/provider_health.py::provider_recommend`
- Parent ADR: None (new capability)