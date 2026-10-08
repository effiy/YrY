---
title: "analytics 路由 asyncio.gather 缺少 return_exceptions 导致单查询失败拖垮整个端点"
tags: [bug, asyncio, gather, return_exceptions, analytics, error-propagation]
category: projects/yiai/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yiai
module: server/routes/analytics.py
reporter: Claude
environment: all
affected_version: current
fixed_version: current
frequency: occasional
roles: [engineer]
---

# analytics 路由 asyncio.gather 缺少 return_exceptions

---

## 一、现象

> **一句话描述**：`analytics.py` 的 `get_combined_metrics` 端点中 `asyncio.gather(efficiency, quality)` 未设置 `return_exceptions=True`。任一查询失败时，异常传播到 gather 导致另一个正常查询的结果也被丢弃，整个端点返回 500。

---

## 二、复现步骤

1. 访问 analytics 控制台
2. MongoDB 中 efficiency 或 quality 查询的一方因数据异常而失败
3. 整个 `/analytics/combined` 端返回 500
4. 正常情况下，一方失败不应影响另一方

---

## 三、根因分析

**问题代码**：`src/server/routes/analytics.py:97-100`

```python
efficiency_data, quality_data = await asyncio.gather(
    get_efficiency_metrics(params),
    get_quality_metrics(params),
)  # ❌ 无 return_exceptions=True
```

**对比**（同类端点已正确修复）：

```python
# health.py:179
mongo, ollama, collections = await asyncio.gather(
    _get_mongo_status(), _get_ollama_status(), _get_collection_counts(),
    return_exceptions=True,
)
```

**根因**：Gather 默认行为是首次异常立即取消其余任务并传播异常。`health.py`、`live.py`、`translate_service.py` 均已使用 `return_exceptions=True`，但 `analytics.py` 遗漏了。

---

## 四、修复方案

添加 `return_exceptions=True` + 异常结果检查：

**修复后**：

```python
efficiency_data, quality_data = await asyncio.gather(
    get_efficiency_metrics(params),
    get_quality_metrics(params),
    return_exceptions=True,
)
efficiency_data = efficiency_data if not isinstance(efficiency_data, BaseException) else {}
quality_data = quality_data if not isinstance(quality_data, BaseException) else {}
```

---

## 五、验证方法

- [ ] `python -m pytest tests/ -q` 通过
- [ ] 模拟 efficiency 查询失败，quality 查询结果仍正常返回

---

## 六、影响范围

| 维度 | 评估 |
|------|------|
| 影响模块 | `analytics.py` |
| 是否影响 API 契约 | 否（返回结构不变） |
| 是否影响前端 | YiVad Analytics 控制台 |
| 用户感知 | Dashboard 偶尔白屏 500 |
| 数据完整性 | 不涉及 |