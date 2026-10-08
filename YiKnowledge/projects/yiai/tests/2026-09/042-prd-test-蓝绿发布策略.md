---

doc_type: test
title: "YA-09-38: 服务部署蓝绿发布策略 — 零停机滚动更新与流量切换 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-38"
source_prds: ["42-需求-蓝绿发布策略"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-38: 服务部署蓝绿发布策略 — 测试规格

> **文档职责**：本文档定义蓝绿发布策略的**怎么验证**（VERIFY），覆盖流量切换、健康检查、快速回滚和数据一致性。

> 来源 PRD：[42-需求-蓝绿发布策略.md](../../prds/2026-09/42-需求-蓝绿发布策略.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 流量分配算法、健康检查逻辑 | pytest | 权重计算、探针检查、路由规则 |
| L2 集成 | 模拟双实例环境 | pytest + multiprocessing | 流量切换、双写一致性、回滚触发 |

### 1.2 测试数据

```python
# tests/deployment/conftest.py

@pytest.fixture
def green_app_instance():
    """Green 环境 YiAi 实例（新版本）。"""
    # 启动在端口 10087
    proc = subprocess.Popen(["python", "main.py", "--port", "10087"])
    _wait_for_health("http://localhost:10087/health")
    yield "http://localhost:10087"
    proc.terminate()

@pytest.fixture
def blue_app_instance():
    """Blue 环境 YiAi 实例（当前版本）。"""
    # 启动在端口 10086
    proc = subprocess.Popen(["python", "main.py", "--port", "10086"])
    _wait_for_health("http://localhost:10086/health")
    yield "http://localhost:10086"
    proc.terminate()

@pytest.fixture
def traffic_router():
    """流量路由器——按权重分发请求。"""
    class TrafficRouter:
        def __init__(self):
            self.blue_weight = 1.0
            self.green_weight = 0.0

        def route(self, request):
            return "green" if random.random() < self.green_weight else "blue"

    return TrafficRouter()
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 流量切换

---

#### TC-BLUE-001: 初始状态——100% 流量到 Blue

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Blue 实例运行（10086），Green 实例运行（10087） |
| **步骤** | 1. 设置 `blue_weight=100, green_weight=0`<br/>2. 发送 100 个请求<br/>3. 检查请求分发 |
| **预期结果** | - 100 个请求全部路由到 Blue<br/>- Green 接收 0 个请求 |

---

#### TC-BLUE-002: 逐步切换——10% -> 50% -> 100% Green

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Blue + Green 都健康 |
| **步骤** | 1. 设置 green_weight=0.1，发送 100 请求<br/>2. 设置 green_weight=0.5，发送 100 请求<br/>3. 设置 green_weight=1.0，发送 100 请求 |
| **预期结果** | - Step 1: ~10 个到 Green，~90 个到 Blue<br/>- Step 2: ~50 个到 Green，~50 个到 Blue<br/>- Step 3: 100 个到 Green |

---

#### TC-BLUE-003: 逐步切换期间无 5xx 错误

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 在逐步切换期间持续发请求 |
| **步骤** | 1. green_weight 从 0 逐步增加到 1.0（60s 内）<br/>2. 持续发送请求<br/>3. 检查错误率 |
| **预期结果** | - 0 个 5xx 错误<br/>- 0 个连接中断<br/>- 请求延迟无突变 |

---

### 2.2 健康检查

---

#### TC-BLUE-004: Green 不健康时阻止流量切换

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Green 启动失败或 `/health` 返回 503 |
| **步骤** | 1. 尝试将 green_weight 设为 0.5<br/>2. Green 不健康 |
| **预期结果** | - green_weight 保持 0<br/>- 日志: "Green instance unhealthy, blocking traffic switch"<br/>- 所有流量仍到 Blue |

---

#### TC-BLUE-005: Green 在切换中途变不健康立即回退

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | green_weight=0.5，Green 突然宕机 |
| **步骤** | 1. 在 green_weight=0.5 时 Kill Green 进程<br/>2. 观察路由行为 |
| **预期结果** | - green_weight 立即回退到 0<br/>- 新请求全部到 Blue<br/>- 延迟 < 1s 完成切换<br/>- 已发送到 Green 的请求可能失败（可接受） |

---

### 2.3 快速回滚

---

#### TC-BLUE-006: 一键回滚到 Blue

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | green_weight=1.0（全量 Green） |
| **步骤** | 1. 触发回滚操作<br/>2. 设置 blue_weight=1.0 |
| **预期结果** | - green_weight 立即变为 0<br/>- 所有新请求回到 Blue<br/>- 回滚操作 < 1s |

---

#### TC-BLUE-007: 回滚后验证数据一致性

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-007 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 在 Green 期间有写入操作 |
| **步骤** | 1. Green 写入数据<br/>2. 回滚到 Blue<br/>3. 查询 Blue 中是否可读 Green 写入的数据 |
| **预期结果** | - Blue 可以读取 Green 写入的数据（共享 MongoDB）<br/>- 数据无丢失 |

---

### 2.4 数据库兼容

---

#### TC-BLUE-008: Blue/Green 双写期间不产生冲突

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-008 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | green_weight=0.5，Blue 和 Green 同时接收写入 |
| **步骤** | 1. 发送 100 个写入请求（50% 到 Blue，50% 到 Green）<br/>2. 检查 MongoDB 数据完整性 |
| **预期结果** | - 100 条记录全部存在<br/>- 无 duplicate key 错误<br/>- 数据版本正确 |

---

#### TC-BLUE-009: Schema 变更向后兼容

| 字段 | 内容 |
|------|------|
| **ID** | TC-BLUE-009 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | Green 新增可选字段 `priority`，Blue 无此字段 |
| **步骤** | 1. Green 写入带 `priority` 的文档<br/>2. Blue 读取该文档 |
| **预期结果** | - Blue 正常读取<br/>- 忽略未知字段 `priority`<br/>- 不报错 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 无 Blue 实例时仅 Green 服务

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. Blue 宕机，仅 Green 健康<br/>2. 强制 green_weight=1.0 |
| **预期结果** | - 所有流量到 Green<br/>- 日志: "Blue instance unavailable, routing all traffic to Green" |

### TC-EDGE-002: 两实例同时不健康

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. Blue 和 Green 都宕机 |
| **预期结果** | - 返回 HTTP 503<br/>- 日志: "All instances unhealthy, service unavailable" |

### TC-EDGE-003: 权重为非 0/1 时的一致性哈希

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. green_weight=0.5，使用请求 key 路由<br/>2. 相同 key 总是路由到相同实例 |
| **预期结果** | - 一致性哈希保证 sticky session<br/>- 同一 key 不跨实例 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 单实例部署模式不变

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 仅启动 Blue 实例<br/>2. 发送请求 |
| **预期结果** | - 所有功能正常<br/>- 无 Green 实例存在时的降级逻辑正确 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-流量切换 | TrafficRouter | TC-BLUE-001~003 | L2 |
| FR-健康检查 | HealthProbe | TC-BLUE-004~005 | L2 |
| FR-快速回滚 | Rollback | TC-BLUE-006~007 | L2 |
| FR-数据兼容 | DBCompat | TC-BLUE-008~009 | L2 |
| FR-边界 | 异常处理 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| K8s Service Mesh 层流量管理 | 当前为应用层路由 | 在 K8s 部署测试中补充 |
| DNS 切换延迟 | 需真实网络环境 | 生产演练时验证 |
| 多副本 MongoDB 写入冲突 | 需分片/副本集环境 | 在分片策略测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [42-需求-蓝绿发布策略.md](../../prds/2026-09/42-需求-蓝绿发布策略.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/42-需求-蓝绿发布策略.md`*