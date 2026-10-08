---

doc_type: test
title: "YA-09-31: 服务日志聚合与结构化 — 统一日志格式与采样的最佳实践 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa, sre]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-31"
source_prds: ["35-需求-结构化日志"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-31: 服务日志聚合与结构化 — 测试规格

> **文档职责**：本文档定义结构化日志模块的**怎么验证**（VERIFY），覆盖 JSON 格式化、日志级别采样、敏感信息脱敏和上下文字段注入。

> 来源 PRD：[35-需求-结构化日志.md](../../prds/2026-09/35-需求-结构化日志.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | StructuredFormatter 格式化、敏感字段过滤、级别采样逻辑 | pytest | 格式化输出、脱敏规则、采样决策 |
| L2 集成 | 真实模块日志输出验证 | pytest + 日志捕获 | 各模块日志格式一致性、WARNING/ERROR 完整性 |
| L3 手动回归 | 日志收集器（Loki/ELK）接入验证 | 手动 | 结构化查询、聚合分析 |

### 1.2 测试数据

```python
# tests/logging/conftest.py

import logging
import json
from shared.logging import StructuredFormatter

SENSITIVE_TEST_CASES = [
    ("password=123456", "password=***"),
    ("token=abc123", "token=***"),
    ("secret=xyz", "secret=***"),
    ('api_key="sk-abc"', 'api_key=***'),
    ("Authorization: Bearer token123", "Authorization: ***"),
    ("key=42", "key=***"),
]

@pytest.fixture
def structured_formatter():
    """返回 StructuredFormatter 实例。"""
    return StructuredFormatter()

@pytest.fixture
def log_capture():
    """捕获日志输出——返回 JSON 列表。"""
    import io
    stream = io.StringIO()
    handler = logging.StreamHandler(stream)
    handler.setFormatter(StructuredFormatter())
    logger = logging.getLogger("test_logger")
    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)
    logger.propagate = False
    yield logger, stream
    logger.removeHandler(handler)

@pytest.fixture
def sample_log_record():
    """构造标准 LogRecord。"""
    return logging.LogRecord(
        name="services.rag",
        level=logging.INFO,
        pathname="/app/services/rag/rag_service.py",
        lineno=42,
        msg="RAG query completed",
        args=(),
        exc_info=None,
    )
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 JSON 格式化

---

#### TC-LOG-001: 日志输出为合法 JSON

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `structured_formatter` + `sample_log_record` |
| **步骤** | 1. 调用 `formatter.format(sample_log_record)`<br/>2. `json.loads(output)` 解析 |
| **预期结果** | - 输出为合法 JSON<br/>- `json.loads` 不抛出 `JSONDecodeError`<br/>- 每行一条日志（NDJSON 格式） |

---

#### TC-LOG-002: JSON 包含必需字段

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `structured_formatter` + `sample_log_record` |
| **步骤** | 1. 格式化日志并解析 JSON<br/>2. 检查必需字段 |
| **预期结果** | - `timestamp`: ISO 8601 格式<br/>- `level`: "INFO"<br/>- `module`: "services.rag"<br/>- `message`: "RAG query completed"<br/>- `file`: "services/rag/rag_service.py"<br/>- `line`: 42 |

---

#### TC-LOG-003: 日志级别正确映射

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 5 个级别的 LogRecord |
| **步骤** | 1. 分别构造 DEBUG/INFO/WARNING/ERROR/CRITICAL 级别的 LogRecord<br/>2. 格式化并检查 `level` 字段 |
| **预期结果** | - `level` 值分别为: "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL" |

---

#### TC-LOG-004: 异常日志包含 exc_info

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | LogRecord 带有 `exc_info` |
| **步骤** | 1. 捕获 `ValueError("test error")` 异常<br/>2. 创建带 exc_info 的 LogRecord<br/>3. 格式化输出 |
| **预期结果** | - JSON 包含 `exception` 字段<br/>- `exception.type` = "ValueError"<br/>- `exception.message` = "test error"<br/>- `exception.traceback` 包含堆栈信息 |

---

### 2.2 敏感信息脱敏

---

#### TC-LOG-005: password/token/secret 自动脱敏

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `structured_formatter` + `SENSITIVE_TEST_CASES` |
| **步骤** | 1. 对每条敏感数据构造 LogRecord<br/>2. 格式化输出<br/>3. 检查 message 字段 |
| **预期结果** | - 所有敏感字段值被替换为 `***`<br/>- `password=123456` -> `password=***`<br/>- `token=abc123` -> `token=***`<br/>- `Authorization: Bearer token123` -> `Authorization: ***` |

---

#### TC-LOG-006: 大小写不敏感的敏感字段匹配

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 混合大小写的敏感字段: `Password`, `TOKEN`, `Api_Key` |
| **步骤** | 1. 构造包含 `Password=123`, `TOKEN=abc`, `Api_Key=xyz` 的消息<br/>2. 格式化 |
| **预期结果** | - `Password=123` -> `Password=***`<br/>- `TOKEN=abc` -> `TOKEN=***`<br/>- `Api_Key=xyz` -> `Api_Key=***` |

---

#### TC-LOG-007: 脱敏不影响正常日志内容

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-007 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 日志消息不包含敏感字段 |
| **步骤** | 1. 构造消息: `"RAG query completed in 245ms with 3 results"`<br/>2. 格式化输出 |
| **预期结果** | - 消息原样保留<br/>- 无多余替换<br/>- 性能无损 |

---

### 2.3 级别采样

---

#### TC-LOG-008: DEBUG 级别 1% 采样

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-008 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `sample_rate` 配置: DEBUG=1% |
| **步骤** | 1. 生成 10,000 条 DEBUG 日志<br/>2. 计数实际输出的日志数 |
| **预期结果** | - 实际输出约 100 条（允许 +/-20 条）<br/>- 采样率接近 1%<br/>- 使用确定性哈希确保可复现 |

---

#### TC-LOG-009: INFO/WARNING/ERROR/CRITICAL 100% 通过

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-009 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 采样配置: INFO 100%, WARNING 100%, ERROR 100% |
| **步骤** | 1. 生成 100 条 INFO 日志<br/>2. 生成 100 条 WARNING 日志<br/>3. 生成 100 条 ERROR 日志 |
| **预期结果** | - 所有 300 条日志全部输出<br/>- 无丢弃 |

---

#### TC-LOG-010: 采样率按模块可配置

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-010 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 配置: `watcher: DEBUG=0%`, `services.rag: DEBUG=5%` |
| **步骤** | 1. 生成 1,000 条 `watcher` DEBUG 日志<br/>2. 生成 1,000 条 `services.rag` DEBUG 日志<br/>3. 分别计数 |
| **预期结果** | - `watcher` DEBUG 输出 0 条<br/>- `services.rag` DEBUG 输出约 50 条<br/>- 不同模块采样率独立 |

---

### 2.4 上下文字段注入

---

#### TC-LOG-011: 请求链路日志包含 request_id 和 trace_id

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-011 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 结构化日志 + OpenTelemetry 同时启用 |
| **步骤** | 1. 发送 RPC 请求（X-Request-Id: abc123）<br/>2. 捕获日志输出<br/>3. 验证每条日志的上下文字段 |
| **预期结果** | - 所有请求链路日志包含 `request_id: "abc123"`<br/>- 所有日志包含 `trace_id`<br/>- `user` 字段为请求用户 |

---

#### TC-LOG-012: 后台任务日志无 request_id

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-012 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | apscheduler 触发的 Watcher 扫描（无 HTTP 请求上下文） |
| **步骤** | 1. 触发定时扫描<br/>2. 捕获日志<br/>3. 检查 `request_id` 字段 |
| **预期结果** | - `request_id` 为空字符串 `""`<br/>- 日志仍包含 `module` 和 `timestamp`<br/>- 不崩溃 |

---

#### TC-LOG-013: duration_ms 字段记录耗时

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOG-013 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | API 网关日志使用 `extra={"duration_ms": 245}` |
| **步骤** | 1. 发送 RPC 请求<br/>2. 捕获网关节点的日志<br/>3. 检查 `duration_ms` 字段 |
| **预期结果** | - 网关日志包含 `duration_ms`<br/>- 值为正整数（毫秒）<br/>- 与 Span 中的 duration 一致 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 日志消息包含不可序列化对象

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 构造消息: `"result: {obj}"`, `obj` 为不可 JSON 序列化的对象<br/>2. 格式化 |
| **预期结果** | - `json.dumps` 使用 `default=str` 降级<br/>- 日志仍为合法 JSON<br/>- WARNING 日志: "Log message contains non-serializable data" |

### TC-EDGE-002: 极长日志消息 (>10KB) 截断

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 构造 50KB 的日志消息<br/>2. 格式化输出 |
| **预期结果** | - `message` 截断到 10KB<br/>- 末尾附加 `...(truncated, original: 50000 bytes)` |

### TC-EDGE-003: 日志写入失败时不中断业务逻辑

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 磁盘写满<br/>2. 执行业务操作并记录日志 |
| **预期结果** | - 业务操作正常完成<br/>- 日志写入静默失败<br/>- `sys.stderr` 输出 fallback 日志 |

### TC-EDGE-004: Unicode/Emoji 日志消息正常处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 构造消息: `"查询完成，处理了100条数据"` |
| **预期结果** | - JSON 正常序列化<br/>- 中文字符不被转义为 `\uXXXX` |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 原有日志行为不丢失

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 启动 YiAi<br/>2. 检查 stderr/stdout 仍输出日志<br/>3. 验证 `configure_logging()` 不破坏原有 handler |
| **预期结果** | - 控制台仍显示日志（开发环境）<br/>- JSON 日志输出到 `logs/yiai.log`<br/>- 文件轮转正常 |

### TC-REG-002: 第三方库日志格式不受影响

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. 启用结构化日志<br/>2. 观察 uvicorn、motor、ollama 等第三方库日志 |
| **预期结果** | - 第三方库日志保持原格式<br/>- 仅 YiAi 自身 logger 受影响 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-JSON 格式化 | StructuredFormatter | TC-LOG-001~004 | L1 |
| FR-敏感信息脱敏 | 脱敏规则 | TC-LOG-005~007 | L1 |
| FR-DEBUG 1% 采样 | 采样器 | TC-LOG-008~010 | L1 |
| FR-上下文注入 | 日志上下文 | TC-LOG-011~013 | L2 |
| FR-各模块格式一致性 | 全模块 | TC-LOG-011~013 | L2 |
| FR-容错 | 异常处理 | TC-EDGE-001~004 | L1+L2 |
| FR-回归 | 日志收集器 | TC-REG-001~002 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| Loki/ELK 实际接入 | 需部署日志收集器基础设施 | 在 SRE 可观测性测试中补充 |
| 日志轮转（RotatingFileHandler） | 需长期运行验证 | 在 soak test（24h）中验证 |
| 采样决策的可复现性验证 | 需统计测试 | 使用确定性哈希算法保证 |
| 生产环境采样率调优 | 需真实流量数据 | 上线后根据日志量调整 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [35-需求-结构化日志.md](../../prds/2026-09/35-需求-结构化日志.md) |
| 分布式链路追踪 | [../2026-09/0033-prd-test-分布式链路追踪.md](../2026-09/033-prd-test-分布式链路追踪.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/35-需求-结构化日志.md`*