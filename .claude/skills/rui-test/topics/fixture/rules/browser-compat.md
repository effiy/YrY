---
paths: [".claude/rui-html-test-fixture/SKILL.md"]
description: "Browser compatibility contracts — supported browsers, version requirements, and feature detection rules."
---

# Browser Compatibility Contracts

## Supported Browsers

| Browser | Minimum version | Testing |
|---------|:---:|---------|
| Chrome | 90+ | Primary |
| Firefox | 90+ | Secondary |
| Safari | 15+ | Secondary |
| Edge | 90+ | Best-effort (Chromium-based) |

## Feature Requirements

| Feature | Required? | Fallback |
|---------|:---:|----------|
| CSS Custom Properties | ✅ Required | None — core to `--rui-*` system |
| ES Modules | ✅ Required | None |
| Web Components (Custom Elements) | ✅ Required | None |
| CSS Grid | ✅ Required | None |
| `prefers-reduced-motion` | ✅ Supported | Disable animations |
| `prefers-color-scheme` | Optional | Default to dark theme |

## Test Fixture Constraints

1. No external API dependencies — fixtures must be self-contained
2. No `localhost` server required — `file://` URLs must work
3. Async components use `waitFor` helpers, not arbitrary `setTimeout`
4. Visual regression baselines generated per OS/browser combination
