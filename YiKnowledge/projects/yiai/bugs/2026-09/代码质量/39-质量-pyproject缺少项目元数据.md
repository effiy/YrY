---
title: pyproject.toml 仅有 pytest 配置缺少 [project] 元数据
tags: [yiai, code-quality, packaging]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# pyproject.toml 仅有 pytest 配置缺少 [project] 元数据

## 现象

`pyproject.toml` 仅包含 `[tool.pytest.ini_options]` 测试配置，缺少标准的 `[project]` 元数据段：

```toml
[tool.pytest.ini_options]
pythonpath = ["src"]
testpaths = ["tests"]
...
```

没有 `[project]` 段意味着：
- 无 `name`、`version`、`description`、`dependencies` 声明
- 无法使用 `pip install -e .` 安装项目
- 依赖管理完全依赖 `requirements.txt`（已不存在）或手动 `pip install`
- IDE 无法从 `pyproject.toml` 识别项目结构

这与 bug #49（`sys.path` 操作）是同一根本原因的上下游关系。

## 根因分析

- 项目初期使用 `requirements.txt` 管理依赖，后迁移至 `pyproject.toml` 但仅迁移了 pytest 配置
- 缺少 `[project]` 导致开发者必须手动管理 Python 环境和 `sys.path`
- `ruff.toml` 中有 lint 配置，但也未包含项目元数据

## 涉及文件

- `pyproject.toml` — 缺少 `[project]` 段

## 修复方案

添加 `[project]` 段：
```toml
[project]
name = "yiai"
version = "1.0.0"
description = "YiAi FastAPI Backend"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.140.0",
    "uvicorn>=0.51.0",
    "motor>=3.7.1",
    ...
]
```

配合 `pip install -e .` 消除 `sys.path` 操作的需要。

## 预防措施

- 所有 Python 项目必须有完整的 `[project]` 元数据

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
