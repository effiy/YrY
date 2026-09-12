---
title: "_format_sse 和 _stream_async 在路由模块中重复定义"
tags: [yiai, code-quality, code-smell, duplication]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# _format_sse 和 _stream_async 在路由模块中重复定义

## 现象

`shared/sse_utils.py` 提供了 `format_sse` 和 `stream_async` 两个公共函数，但 `server/routes/execution.py` 和 `server/routes/rag.py` 各自定义了自己的私有副本 `_format_sse` 和 `_stream_async`，功能完全相同。

`shared/sse_utils.py` 中的版本：
```python
def format_sse(data: Any) -> bytes:
    if isinstance(data, (bytes, bytearray)):
        try:
            data = data.decode("utf-8")
        except Exception:
            data = str(data)
    if isinstance(data, str):
        payload: Any = {"data": {"message": data}}
    else:
        payload = data
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode()

async def stream_async(gen: AsyncIterator[Any]):
    try:
        async for item in gen:
            yield format_sse(item)
    finally:
        yield format_sse({"done": True})
```

`server/routes/execution.py` 和 `server/routes/rag.py` 中的版本与上述逻辑完全一致，唯一的区别是：
- 函数名加了 `_` 前缀（`_format_sse` / `_stream_async`）
- `execution.py` 中 `.encode("utf-8")` vs `sse_utils.py` 中 `.encode()`（UTF-8 是 Python 默认，无实际差异）

## 根因分析

`shared/sse_utils.py` 作为共享工具模块已经存在，但路由模块没有使用它。可能的原因：

1. 路由模块编写时不知道共享模块的存在
2. 将共享模块的函数放在路由模块中以为"就近原则"更清晰
3. 没有及时重构

这种重复导致：
- 修改 SSE 格式时需要同时修改 3 个地方
- 新增 SSE 路由时可能再次复制粘贴
- 增加代码审查和维护负担

## 涉及文件

- `src/shared/sse_utils.py:9-29` — 共享版本（未被这些路由使用）
- `src/server/routes/execution.py:16-34` — 私有副本
- `src/server/routes/rag.py:48-59` — 私有副本

## 修复方案

删除 `execution.py` 和 `rag.py` 中的私有副本，统一使用 `shared/sse_utils.py` 的公共函数：

```diff
# execution.py
- def _format_sse(data: Any) -> bytes:
-     ...
- 
- async def _stream_async(gen: AsyncIterator[Any]):
-     ...
+ from shared.sse_utils import format_sse, stream_async

# 调用处相应改为 stream_async(gen) 和 format_sse(...)
```

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 编写 SSE 路由时优先查找并使用 `shared/sse_utils.py` |
| 审查 | 代码审查时禁用新增的私有 SSE 格式化函数 |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `sse_utils.py`
- `rag.py`
- `execution.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
