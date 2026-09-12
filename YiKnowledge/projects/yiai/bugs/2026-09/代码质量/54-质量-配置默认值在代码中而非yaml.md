---
title: config.yaml 默认值硬编码在 Field(default=...) 而非配置文件中
tags: [yiai, code-quality, config-management]
category: projects/yiai/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiAi
type: bug
status: resolved
severity: trivial
priority: p3
---

# config.yaml 默认值硬编码在 Field(default=...) 而非配置文件中

## 现象

`src/shared/config.py` 中使用 pydantic `Field(default=...)` 设置了大量默认值，这些值在 `config.yaml` 中无对应条目时生效：

```python
# config.py — 硬编码默认值
knowledge_base_dir: str = Field("../YiKnowledge", ...)
menu_views_base_dir: str = Field("../YiVad/src/views", ...)
observer_throttle_enabled: bool = Field(True, ...)
observer_throttle_max_requests: int = Field(100, ...)
observer_throttle_window_seconds: int = Field(60, ...)
audit_retention_days: int = Field(90, ...)
```

`config.yaml` 是主配置文件，但部分默认值仅存在于 Python 代码中。如果运维人员查看 `config.yaml`，这些配置项不可见，导致修改时可能遗漏。

## 根因分析

- pydantic-settings 的 `Field(default=...)` 提供了便捷的默认值
- `config.yaml` 需要手动保持与 Field default 同步
- 生产环境推荐所有配置显式写在 YAML 中，Python default 仅作开发回退

## 涉及文件

- `src/shared/config.py` — 30+ Field(default=...) 硬编码
- `config.yaml` — 缺少部分配置项

## 修复方案

1. 将生产依赖的默认值写入 `config.yaml`
2. Python Field default 仅保留开发环境必需的回退值
3. 在启动时打印警告：哪些配置项使用了代码默认值而非 YAML 配置

## 预防措施

- YAML 配置文件应包含所有可配置项的注释版默认值

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- `src/shared/config.py`
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
