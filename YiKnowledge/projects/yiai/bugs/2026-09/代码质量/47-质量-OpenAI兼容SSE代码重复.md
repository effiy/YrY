---
title: openai_compat.py SSE 流未使用 sse_utils 中的公共函数
tags: [yiai, code-quality, code-reuse]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# openai_compat.py SSE 流未使用 sse_utils 中的公共函数

## 现象

`src/server/routes/openai_compat.py:100` 自行实现了 SSE 帧格式化，而非复用 `shared/sse_utils.py` 中的 `stream_async` 和 `_format_sse`：

```python
# openai_compat.py:100 — 内联 SSE 格式化
return f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n".encode()
```

而 `sse_utils.py` 已提供了通用的 SSE 流处理：

```python
# sse_utils.py:20 — 公共 SSE 格式化（但未被 openai_compat 使用）
return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode()
```

这与 bug #38（`_format_sse` 在 execution/rag 路由中重复）是同一模式的新发现——`openai_compat.py` 也重复了相同的 SSE 格式化逻辑。

## 根因分析

- OpenAI 兼容端点作为独立模块开发，不了解已有的 SSE 工具
- 3 个路由文件中的 SSE 格式化是逐字相同的代码

## 涉及文件

- `src/server/routes/openai_compat.py:100` — 内联 SSE 格式
- `src/shared/sse_utils.py:20` — 已有的公共 `_format_sse`（未被使用）

## 修复方案

```python
from shared.sse_utils import _format_sse
return _format_sse({"data": chunk})
```

## 预防措施

- 新路由开发前检查 `shared/` 中是否有可复用的工具

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `sse_utils.py`
- `openai_compat.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
