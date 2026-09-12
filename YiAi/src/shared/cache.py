"""Unified cache manager — Redis primary + in-memory LRU fallback."""

import asyncio
import hashlib
import json
import time
from collections import OrderedDict
from typing import Any, Optional

from shared.config import settings
from shared.logging import get_logger

logger = get_logger(__name__)


class MemoryLRUCache:
    """LRU in-memory cache with TTL support."""

    def __init__(self, max_size: int = 1000):
        self._cache: OrderedDict[str, tuple[Any, float]] = OrderedDict()
        self.max_size = max_size

    def get(self, key: str) -> Optional[Any]:
        if key not in self._cache:
            return None
        value, ttl = self._cache[key]
        if ttl and time.time() > ttl:
            del self._cache[key]
            return None
        self._cache.move_to_end(key)
        return value

    def set(self, key: str, value: Any, ttl: int = 300):
        if key in self._cache:
            self._cache.move_to_end(key)
        self._cache[key] = (value, time.time() + ttl if ttl else float("inf"))
        if len(self._cache) > self.max_size:
            self._cache.popitem(last=False)

    def delete(self, key: str):
        self._cache.pop(key, None)

    def delete_pattern(self, pattern: str):
        prefix = pattern.rstrip("*")
        keys = [k for k in self._cache if k.startswith(prefix)]
        for k in keys:
            del self._cache[k]

    def flush(self):
        self._cache.clear()

    @property
    def size(self) -> int:
        return len(self._cache)


class CacheManager:
    """Unified cache: Redis primary, MemoryLRU fallback."""

    def __init__(self):
        self._redis = None
        self._memory = MemoryLRUCache(max_size=1000)
        self._redis_available = False
        self._key_prefix = "yiai:"
        self._locks: dict[str, asyncio.Lock] = {}

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

    async def get(self, key: str) -> Optional[Any]:
        full_key = f"{self._key_prefix}{key}"
        try:
            if self._redis_available:
                value = await self._redis.get(full_key)
                if value:
                    return json.loads(value)
            else:
                return self._memory.get(full_key)
        except Exception as e:
            logger.warning(f"[Cache] GET failed, falling back to memory: {e}")
            return self._memory.get(full_key)
        return None

    async def set(self, key: str, value: Any, ttl: int = 300):
        full_key = f"{self._key_prefix}{key}"
        try:
            if self._redis_available:
                await self._redis.setex(full_key, ttl, json.dumps(value, default=str))
            else:
                self._memory.set(full_key, value, ttl)
        except Exception as e:
            logger.warning(f"[Cache] SET failed: {e}")
            self._memory.set(full_key, value, ttl)

    async def delete(self, key: str):
        full_key = f"{self._key_prefix}{key}"
        try:
            if self._redis_available:
                await self._redis.delete(full_key)
            self._memory.delete(full_key)
        except Exception as e:
            logger.warning(f"[Cache] DELETE failed: {e}")

    async def delete_pattern(self, pattern: str):
        full_pattern = f"{self._key_prefix}{pattern}"
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
            self._memory.delete_pattern(full_pattern)
        except Exception as e:
            logger.warning(f"[Cache] DELETE_PATTERN failed: {e}")

    async def get_or_set(self, key: str, factory, ttl: int = 300) -> Any:
        """Cache-Aside: get cached value or compute and cache."""
        cached = await self.get(key)
        if cached is not None:
            return cached

        # Per-key lock to prevent cache stampede
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        async with self._locks[key]:
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

    @property
    def backend(self) -> str:
        return "redis" if self._redis_available else "memory"

    async def stats(self) -> dict:
        return {
            "backend": self.backend,
            "memory_size": self._memory.size,
            "memory_max_size": self._memory.max_size,
            "redis_available": self._redis_available,
        }


cache = CacheManager()