"""Unified cache manager — Redis primary + in-memory fallback with per-entry TTL.

The in-memory fallback uses a dict of ``(value, expire_at)`` tuples so per-entry
TTL is respected (unlike ``cachetools.TTLCache`` which uses a single global TTL).
"""

import asyncio
import time
from typing import Any

import orjson

from shared.config import settings
from shared.logging import get_logger

logger = get_logger(__name__)


class CacheManager:
    """Unified cache: Redis primary, dict-with-expiry memory fallback."""

    def __init__(self):
        self._redis = None
        self._memory: dict[str, tuple[Any, float]] = {}
        self._redis_available = False
        self._key_prefix = "yiai:"
        self._locks: dict[str, asyncio.Lock] = {}
        self._max_memory_entries = 1000

    async def initialize(self):
        """Initialize Redis connection if configured."""
        try:
            redis_url = getattr(settings, "redis_url", None)
            if redis_url:
                import redis.asyncio as redis

                self._redis = redis.from_url(
                    redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                )
                await self._redis.ping()
                self._redis_available = True
                logger.info("[Cache] Redis connected")
            else:
                logger.info("[Cache] Redis not configured, using memory cache")
        except Exception as e:
            logger.warning(f"[Cache] Redis unavailable, fallback to memory: {e}")
            self._redis_available = False

    async def get(self, key: str) -> Any | None:
        full_key = f"{self._key_prefix}{key}"
        try:
            if self._redis_available:
                value = await self._redis.get(full_key)
                if value:
                    import json
                    return json.loads(value)
            else:
                entry = self._memory.get(full_key)
                if entry is not None:
                    val, expire_at = entry
                    if time.monotonic() < expire_at:
                        return val
                    del self._memory[full_key]
        except Exception as e:
            logger.warning(f"[Cache] GET failed, falling back to memory: {e}")
            entry = self._memory.get(full_key)
            if entry is not None:
                val, expire_at = entry
                if time.monotonic() < expire_at:
                    return val
                del self._memory[full_key]
        return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        full_key = f"{self._key_prefix}{key}"
        try:
            if self._redis_available:
                await self._redis.setex(full_key, ttl, orjson.dumps(value, default=str).decode())
            else:
                self._memory[full_key] = (value, time.monotonic() + ttl)
                self._evict_if_needed()
        except Exception as e:
            logger.warning(f"[Cache] SET failed: {e}")
            self._memory[full_key] = (value, time.monotonic() + ttl)

    def _evict_if_needed(self):
        """Remove oldest entries if memory cache exceeds max size."""
        if len(self._memory) <= self._max_memory_entries:
            return
        # Evict 10% of entries (oldest by expire time)
        excess = len(self._memory) - int(self._max_memory_entries * 0.9)
        if excess <= 0:
            return
        sorted_keys = sorted(self._memory.keys(), key=lambda k: self._memory[k][1])
        for k in sorted_keys[:excess]:
            del self._memory[k]

    async def delete(self, key: str):
        full_key = f"{self._key_prefix}{key}"
        try:
            if self._redis_available:
                await self._redis.delete(full_key)
            self._memory.pop(full_key, None)
        except Exception as e:
            logger.warning(f"[Cache] DELETE failed: {e}")

    async def delete_pattern(self, pattern: str):
        full_pattern = f"{self._key_prefix}{pattern}"
        prefix = full_pattern.rstrip("*")
        try:
            if self._redis_available:
                cursor = 0
                while True:
                    cursor, keys = await self._redis.scan(
                        cursor, match=full_pattern, count=100
                    )
                    if keys:
                        await self._redis.delete(*keys)
                    if cursor == 0:
                        break
            keys = [k for k in self._memory if k.startswith(prefix)]
            for k in keys:
                del self._memory[k]
        except Exception as e:
            logger.warning(f"[Cache] DELETE_PATTERN failed: {e}")

    async def get_or_set(self, key: str, factory, ttl: int = 300) -> Any:
        """Cache-Aside: get cached value or compute and cache.

        Uses a per-key asyncio.Lock to prevent cache stampede (only one
        caller recomputes the value while others wait). The lock is removed
        after use to avoid unbounded memory growth from one-off keys.
        """
        cached = await self.get(key)
        if cached is not None:
            return cached

        # Per-key lock to prevent cache stampede — cleaned up in finally
        lock = self._locks.setdefault(key, asyncio.Lock())
        try:
            async with lock:
                # Double-check after acquiring lock
                cached = await self.get(key)
                if cached is not None:
                    return cached

                if asyncio.iscoroutinefunction(factory):
                    value = await factory()
                else:
                    value = factory()

                if value is not None:
                    await self.set(key, value, ttl)
                return value
        finally:
            self._locks.pop(key, None)

    @property
    def backend(self) -> str:
        return "redis" if self._redis_available else "memory"

    async def stats(self) -> dict:
        return {
            "backend": self.backend,
            "memory_size": len(self._memory),
            "memory_max_size": self._max_memory_entries,
            "redis_available": self._redis_available,
        }


cache = CacheManager()
