---

doc_type: test
title: "YA-09-48: 服务配置漂移检测 — 运行时配置与期望状态的差异告警 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-48"
source_prds: ["52-需求-配置漂移检测"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-48: 服务配置漂移检测 — 测试规格

> **文档职责**：本文档定义配置漂移检测的**怎么验证**（VERIFY），覆盖差异检测、自动修复、漂移告警和审计日志。

> 来源 PRD：[52-需求-配置漂移检测.md](../../prds/2026-09/52-需求-配置漂移检测.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 差异算法、期望状态解析 | pytest | diff 计算、快照对比 |
| L2 集成 | 真实运行时配置 vs 配置文件对比 | pytest | 漂移检测、日志更新 |

### 1.2 测试数据

```python
@pytest.fixture
def expected_config():
    return {
        "server": {"port": 10086, "host": "0.0.0.0"},
        "mongodb": {"url": "mongodb://localhost:27017", "db": "yiai"},
        "knowledge": {"watcher_poll_seconds": 60},
    }

@pytest.fixture
def drifted_config():
    return {
        "server": {"port": 10087, "host": "0.0.0.0"},  # port drifted
        "mongodb": {"url": "mongodb://localhost:27017", "db": "yiai_test"}, # db drifted
        "knowledge": {"watcher_poll_seconds": 60},
    }
```

---

## 二、测试用例

### 2.1 漂移检测

#### TC-DRIFT-001: 检测到配置变更（漂移）

| **ID** | TC-DRIFT-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 对比 `expected_config` vs `drifted_config` |
| **预期结果** | - 检测到 3 个差异<br/>- `server.port: 10086 -> 10087`<br/>- `mongodb.db: yiai -> yiai_test`<br/>- 差异以结构化形式输出 |

#### TC-DRIFT-002: 无漂移时不触发告警

| **ID** | TC-DRIFT-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 对比两个完全相同的配置 |
| **预期结果** | - 差异列表为空<br/>- 日志: "No configuration drift detected" |

#### TC-DRIFT-003: 漂移仅新增字段不报错

| **ID** | TC-DRIFT-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 运行时配置比预期多 `new_feature: true` |
| **预期结果** | - 检测到额外字段<br/>- 级别: WARNING（非 ERROR）<br/>- 不标记为关键漂移 |

### 2.2 自动修复

#### TC-DRIFT-004: drift_auto_recover=true 时自动恢复

| **ID** | TC-DRIFT-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 运行时修改 Mongodb URL<br/>2. 漂移检测器检测并自动恢复 |
| **预期结果** | - 配置恢复到期望状态<br/>- 日志: "Auto-recovered drift: mongodb.url" |

#### TC-DRIFT-005: drift_auto_recover=false 时仅告警

| **ID** | TC-DRIFT-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 运行时修改 port<br/>2. 漂移检测仅告警 |
| **预期结果** | - 配置不自动恢复<br/>- 触发 P2 告警<br/>- 日志: "Drift detected but auto-recover disabled" |

### 2.3 定时检测

#### TC-DRIFT-006: 每 5 分钟自动检测一次

| **ID** | TC-DRIFT-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 设置 `drift.check_interval=300`<br/>2. 等待 6 分钟 |
| **预期结果** | - 至少 1 次检测日志<br/>- 日志: "[DriftCheck] scan complete, 0 drifts detected" |

---

## 三、边界与异常测试

### TC-EDGE-001: 期望配置文件不存在
**步骤**：预期配置文件缺失。  
**预期结果**：使用首次启动时的配置快照作为期望状态。

### TC-EDGE-002: 深层嵌套差异检测
**步骤**：`config.a.b.c.d` 改变。  
**预期结果**：深层路径正确展示: `a.b.c.d: old -> new`。

### TC-EDGE-003: 布尔值 false/null 区分
**步骤**：字段从 `false` 变为 `null`。  
**预期结果**：正确区分 false 和 null（不被视为相同）。

---

## 四、回归测试

### TC-REG-001: 漂移检测不影响配置加载性能
**步骤**：对比启用/未启用漂移检测的配置加载延迟。  
**预期结果**：额外开销 < 5ms。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-差异检测 | TC-DRIFT-001~003 | L1 |
| FR-自动修复 | TC-DRIFT-004~005 | L2 |
| FR-定时检测 | TC-DRIFT-006 | L2 |
| FR-边界 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 多实例间配置一致性 | 需多实例部署 | Kubernetes ConfigMap 测试补充 |
| JSON/YAML 字段顺序差异 | 语义相同但顺序不同 | 深度比较算法补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/52-需求-配置漂移检测.md`*