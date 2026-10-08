---
title: "feed.py 辅助函数使用通用 Exception 捕获，可能掩盖意外错误"
tags: [yiai, code-quality, error-handling, rss]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# feed.py 辅助函数使用通用 Exception 捕获，可能掩盖意外错误

## 现象

`src/domain/rss/feed.py` 中的三个辅助函数使用 `except Exception` 捕获所有异常并静默返回回退值。更关键的是，`_entry_date_dir` 中的 `except Exception: pass` 模式未被之前的 #24 号缺陷（try-except-pass）覆盖。

`_entry_date_dir`（行 137-149）：
```python
def _entry_date_dir(entry) -> str:
    parsed = entry.get("published_parsed")
    if parsed:
        try:
            dt = datetime(*parsed[:6], tzinfo=timezone.utc)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            pass  # 静默回退到当天日期
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")
```

`_entry_published_ts`（行 164-173）：
```python
def _entry_published_ts(entry) -> Optional[int]:
    parsed = entry.get("published_parsed")
    if parsed:
        try:
            dt = datetime(*parsed[:6], tzinfo=timezone.utc)
            return int(dt.timestamp() * 1000)
        except Exception:
            return None  # 静默返回 None
    return None
```

`_normalize_url`（`server/routes/search.py` 行 52-67）：
```python
def _normalize_url(url: str) -> str:
    try:
        p = urlparse(url.strip())
        ...
        return urlunparse(...)
    except Exception:
        return url.strip().rstrip("/")  # 静默返回原始 URL
```

## 根因分析

这些函数的设计意图是合理的：对于外部数据（RSS feed、用户输入的 URL），不应因格式错误而崩溃。但 `except Exception` 的粒度太宽：

1. `_entry_date_dir` 中的 `except Exception: pass` 会吞没所有类型的异常，包括 `TypeError`（如果 `parsed[:6]` 的元素不足以传入 `datetime`）、`ValueError`（超出范围的值）以及任何意外的 Python 错误
2. `_entry_published_ts` 中的 `except Exception: return None` 同样过于宽泛
3. `_normalize_url` 中的 `except Exception` 会吞没任何 URL 解析错误，包括 `AttributeError`（如果 `urlparse` 返回值异常）

这些宽泛的异常捕获在出现非预期的错误时无法提供调试信息。

## 涉及文件

- `src/domain/rss/feed.py:137-149` — `_entry_date_dir` 中的 `except Exception: pass`
- `src/domain/rss/feed.py:164-173` — `_entry_published_ts` 中的 `except Exception: return None`
- `src/server/routes/search.py:52-67` — `_normalize_url` 中的 `except Exception: return ...`

## 修复方案

使用更具体的异常类型，并添加日志：

```python
def _entry_date_dir(entry) -> str:
    parsed = entry.get("published_parsed")
    if parsed and isinstance(parsed, tuple) and len(parsed) >= 6:
        try:
            dt = datetime(*parsed[:6], tzinfo=timezone.utc)
            return dt.strftime("%Y-%m-%d")
        except (ValueError, TypeError, OverflowError) as e:
            logger.debug(f"Invalid published_parsed for entry: {e}")
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")
```

对于 `_normalize_url`：
```python
def _normalize_url(url: str) -> str:
    try:
        p = urlparse(url.strip())
        ...
        return urlunparse(...)
    except (ValueError, TypeError) as e:
        logger.debug(f"URL normalization failed for '{url[:80]}': {e}")
        return url.strip().rstrip("/")
```

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 数据清洗函数应使用具体的异常类型（`ValueError`、`TypeError`），而非 `Exception` |
| 审查 | 代码审查时检查是否存在未被 #24/#25 覆盖的宽泛异常捕获 |
| 测试 | 为数据清洗函数添加边界条件测试（无效日期、畸形 URL 等） |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/rss/feed.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
