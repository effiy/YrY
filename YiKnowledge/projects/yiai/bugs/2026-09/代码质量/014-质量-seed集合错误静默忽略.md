---
title: "_seed_collection_if_empty 静默吞没数据库异常"
tags: [yiai, code-quality, error-handling, startup]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: minor
priority: p2
---

# _seed_collection_if_empty 静默吞没数据库异常

## 现象

`src/app.py` 中的 `_seed_collection_if_empty` 函数在检查集合是否为空时，使用 `except Exception: return` 静默吞没所有数据库异常：

```python
async def _seed_collection_if_empty(cname: str, fname: str, lookup_field: str) -> None:
    try:
        count = await db.db[cname].count_documents({})
        if count > 0:
            return
    except Exception:
        return  # 任何数据库异常都被静默忽略
    ...
```

## 根因分析

该函数在应用启动时被调用（通过 `_seed_all_if_empty`），用于在集合为空时从 JSON 文件填充种子数据。但 `except Exception: return` 会在以下场景中静默失败：

1. **数据库连接失败**：`count_documents` 抛出 `ServerSelectionTimeoutError`，种子数据不会被填充，但日志中没有任何错误信息
2. **权限不足**：如果数据库用户没有 `count` 权限，种子数据不会被填充
3. **集合不存在**：某些 MongoDB 驱动对不存在的集合返回异常

这些失败场景对运维完全不可见，应用启动后数据库可能缺少必要的种子数据（如菜单、用户、字典等），导致前端功能异常。

## 涉及文件

- `src/app.py:59-66` — `_seed_collection_if_empty` 函数中的 `except Exception: return`

## 修复方案

添加日志记录，区分"跳过（非空）"和"失败（异常）"两种场景：

```python
async def _seed_collection_if_empty(cname: str, fname: str, lookup_field: str) -> None:
    try:
        count = await db.db[cname].count_documents({})
        if count > 0:
            return
    except Exception as e:
        logger.warning(f"Failed to check collection '{cname}' for seeding: {e}", exc_info=True)
        return
    ...
```

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 启动阶段的异常处理必须有日志记录，不能静默忽略 |
| 审查 | 代码审查时检查启动流程中的异常处理是否充分 |
| 运维 | 启动后检查日志中是否缺少种子数据加载的 INFO 日志 |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/app.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
