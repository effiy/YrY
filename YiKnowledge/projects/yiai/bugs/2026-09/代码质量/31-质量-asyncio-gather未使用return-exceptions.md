---
title: asyncio.gather 未设置 return_exceptions 导致单任务失败取消全部
tags: [yiai, code-quality, async]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: minor
priority: p2
---

# asyncio.gather 未设置 return_exceptions 导致单任务失败取消全部

## 现象

2 处 `asyncio.gather` 调用未设置 `return_exceptions=True`，意味着任一子任务抛出异常时，所有其他正在运行的子任务都会被取消：

```python
# domain/ai/chat.py:86 — 图片获取
fetched = await asyncio.gather(*[_task(u) for u in http_urls], return_exceptions=False)

# server/routes/dashboard.py:191 — 健康检查
mongo, ollama, collections = await asyncio.gather(
    _get_mongo_status(), _get_ollama_status(), _get_collection_counts()
)
```

对于 `chat.py`，虽然内部的 `_task` 捕获了 `Exception`，但如果抛出 `CancelledError` 或 `BaseException` 子类，仍会传播。对于 `dashboard.py`，如果一个健康检查失败（如 Ollama 不可达），MongoDB 和集合统计的检查也会被取消。

## 根因分析

- `asyncio.gather` 默认 `return_exceptions=False`，Python 文档明确指出"如果任何 awaitable 抛出异常，它会被立即传播，取消所有其他 awaitable"
- 健康检查等独立操作应允许部分失败

## 涉及文件

- `src/domain/ai/chat.py:86` — 图片并行获取
- `src/server/routes/dashboard.py:191` — 健康检查聚合

## 修复方案

1. Dashboard 健康检查：使用 `return_exceptions=True`，对每个结果单独检查是否为异常
2. 图片获取：显式设置 `return_exceptions=True` 作为防御性编程

## 预防措施

- 所有 `asyncio.gather` 调用必须显式指定 `return_exceptions` 参数

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `chat.py`
- `dashboard.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
