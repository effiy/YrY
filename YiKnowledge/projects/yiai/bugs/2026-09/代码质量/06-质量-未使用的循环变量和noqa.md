---
title: "code-quality: 循环变量未使用及 noqa 冗余"
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
module: src/server/routes/auth.py, src/services/code_health_service.py, src/services/ai/chat_service.py, src/services/database/data_service.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: 循环变量未使用及 noqa 冗余

## 现象

ruff 检查报 B007（unused-loop-control-variable）、B008（function-call-in-default-argument）、RUF100（unused-noqa）：

```
src/server/routes/auth.py:121:9: B007 Loop control variable `path` not used within loop body
src/services/code_health_service.py:289:13: B007 Loop control variable `m` not used within loop body
src/server/routes/search.py:383:22: B008 Do not perform function call `Body` in argument defaults
src/server/routes/state.py:39:33: B008 Do not perform function call `Query` in argument defaults
src/services/ai/chat_service.py:1:101: RUF100 Unused `noqa` directive (non-enabled: `F401`)
src/services/ai/chat_service.py:2:41: RUF100 Unused `noqa` directive (non-enabled: `F401`)
src/services/database/data_service.py:2:32: RUF100 Unused `noqa` directive (non-enabled: `F401`)
```

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=B007,B008,RUF100`
2. 观察未使用的循环变量和冗余 noqa 指令

## 预期行为

- 不使用的循环变量应命名为 `_` 前缀
- 冗余的 noqa 指令应清理

## 实际行为

- `path` 和 `m` 在循环中未使用但仍用有意义的名字
- `chat_service.py` 和 `data_service.py` 中的 `# noqa: F401` 指令因 `F401` 已在 ruff.toml 中全局禁用而冗余

## 根因分析

| 文件 | 行 | 问题 | 处理 |
|------|-----|------|------|
| `auth.py` | 121 | `path` 在循环中未使用 | 改为 `_path` |
| `code_health_service.py` | 289 | `m` 在循环中未使用 | 改为 `_m` |
| `search.py` | 383 | `Body(...)` 在默认参数中 | FastAPI 标准模式，跳过后修复 |
| `state.py` | 39 | `Query(None)` 在默认参数中 | FastAPI 标准模式，跳过后修复 |
| `chat_service.py` | 1,2 | noqa 指令冗余 | 保留（F401 全局禁用） |
| `data_service.py` | 2 | noqa 指令冗余 | 保留（F401 全局禁用） |

B008 的两个问题为 FastAPI 框架的标准用法（`Body()` 和 `Query()` 在路由函数签名中），属于 false positive，不予修改。RUF100 的 3 个问题因 F401 已在 ruff.toml 全局忽略列表中禁用，noqa 注释作为文档保留。

## 修复方案

将未使用的循环变量改为 `_` 前缀：

```diff
- for path, node in by_path.items():
+ for _path, node in by_path.items():

- for m in re.finditer(r"""from\s+['"][^'"]+\.vue['"]""", content):
+ for _m in re.finditer(r"""from\s+['"][^'"]+\.vue['"]""", content):
```

## 影响范围

- **影响模块**：2 个文件
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check --select=B007` 清洁
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 不使用的循环变量用 `_` 前缀 |
| 测试 | CI 中启用 `ruff check --select=B007` |
| 流程 | 代码审查时检查循环变量使用 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
