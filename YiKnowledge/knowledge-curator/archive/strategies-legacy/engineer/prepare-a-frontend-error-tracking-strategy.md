---
title: I want to prepare a Frontend Error Tracking strategy / Prepare a frontend error tracking strategy
aliases: [i-want-to-prepare-a-frontend-error-tracking-strategy, frontend-error-tracking-strategy, fet-strategy]
tags: [journey, methodology, frontend, observability, errors, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
 - "frontmatter roles + benefit + acceptance_criteria present"
 - "filename is descriptive verb-phrase, hyphens only, no underscores or digits"
 - "body contains user story header + 7 fixed-order sections"
related:
 - ./prepare-a-frontend-monitoring-strategy.md
 - ./prepare-a-frontend-performance-strategy.md
 - ../../oncall-sre/incident-response/prepare-an-observability-strategy.md
 - ./prepare-a-frontend-security-strategy.md
 - ./prepare-a-web-vitals-strategy.md
 - ../../knowledge-curator/templates/thinking/first-principles.md
 - ../../knowledge-curator/templates/thinking/inversion.md
 - ../../knowledge-curator/templates/thinking/second-order-thinking.md
 - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: "Frontend error tracking is not just try-catch; it is a contract. Five dimensions: capture + aggregate + triage + governance + measurement; business-value driven; not one-shot; measurable"
---

# I want to prepare a Frontend Error Tracking strategy

> **As an** engineer, **I want to** prepare a frontend error tracking, **so that** launch is safe.

## Summary

- Frontend error tracking = contract; not just try-catch
- Five dimensions: capture + aggregate + triage + governance + measurement; no missing dimension
- Business-value driven; not by feel
- Cover JS / resource / API / promise / crash multi-source
- Link with frontend-monitoring + frontend-performance + observability + frontend-security + web-vitals
- Publicly accessible; not hidden
- Regular review; evolve and update
- First principles / inversion / second-order / Occam's razor

## Scenario description

Frontend error tracking is a contract; not just try-catch. This entry provides the Frontend Error full path, covering capture + aggregate + triage + governance + measurement, business-value driven not by feel, covering JS / resource / API / promise / crash multi-source, linking with prepare-a-frontend-monitoring-strategy + prepare-a-frontend-performance-strategy + prepare-an-observability-strategy + prepare-a-frontend-security-strategy + prepare-a-web-vitals-strategy, publicly accessible, regular review, and links to FrontendMon / FrontendPerf / Observability / FrontendSec / WebVitals and other leaves.

## 2-hop reachability path

| Hops | Target | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | frontend-monitoring | [./prepare-a-frontend-monitoring-strategy.md](./prepare-a-frontend-monitoring-strategy.md) |
| 1 hop | observability | [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) |
| 2 hops | frontend-performance | [./prepare-a-frontend-performance-strategy.md](./prepare-a-frontend-performance-strategy.md) |
| 2 hops | web-vitals | [./prepare-a-web-vitals-strategy.md](./prepare-a-web-vitals-strategy.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: capture + aggregate + triage + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; no empty slogans
3. **Capture**: window.onerror / unhandledrejection / resource / crash; none missing
4. **Aggregate**: fingerprint / stack / source-map / frequency; none missing
5. **Triage**: impact / users / path / priority / closed loop; none missing
6. **Governance**: owner / cadence / review / docs / drift; none missing
7. **Measurement**: efficiency + trust + speed + risk + cost; none missing
8. **Not one-shot**: progressive from capture -> aggregate -> triage -> governance -> measurement; no skipping levels
9. **Not report-only**: reports are only the starting point; not the endpoint
10. **No empty slogans**: every principle must have landed evidence; no ambiguity
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with frontend-monitoring**: FrontendError + FrontendMon co-build
13. **Link with frontend-performance**: FrontendError + FrontendPerf co-build
14. **Link with observability**: FrontendError + Observability co-build
15. **Link with frontend-security**: FrontendError + FrontendSec co-build
16. **Link with web-vitals**: FrontendError + WebVitals co-build
17. **Toolchain**: Sentry / Bugsnag / Rollbar / Raygun / Datadog
18. **Publicly accessible**: strategy accessible to everyone; not hidden
19. **Regular review**: evolve and update; not one-shot
20. **First principles**: why FrontendError is required; worst consequence of not doing it
21. **Inversion**: how much can be solved with console.log; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: the simpler FrontendError the better; cut redundant rules

## Related

- frontend-monitoring: [./prepare-a-frontend-monitoring-strategy.md](./prepare-a-frontend-monitoring-strategy.md) — FrontendMon co-build
- frontend-performance: [./prepare-a-frontend-performance-strategy.md](./prepare-a-frontend-performance-strategy.md) — FrontendPerf co-build
- observability: [../../oncall-sre/incident-response/prepare-an-observability-strategy.md](../../oncall-sre/incident-response/prepare-an-observability-strategy.md) — Observability co-build
- frontend-security: [./prepare-a-frontend-security-strategy.md](./prepare-a-frontend-security-strategy.md) — FrontendSec co-build
- web-vitals: [./prepare-a-web-vitals-strategy.md](./prepare-a-web-vitals-strategy.md) — WebVitals co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
