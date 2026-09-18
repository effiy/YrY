---
doc_type: module
prd_task_id: "YA-08-08"
title: "YA-08-08: 审计日志系统 — 装饰器驱动的数据变更追踪 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202608"
estimate_frontend: 1.5
source_prd: "08-需求-预写审计日志系统.md"
source_okr: [yiai-001]
related_tests: ["08-prd-test-预写审计日志系统"]
---

# YA-08-08: 审计日志系统 — 装饰器驱动的数据变更追踪 — 开发方案

> 来源 PRD：[08-需求-预写审计日志系统.md](../../prds/2026-08/08-需求-预写审计日志系统.md)
> 需求编号：YA-08-08 · 优先级：P1 · 人天：1.5d
> 类型：功能 · 状态：已完成

---

## 一、方案概述

在 [YA-08-04 预写审计日志](./04-prd-task-预写审计日志.md) 基础装饰器上扩展——增加变更差异计算、敏感字段脱敏、查询索引优化。

### 与 YA-08-04 的关系

| 维度 | YA-08-04 | YA-08-08（本模块） |
|------|---------|-------------------|
| 装饰器 | `@audit_log` 基础版 | 增强：diff 计算 + 脱敏 |
| 存储 | 单条日志 | 批量写入优化 |
| 查询 | 基础查询 | 索引优化 + 分页 |

---

## 二、增强功能

### 2.1 变更差异计算

```python
def _compute_diff(before: dict, after: dict) -> dict:
    """返回 { field: { old, new } } 仅包含变更字段"""
    diff = {}
    all_keys = set(before.keys()) | set(after.keys())
    for key in all_keys:
        if before.get(key) != after.get(key):
            diff[key] = {"old": before.get(key), "new": after.get(key)}
    return diff
```

### 2.2 敏感字段脱敏

```python
SENSITIVE_FIELDS = {"password", "token", "secret", "api_key"}

def _redact(data: dict) -> dict:
    return {k: "***" if k in SENSITIVE_FIELDS else v for k, v in data.items()}
```

---

## 三、实施步骤

| 步骤 | 内容 | 验证 | 人天 |
|------|------|------|------|
| 1 | diff 计算 + 脱敏 | 变更字段精确记录，密码不出现 | 0.5 |
| 2 | 批量写入 + 索引优化 | 100 条/批，查询 < 100ms | 0.5 |
| 3 | 测试 | 脱敏验证 + 批量写入验证 | 0.5 |

**合计：1.5d**。

---

## 四、关联模块

- 基础：[YA-08-04 预写审计日志](./04-prd-task-预写审计日志.md)
- 下游：[YA-09-09 审计日志查询](../2026-09/09-prd-task-审计日志.md)