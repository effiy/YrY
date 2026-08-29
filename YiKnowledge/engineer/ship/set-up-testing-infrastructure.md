---
title: Set Up Testing Infrastructure
aliases: [set-up-testing, testing-infrastructure, test-setup]
tags: [engineer, ship, testing, quality, pytest, vitest]
category: engineer/ship
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers set up testing infrastructure for YrY projects — from zero tests to a reliable test suite with CI integration"
acceptance_criteria:
  - "covers pytest (YiAi), vitest (YiVad/YiPet), and test organization"
  - "includes CI integration and coverage thresholds"
  - "real YrY project testing patterns"
related:
  - ./README.md
  - ../build/implement-cross-project-rpc-call.md
  - ../../leader/decisions/yiai/pytest-introduction.md
---

# Set Up Testing Infrastructure

> **When to use:** When a YrY project has no tests, or when the existing test suite is unreliable. Testing infrastructure is the foundation for all quality work.

## YrY Testing Status

| Project | Framework | Status | Tests | Coverage |
|---|---|---|---|---|
| YiAi | pytest 8 + pytest-asyncio + httpx | ✓ Active | 76+ | 92%+ shared/ |
| YiVad | vitest | ✗ No tests | 0 | 0% |
| YiPet | vitest | ✓ Active | 97 | Limited |

## YiAi — pytest Setup

### Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
addopts = "-v --cov=src --cov-report=term-missing --cov-report=html"
markers = [
    "slow: slow tests (deselect with '-m \"not slow\"')",
    "integration: integration tests requiring running services",
]
```

### Test Structure

```
YiAi/tests/
├── conftest.py           # Shared fixtures
├── test_utils.py         # Pure function tests
├── test_error_codes.py   # Enum tests
├── test_response.py      # Response wrapper tests
├── test_exceptions.py    # Exception tests
├── test_config.py        # Config tests
└── test_integration/     # Integration tests (requires YiAi running)
```

### Key Patterns

```python
# tests/conftest.py — shared fixtures
import pytest

@pytest.fixture
def sample_text():
    return "Hello, this is a test message with 多个 languages."

@pytest.fixture
def sample_json():
    return '{"key": "value", "nested": {"a": 1}}'

# tests/test_utils.py — test pure functions
from shared.utils import estimateTokens, cleanText

def test_estimate_tokens_english():
    assert estimateTokens("Hello world") == 2

def test_estimate_tokens_chinese():
    assert estimateTokens("你好世界") == 4  # Chinese chars ≈ 1 token each

def test_clean_text_strips_whitespace():
    assert cleanText("  hello  ") == "hello"
```

### Async Testing

```python
# tests/test_repository.py
import pytest
from data.repository import query_documents

@pytest.mark.asyncio
async def test_query_documents_with_filter():
    result = await query_documents("test", filter={"status": "active"})
    assert "list" in result
    assert "total" in result

@pytest.mark.integration
@pytest.mark.asyncio
async def test_query_documents_integration():
    """Requires MongoDB running."""
    result = await query_documents("sessions", pageSize=5)
    assert result["total"] >= 0
```

## YiPet — vitest Setup

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
```

### Key Patterns

```typescript
// tests/config/data.test.ts
import { describe, it, expect } from 'vitest';
import { DEFAULTS } from '@/config/defaults';

describe('DEFAULTS', () => {
  it('should have a valid model', () => {
    expect(DEFAULTS.MODEL).toBe('qwen3.5');
  });

  it('should have color options with gradients', () => {
    DEFAULTS.COLORS.forEach(color => {
      expect(color).toMatchObject({
        value: expect.any(String),
        label: expect.any(String),
        gradient: expect.any(String),
      });
    });
  });
});
```

## CI Integration

```yaml
# .github/workflows/test.yml (example)
name: Test
on: [push, pull_request]
jobs:
  test-yiai:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r requirements.txt
      - run: cd YiAi && python -m pytest tests/ -v --cov=src

  test-yipet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: cd YiPet && npm ci && npm test
```

## Coverage Thresholds

| Level | Threshold | When |
|---|---|---|
| Minimum | > 0% | First test added |
| Basic | > 50% | Core utilities covered |
| Good | > 80% | Most paths covered |
| Excellent | > 90% | Edge cases covered |

**YiAi target:** 90%+ on shared/, 70%+ on services/
**YiPet target:** 80%+ on config/, shared/, utils/
**YiVad target:** Get to > 0% first

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Testing only the happy path | Edge cases cause production bugs | Add at least 1 error case and 1 edge case per function |
| No CI integration | Tests rot; no one runs them locally | Add test step to CI; fail PRs that break tests |
| 100% coverage obsession | Tests become brittle; testing implementation details | Target 80% coverage; focus on behavior, not implementation |
| Slow tests in the main suite | CI takes 20+ minutes; team stops waiting | Split fast unit tests (< 5s) from slow integration tests; run fast tests on every push |