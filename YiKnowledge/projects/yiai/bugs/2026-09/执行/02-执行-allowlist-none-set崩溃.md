---
title: "模块执行器 allowlist 为 None 时 set() TypeError"
tags: [bug, execution, allowlist, none-check, typeerror]
category: projects/yiai/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: major
priority: p1
project: yiai
module: domain/execution/executor.py
reporter: Claude
environment: all
affected_version: current
fixed_version: current
frequency: rare
roles: [engineer]
---

# 模块执行器 allowlist 为 None 时 set() TypeError

---

## 一、现象

> **一句话描述**：`config.yaml` 中 `module_allowlist` 未配置（None）时，`set(None)` 抛出 `TypeError: 'NoneType' object is not iterable`，导致模块导入时即崩溃。

---

## 二、复现步骤

1. 从 `config.yaml` 中删除 `module_allowlist` 字段
2. 启动 YiAi

实际 crash trace：

```
TypeError: 'NoneType' object is not iterable
  File "src/domain/execution/executor.py", line 25, in <module>
    EXEC_ALLOWLIST = set(allowlist)  # allowlist is None
```

---

## 三、根因分析

**问题代码**：`src/domain/execution/executor.py:22-25`

```python
allowlist = settings.module_allowlist
if isinstance(allowlist, str):          # None is not str
    allowlist = [x.strip() for x in allowlist.split(',') if x.strip()]
EXEC_ALLOWLIST = set(allowlist)         # set(None) → TypeError
```

**根因**：只处理了 `str` 和 `list` 两种情况，未处理 `None`。当 YAML 中 `module_allowlist` 缺失时，pydantic-settings 可能返回 `None`（取决于字段是否定义了默认值）。

---

## 四、修复方案

添加 None 检查，降级为空列表：

**修复后**：

```python
allowlist = settings.module_allowlist
if allowlist is None:
    allowlist = []
if isinstance(allowlist, str):
    allowlist = [x.strip() for x in allowlist.split(',') if x.strip()]
EXEC_ALLOWLIST = set(allowlist)
```

---

## 五、验证方法

- [ ] `python -c "from domain.execution.executor import EXEC_ALLOWLIST; print(EXEC_ALLOWLIST)"` 正常执行
- [ ] `python -m pytest tests/ -q` 通过
- [ ] 删除 `module_allowlist` 配置后，模块可正常导入

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `executor.py` |
| 是否影响 API 契约 | 否 |
| 是否影响前端 | 否 |
| 用户感知 | 应用启动崩溃 |
| 数据完整性 | 不涉及 |