---
title: "Redis Caching Patterns for AI Applications: Semantic Cache, Session Cache, Rate Limiting, and Real-Time Features"
aliases:
  - Redis caching patterns
  - semantic cache
  - Redis AI caching
  - session cache
  - rate limiting
  - real-time features
tags:
  - data
  - Redis
  - caching
  - semantic-cache
  - rate-limiting
  - real-time
  - AI-caching
category: ai-engineer/data
created: 2026-08-07
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
roles:
  - ai-engineer
  - engineer
benefit: "Reduce LLM costs by 50-80% and latency by 10-100x using Redis for semantic caching, session management, rate limiting, and real-time feature serving in AI applications"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - mongodb-indexing.md
  - data-modeling.md
  - ../platform/ai-gateway-design.md
  - ../platform/model-routing-strategy.md
  - ../../engineer/engineering/rate-limiting.md
tacit: false
---

# Redis Caching Patterns for AI Applications

> **As an** AI engineer, **I want to** implement Redis caching patterns for AI applications, **so that** I can reduce LLM costs, accelerate response times, and build real-time AI features with sub-millisecond data access.

> Redis is the Swiss Army knife of AI infrastructure: it serves as a semantic cache, session store, rate limiter, feature store, and message broker -- all with sub-millisecond latency.

## Summary

- Redis is an in-memory data structure store that supports: strings, hashes, lists, sets, sorted sets, streams, and (via Redis Stack) vector similarity search and JSON documents.
- For AI applications, five key caching patterns: semantic cache (avoid redundant LLM calls), session cache (maintain conversation context), rate limiting (protect LLM API budgets), real-time feature serving (low-latency model inputs), and prompt/response deduplication (exact match cache).
- Semantic cache is the highest-impact pattern: it stores (query embedding, response) pairs and returns cached responses for new queries whose embedding similarity exceeds a threshold, reducing LLM costs by 50-80% for repeated queries.
- Redis Stack adds vector search capability (HNSW index), enabling semantic cache without a separate vector database.
- Redis is single-threaded for command execution, so O(N) commands (KEYS, SMEMBERS on large sets, HGETALL on large hashes) block the event loop. Use SCAN, SSCAN, HSCAN for production.

## Core viewpoints

### 1. Semantic cache is the single highest-ROI optimization for LLM applications

The economics are compelling: an LLM API call costs $0.01-0.10 and takes 500-2000ms. A Redis cache lookup costs $0.00001 and takes < 1ms. For applications with repeated or similar queries (customer support, RAG-based Q&A, internal tools), 50-80% of queries can be served from cache. The semantic cache key is the query embedding (not the raw query string), so semantically similar queries ("How do I reset my password?" and "I forgot my password, help!") map to the same cache entry. Implementation: embed the query, search Redis vector index for similar embeddings, return cached response if cosine similarity > 0.95.

### 2. Redis is the ideal session store for LLM conversations -- but session size must be managed

LLM conversations accumulate context: system prompt, user messages, assistant responses, tool calls, and tool results. A 20-turn conversation can easily exceed 50KB. Storing the full conversation in Redis enables: (a) stateless API servers (any server can handle any request), (b) conversation persistence across server restarts, (c) shared conversation context across multiple services. The key pattern: `session:{session_id}` -> JSON with conversation history. Must set TTL to auto-expire old sessions (default: 1 hour idle, 24 hours max). Do not store conversations in-memory in the application server -- this creates sticky sessions and loses data on restart.

### 3. Rate limiting with Redis sliding window is the most accurate pattern for LLM API protection

LLM APIs are expensive and rate-limited by providers. Redis-based rate limiting protects against: (a) a single user consuming the entire API budget, (b) a bug causing infinite retry loops, (c) malicious abuse. The sliding window algorithm (using sorted sets) is the most accurate: each request adds a timestamp to a sorted set, expired entries are removed, and the count of remaining entries is the current rate. Alternative: token bucket (using Redis lists or Lua scripts) for burst-tolerant limiting. Key pattern: `ratelimit:{user_id}:{model}` -> sorted set of timestamps with TTL.

### 4. Redis Streams is the underrated pattern for real-time AI event processing

Redis Streams provides a lightweight, high-performance message broker for AI event processing: (a) streaming LLM tokens to clients (SSE replacement), (b) async processing of embedding generation, (c) real-time RAG index updates, (d) distributed agent communication. Redis Streams is simpler than Kafka and sufficient for most AI workloads that do not require Kafka's durability guarantees. Key pattern: `XADD stream:llm_tokens * token "Hello" -> XREAD BLOCK 0 STREAMS stream:llm_tokens $`.

## Key info

### Redis caching patterns for AI

| Pattern | Redis data structure | Key format | TTL | Cost reduction | Latency improvement |
|---|---|---|---|---|---|
| Semantic cache | Vector + String | `semcache:{query_hash}` | 1 hour | 50-80% | 100-1000x |
| Exact match cache | String | `cache:{prompt_hash}` | 1 hour | 10-30% | 100-1000x |
| Session store | String (JSON) | `session:{session_id}` | 1 hour idle | N/A | 10-50x (vs. DB) |
| Rate limiting | Sorted Set | `ratelimit:{user_id}:{model}` | Window size | Budget protection | N/A |
| Feature store | Hash | `features:{entity_id}` | Varies | N/A | 100-1000x |
| Token streaming | Stream | `stream:llm_tokens` | Consumer ACK | N/A | Real-time |
| Embedding cache | String | `embed:{text_hash}` | 24 hours | 10-20% | 10-50x |
| Deduplication | String (SET NX) | `dedup:{request_id}` | 5 minutes | Prevents double-charge | N/A |

### Semantic cache implementation

```python
import redis
import numpy as np
from openai import OpenAI

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
client = OpenAI()

def get_embedding(text: str) -> list[float]:
    """Get embedding for text, with Redis cache."""
    text_hash = hashlib.sha256(text.encode()).hexdigest()
    cached = r.get(f"embed:{text_hash}")
    if cached:
        return json.loads(cached)

    embedding = client.embeddings.create(
        model="text-embedding-3-small", input=text
    ).data[0].embedding

    r.setex(f"embed:{text_hash}", 86400, json.dumps(embedding))
    return embedding

def semantic_cache_query(query: str, similarity_threshold: float = 0.95) -> Optional[str]:
    """Check semantic cache for similar query."""
    query_embedding = get_embedding(query)

    # Search Redis vector index for similar embeddings
    results = r.ft("semcache_idx").search(
        Query(f"*=>[KNN 1 @embedding $vec AS score]")
        .return_fields("response", "score")
        .dialect(2),
        {"vec": np.array(query_embedding, dtype=np.float32).tobytes()}
    )

    if results.docs and float(results.docs[0].score) >= similarity_threshold:
        return results.docs[0].response

    return None

def store_in_semantic_cache(query: str, response: str):
    """Store query-response pair in semantic cache."""
    embedding = get_embedding(query)
    query_hash = hashlib.sha256(query.encode()).hexdigest()

    r.ft("semcache_idx").add_document(
        Document(
            id=f"semcache:{query_hash}",
            embedding=np.array(embedding, dtype=np.float32).tobytes(),
            response=response
        )
    )
    r.expire(f"semcache:{query_hash}", 3600)
```

### Sliding window rate limiter

```python
import time
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def is_rate_limited(user_id: str, model: str, max_requests: int, window_seconds: int) -> bool:
    """Check if user has exceeded rate limit for a model."""
    key = f"ratelimit:{user_id}:{model}"
    now = time.time()
    window_start = now - window_seconds

    # Use Lua script for atomicity
    lua_script = """
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window_start = tonumber(ARGV[2])
    local max_requests = tonumber(ARGV[3])

    -- Remove expired entries
    redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

    -- Count current requests
    local count = redis.call('ZCARD', key)

    if count >= max_requests then
        return 1  -- Rate limited
    end

    -- Add current request
    redis.call('ZADD', key, now, now .. ':' .. math.random())
    redis.call('EXPIRE', key, window_seconds)
    return 0  -- Allowed
    """

    result = r.eval(lua_script, 1, key, now, window_start, max_requests)
    return result == 1
```

### Session store pattern

```python
import json
import redis
from typing import Optional

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

class ConversationSession:
    def __init__(self, session_id: str, ttl_idle: int = 3600, ttl_max: int = 86400):
        self.session_id = session_id
        self.key = f"session:{session_id}"
        self.ttl_idle = ttl_idle

    def get_messages(self) -> list[dict]:
        """Get conversation history."""
        data = r.get(self.key)
        if data:
            r.expire(self.key, self.ttl_idle)  # Refresh TTL
            return json.loads(data)
        return []

    def add_message(self, role: str, content: str):
        """Add a message to the conversation."""
        messages = self.get_messages()
        messages.append({"role": role, "content": content})

        # Truncate to last 50 messages to manage size
        if len(messages) > 50:
            messages = messages[-50:]

        r.setex(self.key, self.ttl_idle, json.dumps(messages))

    def clear(self):
        """Clear the session."""
        r.delete(self.key)

    def get_context_window(self, max_tokens: int = 4000) -> list[dict]:
        """Get messages fitting within token budget (simple char-based estimate)."""
        messages = self.get_messages()
        result = []
        total_chars = 0
        for msg in reversed(messages):
            msg_chars = len(msg["content"])
            if total_chars + msg_chars > max_tokens * 4:  # ~4 chars per token
                break
            result.insert(0, msg)
            total_chars += msg_chars
        return result
```

### Memory and performance

| Pattern | Memory per entry | Latency | Throughput (single Redis) |
|---|---|---|---|
| Semantic cache (768-dim) | ~5 KB | < 1ms (cache hit), 1-10ms (cache miss) | 10K-50K ops/s |
| Session store (20 messages) | ~50 KB | < 1ms | 100K ops/s |
| Rate limiting (sorted set) | ~1 KB per request | < 1ms | 100K ops/s |
| Feature store (hash, 100 fields) | ~10 KB | < 1ms | 100K ops/s |
| Token streaming (stream) | ~100 bytes per message | < 1ms | 100K-1M msgs/s |

### Redis deployment considerations for AI

| Consideration | Recommendation |
|---|---|
| Memory sizing | Budget 2-4x working set for peak load + Redis overhead |
| Persistence | AOF every second for sessions; RDB for cache (acceptable to lose) |
| High availability | Redis Sentinel or Redis Cluster (sharding) |
| Vector search | Redis Stack (includes RediSearch with vector similarity) |
| Max memory policy | `allkeys-lru` for cache, `noeviction` for session/rate limiting |
| Connection pooling | Use connection pool (min 10, max 50 per worker) |
| Pipeline | Use pipelining for batch operations to reduce round trips |

## Action recommendations

1. Implement semantic cache as the first optimization: it provides the highest ROI (50-80% cost reduction) for LLM applications with repeated queries.
2. Use Redis Stack for semantic cache to avoid adding a separate vector database. The HNSW index in Redis Stack handles up to ~10M vectors.
3. Use Redis as the session store for LLM conversations. Set TTL (1 hour idle, 24 hours max) and truncate to last 50 messages to manage size.
4. Implement sliding window rate limiting with Redis sorted sets + Lua scripts for atomicity. Protect LLM API budgets per user and per model.
5. Use Redis Streams for real-time LLM token streaming to clients. It is simpler than Kafka and sufficient for most AI workloads.
6. Set `maxmemory-policy` appropriately: `allkeys-lru` for caches, `noeviction` for data that must not be lost (sessions, rate limit counters).
7. Monitor Redis memory usage, hit rate, and eviction rate. A low hit rate or high eviction rate indicates insufficient memory or inappropriate TTL settings.

## Anti-patterns

- **Using KEYS command in production**: O(N) and blocks the Redis event loop. Use SCAN instead.
- **Semantic cache with too-low similarity threshold**: returns irrelevant cached responses. Use threshold >= 0.95.
- **No TTL on cache entries**: cache grows indefinitely, eventually evicting useful data or causing OOM.
- **Storing full conversation history without truncation**: conversations can grow to hundreds of KB, causing memory pressure. Truncate to last 50 messages.
- **Using Redis as the primary database for critical data**: Redis is an in-memory store. AOF persistence helps but is not a replacement for a durable database.
- **Not using connection pooling**: creating a new connection per request adds latency and exhausts file descriptors.
- **Single Redis instance for all patterns**: mixing cache (ephemeral) and session data (needs persistence) on the same instance with the same eviction policy causes data loss. Use separate instances or databases.
- **Not monitoring Redis memory and eviction**: silent eviction of rate limit counters or session data causes subtle bugs.

## Related

- Same category: [mongodb-indexing-summary.md](./mongodb-indexing.md), [data-modeling-summary.md](./data-modeling.md)
- Platform: [../platform/ai-gateway-design.md](../platform/ai-gateway-design.md) (gateway-level caching), [../platform/model-routing-strategy.md](../platform/model-routing-strategy.md) (routing that integrates with cache)
- Infrastructure: [../../engineer/engineering/rate-limiting.md](../../engineer/engineering/rate-limiting.md) (rate limiting patterns)

## References

- Redis Stack: https://redis.io/docs/latest/develop/get-started/vector-database/
- Redis Vector Search: https://redis.io/docs/latest/develop/interact/search-and-query/advanced-concepts/vectors/
- Redis Streams: https://redis.io/docs/latest/develop/data-types/streams/
- GPTCache: https://github.com/zilliztech/GPTCache
- Redis rate limiting: https://redis.io/glossary/rate-limiting/