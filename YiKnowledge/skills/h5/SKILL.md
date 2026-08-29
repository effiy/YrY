---
title: h5
name: h5
description: >
  H5 mobile web development — viewport configuration, touch events, mobile-first
  responsive design, gesture handling, and mobile browser compatibility. Invoke
  when the user is building mobile web pages, debugging mobile-specific layout
  issues, implementing touch interactions, optimizing for mobile performance, or
  dealing with mobile browser quirks. Trigger words: "H5", "mobile web",
  "viewport", "touch event", "gesture", "mobile-first", "mobile Safari",
  "mobile Chrome", "WeChat webview", "mobile browser", "responsive mobile",
  "mobile layout", "1px border", "300ms delay", "fastclick", "pull-to-refresh",
  "virtual keyboard".
  Do NOT trigger for: native mobile apps (React Native, Flutter), Chrome
  Extensions, desktop browser features, or PWA service-worker-only questions.
lifecycle: active
user_invocable: true
status: stable
type: skill
source: internal
created: 2026-08-10
updated: 2026-08-10
category: aier/skills/h5
review_cycle: quarterly
roles:
  - aier
tags:
  - skill
  - h5
  - mobile
  - frontend
chip: frontend
---
# H5 Mobile

Mobile web development patterns and best practices.

## Core Concepts

- **Viewport** — `meta viewport` configuration, safe areas, notch handling
- **Touch Events** — `touchstart`, `touchmove`, `touchend`, `pointer` events
- **Responsive Design** — mobile-first breakpoints, fluid layouts
- **Gesture Handling** — swipe, pinch, long-press, and custom gestures
- **Mobile Performance** — 60fps animations, lazy loading, resource hints

## Key Rules

1. Always set `viewport` meta tag with `width=device-width, initial-scale=1`
2. Use `pointer` events over `touch` + `mouse` dual-binding
3. Handle virtual keyboard overlap with `visualViewport` API
4. Avoid `position: fixed` with on-screen keyboards — test thoroughly
5. Test on real devices, not just DevTools emulation