---
title: model_runtime.py ImportError 捕获范围过宽
tags: [yiai, code-quality, error-handling]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# model_runtime.py ImportError 捕获范围过宽

## 现象

`services/ai/model_runtime.py:379,449` 使用 `except ImportError` 捕获可选依赖缺失，但 `ImportError` 会同时捕获深层导入错误——如果导入的模块存在但模块内部 `import` 了不存在的子模块，也会被静默吞没：

```python
# model_runtime.py:379
try:
    import deepseek
except ImportError:
    deepseek = None

# model_runtime.py:449
try:
    import deepseek
except ImportError:
    return None
```

## 根因分析

- 意图是检测"deepseek 库是否安装"
- 但如果 deepseek 安装成功但缺少子模块（如版本不匹配），ImportError 也被吞没
- 正确的做法是检查 `ModuleNotFoundError`（Python 3.6+ 的 ImportError 子类）

## 涉及文件

- `src/services/ai/model_runtime.py:379,449`

## 修复方案

```python
try:
    import deepseek
except ModuleNotFoundError:
    deepseek = None
```

`ModuleNotFoundError` 仅在顶层模块不存在时抛出，内部导入错误不受影响。

## 预防措施

- `except ImportError` → `except ModuleNotFoundError` 用于可选依赖检查

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
