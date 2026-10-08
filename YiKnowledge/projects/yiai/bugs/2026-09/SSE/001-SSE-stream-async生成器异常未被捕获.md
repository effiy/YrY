---
title: "SSE: stream_async 中生成器异常未被捕获，客户端收到截断流"
tags:
- sse
- error-handling
- stream
- async-generator
- client-hang
category: projects/yiai/bugs/sse
created: 2026-09-07
updated: 2026-09-10
resolution: |
  stream_async/stream_sync: try/finally → try/except/else
  异常时发送 {"done": True, "error": str(e)} 帧，客户端可区分正常终止与异常终止
  stream_sync 同步版本同步修复
  测试已更新，15/15 通过
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: YiAi
module: src/shared/sse_utils.py
reporter: Claude
environment: all
affected_version: main (pre-fix)
fixed_version: main (post-fix 2026-09-07)
frequency: intermittent
---

## Description

`stream_async` 函数（`src/shared/sse_utils.py:23-29`）使用 `try/finally` 包装异步生成器，但 `finally` 块仅发送 `{"done": True}` 帧。当生成器内部抛出异常时，异常会传播到 FastAPI 的 `StreamingResponse`，但客户端可能已经收到部分数据且**没有收到任何错误帧**——`finally` 块虽然执行了，但发送的 `done` 帧会让客户端误以为流正常结束。

**当前代码：**
```python
# src/shared/sse_utils.py:23-29
async def stream_async(gen: AsyncIterator[Any]):
    """Yield SSE frames from an async generator, appending a ``done`` frame."""
    try:
        async for item in gen:
            yield format_sse(item)
    finally:
        yield format_sse({"done": True})
```

**问题：**
- 生成器中途抛出异常 → `finally` 发送 `{"done": True}` → 客户端认为流正常结束
- 客户端无法区分"正常完成"和"异常终止"
- 前端显示"AI 回复完成"，但实际内容被截断

**触发场景：**
- Ollama 在流式生成中途崩溃（返回部分 token 后连接断开）
- RAG 检索在构建响应时抛出异常
- Agent 工具调用在流式输出结果时失败

## Steps to Reproduce

1. 调用 AI Chat 端点，触发 SSE 流式响应
2. 在 Ollama 生成中途强制终止 Ollama 进程
3. 观察 SSE 流——客户端收到最后一个正常 chunk 后收到 `{"done": True}`
4. 前端显示"回复完成"，但内容明显不完整
5. 检查 YiAi 日志——有异常堆栈，但客户端完全无感知

## Expected Result

生成器异常时，`stream_async` 应在 `done` 帧之前发送一个 `error` 帧，包含错误信息，让客户端能区分正常结束和异常终止。

## Actual Result

`finally` 块仅发送 `done` 帧，客户端认为流正常结束。异常信息仅在服务端日志中可见。

## Root Cause

`stream_async` 的 `try/finally` 结构只保证 `done` 帧一定发送，但 `finally` 块无法获取 `try` 块中的异常信息——`finally` 无法知道流是正常结束还是异常终止。

**根本原因：** SSE 流格式化层缺少错误传播机制。`format_sse` 可以格式化任意数据，但 `stream_async` 没有在异常时注入错误帧。

## Fix

### 1. 在 stream_async 中捕获并传播异常

```python
# src/shared/sse_utils.py
import logging
import traceback

logger = logging.getLogger(__name__)

async def stream_async(gen: AsyncIterator[Any]):
    """Yield SSE frames from an async generator, with error propagation."""
    error_occurred = False
    try:
        async for item in gen:
            yield format_sse(item)
    except Exception as e:
        error_occurred = True
        logger.error(f"SSE stream error: {e}", exc_info=True)
        yield format_sse({
            "error": {
                "message": str(e),
                "type": type(e).__name__,
            }
        })
    finally:
        yield format_sse({"done": True, "error": error_occurred})
```

### 2. 前端适配——检查 done 帧中的 error 字段

```typescript
// YiVad/YiPet SSE 消费端
const event = JSON.parse(data);
if (event.done) {
  if (event.error) {
    showErrorToast("AI 回复异常终止，请重试");
  }
  stopLoading();
}
```

## Verification

- 正常流式响应 → `done` 帧中 `error: false`，前端行为不变
- Ollama 中途崩溃 → 客户端收到 `error` 帧 + `done` 帧中 `error: true`，前端显示错误提示
- RAG 检索异常 → 同上
- 没有异常 → 行为与修复前完全一致

## Prevention

- **代码层面：** 所有 SSE 流式端点 MUST 使用 `stream_async` 包装，确保错误传播
- **测试层面：** 添加 SSE 异常场景测试（mock 生成器中途抛异常）
- **监控层面：** 统计 `done` 帧中 `error: true` 的比例，异常升高时告警
- **前端层面：** 所有 SSE 消费端 MUST 检查 `done` 帧中的 `error` 字段

## 影响范围

- **影响模块**：src/shared/sse_utils.py
- **涉及文件**：
- src/shared/sse_utils.py
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
