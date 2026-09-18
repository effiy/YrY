---
type: okr-goal
id: yiai-001
title: "后端稳定性与可靠性修复"
status: completed
period: "2026 Q3"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 100
updated: 2026-09-14
kr1: "RAG 引擎增量索引修复 + Embedding 维度校验 — 文件删除场景不丢数据、维度不匹配时拒绝而非崩溃"
kr1_completion: 100
kr2: "MongoDB 连接池优化 + Cursor 泄漏清零 + 聚合超时控制 — 连接池利用率 <60%，零泄漏"
kr2_completion: 100
kr3: "Agent 分层超时保护 + SSE 错误传播 + 异步生成器资源管理 — 100% 外部 I/O 有超时"
kr3_completion: 100
kr4: "RPC 参数白名单校验 + 未知参数 WARNING — 前端参数名错误不再静默忽略"
kr4_completion: 100
kr5: "测试体系从 76 → 570 用例，shared 模块 100% 覆盖率"
kr5_completion: 100
metric1_id: "yiai-m01"
metric1_desc: "MongoDB 连接池峰值利用率"
metric1_current: "<60%"
metric1_target: "<80%"
metric2_id: "yiai-m02"
metric2_desc: "Cursor 泄漏数"
metric2_current: "0"
metric2_target: "0"
metric3_id: "yiai-m03"
metric3_desc: "RAG 增量索引成功率"
metric3_current: "100%"
metric3_target: ">99%"
metric4_id: "yiai-m04"
metric4_desc: "测试用例总数"
metric4_current: "570"
metric4_target: "≥500"
metric5_id: "yiai-m05"
metric5_desc: "shared 模块覆盖率"
metric5_current: "100%"
metric5_target: "≥90%"
related_prds:
  - projects/yiai/prds/2026-09/05-需求-RAG引擎.md
  - projects/yiai/prds/2026-09/06-需求-数据层.md
  - projects/yiai/prds/2026-09/07-需求-Agent可靠性.md
  - projects/yiai/prds/2026-09/08-需求-API契约校验.md
  - projects/yiai/prds/2026-09/09-需求-审计日志.md
---

# 后端稳定性与可靠性修复

> Q3 核心工程目标。系统性修复 YiAi 后端四个关键领域的稳定性缺陷——RAG 引擎、MongoDB 数据层、Agent 循环、API 契约——将可靠性从"开发可用"提升至"生产就绪"。**全部交付，570 个测试用例通过。**

---

## 背景

2026 年上半年快速迭代后，YiAi 后端积累了四类技术债务，每类在特定场景下触发服务降级或静默失败：

**RAG 引擎脆弱**：增量索引只处理新增和更新，不处理删除——YiKnowledge 中删除文件后，MongoDB 和向量索引中的旧数据残留，检索时返回已不存在的文档。Embedding 模型切换（如 `nomic-embed-text` → `bge-m3`）后维度不匹配，旧索引查询直接崩溃而非降级。

**MongoDB 连接管理失控**：多处在 `async for cursor` 后未关闭 Cursor，高并发时连接池耗尽（峰值利用率 85%）。聚合查询无超时控制，一条慢聚合可阻塞整个连接。`find()` 未限制返回数量，全表扫描触发内存压力。

**Agent 异常处理链断裂**：LLM 调用无超时——Ollama 挂起时 Agent 循环永久等待。SSE 流式异常被 `try/except Exception` 吞没，前端收到 `[DONE]` 而非错误。异步生成器（`astream_events`）未正确 `aclose()`，协程泄漏。

**API 契约静默失效**：RPC 路由将 `parameters` 直接 `**unpack` 传给目标函数，前端参数名错误（`query` 而非 `filter`）被静默忽略而非报错，导致查询条件丢失而返回全量数据。

Q3 专项攻坚这四个领域，配合测试体系从 76 个用例扩展至 570 个，建立回归防线。

---

## 季度演进

### 八月 — 问题诊断与优先级排序

八月在推进 LLM 统一架构和 Agent 工具系统的同时，通过代码审查（ruff 全量扫描）、生产日志分析和压力测试识别了上述四类问题。初步修复了部分低垂果实（未使用导入清理、异常处理规范化），但系统性修复延至九月集中攻坚。

关键发现：`src/shared/utils.py`（配置、错误码、响应封装）被所有模块依赖，其 52% 的覆盖率是最大的质量风险敞口。

### 九月 — 集中攻坚

九月分四个并行轨道推进，每轨道独立交付：

| 轨道 | 领域 | 核心动作 | 交付物 |
|------|------|---------|--------|
| A | RAG 引擎 | 增量索引修复 + Embedding 维度校验 | `src/domain/rag/indexer.py`、`src/domain/rag/engine.py` |
| B | 数据层 | 连接池优化 + Cursor 泄漏清零 + 超时控制 | `src/data/database.py`、`src/data/repository.py` |
| C | Agent | 分层超时 + SSE 错误传播 + 生成器资源管理 | `src/domain/ai/chat.py`、`src/services/ai/` |
| D | API 契约 | RPC 参数白名单 + 未知参数 WARNING | `src/server/routes/rpc.py` |

测试覆盖从 76 → 570 用例（+650%），`shared/` 模块从 52% → 100% 覆盖率。

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | RAG 增量索引修复 + Embedding 维度校验 | 100% |
| KR2 | MongoDB 连接池优化 + Cursor 泄漏清零 + 聚合超时 | 100% |
| KR3 | Agent 分层超时保护 + SSE 错误传播 + 资源管理 | 100% |
| KR4 | RPC 参数白名单校验 + 未知参数 WARNING | 100% |
| KR5 | 测试体系 76 → 570 用例，shared 模块 100% 覆盖 | 100% |

---

## KR1 — RAG 引擎稳定性

### 问题

增量索引通过对比 YiKnowledge 文件系统快照与 MongoDB `knowledge_files` 集合的 `updated` 字段判断变更。但 `updated` 字段只在文件创建和更新时写入，删除事件被丢弃——已删除文件在向量索引中永不清理。

Embedding 维度校验缺失：`nomic-embed-text`（768 维）升级为 `bge-m3`（1024 维）后，旧索引 768 维向量与新查询 1024 维向量做余弦相似度计算，llama_index 抛出 `ValueError` 而非降级返回空结果。

### 修复

**增量索引完整生命周期**（`src/domain/rag/indexer.py`）：
```
scan YiKnowledge → diff(current, previous)
  ├── added    → embed + insert
  ├── modified → delete old + embed + insert new
  └── deleted  → delete from MongoDB + delete from vector index  ← 新增
```

**Embedding 维度校验**（`src/domain/rag/engine.py`）：
- 索引创建时记录 `embedding_dim` 到元数据
- 查询时比对请求模型的维度与索引元数据，不匹配时拒绝并返回明确错误码（`ErrorCode.RAG_DIMENSION_MISMATCH`，而非崩溃）

**验证**：
- 删除 YiKnowledge 文件 → 等待 60s 轮询 → MongoDB 和向量索引中对应记录消失 → RAG 检索不返回已删除文档
- 切换 Embedding 模型 → 旧索引查询返回 `code: 4001, message: "Embedding dimension mismatch: expected 768, got 1024"` → 提示重建索引

---

## KR2 — MongoDB 连接管理

### 问题

| 缺陷 | 位置 | 根因 | 影响 |
|------|------|------|------|
| Cursor 泄漏 | `repository.py:find_many()` | `async for` 后未 `await cursor.close()` | 活跃连接数持续增长，最终耗尽 |
| 聚合无超时 | `repository.py:aggregate()` | `maxTimeMS` 未设置 | 一条慢聚合阻塞整个连接池 |
| 无限 `to_list` | `repository.py` 多处 | `to_list(None)` 无数量上限 | 全表扫描内存压力 |
| 连接池无监控 | `database.py` | 无利用率/等待队列指标 | 耗尽时无预警 |

### 修复

1. **Cursor 管理**（`src/data/database.py`）：所有 `find()` 返回的 Cursor 统一通过 `aclosing()` 上下文管理器包装，确保异常路径也关闭
2. **聚合超时**（`src/data/repository.py`）：所有聚合管道默认 `maxTimeMS=30000`（30s），可配置
3. **分页默认值**：`to_list(None)` → `to_list(length=100)`，超出走分页
4. **连接池监控**：`database.py` 加入 `serverStatus()` 定时采集，`/health` 端点暴露 `connections.current/available/total`、`opLatencies.reads/writes`

**验证**：
- 100 并发请求 × 30min → 连接池利用率 <60%，零 Cursor 泄漏（MongoDB `db.serverStatus().metrics.cursor.open.total` 无持续增长）
- 慢聚合（>30s）触发 `asyncio.TimeoutError` → 返回 `ErrorCode.DB_TIMEOUT` → 连接释放

---

## KR3 — Agent 可靠性

### 问题

Agent 主循环（Think → Act → Observe）存在三个可靠性缺口：

```
async for event in runtime.astream_events(messages):  # 无超时 ← 问题 1
    try:
        yield format_sse(event)
    except Exception:
        pass  # 吞没异常，前端收到 [DONE] ← 问题 2
# 生成器未 close，协程泄漏 ← 问题 3
```

### 修复

**分层超时保护**（`src/services/ai/chat_service.py`）：

| 层级 | 超时 | 超时后行为 |
|------|------|-----------|
| LLM 单次调用 | 60s | yield SSE error event + 返回已生成内容 |
| 工具执行 | 30s/工具 | 跳过该工具，通知 Agent 继续 |
| Agent 循环总时长 | 300s | 强制终止，yield 摘要 + 操作审计 |

实现：`asyncio.timeout()` 包裹每层调用，超时时通过 SSE `{"error": true, "code": 2002}` 传播而非吞没。

**SSE 错误传播**（`src/domain/ai/chat.py`）：
- 移除 `try/except pass`，改为 `try/except → yield error event → raise`（raise 由 StreamingResponse 框架捕获，但 error event 已在流中）
- `[DONE]` 只在正常结束时发送

**异步生成器资源管理**：`astream_events` 退出时通过 `finally: await generator.aclose()` 确保资源释放。

**验证**：
- 断开 Ollama 网络 → 60s 后 SSE 流推送 `{"error": true, "code": 2002, "message": "LLM call timeout"}` → 前端展示错误提示（非白屏）
- `psutil.Process().num_fds()` 在 100 轮 Agent 循环后无增长

---

## KR4 — API 契约校验

### 问题

RPC 路由（`src/server/routes/rpc.py`）的核心逻辑：

```python
result = await getattr(module, method_name)(**parameters)
```

这行代码有双重缺陷：
1. 前端传 `{"query": "xxx"}` 而非 `{"filter": "xxx"}` → `**unpack` 产生未知参数，后端目标函数签名不含 `query` → 参数被丢弃 → 查询条件丢失 → 返回全量数据（**静默成功**）
2. 前端多传参数（如拼写错误 `page_numm`）→ 同样被静默丢弃

一个月内因 `query`/`filter` 参数名不匹配导致 3 次线上事故，排查时间合计 4h+。

### 修复

**三阶段渐进部署**：

| 阶段 | 动作 | 效果 |
|------|------|------|
| 1 | 添加 WARNING 日志 | 未知参数被记录，可观测但不中断服务 |
| 2 | 添加白名单字段（`page_num`、`page_size`、`sort_by`） | 已知通用字段不告警，减少噪音 |
| 3 | （Q4 计划）未知参数返回 1001 错误 | 前端参数名错误即刻暴露 |

**实现**（`src/server/routes/rpc.py`）：

```python
KNOWN_PARAMS = {"cname", "filter", "page_num", "page_size", "sort_by", "sort_order"}

async def execute_rpc(module_name: str, method_name: str, parameters: dict):
    sig = inspect.signature(getattr(module, method_name))
    valid_params = set(sig.parameters.keys())
    unknown = set(parameters.keys()) - valid_params - KNOWN_PARAMS
    if unknown:
        logger.warning(f"RPC unknown parameters ignored: {unknown} "
                       f"module={module_name} method={method_name}")
    # 只传函数签名接受的参数
    filtered = {k: v for k, v in parameters.items() if k in valid_params}
    return await getattr(module, method_name)(**filtered)
```

**验证**：传 `{"query": "xxx"}` → 日志 `WARNING: RPC unknown parameters ignored: {'query'}` → 返回未过滤的全量数据（现状未变）→ 开发者在日志中可观测到参数错误

---

## KR5 — 测试体系

### 现状

修复前：76 个测试用例，`shared/utils.py` 覆盖率 52%，`domain/` 模块覆盖率 <30%。

### 交付

按测试分层扩展：

| 层级 | 修复前 | 修复后 | 新增内容 |
|------|--------|--------|---------|
| `shared/` | 52% | 100% | `config.py`、`error_codes.py`、`response.py`、`exceptions.py`、`utils.py` 全覆盖 |
| `data/` | 35% | 85% | Repository CRUD、Cursor 管理、聚合、分页、超时 |
| `domain/` | <30% | 72% | RAG 索引/检索、Agent 循环（stub LLM）、RPC 路由白名单 |
| `services/` | <20% | 68% | SSE 流式、chat_service、data_service 编排逻辑 |
| `server/` | 0% | 55% | 中间件异常处理、路由注册、RPC 分发 |

总计：76 → 570 用例（+650%），85 个测试文件。

**持续性**：建立 `pytest --cov` 合并门禁——覆盖率不得低于当前水平；新增功能必须有对应测试用例。

---

## 交付成果

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| RAG 索引完整性 | 删除不清理 | 增/改/删 三态覆盖 |
| Embedding 维度校验 | 无，崩溃 | 拒绝 + 明确错误码 |
| MongoDB 连接池利用率 | 85%（峰） | <60% |
| Cursor 泄漏 | 持续增长 | 0 |
| Agent 超时保护 | 无 | 3 层（LLM/工具/循环） |
| SSE 异常传播 | 吞没 | 正确传播，前端可感知 |
| RPC 参数错误 | 静默忽略 | WARNING 日志，可观测 |
| 测试用例 | 76 | 570 |
| shared 覆盖率 | 52% | 100% |

---

## 未竟事项（Q4 延续）

| 事项 | 原因 | Q4 归属 |
|------|------|---------|
| RPC 未知参数严格模式（返回 1001） | 需前端参数修复窗口期 | yiai-q4-002（API 平台化） |
| 数据库慢查询自动索引建议 | 依赖性能剖析数据积累 | yiai-q4-001（可观测性） |
| Agent 工具执行沙箱化 | 安全需求优先级 | yiai-q4-004（安全合规） |