---
title: "code-quality: chat.py 和 tools.py 存在未使用的 import"
tags: [yiai, bug, code-quality]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: closed
severity: trivial
priority: p3
project: YiAi
module: src/domain/ai/chat.py, src/domain/ai/tools.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: chat.py 和 tools.py 存在未使用的 import

## 现象

ruff 检查报 5 个 F401（imported but unused）错误：

```
src/domain/ai/chat.py:3:8: F401 `functools` imported but unused
src/domain/ai/chat.py:231:43: F401 `services.ai.model_runtime.OllamaRuntime` imported but unused
src/domain/ai/chat.py:231:58: F401 `services.ai.model_runtime.OpenAIRuntime` imported but unused
src/domain/ai/tools.py:14:8: F401 `json` imported but unused
src/domain/ai/tools.py:19:36: F401 `dataclasses.field` imported but unused
```

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=F401`
2. 观察未使用的导入

## 预期行为

所有导入应被实际使用，或从代码中移除

## 实际行为

- `functools` 在 `chat.py` 顶部导入但从未使用
- `OllamaRuntime` 和 `OpenAIRuntime` 在函数内部导入但只有 `get_runtime` 被使用
- `json` 在 `tools.py` 顶部导入但被函数内部的局部 `import json` 遮蔽
- `field` 从 `dataclasses` 导入但只有 `dataclass` 装饰器被使用

## 根因分析

这些是重构后残留的死代码。`chat.py` 中的 `functools` 可能是早期实现中用于 `lru_cache` 或其他工具。`OllamaRuntime`/`OpenAIRuntime` 可能曾经直接使用，后来改为通过 `get_runtime` 工厂方法间接使用。`tools.py` 中的 `json` 在函数内部重新导入，使顶部导入无效。

## 修复方案

移除所有未使用的导入：
- `chat.py`: 移除 `functools`，`OllamaRuntime`，`OpenAIRuntime`
- `tools.py`: 移除 `json`，`field`

## 影响范围

- **影响模块**：src/domain/ai/chat.py、src/domain/ai/tools.py
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check` 清洁
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 重构后检查并移除不再使用的导入 |
| 测试 | CI 中启用 `ruff check` |
| 流程 | 每个 PR 运行 `ruff check --select=F401` |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
