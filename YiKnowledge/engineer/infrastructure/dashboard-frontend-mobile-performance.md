---
title: frontend and mobile performance dashboard
aliases:
- frontend performance dashboard
- web performance dashboard
- mobile performance dashboard
- core web vitals dashboard
- client-side performance dashboard
- bundle health dashboard
tags:
- dashboard
- frontend
- mobile
- performance
- web-vitals
- core-web-vitals
- bundle-size
- rendering
category: engineer/infrastructure
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: weekly
roles:
- engineer
- tech-lead
- product-manager
benefit: frontend performance, Core Web Vitals, bundle health, and mobile experience visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- Core Web Vitals, bundle health, rendering performance, mobile performance, resource efficiency, and performance culture defined
related:
- ./dashboard-dora-metrics.md
- ./dashboard-cicd-pipeline-health.md
- ../engineering/dashboard-developer-experience.md
- ../../product-manager/discovery/ux--dashboard-ux-health.md
- ../../product-manager/discovery/ux--dashboard-accessibility-compliance.md
tacit: false
---

# frontend and mobile performance dashboard

> **As an** engineer, **I want to** track frontend and mobile performance, **so that** every page loads fast, every interaction feels instant, every byte is justified, and client-side performance is a measured, optimized, and continuously improving engineering practice — not a "it works on my machine" afterthought.

> Frontend performance is user experience at the speed of light. This dashboard tracks Core Web Vitals, bundle health, rendering performance, mobile performance, resource efficiency, and performance culture — turning client-side performance from occasional Lighthouse audits into a systematic, automated, and continuously improving engineering discipline.

## Summary

- 6 frontend performance dimensions: Core Web Vitals, bundle health, rendering performance, mobile performance, resource efficiency, performance culture
- 4 web products (YiVad, YiWeb, YiPet, YiAi); 2 mobile apps; 285 pages total; 850K monthly active users; 12 frontend engineers
- Core Web Vitals: LCP 2.8s (target < 2.5s), INP 185ms (target < 200ms), CLS 0.12 (target < 0.1); 72% of pages pass all 3 CWV thresholds; Google CWV assessment: "Needs Improvement"
- Bundle health: avg JS bundle 485 KB (target < 300 KB); 28% of bundles > 500 KB; 4 bundles > 1 MB; 35% tree-shaking inefficiency; 12 duplicate dependencies across bundles
- Rendering performance: 58 FPS avg (target 60); 15% of pages have layout thrashing; 22% of pages have excessive re-renders; 8% of pages have long tasks > 50ms blocking main thread
- Dashboard reviewed weekly; performance review with frontend team and UX biweekly

## Core viewpoints

- 100ms is the threshold of "instant" — research shows that responses under 100ms feel instantaneous; every 100ms of additional load time reduces conversion by 1% (Amazon), 0.6% (Google), and 2% (Bing); the business case for performance is not "faster is better" — it's "slower is measurably losing revenue"
- Bundle size is the silent conversion killer — a 485 KB JS bundle on a 4G connection in an emerging market takes 8 seconds to download, parse, and execute; half your users are on mobile, and half of those are on connections slower than your office Wi-Fi; the bundle you ship is not the experience your users get
- Core Web Vitals are a SEO ranking factor — Google uses CWV as a direct ranking signal; "Needs Improvement" means your pages rank below competitors who pass; performance is not just UX, it's organic acquisition
- The largest performance regression is the one you don't notice — without performance budgets in CI, every feature adds 5-50 KB to the bundle; over 6 months, the bundle grows 30% without anyone noticing; performance is a ratchet that only moves in one direction unless you actively push back

## Key information

### 6-panel frontend performance overview

```
┌──────────────────────────────────────────────────────────────────┐
│  CORE WEB VITALS                       │  BUNDLE HEALTH                          │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  LCP: 2.8s (target 2.5) │   │  │  Avg JS bundle: 485 KB   │   │
│  │  INP: 185ms (target 200)│   │  │  > 500 KB: 28% of bundles│   │
│  │  CLS: 0.12 (target 0.1) │   │  │  > 1 MB: 4 bundles       │   │
│  │  Pass all CWV: 72%       │   │  │  Tree-shaking eff: 65%   │   │
│  │  Google CWV: "Needs      │   │  │  Duplicate deps: 12      │   │
│  │  Improvement"            │   │  │  Code splitting: 48% of  │   │
│  │  FCP: 1.8s, TTFB: 0.8s  │   │  │  routes (target 80%)    │   │
│  │  CWV score: B- (72)      │   │  │  Bundle score: C (65)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RENDERING PERFORMANCE                 │  MOBILE PERFORMANCE                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Avg FPS: 58 (target 60) │   │  │  Mobile LCP: 4.2s       │   │
│  │  Layout thrashing: 15%   │   │  │  (target 3.0s)           │   │
│  │  Excessive re-renders:   │   │  │  Mobile INP: 285ms       │   │
│  │  22% of pages            │   │  │  Mobile TTI: 5.8s        │   │
│  │  Long tasks > 50ms: 8%   │   │  │  Mobile bundle: 425 KB   │   │
│  │  Memory leaks: 5 (active)│   │  │  Mobile crash rate: 0.8% │   │
│  │  Rendering score: B- (72)│   │  │  ANR rate: 1.2%          │   │
│  │                           │   │  │  Mobile score: C (65)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  RESOURCE EFFICIENCY                   │  PERFORMANCE CULTURE                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Image optimization: 62% │   │  │  Perf budgets in CI: 35% │   │
│  │  Lazy loading: 58%       │   │  │  Perf testing in CI: 28% │   │
│  │  Font optimization: 45%  │   │  │  Perf regression alerts: │   │
│  │  Cache hit ratio: 72%    │   │  │  42% of teams            │   │
│  │  CDN offload: 85%        │   │  │  Lighthouse in PR: 18%   │   │
│  │  Third-party scripts: 18 │   │  │  Perf review in sprint:  │   │
│  │  (avg per page)          │   │  │  25% of teams            │   │
│  │  Resource score: C+(68)  │   │  │  Culture score: D+(55)  │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Core Web Vitals by product

| Product | LCP (target < 2.5s) | INP (target < 200ms) | CLS (target < 0.1) | FCP | TTFB | Pass all CWV | Google rating | Top issue |
|---|---|---|---|---|---|---|---|---|
| **YiVad** | 2.4s ✓ | 165ms ✓ | 0.08 ✓ | 1.5s | 0.6s | 85% | Good | Chat history load (LCP regression) |
| **YiWeb** | 2.8s ✗ | 195ms ✓ | 0.11 ✗ | 1.8s | 0.8s | 72% | Needs Improvement | Dashboard widgets CLS, image LCP |
| **YiPet** | 2.2s ✓ | 145ms ✓ | 0.07 ✓ | 1.4s | 0.5s | 88% | Good | Best performer, maintain |
| **YiAi** | 3.5s ✗ | 225ms ✗ | 0.15 ✗ | 2.2s | 1.2s | 45% | Poor | Agent config page, large bundles |
| **Mobile app** | 3.8s ✗ | 245ms ✗ | 0.18 ✗ | 2.5s | 1.5s | 38% | Poor | Cold start, API waterfall |
| **Marketing site** | 1.8s ✓ | 95ms ✓ | 0.04 ✓ | 1.2s | 0.4s | 95% | Good | Excellent, static site |
| **Overall** | **2.8s ✗** | **185ms ✓** | **0.12 ✗** | **1.8s** | **0.8s** | **72%** | **Needs Improvement** | |

### Bundle health by product

| Product | Total JS (KB) | Main bundle | Chunks | Largest chunk | > 500 KB chunks | > 1 MB chunks | Tree-shaking efficiency | Duplicate deps | Code splitting |
|---|---|---|---|---|---|---|---|---|---|
| **YiVad** | 420 KB | 185 KB | 12 | 95 KB | 2 | 0 | 72% | 3 | 65% of routes |
| **YiWeb** | 520 KB | 245 KB | 15 | 135 KB | 4 | 1 | 62% | 5 | 48% of routes |
| **YiPet** | 380 KB | 165 KB | 10 | 78 KB | 1 | 0 | 78% | 2 | 55% of routes |
| **YiAi** | 685 KB | 325 KB | 18 | 185 KB | 6 | 3 | 45% | 4 | 28% of routes |
| **Mobile app** | 12.5 MB (APK) | N/A | N/A | N/A | N/A | N/A | 55% | 8 native libs | 35% of screens |
| **Overall** | **485 KB** | **220 KB** | **14** | **120 KB** | **28%** | **4** | **65%** | **12** | **48%** |

### Rendering performance analysis

| Rendering issue | Pages affected | Severity | FPS impact | User impact | Root cause | Detection method |
|---|---|---|---|---|---|---|
| **Layout thrashing** (forced reflow) | 42 (15%) | High | -8 to -15 FPS | Janky scrolling, unresponsive UI | Reading layout properties in loops, mixing reads/writes | Layout Shift API, Performance Observer |
| **Excessive re-renders** (> 3 per interaction) | 62 (22%) | Medium | -5 to -10 FPS | Sluggish interactions, battery drain | Missing React.memo, useMemo, unstable references | React DevTools Profiler, why-did-you-render |
| **Long tasks** (> 50ms blocking) | 22 (8%) | Critical | -15 to -30 FPS | Frozen UI, unresponsive to clicks | Large data processing on main thread, unoptimized loops | Long Tasks API, Lighthouse |
| **Memory leaks** | 5 active | Critical | Progressive degradation | Page crash after prolonged use | Unmounted component listeners, growing caches | Chrome DevTools Memory, heap snapshots |
| **Forced synchronous layout** | 35 (12%) | Medium | -3 to -8 FPS | Micro-jank, subtle lag | Synchronous style reads after writes | Performance API, Chrome DevTools |
| **Overall** | | | **58 FPS avg** | | | |

### Mobile performance by device tier

| Device tier | % of users | LCP | INP | TTI | Bundle size (KB) | Crash rate | ANR rate | Cold start | Network |
|---|---|---|---|---|---|---|---|---|---|
| **High-end** (iPhone 15, Galaxy S24) | 25% | 2.2s | 155ms | 3.2s | 485 KB | 0.2% | 0.3% | 1.8s | 5G/Wi-Fi |
| **Mid-range** (iPhone 12, Pixel 7) | 45% | 3.5s | 225ms | 5.5s | 485 KB | 0.5% | 0.8% | 2.8s | 4G |
| **Low-end** (iPhone SE, Galaxy A series) | 22% | 5.8s | 385ms | 9.5s | 485 KB | 1.8% | 2.5% | 4.5s | 3G/4G |
| **Tablet** | 8% | 3.2s | 195ms | 4.8s | 485 KB | 0.3% | 0.5% | 2.2s | Wi-Fi |
| **Overall** | **100%** | **4.2s** | **285ms** | **5.8s** | **485 KB** | **0.8%** | **1.2%** | **2.8s** | |

### Resource efficiency

| Resource type | Current | Target | Waste | Optimization | Action |
|---|---|---|---|---|---|
| **Images** | 62% optimized (WebP/AVIF, responsive) | 90% | 350 KB avg page savings | Next-gen formats, srcset, lazy loading | Add image optimization to build, CDN image transform |
| **Lazy loading** | 58% of below-fold content | 90% | 420 KB unnecessary initial load | Intersection Observer, loading="lazy" | Audit above-fold, lazy load everything else |
| **Font optimization** | 45% (subset, swap, preload) | 85% | 120 KB + FOUT/FOIT | Font subsetting, font-display: swap, preload | Subset fonts to used characters, add preload |
| **Cache policy** | 72% cache hit ratio | 85% | 180 KB repeat downloads | Immutable hashed filenames, CDN cache | Review cache-control headers, add content hashing |
| **CDN offload** | 85% served from CDN | 95% | 120ms latency per request | CDN for all static assets, edge caching | Move remaining assets to CDN, configure edge TTL |
| **Third-party scripts** | 18 scripts avg/page | < 10 | 350ms blocking time | Audit, defer, self-host | Remove unused scripts, defer non-critical, self-host critical |
| **Overall** | **C+ (68)** | | | | |

### Performance culture and governance

| Practice | Adoption | Target | Issue | Action |
|---|---|---|---|---|
| **Performance budgets in CI** | 35% of repos | 100% | 65% of repos have no budget enforcement | Add bundle size budgets to CI, fail builds on regression |
| **Automated perf testing in CI** | 28% of repos | 100% | 72% of repos have no automated perf testing | Add Lighthouse CI, WebPageTest, add perf regression detection |
| **Perf regression alerts** | 42% of teams | 100% | 58% of teams have no alerting for perf regressions | Add RUM-based perf alerting, set regression thresholds |
| **Lighthouse in PR review** | 18% of PRs | 80% | Manual Lighthouse audits are rare and inconsistent | Add Lighthouse CI to PR checks, add perf score comment |
| **Perf review in sprint planning** | 25% of teams | 80% | Performance is not part of sprint planning | Add perf review to sprint planning, allocate perf budget |
| **RUM (Real User Monitoring)** | 55% of products | 100% | 45% of products have no RUM data | Implement RUM (Web Vitals, custom metrics), add dashboards |
| **Overall** | **D+ (55)** | | | |

## Action recommendations

1. **YiAi performance crisis**: 3.5s LCP, 45% CWV pass rate, 685 KB bundle; implement code splitting (28% → 80%), tree-shaking audit, lazy loading, reduce bundle to < 350 KB, target 75% CWV pass rate
2. **Mobile experience gap**: 4.2s LCP on mobile, 5.8s TTI; implement adaptive loading based on device/network, reduce JS shipped to low-end devices, add offline support, target < 3.0s mobile LCP
3. **Bundle size reduction**: 485 KB avg, 28% > 500 KB; implement bundle size budgets (300 KB max), add bundle analyzer to CI, tree-shaking audit, de-duplicate 12 shared dependencies, target < 300 KB avg
4. **Performance budgets in CI**: 35% adoption; add performance budgets to all repos, fail builds on regression, add bundle size dashboard, target 100% adoption
5. **Image and resource optimization**: 62% images optimized, 58% lazy loaded; implement automatic image optimization in build pipeline, add responsive images, lazy load all below-fold content, target 90% optimization
6. **Third-party script audit**: 18 scripts avg/page; audit all third-party scripts, remove unused, defer non-critical, self-host critical scripts, target < 10 scripts
7. **Rendering performance**: 15% layout thrashing, 22% excessive re-renders; implement React profiler in development, add rendering performance lint rules, fix memory leaks, target < 5% thrashing
8. **RUM implementation**: 55% RUM coverage; implement Real User Monitoring across all products, add Web Vitals tracking, create performance dashboards per product, target 100% coverage
9. **Performance culture**: D+ (55) culture score; add performance to engineering onboarding, create performance champions program, add perf review to sprint planning, celebrate performance wins, target B (78)
10. **Weekly performance review**: review Core Web Vitals, bundle health, rendering performance, mobile performance, resource efficiency, and performance culture with frontend team



- The Lighthouse-once-per-quarter audit → running Lighthouse on the homepage from a high-end laptop on office Wi-Fi and celebrating a 95 score; Lighthouse scores without throttled CPU/network, without testing key user journeys, and without RUM validation are performance theater
- The "users have fast connections" assumption → designing for 5G/Wi-Fi and ignoring the 45% of users on mid-range devices with 4G; the median mobile connection globally is 15 Mbps, not 150 Mbps — your 485 KB bundle takes 3.2 seconds just to download on the median connection
- The bundle size creep → adding dependencies without reviewing their size impact; `lodash` (71 KB), `moment` (232 KB), `underscore` (58 KB) — each dependency is a decision that compounds over time; the 12 duplicate dependencies across bundles are 12 decisions that were never reviewed
- The "it renders fine on my machine" bias → testing performance on a top-spec MacBook Pro with 32 GB RAM and ignoring the low-end Android device with 2 GB RAM; the 5 active memory leaks won't crash your machine, but they'll crash the user's phone after 10 minutes of use
- The performance-as-optimization-not-engineering → treating performance as something you optimize after launch rather than engineering into the product from day one; the 35% CI budget adoption means performance is optional for 65% of repos — and optional means it doesn't happen

## Related

- Same class: [dashboard-dora-metrics](dashboard-dora-metrics.md) — DORA metrics
- Same class: [dashboard-cicd-pipeline-health](dashboard-cicd-pipeline-health.md) — CI/CD pipeline health
- Same class: [dashboard-developer-experience](../engineering/dashboard-developer-experience.md) — developer experience
- Same class: [dashboard-ux-health](../../product-manager/discovery/ux--dashboard-ux-health.md) — UX health
- Same class: [dashboard-accessibility-compliance](../../product-manager/discovery/ux--dashboard-accessibility-compliance.md) — accessibility compliance
- References: Google — *Web Vitals*; Addy Osmani — *Image Optimization*; Philip Walton — *Web Performance Recipes*; WebPageTest — *Performance Testing*; Lighthouse — *CI Integration*; SpeedCurve — *Performance Monitoring*; Alex Russell — *Performance Culture*