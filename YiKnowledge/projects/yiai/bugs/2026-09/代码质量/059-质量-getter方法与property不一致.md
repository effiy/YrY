---
title: 未使用 @property 封装简单的属性访问
tags: [yiai, code-quality, oop]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# 未使用 @property 封装简单的属性访问

## 现象

RSSSchedulerManager 和 KnowledgeWatcherManager 使用显式 `is_running` 方法而非 `@property` 装饰器来暴露布尔状态：

```python
# scheduler.py:42 — 方法而非属性
@property
def is_running(self) -> bool:
    return self._running

# watcher.py:112 — 同样的模式
@property  
def is_running(self) -> bool:
    return self._running
```

实际上这些已经用了 `@property`——但在其他类中（如 `RSSSchedulerManager`）同时有 `get_status()` 方法返回字典而 `is_running` 是 property，不一致。

此外 `settings.py` 中 `Settings` 类的配置项均通过 `pydantic.Field` 直接暴露，某些派生配置（如 `get_throttle_whitelist`）使用普通方法而非 `@property`：

```python
# config.py:252 — 方法而非 property
def get_throttle_whitelist(self) -> List[str]:
    return Settings._to_list(self.observer_throttle_whitelist)
```

## 根因分析

- Python 类中方法和属性的边界模糊——简单的无参数 getter 应该是 `@property`
- Team 没有统一的 OOP 风格指南

## 涉及文件

- `src/shared/config.py:252` — `get_throttle_whitelist()` 应为 `throttle_whitelist` property

## 修复方案

将无参数的计算属性封装为 `@property`。

## 预防措施

- 无参数且无副作用的方法使用 `@property`

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `settings.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
