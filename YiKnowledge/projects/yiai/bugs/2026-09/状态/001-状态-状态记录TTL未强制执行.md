---
title: "State: 状态记录 TTL 未强制执行，过期数据依赖手动清理"
tags:
- state-store
- ttl
- data-cleanup
- storage
- memory-leak
category: projects/yiai/bugs/state
created: 2026-09-07
updated: 2026-09-10
resolution: |
  database.py _ensure_indexes: 新增 state_records 集合的 TTL 索引
  createIndex({expiresAt: 1}, expireAfterSeconds: 0, background: true)
  MongoDB 将在 expiresAt 时间到达后自动删除过期记录
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiAi
module: src/domain/state/recorder.py, src/domain/state/service.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: always
---

## Description

`src/domain/state/` 模块提供 Key-Value 状态存储，配置中定义了 `state_store_default_ttl: 0`（`0` 表示永不过期）。虽然 TTL 字段存在于配置中，但状态存储模块**没有实现 TTL 过期清理机制**——过期数据不会被自动删除，只能通过手动 API 调用清理。

**当前配置：**
```yaml
state_store_enabled: true
state_store_default_ttl: 0  # 0 = 永不过期
state_store_query_max_limit: 100000000
collection_state_records: "state_records"
```

**问题：**
1. `state_store_default_ttl: 0` 意味着所有状态记录默认永不过期
2. 没有后台任务清理过期记录
3. 查询时不过滤过期记录（如果 TTL 被设置）
4. `state_records` 集合随时间无限增长
5. Agent 会话状态（确认决策、拒绝记忆等）存储在内存中而非 state store，但 state store 可能被用于存储其他有时效性的数据

## Steps to Reproduce

1. 通过 API 创建大量状态记录（如 `POST /state/set`）
2. 设置 TTL 为 60 秒
3. 等待 120 秒后查询状态记录
4. 过期记录仍然存在，未被清理
5. 检查 `state_records` 集合——文档数量持续增长

## Expected Result

TTL 应在以下层面生效：
1. **写入时**：创建记录时设置 MongoDB TTL 索引
2. **查询时**：自动过滤已过期的记录
3. **后台清理**：MongoDB TTL 索引自动删除过期文档

## Actual Result

TTL 配置存在但未被使用。记录永不过期，依赖手动清理。

## Root Cause

`state_store_default_ttl` 配置项被定义但未在状态存储模块中实际使用。MongoDB 支持 TTL 索引（`expireAfterSeconds`），但 `state_records` 集合未创建 TTL 索引。

**根本原因：** TTL 功能在配置阶段被规划，但在实现阶段被遗漏。状态存储模块的初始实现聚焦于基本 CRUD，TTL 清理被推迟。

## Fix

### 1. 创建 MongoDB TTL 索引

```python
# src/data/database.py — 在 _ensure_indexes 中添加
async def _ensure_indexes(self):
    # ... existing indexes ...
    # State records TTL index
    await self.db[settings.collection_state_records].create_index(
        [("expiresAt", 1)],
        expireAfterSeconds=0,  # MongoDB 在 expiresAt 时间到达后自动删除
        background=True,
    )
```

### 2. 写入时设置 expiresAt

```python
# src/domain/state/service.py
from datetime import datetime, timezone, timedelta

async def set_state(key: str, value: dict, ttl: int = None) -> dict:
    ttl = ttl if ttl is not None else settings.state_store_default_ttl
    doc = {
        "key": key,
        "value": value,
        "createdTime": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
    }
    if ttl > 0:
        doc["expiresAt"] = datetime.now(timezone.utc) + timedelta(seconds=ttl)
    # ...
```

### 3. 查询时过滤过期记录

```python
async def get_state(key: str) -> Optional[dict]:
    doc = await db.find_one(settings.collection_state_records, {"key": key})
    if not doc:
        return None
    # 手动过滤（在 TTL 索引生效前作为补充保护）
    if "expiresAt" in doc and doc["expiresAt"] < datetime.now(timezone.utc):
        return None
    return doc.get("value")
```

## Verification

- 创建 TTL=10s 的记录 → 10s 后 MongoDB 自动删除
- 查询已过期的记录 → 返回 None
- 永不过期的记录（TTL=0）→ 不被自动删除
- `state_records` 集合大小稳定

## Prevention

- **代码层面：** 新增持久化功能时，MUST 考虑数据生命周期（创建 → 使用 → 过期 → 清理）
- **数据库层面：** 所有有时效性的集合 MUST 创建 TTL 索引
- **监控层面：** 监控 `state_records` 集合大小，异常增长时告警
- **配置层面：** 生产环境 `state_store_default_ttl` 不应为 0

## 影响范围

- **影响模块**：src/domain/state/recorder.py, src/domain/state/service.py
- **涉及文件**：
- src/domain/state/recorder.py, src/domain/state/service.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
