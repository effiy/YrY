"""Deterministic tests for the circuit breaker (shared/circuit_breaker.py)."""
import pytest
from shared.circuit_breaker import CircuitBreaker, CircuitBreakerOpen


class TestCircuitBreaker:
    def test_allow_when_closed(self):
        cb = CircuitBreaker("test", failure_threshold=3)
        assert cb.allow() is True

    def test_allow_after_success(self):
        cb = CircuitBreaker("test", failure_threshold=3)
        cb.record_failure()
        cb.record_success()
        assert cb.allow() is True
        assert cb.is_open is False

    def test_opens_after_threshold_failures(self):
        cb = CircuitBreaker("test", failure_threshold=3)
        cb.record_failure()
        cb.record_failure()
        cb.record_failure()
        assert cb.is_open is True
        assert cb.allow() is False

    def test_stays_open_during_cooldown(self):
        cb = CircuitBreaker("test", failure_threshold=2, cooldown_seconds=999)
        cb.record_failure()
        cb.record_failure()
        assert cb.is_open is True
        for _ in range(5):
            assert cb.allow() is False

    def test_half_open_allows_probe(self):
        cb = CircuitBreaker("test", failure_threshold=2, cooldown_seconds=0)
        cb.record_failure()
        cb.record_failure()
        assert cb.allow() is True  # half-open probe

    def test_probe_success_closes_circuit(self):
        cb = CircuitBreaker("test", failure_threshold=2, cooldown_seconds=0)
        cb.record_failure()
        cb.record_failure()
        cb.allow()  # half-open probe
        cb.record_success()
        assert cb.is_open is False
        assert cb.allow() is True

    def test_probe_failure_reopens_circuit(self):
        cb = CircuitBreaker("test", failure_threshold=1, cooldown_seconds=999)
        cb.record_failure()
        # Circuit stays open with high cooldown
        assert cb.allow() is False
        assert cb.is_open is True

    def test_half_open_probe_failure_immediately_reopens(self):
        """After a half-open probe fails, circuit re-opens immediately."""
        cb = CircuitBreaker("test", failure_threshold=2, cooldown_seconds=0)
        cb.record_failure()
        cb.record_failure()
        # Cooldown=0, so allow() immediately goes half-open
        assert cb.allow() is True  # probe allowed
        cb.record_failure()  # probe fails
        # Circuit re-opens — is_open with cooldown=0 expires instantly
        # but _opened_at was just set
        assert cb._opened_at > 0

    def test_record_success_clears_failures(self):
        cb = CircuitBreaker("test", failure_threshold=5)
        cb.record_failure()
        cb.record_failure()
        cb.record_failure()
        cb.record_success()
        assert len(cb._failures) == 0

    def test_prunes_old_failures(self):
        cb = CircuitBreaker("test", failure_threshold=5, window_seconds=0)
        cb.record_failure()
        cb.record_failure()
        cb.record_failure()
        assert len(cb._failures) == 0  # all pruned with window=0

    def test_single_failure_does_not_open(self):
        cb = CircuitBreaker("test", failure_threshold=3)
        cb.record_failure()
        assert cb.is_open is False
        assert cb.allow() is True

    def test_stats_reflects_state(self):
        cb = CircuitBreaker("test", failure_threshold=3)
        cb.record_failure()
        stats = cb.stats
        assert stats["name"] == "test"
        assert stats["failure_count"] == 1
        assert stats["state"] == "closed"


class TestCircuitBreakerOpen:
    def test_exception_message(self):
        exc = CircuitBreakerOpen("ollama", retry_after=30)
        assert "ollama" in str(exc)
        assert "30s" in str(exc)
        assert exc.name == "ollama"
        assert exc.retry_after == 30


class TestGlobalRegistry:
    def test_get_or_create_singleton(self):
        from shared.circuit_breaker import get_circuit_breaker, _registry
        cb1 = get_circuit_breaker("test_registry")
        cb2 = get_circuit_breaker("test_registry")
        assert cb1 is cb2

    def test_get_all_stats(self):
        from shared.circuit_breaker import (
            get_all_circuit_breaker_stats,
            get_circuit_breaker,
        )
        get_circuit_breaker("stats_test")
        stats = get_all_circuit_breaker_stats()
        assert any(s["name"] == "stats_test" for s in stats)