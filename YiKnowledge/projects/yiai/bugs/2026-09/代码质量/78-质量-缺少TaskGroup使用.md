---
title: 未使用 asyncio.TaskGroup 管理并发任务
tags: [yiai, code-quality, async]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# 未使用 asyncio.TaskGroup 管理并发任务

## 现象

Python 3.11+ 的 `asyncio.TaskGroup` 提供了结构化并发（一个任务失败自动取消其他），但项目使用 `asyncio.gather` 手动管理。`TaskGroup` 的上下文管理器模式更安全。

## 涉及文件

- `src/server/routes/dashboard.py` — asyncio.gather
- `src/domain/ai/chat.py` — asyncio.gather

## 修复方案

Python 3.11+ 环境使用 `async with asyncio.TaskGroup() as tg`。

## 预防措施

新并发代码优先 TaskGroup 而非 bare gather。

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/ai/chat.py`
- `src/server/routes/dashboard.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
