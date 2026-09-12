---
title: "Knowledge: Watcher bulk_write 部分失败时返回成功计数，掩盖数据不一致"
tags:
- knowledge-watcher
- bulk-write
- partial-failure
- mongodb
- data-consistency
category: projects/yiai/bugs/knowledge
created: 2026-09-07
updated: 2026-09-10
resolution: |
  watcher.py _bulk_upsert/_bulk_delete: ordered=False + BulkWriteError 处理
  部分失败时记录 warning 日志含 failed/upserted/modified 计数
  单个文档写入失败不再中断后续操作
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: YiAi
module: src/domain/knowledge/watcher.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: rare
---

## Description

`KnowledgeWatcherManager._bulk_upsert` 方法（`src/domain/knowledge/watcher.py:173-209`）将批量操作分块执行（`_BULK_CHUNK=1000`），但只累加 `upserted_count` 和 `modified_count`，**不检查 `bulk_write` 的写入错误**（`BulkWriteResult` 不包含个别文档的写入错误——需使用 `BulkWriteError` 异常或 `ordered=False` 来获取）。

**当前代码：**
```python
# src/domain/knowledge/watcher.py:205-209
for i in range(0, len(ops), _BULK_CHUNK):
    result = await collection.bulk_write(ops[i:i + _BULK_CHUNK])
    total_upserted += result.upserted_count
    total_modified += result.modified_count
return total_upserted + total_modified
```

**问题：**
1. `bulk_write` 默认 `ordered=True`——遇到第一个写入错误就停止，后续操作不执行
2. 当某个文档的 `_extract_meta` 返回了不符合 MongoDB schema 的数据（如 `path` 为 `None`），`bulk_write` 会抛出 `BulkWriteError`
3. 异常在 `_bulk_upsert` 中未被捕获，传播到 `_scheduler_job` 的通用 `except Exception` 后被静默记录日志
4. 部分文档已写入、部分未写入——数据不一致

**触发场景：**
- YiKnowledge 中新增了 frontmatter 格式异常的 markdown 文件
- `_extract_meta` 解析失败返回不完整的数据
- `UpdateOne` 操作因数据格式问题失败

## Steps to Reproduce

1. 在 YiKnowledge 中创建一个 frontmatter 格式错误的 markdown 文件
2. 等待 Knowledge Watcher 轮询（默认 5 秒）
3. 检查 `logs/app.log`——`_bulk_upsert` 可能抛出异常，被 `_scheduler_job` 捕获
4. 检查 MongoDB `knowledge_files` 集合——该文件可能未被同步
5. 其他正常文件的同步也可能因 `ordered=True` 而被中断

## Expected Result

使用 `ordered=False` 执行批量写入，即使部分文档写入失败，其他文档仍继续写入。返回结果中包含失败计数和失败原因。

## Actual Result

`ordered=True`（默认）导致第一个写入失败后所有后续操作被跳过。异常被上层捕获后仅记录日志，同步中断。

## Fix

### 1. 使用 ordered=False 并处理写入错误

```python
# src/domain/knowledge/watcher.py
from pymongo.errors import BulkWriteError

async def _bulk_upsert(self, collection, abs_paths: dict[str, str]) -> dict:
    """Bulk_write upsert metadata. Returns {upserted, modified, failed, errors}."""
    if not abs_paths:
        return {"upserted": 0, "modified": 0, "failed": 0, "errors": []}

    now = _now_str()
    ops: list[UpdateOne] = []
    op_paths: list[str] = []  # track which path each op corresponds to
    for rel, abs_path in abs_paths.items():
        try:
            meta = _extract_meta(rel, abs_path)
        except Exception as e:
            logger.warning(f"Failed to extract meta {rel}: {e}")
            continue
        updated_at = meta.get("updatedAt")
        if updated_at:
            meta["updatedTime"] = datetime.fromtimestamp(
                updated_at / 1000, tz=timezone.utc
            ).strftime("%Y-%m-%d %H:%M:%S")
        else:
            meta["updatedTime"] = now
        ops.append(UpdateOne(
            {"path": meta["path"]},
            {"$set": {**meta}, "$setOnInsert": {"createdTime": now}},
            upsert=True,
        ))
        op_paths.append(rel)

    total_upserted = 0
    total_modified = 0
    total_failed = 0
    errors: list[str] = []

    for i in range(0, len(ops), _BULK_CHUNK):
        chunk = ops[i:i + _BULK_CHUNK]
        try:
            result = await collection.bulk_write(chunk, ordered=False)
            total_upserted += result.upserted_count
            total_modified += result.modified_count
        except BulkWriteError as e:
            total_upserted += e.details.get("nInserted", 0)
            total_modified += e.details.get("nModified", 0)
            for write_error in e.details.get("writeErrors", []):
                idx = write_error.get("index", -1)
                op_idx = i + idx
                path = op_paths[op_idx] if 0 <= op_idx < len(op_paths) else "unknown"
                err_msg = write_error.get("errmsg", "unknown error")
                errors.append(f"{path}: {err_msg}")
                logger.warning(f"Bulk upsert error for {path}: {err_msg}")
            total_failed += len(e.details.get("writeErrors", []))

    return {
        "upserted": total_upserted,
        "modified": total_modified,
        "failed": total_failed,
        "errors": errors,
    }
```

### 2. 更新调用方适配新返回格式

`_reconcile_diff` 和 `sync_knowledge_full` 需要适配 `_bulk_upsert` 返回 `dict` 而非 `int`。

## Verification

- 正常同步 → `upserted > 0`, `failed = 0`, `errors = []`
- 包含格式错误的文件 → 该文件记录在 `errors` 中，其他文件正常同步
- 不降级整个同步过程

## Prevention

- **代码层面：** 所有 `bulk_write` 操作 MUST 使用 `ordered=False` 以实现容错
- **监控层面：** 监控 `failed` 计数，当失败率超过阈值时告警
- **数据层面：** `_extract_meta` 应返回验证结果，调用方根据验证结果决定是否写入

## 影响范围

- **影响模块**：src/domain/knowledge/watcher.py
- **涉及文件**：
- src/domain/knowledge/watcher.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
