---
title: "_apply_rss_date_filters 原地修改输入字典"
tags: [yiai, code-quality, code-smell, side-effect]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: minor
priority: p2
---

# _apply_rss_date_filters 原地修改输入字典

## 现象

`src/data/repository.py` 中的 `_apply_rss_date_filters` 函数通过 `pop` 方法原地修改输入的 `query_params` 字典，这是一种隐式副作用：

```python
def _apply_rss_date_filters(
    query_params: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    if not ("publishedStart" in query_params or "publishedEnd" in query_params):
        return None
    start_ms = _parse_ms_ts(query_params.pop("publishedStart", None))
    end_ms = _parse_ms_ts(query_params.pop("publishedEnd", None))
    return {"start_ms": start_ms, "end_ms": end_ms}
```

在 `query_documents` 中的调用处：
```python
rss_date_range: Optional[Dict[str, Any]] = None
if collection_name == "rss":
    rss_date_range = _apply_rss_date_filters(query_params)
filter_dict = _build_filter(query_params)
```

## 根因分析

调用者 `query_documents` 传入 `query_params`（从 `params` copy 而来），`_apply_rss_date_filters` 在检查是否包含 `publishedStart`/`publishedEnd` 后将其从字典中移除。虽然这是有意为之的（防止这些字段进入 `_build_filter`），但：

1. 函数名暗示这是一个纯查询/过滤函数，不应有修改输入的副作用
2. 如果未来的代码在 `_apply_rss_date_filters` 返回后再次访问 `query_params`，`publishedStart`/`publishedEnd` 已经被移除
3. 这种隐式行为需要阅读函数实现才能理解，增加了维护成本

## 涉及文件

- `src/data/repository.py:194-213` — `_apply_rss_date_filters` 函数

## 修复方案

将 pop 操作移到调用方，使 `_apply_rss_date_filters` 成为纯函数：

```python
def _apply_rss_date_filters(
    published_start: Optional[str] = None,
    published_end: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Return {start_ms, end_ms} or None if no date filters provided."""
    if published_start is None and published_end is None:
        return None
    start_ms = _parse_ms_ts(published_start)
    end_ms = _parse_ms_ts(published_end)
    return {"start_ms": start_ms, "end_ms": end_ms}

# 调用处：
if collection_name == "rss":
    rss_date_range = _apply_rss_date_filters(
        published_start=query_params.pop("publishedStart", None),
        published_end=query_params.pop("publishedEnd", None),
    )
```

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 函数不应修改可变输入参数，除非函数名明确暗示（如 `pop_xxx`）|
| 审查 | 代码审查时检查函数是否对输入参数有隐式副作用 |
| 测试 | 为纯函数编写单元测试，验证输入不被修改 |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/data/repository.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
