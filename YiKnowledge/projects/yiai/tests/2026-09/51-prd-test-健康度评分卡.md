---

doc_type: test
title: "YA-09-47: 服务健康度评分卡 — 多维度加权可用性评估与 SLA 仪表盘 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-47"
source_prds: ["51-需求-健康度评分卡"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-47: 服务健康度评分卡 — 测试规格

> **文档职责**：本文档定义健康度评分卡的**怎么验证**（VERIFY），覆盖多维度加权计算、SLA 达标判定、趋势分析和告警联动。

> 来源 PRD：[51-需求-健康度评分卡.md](../../prds/2026-09/51-需求-健康度评分卡.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 评分算法、加权计算 | pytest | 公式正确性、边界分数 |
| L2 集成 | 实际服务指标计算 | pytest + httpx | API 响应、多维度汇总 |
| L3 手动 | Dashboard 可视化 | 手动 | 评分展示、趋势图表 |

### 1.2 测试数据

```python
@pytest.fixture
def score_dimensions():
    return {
        "availability": {"weight": 0.35, "score": 100},    # 可用性
        "latency_p99": {"weight": 0.25, "score": 85},      # P99延迟
        "error_rate": {"weight": 0.20, "score": 95},        # 错误率
        "saturation": {"weight": 0.10, "score": 70},        # 资源饱和度
        "dependencies": {"weight": 0.10, "score": 90},      # 依赖健康
    }
```

---

## 二、测试用例

### 2.1 评分计算

#### TC-SCORE-001: 加权总分计算正确

| **ID** | TC-SCORE-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 使用 `score_dimensions` 数据<br/>2. 计算加权总分 |
| **预期结果** | - 总分 = 100*0.35 + 85*0.25 + 95*0.20 + 70*0.10 + 90*0.10<br/>- 总分 = 91.25<br/>- 四舍五入精度 0.01 |

#### TC-SCORE-002: 单个维度 0 分时仍计算其他维度

| **ID** | TC-SCORE-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. availability=0（完全不可用）<br/>2. 计算总分 |
| **预期结果** | - 总分 > 0（其他维度仍有分）<br/>- availability=0 拉低总分 35 个百分点 |

### 2.2 SLA 判定

#### TC-SCORE-003: SLA 达标（总分 >= 95）

| **ID** | TC-SCORE-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 所有维度 >= 95 分 |
| **预期结果** | - 状态: "SLA_MET"<br/>- 绿色标识<br/>- 月度 SLA 连续达标计数 +1 |

#### TC-SCORE-004: SLA 警告（总分 80-94）

| **ID** | TC-SCORE-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. latency_p99=60 分，总分=85 |
| **预期结果** | - 状态: "SLA_AT_RISK"<br/>- 黄色标识<br/>- 触发 P2 告警 |

#### TC-SCORE-005: SLA 违约（总分 < 80）

| **ID** | TC-SCORE-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. availability=50, error_rate=30，总分=55 |
| **预期结果** | - 状态: "SLA_BREACHED"<br/>- 红色标识<br/>- 触发 P0 告警 |

### 2.3 API 端点

#### TC-SCORE-006: GET /health/score 返回完整评分

| **ID** | TC-SCORE-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. GET `/health/score` |
| **预期结果** | - 返回 `{overall: 91.25, sla_status: "SLA_AT_RISK", dimensions: {...}, updated_at: "..."}` |

#### TC-SCORE-007: 历史评分趋势（过去 24h）

| **ID** | TC-SCORE-007 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. GET `/health/score/history?hours=24` |
| **预期结果** | - 返回 24 个数据点（每小时 1 个）<br/>- 每个点包含时间戳和总分 |

---

## 三、边界与异常测试

### TC-EDGE-001: 某维度无数据时使用默认值
**步骤**：saturation 无数据（新服务）。  
**预期结果**：设默认 100 分 + 标记 "no_data"。

### TC-EDGE-002: 权重和不等于 1.0
**步骤**：配置中 weights 合计 = 0.8。  
**预期结果**：归一化到 1.0 + WARNING 日志。

### TC-EDGE-003: 评分计算延迟 < 10ms
**步骤**：大维度数量（20 个）。  
**预期结果**：计算 < 10ms。

---

## 四、回归测试

### TC-REG-001: /health 端点不受评分卡影响
**步骤**：GET `/health` 仍返回基本健康状态。  
**预期结果**：格式不变，延迟不变。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-评分 | TC-SCORE-001~002 | L1 |
| FR-SLA 判定 | TC-SCORE-003~005 | L1 |
| FR-API | TC-SCORE-006~007 | L2 |
| FR-边界 | TC-EDGE-001~003 | L1 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| SLA 月度报告自动生成 | 需前端集成 | YiVad 监控面板测试 |
| 多实例聚合评分 | 需 Prometheus 集成 | 可观测性测试补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/51-需求-健康度评分卡.md`*