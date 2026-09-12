---
title: "RAG: 增量刷新与全量重建存在竞态条件，可能导致索引损坏"
tags:
- rag
- race-condition
- index-rebuild
- concurrent
- asyncio
category: projects/yiai/bugs/rag
created: 2026-09-07
updated: 2026-09-10
resolution: |
  indexer.py: 新增模块级 _index_lock = asyncio.Lock()
  refresh_index_async() 和 rebuild_index_async() 均使用 async with _index_lock 包裹
  防止增量刷新与全量重建并发操作同一索引目录
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: src/domain/knowledge/watcher.py, src/domain/rag/indexer.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: rare
---

## Description

Knowledge Watcher 的 `_maybe_trigger_rag_refresh` 通过 `asyncio.create_task` 异步触发增量 RAG 刷新（`src/domain/knowledge/watcher.py:264`）。同时，用户可以通过 `/rag/build-index` 端点手动触发全量索引重建（`force=True`）。这两种操作都操作同一个持久化索引目录（`data/rag_store/`），但**没有任何互斥锁或操作队列**来防止并发执行。

**竞态场景：**
1. Knowledge Watcher 检测到文件变更，触发增量刷新（`refresh_index_async`）
2. 增量刷新正在执行中（读取旧索引 → 插入新文档 → 保存索引）
3. 用户调用 `/rag/build-index` 进行全量重建
4. 全量重建删除旧索引文件 → 增量刷新在已删除的文件上操作 → 写入损坏的索引

**当前代码：**
```python
# src/domain/knowledge/watcher.py:244-264
if self._rag_rebuild_task is not None and not self._rag_rebuild_task.done():
    return  # 仅防止 watcher 自身重复触发
# ...
self._rag_rebuild_task = asyncio.create_task(_run())
```

`_rag_rebuild_task` 仅追踪 watcher 自己触发的刷新任务，不知道外部触发的全量重建。

## Steps to Reproduce

1. 启动 YiAi，Knowledge Watcher 开始运行
2. 在 YiKnowledge 中批量修改 10+ 个 markdown 文件
3. Watcher 触发增量 RAG 刷新（`asyncio.create_task` 在后台执行）
4. 在增量刷新执行期间，通过 API 调用 `/rag/build-index` 并设置 `force=True`
5. 两种操作同时操作 `data/rag_store/` 目录
6. 索引文件可能处于不一致状态

## Expected Result

RAG 索引操作应串行化——增量刷新和全量重建不能同时执行。后来的操作应排队等待或返回错误（如 "Another index operation is in progress"）。

## Actual Result

两种操作可以并发执行，无互斥保护。在并发场景下索引可能损坏。

## Root Cause

`_maybe_trigger_rag_refresh` 的防重复机制仅检查 watcher 自己的任务（`_rag_rebuild_task`），不检查外部触发的索引操作。`refresh_index_async` 和 `build_index`（全量重建）之间没有共享的互斥锁。

**根本原因：** RAG 索引操作缺乏全局互斥机制。索引目录是共享的可变状态，但操作之间没有协调。

## Fix

### 1. 添加全局索引操作锁

```python
# src/domain/rag/indexer.py
import asyncio

_index_lock = asyncio.Lock()

async def refresh_index_async(added, removed, changed):
    """Incremental refresh with global lock."""
    async with _index_lock:
        return await _refresh_index_impl(added, removed, changed)

async def build_index_async(force: bool = False):
    """Full rebuild with global lock."""
    async with _index_lock:
        return await _build_index_impl(force)
```

### 2. Watcher 端检查锁状态

```python
# src/domain/knowledge/watcher.py
async def _maybe_trigger_rag_refresh(self, base: str) -> None:
    # ...
    if self._rag_rebuild_task is not None and not self._rag_rebuild_task.done():
        return
    # 如果全局锁被持有（外部操作进行中），跳过本次刷新
    if _index_lock.locked():
        logger.info("RAG index operation in progress, skipping refresh")
        return
    # ...
```

### 3. API 端点返回操作状态

```python
# server/routes/rag.py
@router.post("/build-index")
async def build_index(force: bool = False):
    if _index_lock.locked():
        return fail(
            error=ErrorCode.BUSINESS_ERROR,
            message="Another index operation is in progress, please retry later"
        )
    # ...
```

## Verification

- 增量刷新执行期间调用全量重建 → 全量重建等待或返回 "in progress" 错误
- 全量重建执行期间 watcher 触发增量刷新 → 增量刷新跳过
- 顺序操作（先增量后全量，或反之）→ 正常执行

## Prevention

- **架构层面：** 所有操作共享可变状态（文件系统、数据库）的后台任务 MUST 使用互斥锁
- **测试层面：** 添加并发索引操作测试（`asyncio.gather` 同时触发增量和全量）
- **监控层面：** 记录索引操作排队/跳过的次数，识别频繁冲突

## 影响范围

- **影响模块**：src/domain/knowledge/watcher.py, src/domain/rag/indexer.py
- **涉及文件**：
- src/domain/knowledge/watcher.py, src/domain/rag/indexer.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
