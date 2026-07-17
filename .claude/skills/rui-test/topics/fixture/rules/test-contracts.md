---
paths:
  - ".claude/rui-html-test-fixture/SKILL.md"
description: "HTML test contracts: test fixture structure, assertion types, browser compatibility, and visual regression rules."
---

# HTML Test Contracts

`rui-html-test` provides testing infrastructure for HTML/Vue components. These contracts define test boundaries.

## Test Fixture Structure

```
tests/
├── fixtures/
│   └── <component>/
│       ├── index.html     # Test page with component mounted
│       ├── test.js        # Test assertions
│       └── expected/      # Expected outputs (screenshots, DOM snapshots)
└── results/
    └── <component>/
        └── <timestamp>/   # Test run results
```

## Assertion Types

| Type | Method | Best for |
|------|--------|----------|
| DOM presence | `querySelector` not null | Component renders |
| Text content | `textContent` match | Data display |
| CSS properties | `getComputedStyle` | Visual styling |
| Event handling | `dispatchEvent` + state check | Interactivity |
| Visual regression | Screenshot comparison | Pixel-perfect rendering |

## Browser Compatibility

Tests target these browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

## Hard Constraints

1. Test fixtures must be self-contained — no external API dependencies
2. Visual regression baseline must be generated on the same OS/browser
3. Async components must use `waitFor` helpers, not arbitrary timeouts
