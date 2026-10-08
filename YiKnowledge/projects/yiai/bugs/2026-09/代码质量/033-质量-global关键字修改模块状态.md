---
title: global 关键字在 6 个模块中创建模块级可变状态
tags: [yiai, code-quality, state-management]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: minor
priority: p2
---

# global 关键字在 6 个模块中创建模块级可变状态

## 现象

`global` 关键字在 6 个模块中被使用 20+ 次，创建模块级单例和可变状态，与 bug #37（4 个缓存字典）互补，本报告覆盖非缓存的 global 变量：

```python
# services/ai/llm_provider.py:368,376
global _router
global _router

# server/mcp_server.py:29,38
global _ollama_service
global _settings

# server/routes/state.py:19
global _state_service

# domain/ai/tools.py:399
global _registry

# domain/execution/executor.py:30,41
global _recorder
global _guard

# domain/rag/indexer.py:133,183,236,414
global _kb_index, _kb_index_built_at, _kb_doc_count
global _last_categories_scan, _cached_categories
```

## 根因分析

- Python 模块级别的变量在 FastAPI 单进程中表现为"单例"，但 `global` 声明使它们可被任意函数修改
- 测试时这些状态在测试用例间残留，破坏了隔离性
- `pytest --looponfail` 或 `pytest-xdist` 并行模式下会产生竞态条件

## 涉及文件

- `src/services/ai/llm_provider.py` — `_router`
- `src/server/mcp_server.py` — `_ollama_service`、`_settings`
- `src/server/routes/state.py` — `_state_service`
- `src/domain/ai/tools.py` — `_registry`
- `src/domain/execution/executor.py` — `_recorder`、`_guard`
- `src/domain/rag/indexer.py` — RAG 索引全局状态 + 类别缓存

## 修复方案

1. 使用 FastAPI `app.state` 存储应用级状态
2. 或使用类级单例替换模块级 `global`（如 `KnowledgeWatcherManager` 模式）
3. 测试时提供 `reset_state()` fixture 清理全局状态

## 预防措施

- 新模块禁止使用 `global` 关键字
- 应用级状态统一放在 `app.state` 或配置好的单例类中

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/server/mcp_server.py`
- `src/domain/rag/indexer.py`
- `src/domain/ai/tools.py`
- `src/services/ai/llm_provider.py`
- `src/domain/execution/executor.py`
- `src/server/routes/state.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
