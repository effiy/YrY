---
title: "code-quality: repository.py 和 code_health_service.py 存在未使用变量"
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
module: src/data/repository.py, src/services/code_health_service.py
reporter: Claude
environment: development
affected_version: 1.0.0
fixed_version: 1.0.0
frequency: always
---

# code-quality: repository.py 和 code_health_service.py 存在未使用变量

## 现象

ruff 检查报 F841（assigned but never used）错误：

```
src/data/repository.py:514: F841 Local variable `query_label` is assigned to but never used
src/data/repository.py:520: F841 Local variable `query_label` is assigned to but never used
src/services/code_health_service.py:294: F841 Local variable `used` is assigned to but never used
```

## 复现步骤

1. 运行 `cd YiAi && python -m ruff check src/ --select=F841`
2. 观察未使用的变量

## 预期行为

所有变量赋值应被后续代码使用，或从代码中移除

## 实际行为

- `query_label` 在两处被赋值为 `f'key={doc_id}'` 和 `f'file_path={file_path}'`，但从未在后续代码中引用
- `used` 被赋值为两个集合的交集，但只有 `unused`（差集）被后续代码使用

## 根因分析

`query_label` 可能是为日志或异常消息预留的，但实际实现中未使用。`used` 是 `component_names & all_imported` 的交集，但代码只关心 `unused` 组件。

## 修复方案

移除所有未使用的变量赋值：
- `repository.py`: 删除两处 `query_label` 赋值
- `code_health_service.py`: 删除 `used = component_names & all_imported`，保留 `unused`

## 影响范围

- **影响模块**：src/data/repository.py、src/services/code_health_service.py
- **是否影响 API 契约**：否
- **是否影响其他项目**：否

## 验证方法

- [x] `ruff check` 清洁
- [x] `pytest tests/ -q` 通过（559 个测试）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 删除未使用的中间变量，或在需要时使用它们 |
| 测试 | CI 中启用 `ruff check` |
| 流程 | 每个 PR 运行 `ruff check --select=F841` |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
