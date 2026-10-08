---
title: ruff.toml 中禁用了过多 lint 规则
tags: [yiai, code-quality, linting]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# ruff.toml 中禁用了过多 lint 规则

## 现象

`ruff.toml` 中显式禁用了多条有助于代码质量的 lint 规则：

```toml
ignore = [
    "E402",    # sys.path manipulation precedes application imports
    "E501",    # 行过长
    "F841",    # 未使用变量
    "B904",    # raise without from inside except
    ...
]
```

- `E402` (模块级导入不在文件顶部) — 因 `sys.path` hack 而禁用，修复 bug #49 后可启用
- `F841` (未使用变量) — 禁用后无法检测 bug #17、#18、#51 类问题
- `B904` (raise without from) — 禁用后无法检测 bug #20 类问题

项目同时运行了这些规则（`select = ["E", "F", "B", ...]`）但在 ignore 中禁用——意味开发者认为这些是误报。

## 根因分析

- 规则因历史代码质量问题而被禁用
- 部分已修复的 bug（#17-#20 代码被清理）对应的规则可以重新启用

## 涉及文件

- `ruff.toml` — ignore 列表

## 修复方案

逐步减少 ignore 列表：每轮修复一个类别的代码问题后，重新启用对应的 ruff 规则。

## 预防措施

- 禁用 lint 规则时必须添加注释说明原因和计划修复日期

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
