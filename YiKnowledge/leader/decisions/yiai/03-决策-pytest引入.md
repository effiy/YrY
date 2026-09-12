---
title: "ADR: Introduce Pytest Test Framework"
tags: [adr, yiai, testing, pytest, quality]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-08-21
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解 YiAi 的 pytest 测试策略和目录结构，为后续领域逻辑的测试覆盖提供标准"
acceptance_criteria:
  - "测试框架、目录结构和覆盖率目标已定义"
related:
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: 引入 Pytest 测试框架

> **状态**：已接受 (2026-08-03) — 已实施 (2026-08-21)

## 上下文

YiAi 此前测试覆盖率为零。尽管架构分层清晰（domain/services/server），但每次重构都携带未知的回归风险。缺乏测试是项目最大的技术债务项。

**为什么测试缺失如此严重**：
- 后端是 YrY 单体仓库的唯一数据源和逻辑层——YiVad 和 YiPet 的所有功能都依赖它
- RPC 信封协议 (`{module_name, method_name, parameters}`) 是跨项目的唯一调用协议，参数名称不匹配（如 `filter`/`query`）的 bug 已发生多次，本可在单元测试阶段捕获
- 随着 LLM 多提供商路由、Agent 循环和 RAG 评估基础设施的引入，代码复杂度在快速增加

## 决策

**引入 pytest 8 + httpx + pytest-asyncio + pytest-cov，配合结构化的测试目录。**

### 目录结构

```
tests/
├── unit/        # 纯函数测试，无 I/O 依赖
├── integration/ # 测试实际 MongoDB、Ollama 或 HTTP 端点
├── eval/        # RAG 评估测试（质量度量，非通过/失败）
└── conftest.py  # 共享 fixtures
```

**各目录职责**：

- `unit/` — 测试可以脱离外部依赖独立运行的纯逻辑：工具函数、错误码、响应格式、异常类、配置解析等。这些测试应在数毫秒内完成
- `integration/` — 测试需要与真实依赖交互的场景：MongoDB CRUD 操作、Ollama LLM 调用、HTTP 端点请求/响应、知识监听器轮询逻辑。这些测试可能依赖测试数据库或测试 Ollama 实例
- `eval/` — RAG 质量评估测试：测量 faithfulness、answer_relevancy、context_precision、context_recall 等指标。这些不是传统意义上的"通过/失败"测试，而是质量度量的回归检测

### 配置（2026-08-21 实施结果）

- **配置文件**：`pyproject.toml`，包含 `pythonpath = ["src"]`、`testpaths = ["tests"]`、`--cov=src`
- **共享 fixtures**：`tests/conftest.py` 提供测试复用的 fixtures
- **初始覆盖**：5 个测试套件，76 个测试案例 — `test_utils.py`、`test_error_codes.py`、`test_response.py`、`test_exceptions.py`、`test_config.py`
- **覆盖率结果**：shared/error_codes.py 100%、shared/exceptions.py 100%、shared/response.py 100%、shared/utils.py 93%、shared/config.py 92%

## 选择理由

- pytest 是 Python 生态的标准测试框架
- pytest-asyncio 原生支持 FastAPI 的异步特性
- httpx 提供异步 HTTP 客户端用于端点测试
- 结构化的目录防止测试无序增长

## 后果

### 正面影响
- 所有 `shared/` 模块代码覆盖率 92%+，回归风险显著降低
- RPC 信封和参数名称契约有测试保障
- 新工程师可通过阅读测试了解预期行为

### 负面影响
- 测试维护需要额外投入（每次接口变更需更新对应测试）
- domain 层尚无测试（后续工作需要时间）

### 规范
- 所有新的领域逻辑应有对应测试
- CI 应在每个 PR 上运行 `python -m pytest tests/ -v`
- 覆盖率目标：shared/ 层 80%+，domain/ 层 60%+

## 适用场景

- 为 YiAi 新功能添加测试时的结构参考
- 评估测试覆盖率的基线数据
- 技术债务管理的量化依据

## 常见问题

**Q: 为什么不用 unittest（Python 标准库）？**
A: pytest 的 fixture 系统、参数化测试和插件生态远超 unittest。对于异步 FastAPI 项目，pytest-asyncio 的集成是开箱即用的。

**Q: 覆盖率目标是不是太低（domain 层 60%+）？**
A: 对于从零开始的项目，60% 是现实的第一阶段目标。重点在 shared/ 层先达到高覆盖率（标准库代码被最多模块依赖），再逐步提升 domain/ 层。

## 反模式

- **追求 100% 覆盖率。** 100% 覆盖率是昂贵的且不总能带来质量保障。例如 HTTP 路由注册、FastAPI 生命周期等样板代码的测试价值很低
- **为旧代码编写低价值测试。** 优先为最频繁修改和最容易出错的代码路径编写测试，而非均匀地为所有代码覆盖测试