---
title: Retry with Exponential Backoff
aliases: [retry-backoff, retry-pattern, exponential-backoff, resilience]
tags: [engineer, ship, reliability, retry, backoff, resilience]
category: engineer/ship
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, srer]
benefit: "Engineers implement retry with exponential backoff correctly — preventing thundering herd and cascading failures"
acceptance_criteria:
  - "covers Python (tenacity) and TypeScript patterns"
  - "includes jitter, max retries, and timeout configuration"
  - "real YiAi retry patterns from the codebase"
related:
  - ./README.md
  - ./set-up-testing-infrastructure.md
  - ../../srer/observability/slo-sli-definition.md
---

# Retry with Exponential Backoff

> **When to use:** For any transient failure — network timeouts, connection resets, rate limits, temporary service unavailability. Retry turns transient failures into successes without user impact.

## When to Retry (and When NOT to)

| Retry | Don't Retry |
|---|---|
| Network timeout | 400 Bad Request (invalid input) |
| Connection reset | 401 Unauthorized |
| 503 Service Unavailable | 403 Forbidden |
| 429 Rate Limited | 404 Not Found |
| Database deadlock | 422 Unprocessable Entity |
| Temporary DNS failure | Any 4xx (client error) |

**Rule:** Retry on 5xx and network errors. Never retry on 4xx (fix the request, not retry it).

## Python Pattern (YiAi — tenacity)

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
import logging

logger = logging.getLogger(__name__)

# YiAi's LLM retry pattern
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((ConnectionError, TimeoutError)),
    before_sleep=before_sleep_log(logger, logging.WARNING),
)
async def call_ollama_with_retry(prompt: str) -> dict:
    """Call Ollama with retry on transient failures."""
    return await ollama_client.chat(prompt)

# YiAi's MongoDB retry pattern
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=1, max=30),
    retry=retry_if_exception_type((ConnectionError, TimeoutError)),
)
async def mongodb_operation_with_retry(collection: str, query: dict):
    """MongoDB operations with retry on transient failures."""
    return await db[collection].find_one(query)
```

### Backoff Timing

| Attempt | Delay (multiplier=1, min=1, max=10) |
|---|---|
| 1st retry | 1s |
| 2nd retry | 2s |
| 3rd retry | 4s |
| 4th retry | 8s |
| 5th retry | 10s (capped at max) |

## TypeScript Pattern (YiPet — ApiClient)

```typescript
// YiPet/src/api/client.ts — retry with backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Only retry on 5xx and network errors
      if (response.status < 500 || attempt === maxRetries) {
        return response;
      }

      // 429 Rate Limited — use Retry-After header
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : (2 ** attempt) * 1000;
        await sleep(delay);
        continue;
      }
    } catch (err) {
      lastError = err as Error;
      if (attempt === maxRetries) throw lastError;
    }

    // Exponential backoff with jitter
    const delay = Math.min((2 ** attempt) * 1000, 30000);
    const jitter = Math.random() * 1000;
    await sleep(delay + jitter);
  }

  throw lastError!;
}
```

## Jitter — Why It Matters

Without jitter, all retrying clients fire at the same time → thundering herd.

```
Without jitter:
Client A: retry at 1s, 2s, 4s, 8s
Client B: retry at 1s, 2s, 4s, 8s  ← All in sync → server overloaded

With jitter:
Client A: retry at 1.3s, 2.7s, 4.1s, 8.9s
Client B: retry at 1.8s, 2.2s, 4.6s, 8.1s  ← Spread out → server handles load
```

## YiAi-Specific Retry Patterns

| Component | Max retries | Backoff | Reason |
|---|---|---|---|
| Ollama API calls | 2 | 1s, 2s | LLM loading into VRAM; transient |
| MongoDB operations | 5 | 1s-30s exponential | Connection pool exhaustion; recovers |
| OSS file operations | 3 | 1s, 2s, 4s | Network blips |
| Agent LLM retry | 2 | 1s, 2s | XML parse errors, transient failures |

## Circuit Breaker (When Retry Isn't Enough)

When a service is consistently failing, retry makes things worse. Add a circuit breaker:

```python
# Simple circuit breaker pattern
class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failures = 0
        self.threshold = failure_threshold
        self.recovery = recovery_timeout
        self.last_failure = 0

    async def call(self, func, *args, **kwargs):
        if self.failures >= self.threshold:
            if time.time() - self.last_failure < self.recovery:
                raise Exception("Circuit breaker open")
            self.failures = 0  # Try again after recovery timeout

        try:
            result = await func(*args, **kwargs)
            self.failures = 0  # Success resets the breaker
            return result
        except Exception:
            self.failures += 1
            self.last_failure = time.time()
            raise
```

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Retrying without backoff | All retries fire at the same interval; server stays overloaded | Use exponential backoff with jitter |
| Retrying on 4xx errors | Same invalid request fails every time; wastes resources | Only retry on 5xx and network errors |
| Infinite retries | Service is down for hours; retries never stop | Always set a max retry count (3-5) |
| No logging on retry | Retries are invisible; can't debug "slow" requests | Log a warning on each retry attempt |