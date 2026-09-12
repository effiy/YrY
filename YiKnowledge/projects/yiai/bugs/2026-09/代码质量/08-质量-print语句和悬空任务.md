---
title: "code-quality: 遗留 print 语句和未引用的 asyncio 任务"
tags: [yiai, bug, code-quality]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: closed
severity: minor
priority: p2
project: YiAi
module: src/app.py, src/domain/audit/logger.py, src/services/ai/model_runtime.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: 遗留 print 语句和未引用的 asyncio 任务

## 现象

ruff 检查报 T201（print found）和 RUF006（asyncio-dangling-task）：

```
src/app.py:249:5: T201 `print` found
src/app.py:250:5: T201 `print` found
src/app.py:119:17: RUF006 Store a reference to `asyncio.ensure_future`
src/domain/audit/logger.py:49:9: RUF006 Store a reference to `asyncio.create_task`
src/services/ai/model_runtime.py:176:9: RUF006 Store a reference to `asyncio.create_task`
```

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=T201,RUF006`
2. 观察遗留问题

## 预期行为

- 服务器启动信息应通过标准日志框架输出
- 异步任务应保存引用以防止被垃圾回收

## 实际行为

- `app.py` 启动时使用 `print()` 而非 `logger.info()`
- 3 处 `asyncio.create_task()`/`ensure_future()` 未保存任务引用

## 根因分析

**T201:** 开发阶段遗留的 `print()` 调试语句，生产环境应使用结构化日志。

**RUF006:** `asyncio.create_task()` 创建的协程如果未保存引用，可能在任务完成前被垃圾回收。虽然这些场景（启动预加载、审计日志、后台 worker）通常是安全的，但显式保存引用是最佳实践。

## 修复方案

```python
# T201: print → logger.info
- print(f"Starting server: http://{host}:{port}")
+ logger.info(f"Starting server: http://{host}:{port}")

# RUF006: 保存任务引用
- asyncio.ensure_future(preload_kb_index())
+ _preload_task = asyncio.ensure_future(preload_kb_index())

- asyncio.create_task(cls.write(entry))
+ _task = asyncio.create_task(cls.write(entry))

- asyncio.create_task(asyncio.to_thread(_worker))
+ _worker_task = asyncio.create_task(asyncio.to_thread(_worker))
```

## 影响范围

- **影响模块**：3 个文件
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check --select=T201` 清洁
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 始终使用 `logger.info()` 而非 `print()` |
| 代码 | 创建异步任务时保存引用 |
| 测试 | CI 中启用 `ruff check --select=T201,RUF006` |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
