---
title: "服务端接口响应速度优化实施记录"
tags: ["performance", "optimization", "caching", "gzip", "async", "middleware", "orjson", "tracing", "health-check", "lifecycle", "memory-leak"]
category: "devs"
created: "2026-09-17"
updated: "2026-09-17"
source: "claude"
type: "implementation"
status: "done"
---

# 服务端接口响应速度优化

> 2026-09-17 实施，四轮共 19 项优化，面向 YiAi 全部接口。

## 优化总览

### 第一轮：基础架构（7 项）
| # | 优化项 | 文件 |
|---|--------|------|
| 1 | GZip 压缩中间件 | `app.py` |
| 2 | 响应时间追踪 (`X-Response-Time-Ms`) | `middleware.py` |
| 3 | 修复 `rag_chat_stream` mode 变量 bug | `engine.py` |
| 4 | `rag_query` 异步化 + HyDE 非阻塞 | `engine.py`, `rag_service.py`, `rag.py` |
| 5 | Regex 编译缓存 (`@lru_cache`) | `repository.py` |
| 6 | Cache-Aside 缓存层接入 (9 端点) | `knowledge.py`, `rag.py`, `about.py`, `system.py` |
| 7 | 菜单写操作缓存失效 | `system.py` |

### 第二轮：序列化与追踪（5 项）
| # | 优化项 | 文件 |
|---|--------|------|
| 8 | orjson 替代 stdlib json (2-5×) | `response.py`, `app.py` |
| 9 | X-Request-ID 分布式追踪 | `middleware.py`, `app.py` |
| 10 | Cache-Control + ETag 响应头 | `response.py`, 4 个路由文件 |
| 11 | MongoDB 排序优化 + 缓存失效完善 | `repository.py`, `knowledge.py` |
| 12 | 启动缓存预热 (menus + knowledge) | `app.py` |

### 第三轮：可观测性与运维（4 项）
| # | 优化项 | 文件 |
|---|--------|------|
| 13 | 健康检查增强 (K8s liveness/readiness) | `health.py` |
| 14 | MongoDB 查询超时 + 连接池调优 | `database.py`, `repository.py` |
| 15 | 结构化日志 (request_id 注入) | `logging.py`, `middleware.py` |
| 16 | 代码清理 (移除未使用导入) | `knowledge.py`, `cache_keys.py` |

### 第四轮：生命周期与内存安全（3 项）
| # | 优化项 | 文件 |
|---|--------|------|
| 17 | 修复 cache._locks 内存泄漏 | `cache.py` |
| 18 | HTTP 客户端生命周期管理 | `engine.py`, `rag/__init__.py`, `app.py` |
| 19 | MongoDB appName 标识 + 超时配置 | `database.py`, `config.py` |

## 详细说明

### 17. Cache Locks 内存泄漏修复 (`src/shared/cache.py`)

原实现中 `get_or_set` 的 `_locks[key] = asyncio.Lock()` 永久保留每个缓存键的锁对象，导致内存随时间线性增长：

```python
# 修复前 — 锁对象永不释放
if key not in self._locks:
    self._locks[key] = asyncio.Lock()

# 修复后 — try/finally 确保锁在计算完成后立即释放
lock = self._locks.setdefault(key, asyncio.Lock())
try:
    async with lock: ...
finally:
    self._locks.pop(key, None)
```

### 18. HTTP 客户端生命周期 (`src/domain/rag/engine.py`)

- `_get_http_client()` 创建的共享 `httpx.AsyncClient` 现由应用管理生命周期
- 新增 `close_http_client()` 函数，通过 `domain/rag/__init__.py` 导出
- `app.py` lifespan 的 shutdown 阶段调用 `await close_http_client()` 确保连接池优雅关闭

### 19. MongoDB 驱动标识 (`src/data/database.py`)

- `appname="YiAi"` 使 MongoDB 慢查询日志和 `db.currentOp()` 可识别应用来源
- `mongodb_query_timeout_ms: 30000` 新增到 `config.py` Settings，可通过 `config.yaml` 覆盖

## 中间件管道

```
Request → BodySizeLimit → RequestId → ResponseTime → CORS → GZip → Auth → Route
```

| 中间件 | 职责 | 顺序原因 |
|--------|------|----------|
| `BodySizeLimitMiddleware` | 拒绝超大请求 (413) | 最外层，拒绝后无需后续处理 |
| `RequestIdMiddleware` | 生成/传播 X-Request-ID | 在计时前分配，注入日志上下文 |
| `ResponseTimeMiddleware` | 计算处理耗时 | 包裹所有业务逻辑 |
| `CORSMiddleware` | CORS 头处理 | 压缩前添加，确保压缩响应也有 CORS 头 |
| `GZipMiddleware` | JSON 压缩 (min 512B) | 最内层，对 SSE 自动跳过 |

## 缓存矩阵

| 端点 | 服务端 TTL | HTTP max-age | 失效触发器 |
|------|-----------|-------------|-----------|
| `/knowledge-scan` | 30s | 30s | write/delete/sync |
| `/knowledge-stories` | 30s | 30s | write/delete/sync |
| `/knowledge-bugs` | 30s | 30s | write/delete/sync |
| `/knowledge-files` | 30s | 30s | write/delete/sync |
| `/knowledge-read` | — | 30s | — |
| `/knowledge-bug-read` | — | 30s | — |
| `/rag-status` | 10s | 10s | TTL |
| `/rag-categories` | 30s | 30s | sync |
| `/about/index` | 1h | 3600 | TTL |
| `/system/menus` | 1h | 3600 | CRUD |
| `/system/scheduler` | 30s | 30s | TTL |

## MongoDB 连接配置

```yaml
mongodb:
  pool_size: 10
  max_pool_size: 50
  query_timeout_ms: 30000
# 驱动参数:
#   appname: YiAi
#   maxConnecting: 2
#   socketTimeoutMS: 30000
#   connectTimeoutMS: 5000
#   serverSelectionTimeoutMS: 5000
```

## 健康检查端点

| 端点 | 用途 | 检查内容 |
|------|------|----------|
| `GET /health/live` | K8s liveness | 仅应用存活 |
| `GET /health/ready` | K8s readiness | MongoDB ping |
| `GET /health` | 全量检查 | MongoDB + Ollama + 磁盘 |
| `GET /health/observer` | Observer 状态 | 限流/采样/沙箱配置 |

## 相关 PRD 任务

- `29-prd-task-数据查询缓存层.md`
- `47-prd-task-响应压缩优化.md`
- `53-prd-task-ETag缓存验证.md`
- `70-prd-task-缓存智能失效.md`
- `75-prd-task-查询计划缓存优化.md`
- `97-prd-task-自适应压缩传输.md`
- `113-prd-task-全链路TraceID透传.md`
- `159-prd-task-响应压缩与传输优化.md`