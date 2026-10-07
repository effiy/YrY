---

doc_type: test
title: "YA-09-32: 服务异常监控与告警路由 — 分级告警与企微/Sentry 双通道推送 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa, sre]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-32"
source_prds: ["36-需求-告警路由"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-32: 服务异常监控与告警路由 — 测试规格

> **文档职责**：本文档定义告警路由模块的**怎么验证**（VERIFY），覆盖分级告警（P0-P3）、企微 Webhook 推送、Sentry 集成和告警抑制。

> 来源 PRD：[36-需求-告警路由.md](../../prds/2026-09/36-需求-告警路由.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 告警模型、级别路由逻辑、抑制规则引擎 | pytest | AlertRule 匹配、SuppressWindow 计算 |
| L2 集成 | 企微 Webhook Mock + Sentry SDK Mock | pytest + httpx | 双通道推送、告警模板渲染、重试机制 |
| L3 手动回归 | 真实企微 + Sentry 推送 | 手动 | 告警时效性、消息格式、链接跳转 |

### 1.2 测试数据

```python
# tests/alerting/conftest.py

from dataclasses import dataclass

@dataclass
class Alert:
    """告警模型。"""
    level: str  # P0, P1, P2, P3
    module: str
    title: str
    message: str
    trace_id: str = ""
    error_count: int = 1

@pytest.fixture
def p0_alert():
    """P0 致命告警——MongoDB 连接失败。"""
    return Alert(
        level="P0",
        module="services.database",
        title="MongoDB 连接失败",
        message="ServerSelectionTimeoutError: localhost:27017",
        trace_id="abc123",
    )

@pytest.fixture
def p1_alert():
    """P1 严重告警——Ollama 推理超时。"""
    return Alert(
        level="P1",
        module="services.ai",
        title="Ollama 推理超时",
        message="Ollama chat timeout after 30s",
        error_count=3,
    )

@pytest.fixture
def p2_alert():
    """P2 警告——Watcher 扫描部分失败。"""
    return Alert(
        level="P2",
        module="domain.knowledge",
        title="Watcher 扫描部分失败",
        message="Failed to parse 3 files out of 200",
    )

@pytest.fixture
def p3_alert():
    """P3 通知——DEPRECATED 参数使用。"""
    return Alert(
        level="P3",
        module="server.rpc",
        title="废弃参数使用",
        message="v1: deprecated param 'query' used by client",
    )

@pytest.fixture
def mock_webhook(httpx_mock):
    """Mock 企微 Webhook 端点。"""
    httpx_mock.add_response(
        url="https://qyapi.weixin.qq.com/cgi-bin/webhook/send",
        method="POST",
        json={"errcode": 0, "errmsg": "ok"},
    )
    return httpx_mock

@pytest.fixture
def mock_sentry(mocker):
    """Mock Sentry SDK。"""
    mock_capture = mocker.patch("sentry_sdk.capture_event")
    return mock_capture
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 告警分级与路由

---

#### TC-ALERT-001: P0 告警企微 + Sentry 双通道推送

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `p0_alert` + `mock_webhook` + `mock_sentry` |
| **步骤** | 1. 触发 P0 告警 `alert(p0_alert)`<br/>2. 检查企微 Webhook 调用<br/>3. 检查 Sentry 事件 |
| **预期结果** | - 企微 Webhook 被调用一次<br/>- Sentry `capture_event` 被调用一次<br/>- 企微消息 Markdown 格式正确<br/>- 两个通道都包含 trace_id |

---

#### TC-ALERT-002: P1 告警仅企微推送（无 Sentry）

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `p1_alert` + `mock_webhook` |
| **步骤** | 1. 触发 P1 告警<br/>2. 检查通道分发 |
| **预期结果** | - 企微 Webhook 被调用<br/>- Sentry 未被调用<br/>- P1 告警不占用 Sentry quota |

---

#### TC-ALERT-003: P2/P3 告警仅记录日志

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `p2_alert`, `p3_alert` |
| **步骤** | 1. 触发 P2 和 P3 告警<br/>2. 检查推送通道 |
| **预期结果** | - 企微 Webhook 未被调用<br/>- Sentry 未被调用<br/>- 日志包含完整告警信息<br/>- Dashboard 上可见告警计数 |

---

#### TC-ALERT-004: error_count >= 5 时自动升级到 P1

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | P2 告警的 `error_count` 达到 5 |
| **步骤** | 1. 连续触发 5 次 P2 告警<br/>2. 检查第 5 次告警的分发通道 |
| **预期结果** | - 第 5 次告警自动升级为 P1<br/>- 触发企微推送<br/>- 消息中标注: "Auto-escalated from P2 (5 occurrences)" |

---

### 2.2 告警抑制

---

#### TC-ALERT-005: 抑制窗口内相同告警不重复推送

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | P1 告警抑制窗口 = 5 分钟 |
| **步骤** | 1. 触发 `alert_1`（MongoDB 连接失败）<br/>2. 等待 1 分钟<br/>3. 再触发相同 `alert_1` |
| **预期结果** | - 第一次告警推送成功<br/>- 第二次告警被抑制<br/>- 日志: "Alert suppressed: same alert within 5min window"<br/>- `suppressed_count` 计数器 +1 |

---

#### TC-ALERT-006: 抑制窗口过期后恢复推送

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 抑制窗口 = 5 分钟 |
| **步骤** | 1. 触发告警 A<br/>2. 等待 6 分钟（超过抑制窗口）<br/>3. 再触发相同告警 A |
| **预期结果** | - 第 6 分钟后的告警正常推送<br/>- 消息中标注: "Re-alerting after 6min suppression" |

---

#### TC-ALERT-007: 不同告警不互相抑制

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-007 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 抑制窗口作用期内存在不同告警 |
| **步骤** | 1. 触发 MongoDB 告警<br/>2. 1 分钟后触发 Ollama 超时告警<br/>3. 检查推送次数 |
| **预期结果** | - 两个不同告警都推送<br/>- 抑制仅作用于相同 `(level, module, title)` 组合 |

---

### 2.3 企微消息模板

---

#### TC-ALERT-008: 企微 Markdown 消息格式正确

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-008 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 消息模板渲染 |
| **步骤** | 1. 渲染 `p0_alert` 的企微消息<br/>2. 检查 Markdown 内容 |
| **预期结果** | - 包含告警级别 emoji（P0/P1/P2/P3）<br/>- `title` 为加粗标题<br/>- `message` 为代码块<br/>- 包含 `trace_id` 和发生时间<br/>- 包含 YiVad 链接（可跳转） |

---

### 2.4 Sentry 集成

---

#### TC-ALERT-009: Sentry 事件包含完整上下文

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-009 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `p0_alert` + `mock_sentry` |
| **步骤** | 1. 触发 P0 告警<br/>2. 检查 `sentry_sdk.capture_event` 参数 |
| **预期结果** | - `level` = "fatal"<br/>- `extra.module` 包含模块信息<br/>- `extra.trace_id` 包含 trace_id<br/>- `tags.level` = "P0" |

---

#### TC-ALERT-010: Sentry 不可达时仅企微推送

| 字段 | 内容 |
|------|------|
| **ID** | TC-ALERT-010 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | Sentry SDK raise 异常 |
| **步骤** | 1. Mock `sentry_sdk.capture_event` 抛出 `NetworkError`<br/>2. 触发 P0 告警 |
| **预期结果** | - 企微推送成功<br/>- Sentry 异常被捕获<br/>- WARNING 日志: "Sentry event failed, alert sent via WeChat only" |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 企微 Webhook 不可达时重试 3 次

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. Mock Webhook 前两次失败（503），第三次成功<br/>2. 触发 P0 告警 |
| **预期结果** | - 重试 3 次<br/>- 第 3 次成功<br/>- 总延迟 < 3s |

### TC-EDGE-002: 企微 Webhook 3 次全失败降级

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. Mock Webhook 全部失败<br/>2. 触发 P0 告警 |
| **预期结果** | - 3 次重试全部失败<br/>- ERROR 日志: "Alert delivery failed after 3 retries"<br/>- 告警内容写入本地 `alerts_failed.log` |

### TC-EDGE-003: 极长告警消息截断

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 构造 10KB 的告警消息<br/>2. 渲染企微 Markdown |
| **预期结果** | - 消息截断到企微限制（4096 字符）<br/>- 末尾标注: "...(truncated)" |

### TC-EDGE-004: 告警风暴保护——1 分钟内最多推送 10 条

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 1 分钟内触发 50 条不同的 P0 告警<br/>2. 检查实际推送数 |
| **预期结果** | - 最多推送 10 条<br/>- 第 11 条起记入 aggregated 告警<br/>- 日志: "Alert storm detected, rate limited to 10/min" |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 告警不阻塞业务请求

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 在 RPC 请求处理中触发告警<br/>2. 测量请求延迟 |
| **预期结果** | - 告警为异步发送<br/>- RPC 请求延迟不受告警影响<br/>- 额外开销 < 1ms |

### TC-REG-002: 全局告警开关可禁用

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 配置 `alerts.enabled=false`<br/>2. 触发各类告警 |
| **预期结果** | - 无任何推送<br/>- 日志记录告警事件（不推送）<br/>- Dashboard 上仍可见告警计数 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-分级路由（P0-P3） | AlertRouter | TC-ALERT-001~004 | L1+L2 |
| FR-告警抑制 | SuppressRule | TC-ALERT-005~007 | L1 |
| FR-企微 Markdown 模板 | MessageTemplate | TC-ALERT-008 | L1 |
| FR-Sentry 集成 | SentryClient | TC-ALERT-009~010 | L2 |
| FR-重试与降级 | RetryHandler | TC-EDGE-001~002 | L2 |
| FR-风暴保护 | RateLimiter | TC-EDGE-004 | L1 |
| FR-性能 | AsyncSender | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 真实企微 Webhook 限频 | 测试使用 Mock，真实限频需生产验证 | 灰度环境验证企微 20条/分钟 限频 |
| Sentry Issue 分组 | 依赖 Sentry 服务端算法 | Sentry Dashboard 验证后补充 |
| 告警升级后自动恢复通知 | 需实现 RecoveryDetector | 后续版本补充 |
| Dashboard 告警聚合面板 | 需前端集成 | YiVad 监控面板测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [36-需求-告警路由.md](../../prds/2026-09/36-需求-告警路由.md) |
| 结构化日志 | [../2026-09/35-prd-test-结构化日志.md](../2026-09/35-prd-test-结构化日志.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/36-需求-告警路由.md`*