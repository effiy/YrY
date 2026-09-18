---
doc_type: module
prd_task_id: "YA-09-67"
title: "YA-09-67: 自适应日志采样 — 错误全量 + 正常采样 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "94-需求-自适应日志采样.md"
source_okr: [yiai-001]
---

# YA-09-67: 自适应日志采样 — 错误全量 + 正常采样 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[94-需求-自适应日志采样.md](../../prds/2026-09/94-需求-自适应日志采样.md)
> 需求编号：YA-09-67 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

高流量下全量日志成本高。自适应采样：错误请求 100% 记录，正常请求按重要性分级采样。

```python
class AdaptiveSampler:
    def should_log(self, request, response) -> bool:
        # 错误/慢请求：100% 记录
        if response.status_code >= 400: return True
        if response.duration_ms > 1000: return True
        # Admin API：50% 采样
        if request.url.path.startswith("/admin"): return random.random() < 0.5
        # 正常请求：10% 采样
        return random.random() < 0.1
```

### 采样率

| 请求类型 | 采样率 | 理由 |
|---------|--------|------|
| 错误 (4xx/5xx) | 100% | 排障必需 |
| 慢请求 (> 1s) | 100% | 性能分析 |
| Admin API | 50% | 安全审计 |
| 正常请求 | 10% | 流量趋势 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | AdaptiveSampler 实现 | 错误全量 + 正常抽样 | 0.25 |
| 2 | 采样率配置 + Dashboard + 测试 | 日志量降低 80%+ | 0.25 |

**合计：0.5d**。