---

doc_type: test
title: "YA-09-18: Agent 工具调用结果缓存 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-18"
source_prds: ["18-需求-Agent工具调用结果缓存"]
source_modules: ["18-prd-task-Agent工具调用结果缓存"]
source_okr: [yiai-001]

type: test
---

# YA-09-18: Agent 工具调用结果缓存 — 测试规格

> 来源 PRD：[18-需求-Agent工具调用结果缓存.md](../../prds/2026-09/18-需求-Agent工具调用结果缓存.md)
> 开发方案：[18-prd-task-Agent工具调用结果缓存.md](../../devs/2026-09/18-prd-task-Agent工具调用结果缓存.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖工具调用结果缓存（命中/未命中/TTL）、副作用工具排除、缓存失效策略。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 缓存逻辑纯函数 | pytest + dict 内存缓存 | 缓存 key 生成、TTL 检查、副作用工具判断 |
| L2 集成测试 | 真实 Agent 工具调用 + MongoDB 缓存 | pytest-asyncio + motor | 缓存读写、TTL 过期、Agent 循环缓存命中 |

### 1.2 工具分类

| 分类 | 工具 | 可缓存 | TTL | 原因 |
|------|------|--------|-----|------|
| 只读 | `search_knowledge` | 是 | 300s | 知识库不频繁变更 |
| 只读 | `query_database` | 是 | 60s | 数据可能变化 |
| 只读 | `read_file` | 是 | 120s | 文件可能被修改 |
| 只读 | `web_search` | 是 | 600s | 搜索结果相对稳定 |
| 副作用 | `execute_code` | 否 | — | 每次执行结果可能不同 |
| 副作用 | `write_file` | 否 | — | 破坏性操作 |
| 副作用 | `create_document` | 否 | — | 破坏性操作 |
| 副作用 | `delete_document` | 否 | — | 破坏性操作 |

### 1.3 缓存 Key 生成

```
cache_key = f"{tool_name}:{hash(json.dumps(args, sort_keys=True))}"
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import json
import time
import hashlib
from unittest.mock import AsyncMock

@pytest.fixture
def cache_config():
    """缓存配置。"""
    return {
        "default_ttl": 300,
        "tool_ttl_overrides": {
            "search_knowledge": 300,
            "query_database": 60,
            "read_file": 120,
            "web_search": 600,
        },
        "side_effect_tools": ["execute_code", "write_file", "create_document", "delete_document"],
        "max_cache_size": 1000,
    }

@pytest.fixture
def tool_cache(cache_config):
    """内存缓存实例——用于单元测试。"""
    class ToolCache:
        def __init__(self, config):
            self.store = {}
            self.config = config

        def _make_key(self, tool_name, args):
            args_str = json.dumps(args, sort_keys=True)
            return f"{tool_name}:{hashlib.md5(args_str.encode()).hexdigest()}"

        def get(self, tool_name, args):
            key = self._make_key(tool_name, args)
            entry = self.store.get(key)
            if entry and time.time() < entry["expires_at"]:
                return entry["result"]
            return None

        def set(self, tool_name, args, result):
            key = self._make_key(tool_name, args)
            ttl = self.config["tool_ttl_overrides"].get(tool_name, self.config["default_ttl"])
            self.store[key] = {"result": result, "expires_at": time.time() + ttl}

        def should_cache(self, tool_name):
            return tool_name not in self.config["side_effect_tools"]

    return ToolCache(cache_config)

@pytest.fixture
def search_knowledge_args():
    """search_knowledge 的常见参数。"""
    return [
        {"query": "RAG 检索优化", "top_k": 5},
        {"query": "Docker 部署教程", "top_k": 10},
        {"query": "微服务架构模式", "top_k": 5},
    ]

@pytest.fixture
def search_knowledge_results():
    """search_knowledge 的 mock 结果。"""
    return {
        "RAG 检索优化": {"documents": [{"title": "RAG 优化指南", "score": 0.95}], "total": 15},
        "Docker 部署教程": {"documents": [{"title": "Docker Compose 教程", "score": 0.88}], "total": 8},
        "微服务架构模式": {"documents": [{"title": "微服务设计模式", "score": 0.92}], "total": 22},
    }

@pytest.fixture
def mock_tool_handlers():
    """Mock 工具处理器——含执行计数。"""
    handlers = {}
    for tool in ["search_knowledge", "query_database", "read_file", "web_search", "execute_code", "write_file"]:
        handler = AsyncMock()
        handler.call_count = 0
        async def wrapper(*args, _handler=handler, **kwargs):
            _handler.call_count += 1
            return f"Result from {tool}"
        handler.side_effect = wrapper
        handlers[tool] = handler
    return handlers
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 缓存基本行为

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AC-01 | 相同参数→缓存命中 | search_knowledge("RAG 检索优化") | 1. 第 1 次调用：执行工具，结果缓存<br>2. 第 2 次调用：相同参数 | 第 2 次调用不执行工具，直接返回缓存结果 | P0 |
| TC-AC-02 | 不同参数→缓存 miss | search_knowledge("RAG" vs "Docker") | 1. 调用 "RAG" → 缓存<br>2. 调用 "Docker" → 新执行 | 不同参数生成不同 cache key，各自缓存 | P1 |
| TC-AC-03 | 缓存 key 参数顺序无关 | args={a:1, b:2} vs {b:2, a:1} | 1. 两次调用参数顺序不同<br>2. 检查缓存行为 | 缓存命中（sort_keys=True 保证一致性） | P2 |
| TC-AC-04 | 空结果也缓存 | search_knowledge 返回 0 文档 | 1. 空结果<br>2. 第 2 次调用 | 空结果也缓存，避免重复查询 | P2 |

### 3.2 TTL 过期

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AC-05 | TTL 内缓存有效 | search_knowledge TTL=300s | 1. 缓存结果<br>2. 100s 后再次调用 | 缓存命中（100s < 300s） | P1 |
| TC-AC-06 | TTL 过期后重新执行 | search_knowledge TTL=300s | 1. 缓存结果<br>2. 301s 后再次调用 | 缓存过期，重新执行工具并更新缓存 | P0 |
| TC-AC-07 | query_database TTL 较短 | TTL=60s | 1. 缓存结果<br>2. 61s 后调用 | 过期，重新查询数据库 | P1 |
| TC-AC-08 | web_search TTL 较长 | TTL=600s | 1. 缓存结果<br>2. 300s 后调用 | 缓存仍有效（300s < 600s） | P2 |

### 3.3 副作用工具排除

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AC-09 | execute_code 不缓存 | code_execute 工具 | 1. 第 1 次执行 "print(1)"<br>2. 第 2 次执行 "print(1)"（相同参数） | 每次都执行，不读取缓存 | P0 |
| TC-AC-10 | write_file 不缓存 | write_file 工具 | 1. 相同文件路径和内容<br>2. 两次调用 | 每次都执行写入操作 | P0 |
| TC-AC-11 | create_document 不缓存 | create_document 工具 | 1. 相同数据<br>2. 两次调用 | 每次都创建新文档 | P1 |
| TC-AC-12 | delete_document 不缓存 | delete_document 工具 | 1. 相同文档 ID<br>2. 两次调用 | 第 1 次删除，第 2 次报文档不存在 | P1 |

### 3.4 缓存管理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-AC-13 | max_cache_size=1000 淘汰 | 缓存满 1000 条 | 1. 插入第 1001 条<br>2. 检查缓存行为 | 淘汰最旧条目（LRU），新条目插入成功 | P2 |
| TC-AC-14 | 手动清除缓存 | 已有缓存数据 | 1. 调用 `cache.clear()`<br>2. 再次查询 | 缓存 miss，重新执行工具 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-AC-01 | 超大参数导致 key 过长 | args 中包含 1MB 数据 | 参数摘要哈希，不存储完整 args | P2 |
| EG-AC-02 | TTL=0 立即过期 | tool TTL 设为 0 | 每次缓存后立即过期，等同于不缓存 | P2 |
| EG-AC-03 | 并发相同参数的缓存写入 | 两个请求同时 cache miss | 只有第一个执行工具，第二个等待或也执行（取决于锁策略） | P1 |
| EG-AC-04 | 工具抛出异常不缓存 | search_knowledge 抛异常 | 异常结果不缓存，下次调用重试 | P1 |
| EG-AC-05 | 缓存存储不可用 | 缓存后端（Redis/MongoDB）宕机 | 降级为跳过缓存，直接执行工具 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-AC-01 | 工具调用结果格式不变 | 缓存返回时 | 缓存结果与直调工具结果格式一致 | P0 |
| RG-AC-02 | Agent 循环行为不变 | 启用缓存后 | Agent 决策和最终回答质量不变 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 相同参数缓存命中 | TC-AC-01 ~ TC-AC-04 | 命中/miss/顺序无关/空结果 |
| FR2: TTL 过期管理 | TC-AC-05 ~ TC-AC-08 | 有效/过期/短TTL/长TTL |
| FR3: 副作用工具排除 | TC-AC-09 ~ TC-AC-12 | code/write/create/delete |
| FR4: 缓存管理 | TC-AC-13, TC-AC-14 | 淘汰/手动清除 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 分布式缓存一致性 | 多 YiAi 实例缓存不同步 | 添加 Redis 共享缓存测试 |
| 缓存命中率监控 | 无缓存效果量化指标 | 添加 cache_hit/miss 计数和命中率计算 |
| 缓存预热 | 冷启动时无缓存 | 添加缓存预热策略测试（预填充高频查询） |
| 结果体积限制 | 工具返回 MB 级结果 | 添加大结果缓存行为测试 |