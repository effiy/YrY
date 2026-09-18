---
doc_type: module
prd_task_id: "YA-09-28"
title: "YA-09-28: 健康度评分卡 — 多维度加权 SLA 评估 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "51-需求-健康度评分卡.md"
source_okr: [yiai-001]
---

# YA-09-28: 健康度评分卡 — 多维度加权 SLA 评估 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[51-需求-健康度评分卡.md](../../prds/2026-09/51-需求-健康度评分卡.md)
> 需求编号：YA-09-28 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

为 Dashboard 提供加权健康度评分，综合评估服务整体状态，而非简单的 up/down 二元判断。

### 评分维度

| 维度 | 权重 | 指标 | 评分规则 |
|------|------|------|---------|
| 可用性 | 30% | 成功率 (5min) | ≥ 99.9% = 100, < 95% = 0 |
| 延迟 | 25% | P95 响应时间 | < 200ms = 100, > 2s = 0 |
| 错误率 | 20% | 5xx 占比 | 0% = 100, > 5% = 0 |
| 吞吐量 | 15% | 请求/秒 vs 基线 | ≥ 基线 = 100, < 50% 基线 = 0 |
| 依赖健康 | 10% | MongoDB/Ollama 连接 | 全部 OK = 100, 任一失败 = 0 |

### 评分公式

```python
def health_score(metrics: dict) -> float:
    score = (
        availability_score(metrics["success_rate"]) * 0.30 +
        latency_score(metrics["p95_latency_ms"]) * 0.25 +
        error_score(metrics["error_rate"]) * 0.20 +
        throughput_score(metrics["rps"], metrics["baseline_rps"]) * 0.15 +
        dependency_score(metrics["dependencies"]) * 0.10
    )
    return round(score, 1)
```

### 等级

| 分数 | 等级 | 颜色 |
|------|------|------|
| ≥ 90 | 优秀 | 绿色 |
| 70-89 | 良好 | 蓝色 |
| 50-69 | 警告 | 黄色 |
| < 50 | 危险 | 红色 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 评分引擎 + 维度实现 | 各维度指标正确计算 | 0.5 |
| 2 | Dashboard 集成 + 测试 | YiVad 显示健康度仪表盘 | 0.5 |

**合计：1.0d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 集成：[YA-08-07 Dashboard](../2026-08/07-prd-task-Dashboard健康聚合API.md)
- 集成：[YA-09-12 健康探针](./20-prd-task-服务健康检查与就绪探针.md)