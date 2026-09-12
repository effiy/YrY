---
title: "YA-09-14: Agent 工具调用结果缓存策略 — 减少重复 LLM 推理与工具执行开销"
tags: [需求文档, Agent, 工具调用, 缓存, 性能优化, 后端]
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiAi
project_id: yiai
owner: 陈铭
prd_month: "202609"
prd_task_id: YA-09-14
estimate_backend: 1.0
review_status: 待评审
issue_type: 架构
roles: [engineer, aier]
---

# YA-09-14: Agent 工具调用结果缓存策略 — 减少重复 LLM 推理与工具执行开销

> 需求编号：YA-09-14 · 优先级：P2 · 人天：1.0d · 状态：需求已编写
> 依赖：YA-09-03（Agent 可靠性）

## 背景

Agent 在执行 ReAct 循环时频繁调用工具：`search_knowledge`、`read_file`、`query_database`、`execute_code`。同一会话内 Agent 可能多次调用相同工具（相同参数），尤其在多轮迭代中探索相关问题时。

| 场景 | 重复调用示例 |
|------|------------|
| Agent 第 2 轮搜索 `"FastAPI middleware"` → 第 5 轮再次搜索相同关键词 | 重复 RAG 检索 + Embedding |
| Agent 读取 `CLAUDE.md` → 3 轮迭代后再次读取 | 重复文件 I/O |
| Agent 查询 `bugs` 集合 `{status: "open"}` → 后续再次查询 | 重复 MongoDB 查询 |

工具调用有显著成本：RAG 检索涉及 Embedding 计算（Ollama GPU），`read_file` 涉及磁盘 I/O。对于确定的工具+参数组合，结果在会话内是幂等的——缓存可消除重复开销。

---

## 一、设计决策

### 决策 1：缓存粒度 — 工具级 vs 参数级 vs 会话级

| 选项 | 命中率 | 一致性 | 实现 |
|------|--------|--------|------|
| 工具级 (忽略参数) | 低 | 低 (不同参数不同结果) | 低 |
| **参数级 (工具名 + 参数哈希)** | 高 | 高 | 中 |
| 会话级 (所有调用共享) | 中 | 中 (跨会话不一致) | 低 |

**选择：参数级 LRU 缓存（会话生命周期）。** `cache_key = sha256(tool_name + json.dumps(params, sort_keys=True))`。缓存仅在同一 Agent 会话内有效（避免跨会话数据污染）。

### 决策 2：缓存 TTL — 固定 vs 自适应 vs 会话结束

**选择：会话生命周期——Agent 循环结束时清除。** 工具结果可能随外部状态变化（如文件被修改），跨轮次缓存可能导致 Agent 基于过期信息决策。

### 决策 3：缓存容量 — 无限制 vs 固定数量 vs 固定内存

**选择：LRU 最近 50 个结果。** 覆盖典型 Agent 循环（5-15 个工具调用），50 个足够覆盖缓存命中窗口。

---

## 二、目标架构

```python
# YiAi/src/domain/ai/tool_cache.py

import hashlib, json, time
from functools import lru_cache

class ToolResultCache:
    """Agent 工具调用结果缓存——参数级 LRU，会话生命周期。"""

    def __init__(self, max_size: int = 50):
        self._cache: dict[str, tuple[dict, float]] = {}
        self._max_size = max_size
        self._access_order: list[str] = []
        self._hits = 0
        self._misses = 0

    @staticmethod
    def _cache_key(tool_name: str, params: dict) -> str:
        """生成确定性的缓存 Key。"""
        params_str = json.dumps(params, sort_keys=True, default=str)
        payload = f"{tool_name}:{params_str}"
        return hashlib.sha256(payload.encode()).hexdigest()[:16]

    def get(self, tool_name: str, params: dict) -> dict | None:
        key = self._cache_key(tool_name, params)
        if key in self._cache:
            result, timestamp = self._cache[key]
            self._access_order.remove(key)
            self._access_order.append(key)
            self._hits += 1
            return result
        self._misses += 1
        return None

    def set(self, tool_name: str, params: dict, result: dict):
        key = self._cache_key(tool_name, params)

        # LRU 淘汰——超过容量时删除最早访问的
        if len(self._cache) >= self._max_size:
            oldest = self._access_order.pop(0)
            del self._cache[oldest]

        self._cache[key] = (result, time.time())
        self._access_order.append(key)

    def clear(self):
        self._cache.clear()
        self._access_order.clear()

    @property
    def hit_rate(self) -> float:
        total = self._hits + self._misses
        return self._hits / total if total > 0 else 0

    @property
    def stats(self) -> dict:
        return {
            'size': len(self._cache), 'hits': self._hits,
            'misses': self._misses, 'hit_rate': f'{self.hit_rate:.1%}',
            'max_size': self._max_size,
        }
```

集成到 Agent 循环：

```python
# YiAi/src/domain/ai/agent.py

cache = ToolResultCache(max_size=50)

async def execute_tool(tool_name: str, params: dict) -> dict:
    # 1. 检查缓存
    cached = cache.get(tool_name, params)
    if cached is not None:
        logger.debug(f"[Agent:Cache] HIT {tool_name} ({cache.hit_rate:.0%})")
        return cached

    # 2. 执行工具
    logger.debug(f"[Agent:Cache] MISS {tool_name}")
    result = await tool_registry[tool_name](**params)

    # 3. 写入缓存（仅幂等工具）
    if tool_name in IDEMPOTENT_TOOLS:  # {search_knowledge, read_file, query_database}
        cache.set(tool_name, params, result)

    return result

# Agent 循环结束时清除
async def agent_loop(messages):
    try:
        for iteration in range(max_iterations):
            # ... ReAct 循环 ...
    finally:
        cache.clear()
        logger.info(f"[Agent:Cache] Final stats: {cache.stats}")
```

---

## 三、缓存策略矩阵

| 工具 | 幂等性 | 缓存 | TTL | 理由 |
|------|--------|------|-----|------|
| `search_knowledge` | ✅ (RAG 检索) | 是 | 会话 | 同参数结果一致 |
| `read_file` | ✅ (文件读取) | 是 | 会话 | 会话内文件不会变化 |
| `query_database` | ✅ (MongoDB 查询) | 是 | 会话 | 数据可能在会话间变化 |
| `execute_code` | ❌ (代码执行) | **否** | — | 副作用不可缓存 |
| `write_file` | ❌ (文件写入) | **否** | — | 副作用改变状态 |
| `send_wework` | ❌ (消息发送) | **否** | — | 副作用不可重复 |

---

## 四、性能分析

| 指标 | 无缓存 | 有缓存 (50% 命中率) | 节省 |
|------|--------|-------------------|------|
| 典型 Agent 循环工具调用 | 10 次 | 5 次 (缓存命中) + 5 次 (执行) | **50% 工具调用** |
| `search_knowledge` (~200ms) | 5 次 × 200ms = 1s | 3 次 × 200ms = 600ms | **-400ms** |
| `read_file` (~10ms) | 3 次 × 10ms = 30ms | 1 次 × 10ms = 10ms | **-20ms** |
| 总 Agent 耗时减少 | — | — | **~5-10%** (取决于工具调用比例) |

---

## 五、可观测性

| 指标 | 说明 |
|------|------|
| 缓存命中率 | > 30% 良好，< 10% 可能缓存策略无效 |
| 缓存大小 | 接近 max_size (50) 时 LRU 频繁淘汰 |

---

## 六、测试规格

#### Scenario: 相同工具+参数命中缓存
- **Given** 已缓存 `search_knowledge("RAG优化")` → `{chunks: [...]}`
- **When** 再次调用 `search_knowledge("RAG优化")`
- **Then** `cache.get()` 返回缓存结果，`hits += 1`
- **And** 不执行实际的 RAG 检索

#### Scenario: 不同参数不命中缓存
- **Given** 已缓存 `read_file("README.md")`
- **When** 调用 `read_file("CLAUDE.md")`
- **Then** `cache.get()` 返回 None，`misses += 1`

#### Scenario: 非幂等工具不缓存
- **Given** IDEMPOTENT_TOOLS 不包含 `execute_code`
- **When** 调用 `execute_code("print('hello')")`
- **Then** 结果不被缓存

#### Scenario: LRU 淘汰——超过容量
- **Given** 缓存已有 50 个条目 (max_size=50)
- **When** 缓存第 51 个结果
- **Then** 最早访问的条目被淘汰
- **And** 缓存大小保持 50

#### Scenario: Agent 循环结束清除缓存
- **Given** Agent 循环中缓存了 15 个工具调用结果
- **When** `agent_loop` 执行 `finally: cache.clear()`
- **Then** 缓存清空，`cache.stats.size` = 0

---

## 七、代码审查检查清单

- [ ] `_cache_key` 使用 `sort_keys=True` 保证参数顺序无关
- [ ] 仅 `IDEMPOTENT_TOOLS` 集合中的工具参与缓存
- [ ] 非幂等工具 (`execute_code`, `write_file`, `send_wework`) 排除
- [ ] LRU 淘汰正确更新 `_access_order`
- [ ] `cache.clear()` 在 `agent_loop` 的 `finally` 中调用
- [ ] 缓存命中/未命中日志为 DEBUG 级别
- [ ] `cache.stats` 可通过 `/health/debug` 端点查询

---

## 八、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 缓存返回过期数据（文件被外部修改） | 低 | 中 | 会话生命周期——Agent 循环间清除 |
| 缓存 Key 碰撞（SHA256 truncate 16 chars） | 极低 | 低 | 16 字符 hex = 2^64 空间，碰撞概率可忽略 |
| 缓存占用内存过大 | 低 | 低 | LRU 上限 50 个, 单个结果 < 100KB, 总 < 5MB |

---

*PRD 来源: `projects/yiai/requirements/2026-09/14-需求-Agent工具缓存.md`*

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 在相关函数中添加参数校验和边界检查 |
| 测试 | 添加对应的自动化测试用例 |
| 流程 | 代码审查时重点检查此类模式 |
| 监控 | 添加日志告警，异常发生时及时发现 |
| 文档 | 在编码规范中记录此类反模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
