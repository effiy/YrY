---
title: 未使用 functools.cached_property 缓存开销大的计算属性
tags: [yiai, code-quality, optimization]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# 未使用 functools.cached_property 缓存开销大的计算属性

## 现象

`config.py` 中的 `get_throttle_whitelist()` 每次调用都会调用 `Settings._to_list()` 解析字符串，但白名单不会变化。可以使用 `@cached_property` 仅计算一次。

## 涉及文件

- `src/shared/config.py:252` — get_throttle_whitelist

## 修复方案

```python
from functools import cached_property
@cached_property
def throttle_whitelist(self) -> List[str]:
    return Settings._to_list(self.observer_throttle_whitelist)
```

## 预防措施

恒定不变的派生配置使用 cached_property。

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `config.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
