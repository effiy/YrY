---
title: Implement an API
aliases: [i-want-to-implement-an-api, implement-an-api, api-design]
tags: [journey, methodology, api, design, implementation, versioning]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers design and implement APIs with consistent patterns, versioning, and error handling from day one"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../product-manager/frameworks/write-a-spec-or-prd.md
  - ../quality-security/do-a-code-review.md
  - ../infrastructure/set-up-ci-cd.md
  - ../../oncall-sre/observability/set-up-observability.md
  - ../engineering/set-up-testing-infrastructure.md
  - ../../knowledge-curator/templates/write-documentation.md
  - ../../tech-lead/roadmap/deprecate-a-feature.md
  - ../../engineer/architecture-design/rpc-envelope.md
  - ../../engineer/architecture-design/sse-streaming.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
tacit: An API is a contract not a function; contract first, then implementation; contract has versions, has deprecation, has monitoring; contract stability outweighs implementation simplicity
---

# I want to implement an API

> **As an** engineer, **I want to** implement an api, **so that** outcome is traceable.

## Summary

- API five steps: contract → implementation → test → documentation → monitoring
- Contract first: OpenAPI / RPC envelope; contract stability outweighs implementation simplicity
- Implementation: layered controller / service / data; field names hard constraint
- Test: unit + integration + contract baseline; bidirectional run
- Documentation: OpenAPI auto-generated + example + error codes
- Monitoring: latency + error rate + call distribution
- Version management: v1 / v2 coexist; deprecation follows deprecation policy

## Scenario

New business need, new feature, new data; need to expose an API to frontend or third party. This entry provides the full path from contract to monitoring, covering contract first, layered implementation, test three-piece set, documentation auto-generation, monitoring, version management, and links to PRD / code review / CI-CD / observability / testing / documentation / deprecate-a-feature / harden-supply-chain and other leaves.

## 2-hop reachability paths

| Hops | goal | file |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | PRD | [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) |
| 2 hops | code review | [../processes/do-a-code-review.md](../quality-security/do-a-code-review.md) |
| 2 hops | CI/CD | [../tools/set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) |
| 2 hops | observable | [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) |
| 2 hops | test infrastructure | [../tools/set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) |
| 2 hops | documentation writing | [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) |
| 2 hops | feature deprecation | [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) |
| 2 hops | supply chain hardening | [./harden-supply-chain.md](../process/harden-supply-chain.md) |
| 2 hops | RPC envelope pattern | [../../engineer/architecture-design/rpc-envelope.md](rpc-envelope.md) |
| 2 hops | SSE streaming pattern | [../../engineer/architecture-design/sse-streaming.md](sse-streaming.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |

## Action recommendations

1. **Contract first**: OpenAPI / RPC envelope; contract stability outweighs implementation simplicity
2. **Field names hard constraint**: see [rpc-envelope pattern](rpc-envelope.md); filter / target_file / cname / module_name / method_name unchanged
3. **Layered implementation**: controller / service / data; do not write business in controller
4. **Error code normalization**: `{code, message, data}`; code=0 success; non-0 error codes normalized
5. **Test three-piece set**: unit + integration + contract baseline; bidirectional run
6. **OpenAPI auto-generation**: documentation auto-generated; not hand-written
7. **Example required**: each endpoint example + error code example
8. **Version management**: v1 / v2 coexist; deprecation follows [deprecation policy](../../tech-lead/roadmap/deprecate-a-feature.md)
9. **Rate limit + auth**: API launches with rate limit + auth
10. **Monitoring three-piece set**: latency + error rate + call distribution; per endpoint monitoring
11. **Contract test co-build**: YiVad vendor contract 20 cases bidirectional run; OpenAPI derived types + CI diff block
12. **SSE stream follows pattern**: see [sse-streaming pattern](sse-streaming.md); do not rewrite
13. **No mixing feature changes**: API change PRs don't mix in new features; 1:1 mapping
14. **First principles**: why must new API; how much can extending existing API solve; if extendable, don't build new
15. **Second-order thinking**: second-order consequences of a new API (maintenance / compatibility / deprecation); not just short-term output
16. **Occam**: API the simpler the better; cut redundant fields

## Related

- PRD: [../../product-manager/frameworks/write-a-spec-or-prd.md](../../product-manager/frameworks/write-a-spec-or-prd.md) — requirement prerequisite
- code review: [../processes/do-a-code-review.md](../quality-security/do-a-code-review.md) — landing review
- CI/CD: [../tools/set-up-ci-cd.md](../infrastructure/set-up-ci-cd.md) — landing gate
- observable: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — monitoring
- test infrastructure: [../tools/set-up-testing-infrastructure.md](../engineering/set-up-testing-infrastructure.md) — test three-piece set
- documentation: [../../knowledge-curator/templates/write-documentation.md](../../knowledge-curator/templates/write-documentation.md) — OpenAPI auto-generation
- feature deprecation: [../../tech-lead/roadmap/deprecate-a-feature.md](../../tech-lead/roadmap/deprecate-a-feature.md) — version deprecation
- supply chain hardening: [./harden-supply-chain.md](../process/harden-supply-chain.md) — dependency hardening
- Pattern: [rpc-envelope](rpc-envelope.md) + [sse-streaming](sse-streaming.md)
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md)
