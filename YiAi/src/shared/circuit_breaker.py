"""Circuit breaker — fail-fast when external services are degraded.

A simple time-windowed circuit breaker. When *failure_threshold* calls fail
within *window_seconds*, the circuit opens and immediately fails subsequent
calls for *cooldown_seconds* without contacting the external service. This
prevents cascading resource exhaustion when Ollama, DeepSeek, or other
dependencies are slow or failing.

After the cooldown period, the circuit moves to half-open: the next call is
allowed through as a probe. If it succeeds, the circuit closes. If it fails,
the cooldown resets.

Usage::

    from shared.circuit_breaker import CircuitBreaker

    _ollama_cb = CircuitBreaker("ollama", failure_threshold=5, cooldown_seconds=30)

    async def chat(messages):
        if not _ollama_cb.allow():
            raise CircuitBreakerOpen("ollama")
        try:
            result = await _do_ollama_chat(messages)
            _ollama_cb.record_success()
            return result
        except Exception:
            _ollama_cb.record_failure()
            raise
"""

from __future__ import annotations

import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)


class CircuitBreakerOpen(Exception):
    """Raised when a call is attempted while the circuit breaker is open."""

    def __init__(self, name: str, retry_after: float = 0):
        self.name = name
        self.retry_after = retry_after
        super().__init__(f"Circuit breaker '{name}' is open — retry after {retry_after:.0f}s")


class CircuitBreaker:
    """Sliding-window circuit breaker for external service calls."""

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        window_seconds: float = 60.0,
        cooldown_seconds: float = 30.0,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.window_seconds = window_seconds
        self.cooldown_seconds = cooldown_seconds
        self._failures: list[float] = []  # timestamps of recent failures
        self._opened_at: float = 0.0

    def allow(self) -> bool:
        """Return True if the call should be attempted."""
        now = time.monotonic()
        self._prune(now)

        if self._opened_at > 0:
            if now - self._opened_at >= self.cooldown_seconds:
                # Half-open: allow one probe
                self._opened_at = 0
                logger.info("Circuit breaker '%s' half-open — probing", self.name)
                return True
            return False
        return True

    def record_success(self):
        """Record a successful call. Clears failure history — a success proves
        the service is healthy and closes the circuit if it was half-open."""
        now = time.monotonic()
        self._prune(now)
        if self._failures:
            logger.info("Circuit breaker '%s' — clearing %d failures after success", self.name, len(self._failures))
        self._failures.clear()
        self._opened_at = 0

    def record_failure(self):
        """Record a failed call. May open the circuit if threshold exceeded."""
        now = time.monotonic()
        self._failures.append(now)
        self._prune(now)

        if len(self._failures) >= self.failure_threshold and self._opened_at == 0:
            self._opened_at = now
            logger.warning(
                "Circuit breaker '%s' OPEN — %d failures in %.0fs, "
                "cooldown %.0fs",
                self.name, len(self._failures), self.window_seconds,
                self.cooldown_seconds,
            )

    def _prune(self, now: float):
        cutoff = now - self.window_seconds
        self._failures = [t for t in self._failures if t > cutoff]

    @property
    def is_open(self) -> bool:
        return self._opened_at > 0 and (
            time.monotonic() - self._opened_at < self.cooldown_seconds
        )

    @property
    def stats(self) -> dict:
        self._prune(time.monotonic())
        return {
            "name": self.name,
            "state": "open" if self.is_open else "closed",
            "failure_count": len(self._failures),
            "failure_threshold": self.failure_threshold,
            "cooldown_seconds": self.cooldown_seconds,
            "opened_at": self._opened_at if self._opened_at else None,
        }


# Global registry for the /debug/performance endpoint
_registry: dict[str, CircuitBreaker] = {}


def get_circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    cooldown_seconds: float = 30.0,
) -> CircuitBreaker:
    """Get or create a named circuit breaker singleton."""
    if name not in _registry:
        _registry[name] = CircuitBreaker(
            name=name,
            failure_threshold=failure_threshold,
            cooldown_seconds=cooldown_seconds,
        )
    return _registry[name]


def get_all_circuit_breaker_stats() -> list[dict]:
    return [cb.stats for cb in _registry.values()]
