---

doc_type: test
title: "YA-08-07: Dashboard 健康聚合 API — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-07"
source_prds: ["07-需求-Dashboard健康聚合API"]
source_modules: ["07-prd-task-Dashboard健康聚合API"]
source_okr: [yiai-001]

type: test
---

# YA-08-07: Dashboard 健康聚合 API — 测试规格

> 来源 PRD：[07-需求-Dashboard健康聚合API.md](../../prds/2026-08/07-需求-Dashboard健康聚合API.md)
> 开发方案：[07-prd-task-Dashboard健康聚合API.md](../../devs/2026-08/07-prd-task-Dashboard健康聚合API.md)
> 需求编号：YA-08-07 -- 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 7 个子路由的数据聚合和降级。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 各子系统） | 每次提交 |
| L2 集成 | pytest + httpx + TestClient | YiAi 服务（mock 外部） | 每次提交 |
| L4 端到端 | 手动 + curl | 真实 MongoDB + Ollama | 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `GET /dashboard/ai` — 模型列表 + Token 用量 | L2 |
| COV-2 | `GET /dashboard/rag` — 索引大小 + 文档数 | L2 |
| COV-3 | `GET /dashboard/knowledge` — 文件数 + 分类统计 | L2 |
| COV-4 | `GET /dashboard/rss` — Feed 源数 + 最近更新 | L2 |
| COV-5 | `GET /dashboard/performance` — 请求量 + P95 延迟 | L2 |
| COV-6 | `GET /dashboard/organization` — 用户/项目/活跃度 | L2 |
| COV-7 | `GET /dashboard/health` — 各依赖连通性 | L2 |
| COV-8 | 降级行为：单子系统不可用 | L2 |
| COV-9 | 并行查询（asyncio.gather） | L1 |
| COV-10 | 缓存策略（10s TTL） | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `health_response` | 完整 7 子系统健康状态的 JSON | 响应格式验证 |
| `mock_mongo_status` | `{connected: true, database: "test"}` | MongoDB 连通性 mock |
| `mock_ollama_status` | `{connected: true, model_count: 5, url: "..."}` | Ollama 状态 mock |
| `mock_collection_counts` | `{menus: 25, users: 12, sessions: 150, ...}` | 集合计数 mock |

---

## 二、7 子路由验证

### 2.1 AI 子路由（COV-1 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-01 | `/dashboard/ai` 返回模型列表 + Token 用量 | 1. Mock Ollama `/api/tags` 返回 3 个模型；2. GET `/dashboard/ai` | 返回 `{models: [...], token_usage: {...}}` | P0 | 已完成 |
| UT-DB-02 | AI 路由 Ollama 不可达 → 降级 | 1. Mock Ollama 连接失败；2. 请求 | 返回 `{status: "unavailable"}`, 其他子路由不受影响 | P0 | 待实现 |
| UT-DB-03 | AI 路由返回模型详细信息 | 1. 请求 `/dashboard/ai` | 每个模型含 `name`/`size`/`modified_at` | P1 | 待实现 |

### 2.2 RAG 子路由（COV-2 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-04 | `/dashboard/rag` 返回索引大小 + 文档数 | 1. Mock RAG 引擎元数据 | 返回 `{index_size_mb, document_count, last_indexed}` | P0 | 已完成 |
| UT-DB-05 | RAG 索引为空 → 返回 0 | 1. 无索引数据 | `document_count = 0`, `index_size_mb = 0` | P1 | 待实现 |

### 2.3 Knowledge 子路由（COV-3 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-06 | `/dashboard/knowledge` 返回文件数 + 分类统计 | 1. Mock knowledge_files 集合 | 返回 `{total_files, by_category: {...}, by_role: {...}}` | P0 | 已完成 |
| UT-DB-07 | Knowledge Watcher 运行状态 | 1. 请求 knowledge 健康信息 | 包含 `watcher_running` 字段 | P1 | 待实现 |

### 2.4 RSS 子路由（COV-4 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-08 | `/dashboard/rss` 返回 Feed 源数 + 最近更新 | 1. Mock rss_feeds/entries 集合 | 返回 `{total_feeds, total_entries, last_fetch}` | P0 | 已完成 |
| UT-DB-09 | RSS 调度器状态 | 1. 请求 rss 信息 | 包含 `scheduler_running` 和 `next_run` 时间 | P1 | 待实现 |

### 2.5 Performance 子路由（COV-5 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-10 | `/dashboard/performance` 返回请求量 + P95 延迟 | 1. Mock 性能计数器 | 返回 `{request_count, p95_latency_ms, avg_latency_ms}` | P0 | 已完成 |
| UT-DB-11 | Performance 路由空数据 → 返回 0 | 1. 无历史性能数据 | 各项指标为 0 | P1 | 待实现 |

### 2.6 Organization 子路由（COV-6 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-12 | `/dashboard/organization` 返回用户/项目/活跃度 | 1. Mock users/sessions 集合 | 返回 `{total_users, total_projects, active_users_7d}` | P0 | 已完成 |
| UT-DB-13 | Organization 统计准确性 | 1. 预置 10 个用户、5 个活跃用户；2. 请求 | `active_users_7d = 5` | P1 | 待实现 |

### 2.7 Health 聚合路由（COV-7 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-14 | `/dashboard/health` 返回 7 子系统完整状态 | 1. 所有子系统正常；2. GET `/dashboard/health` | 返回 `{server, mongodb, scheduler, knowledge_watcher, ollama, observer, collections}` | P0 | 已完成 |
| UT-DB-15 | MongoDB 连通性检查 | 1. Mock `db.command("ping")` | `mongodb.connected = true` | P0 | 待实现 |
| UT-DB-16 | Ollama 连通性检查（5s 超时） | 1. Mock Ollama `/api/tags` | `ollama.connected = true, model_count > 0` | P0 | 待实现 |
| UT-DB-17 | Collections 计数 7 个集合 | 1. Mock 各集合 count_documents | `collections` 包含 `menus/users/roles/departments/sessions/knowledge_files/rss_sources` | P0 | 待实现 |
| UT-DB-18 | Server uptime 计算 | 1. 服务器运行 3600s | `server.uptime_seconds` ≈ 3600（±1s） | P1 | 待实现 |

---

## 三、降级行为（COV-8 . L2）

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-DB-19 | Ollama 不可达 | 1. Mock Ollama 连接失败；2. GET `/dashboard/health` | 返回 200，`ollama.connected = false`，`model_count = 0`，其他子系统正常 | P0 | 已完成 |
| UT-DB-20 | MongoDB 不可达 | 1. Mock MongoDB ping 失败；2. 请求 | 返回 200，`mongodb.connected = false`，collections 计数为 0 | P0 | 已完成 |
| UT-DB-21 | 部分集合计数失败 | 1. Mock `sessions` 集合不存在；2. 请求 | `collections.sessions = 0`，其他集合计数正常 | P0 | 待实现 |
| UT-DB-22 | RSS 调度器未启动 | 1. scheduler_manager 为 None | `scheduler.enabled = false`，不抛 AttributeError | P1 | 待实现 |
| UT-DB-23 | 全部子系统并行查询 | 1. 检查请求延迟 | 总延迟 = max(各子系统)，不是 sum | P0 | 已完成 |
| UT-DB-24 | 单一子系统异常不阻塞整体 | 1. Ollama 5s 超时；2. 请求 | 整体在 5s 内返回，mongodb/knowledge 等正常 | P0 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DB-EDGE-001 | 缓存命中时不再执行检查 | 1. 首次请求（缓存 miss）；2. 10s 内再次请求 | 第二次请求 < 10ms（缓存命中），不触发实际检查 | P1 | 待实现 |
| TC-DB-EDGE-002 | 缓存过期后重新检查 | 1. 等待 11s；2. 再次请求 | 触发新的健康检查（缓存过期） | P1 | 待实现 |
| TC-DB-EDGE-003 | 并发请求缓存击穿保护 | 1. 缓存过期时 3 个并发请求 | `asyncio.Lock` 保护，仅 1 个请求执行检查，其他等待缓存 | P2 | 待实现 |
| TC-DB-EDGE-004 | 新增 MongoDB 集合后自动发现 | 1. 新增 `audit_logs` 集合 | 使用 `list_collection_names()` 动态发现，Dashboard 自动包含新集合 | P1 | 待实现 |
| TC-DB-EDGE-005 | Ollama 高负载时超时 → degraded 而非 unhealthy | 1. Ollama 推理 CPU 100%，API 响应 8s | 返回 `{status: "degraded", latency_ms: 8000}`，非 `unhealthy` | P2 | 待实现 |
| TC-DB-EDGE-006 | estimated_document_count 使用（精度 vs 性能） | 1. 大集合 50 万文档；2. 计数 | 使用 `estimated_document_count()`，< 1ms，Dashboard 标注 "近似值" | P2 | 待实现 |

---

## 五、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-DB-REG-001 | 缺陷 1：新增集合后 Dashboard 不显示 | 新增 audit_logs 集合 | 动态发现自动包含新集合 | P1 | 待实现 |
| TC-DB-REG-002 | 缺陷 2：asyncio.gather 因锁串行化 | MongoDB + Ollama 共享连接池 | 各子系统独立连接，真正并行 | P1 | 待实现 |
| TC-DB-REG-003 | 缺陷 3：Ollama 高负载超时误报 unhealthy | Ollama CPU 100% 时 API 超时 | 区分 "degraded"（超时）和 "unhealthy"（连接失败） | P2 | 待实现 |
| TC-DB-REG-004 | 缺陷 5：缓存不考虑事件驱动的状态变更 | MongoDB 宕机 2s 恢复后缓存仍显示异常 | 事件驱动缓存失效 | P2 | 待实现 |

---

## 六、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 7 子路由各返回正确数据 | AI/RAG/Knowledge/RSS/Performance/Organization/Health | UT-DB-01 ~ 18 |
| FR-02 降级行为 | 单子系统不可用不影响整体 | UT-DB-19 ~ 24 |
| FR-03 并行查询 | asyncio.gather 总延迟 = max | UT-DB-23 |
| FR-04 缓存 10s TTL | 缓存命中/过期/击穿 | TC-DB-EDGE-001 ~ 003 |
| FR-05 动态集合发现 | 新集合自动包含 | TC-DB-EDGE-004 |

---

## 七、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | `/dashboard/stats` 统计聚合未测试 | 跨系统统计功能未验证 | 补充 stats 端点测试 |
| G-2 | `/dashboard/trends` 趋势数据未测试 | 时序趋势分析未验证 | 补充 trends 端点测试 |
| G-3 | `/dashboard/alerts` 告警规则未测试 | 阈值告警功能未验证 | 补充 alerts 端点测试 |
| G-4 | 真实 Ollama 健康检查（非 mock） | mock 无法验证 ollama.list() 真实响应 | 手动 L4 端到端测试 |
| G-5 | 子系统健康历史记录 | 无趋势存储和查询 | 实现后补充 |