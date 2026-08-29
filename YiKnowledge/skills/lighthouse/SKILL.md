---
title: lighthouse
name: lighthouse
description: >
  Google Lighthouse — performance audits, accessibility scoring, SEO analysis,
  CI integration, and score optimization. Invoke when the user is running
  Lighthouse audits, debugging low performance scores, optimizing Core Web
  Vitals, setting up Lighthouse CI, or interpreting Lighthouse reports.
  Trigger words: "Lighthouse", "performance audit", "Core Web Vitals", "LCP",
  "FID", "INP", "CLS", "TTFB", "FCP", "accessibility score", "SEO score",
  "best practices score", "Lighthouse CI", "lighthouse report", "PageSpeed
  Insights", "performance budget", "web vitals", "perf score", "lighthouse
  config", "lighthouse 100", "chrome devtools audit".
  Do NOT trigger for: general performance profiling (Chrome DevTools Performance
  tab), backend performance, or non-Lighthouse tools like WebPageTest.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/lighthouse
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - lighthouse
  - performance
  - frontend
chip: platform
---
# Lighthouse

Performance auditing and optimization with Google Lighthouse.

## Core Concepts

- **Audit Categories** — Performance, Accessibility, Best Practices, SEO, PWA
- **Core Web Vitals** — LCP (loading), INP (interactivity), CLS (visual stability)
- **CI Integration** — Lighthouse CI for automated regression testing
- **Score Optimization** — targeted fixes for each audit category

## Key Rules

1. Run Lighthouse in incognito to avoid extension interference
2. Always test on throttled network and CPU (mobile simulation)
3. Set performance budgets and enforce them in CI
4. Fix LCP first (largest contentful paint) — it has the most impact
5. Use Lighthouse CI assertions to prevent regressions, not just reports