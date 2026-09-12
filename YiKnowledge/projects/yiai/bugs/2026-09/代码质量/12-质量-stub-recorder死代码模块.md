---
title: state/recorder.py 整个模块为死代码桩
tags: [yiai, code-quality, dead-code]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# state/recorder.py 整个模块为死代码桩

## 现象

`src/domain/state/recorder.py` 整个文件只有一个函数 `get_recorder()`，始终返回 `None`。该模块是 dead stub——从未被任何有效代码路径使用。

```python
def get_recorder():
    """Return a no-op recorder when state recording is not configured."""
    return None
```

## 根因分析

- 该模块是早期实现的占位桩，但从未被实际调用方填充
- 代码库中搜索 `get_recorder` 或 `from domain.state.recorder` 无任何引用
- 保留了代码但没有任何功能，增加维护负担和混淆

## 涉及文件

- `src/domain/state/recorder.py` — 整个文件（10 行）

## 修复方案

删除 `src/domain/state/recorder.py`。如果未来需要状态记录功能，从零实现。

## 预防措施

- 添加桩代码时，加上 TODO 注释和截止日期
- 定期清理超过 3 个月未被使用的桩代码

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/domain/state/recorder.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
