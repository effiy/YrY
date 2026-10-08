---
title: "code-quality: except 块中 raise 未使用 from 保留异常链"
tags: [yiai, bug, code-quality, exception-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: closed
severity: minor
priority: p2
project: YiAi
module: src/data/repository.py, src/domain/execution/executor.py, src/server/routes/state.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: except 块中 raise 未使用 from 保留异常链

## 现象

ruff 检查报 8 个 B904（raise-without-from-inside-except）错误：

```
src/data/repository.py:321:9: B904 Within an `except` clause, raise exceptions with `raise ... from err`
src/data/repository.py:488:17: B904
src/data/repository.py:490:17: B904
src/domain/execution/executor.py:68:9: B904
src/domain/execution/executor.py:104:13: B904
src/domain/execution/executor.py:197:9: B904
src/server/routes/state.py:78:9: B904
src/server/routes/state.py:88:9: B904
```

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=B904`
2. 观察异常链中断的 raise 语句

## 预期行为

在 except 块中重新抛出异常时，应使用 `raise ... from err`（保留原始异常链）或 `raise ... from None`（明确抑制异常链）

## 实际行为

8 处 except 块中直接 `raise SomeException(...)` 未附加原始异常，导致排查问题时丢失根因信息

## 根因分析

| 文件 | 行 | 问题 |
|------|-----|------|
| `repository.py` | 321 | `raise ValueError(...)` 未附加原始 `ValueError` |
| `repository.py` | 488,490 | `raise ValueError(...)` 未附加原始 `Exception e` |
| `executor.py` | 68 | `raise BusinessException(...)` 未附加 `JSONDecodeError` |
| `executor.py` | 104 | `raise Exception(...)` 未附加 `TimeoutError` |
| `executor.py` | 197 | `raise BusinessException(...)` 未附加 `ImportError/AttributeError` |
| `state.py` | 78,88 | `raise BusinessException(...)` 未附加 `ValueError` |

## 修复方案

在所有 except 块的 raise 语句中添加 `from` 子句：

```diff
- except ValueError:
-     raise ValueError("Pagination parameters must be valid integers")
+ except ValueError as exc:
+     raise ValueError("Pagination parameters must be valid integers") from exc

- raise Exception(f"Script execution timeout ({timeout}s)")
+ raise Exception(f"Script execution timeout ({timeout}s)") from None

- raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"...")
+ raise BusinessException(ErrorCode.INVALID_PARAMS, message=f"...") from e
```

## 影响范围

- **影响模块**：3 个文件
- **是否影响 API 契约**：否（异常消息不变）
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check --select=B904` 清洁
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | except 块中始终使用 `raise ... from err` 或 `from None` |
| 测试 | CI 中启用 `ruff check --select=B904` |
| 流程 | 代码审查时检查异常链保留 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
