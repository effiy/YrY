---

doc_type: test
title: "YA-09-43: 服务端请求体压缩与传输优化 — Gzip/Brotli 中间件集成 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-43"
source_prds: ["47-需求-响应压缩优化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-43: 服务端请求体压缩与传输优化 — 测试规格

> **文档职责**：本文档定义响应压缩优化的**怎么验证**（VERIFY），覆盖 Gzip/Brotli 协商、压缩率、大小阈值和 Content-Encoding。

> 来源 PRD：[47-需求-响应压缩优化.md](../../prds/2026-09/47-需求-响应压缩优化.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 压缩算法、Accept-Encoding 解析 | pytest | 协商逻辑、阈值判断 |
| L2 集成 | FastAPI GZipMiddleware 实际行为 | pytest + httpx | Content-Encoding、Content-Length 变化 |

### 1.2 测试数据

```python
@pytest.fixture
def large_response_data():
    """> 1KB 响应数据（触发压缩阈值）。"""
    return {"data": [{"id": i, "name": f"item-{i}", "desc": "x"*200} for i in range(100)]}

@pytest.fixture
def small_response_data():
    """< 500B 响应数据（不触发压缩）。"""
    return {"status": "ok"}
```

---

## 二、测试用例

### 2.1 压缩协商

#### TC-COMP-001: Accept-Encoding: gzip 时返回 gzip 响应

| **ID** | TC-COMP-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 RPC 请求 header: `Accept-Encoding: gzip`<br/>2. 检查响应 header |
| **预期结果** | - `Content-Encoding: gzip`<br/>- 响应体为 gzip 压缩<br/>- `Content-Length` 显著减少 |

#### TC-COMP-002: Accept-Encoding: br 时返回 Brotli 响应

| **ID** | TC-COMP-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送 header: `Accept-Encoding: br` |
| **预期结果** | - `Content-Encoding: br`<br/>- Brotli 压缩率优于 Gzip |

#### TC-COMP-003: 无 Accept-Encoding 时不压缩

| **ID** | TC-COMP-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 不发送 Accept-Encoding header |
| **预期结果** | - 无 `Content-Encoding` header<br/>- 响应体为原始 JSON |

### 2.2 压缩效果

#### TC-COMP-004: JSON 响应压缩率 > 70%

| **ID** | TC-COMP-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 `large_response_data` 请求<br/>2. 对比压缩前后大小 |
| **预期结果** | - Gzip 压缩率 > 70%<br/>- Brotli 压缩率 > 75% |

#### TC-COMP-005: 小于 1KB 的响应不压缩

| **ID** | TC-COMP-005 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 发送 `small_response_data` 请求 |
| **预期结果** | - 不压缩（小文件压缩开销 > 收益）<br/>- `Content-Encoding` 不存在 |

### 2.3 性能

#### TC-COMP-006: 压缩不显著增加延迟（< 5ms）

| **ID** | TC-COMP-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 对比压缩/不压缩的 P50 延迟 |
| **预期结果** | - 额外延迟 < 5ms<br/>- 网络传输时间减少 > 5ms（大响应时净收益为正） |

---

## 三、边界与异常测试

### TC-EDGE-001: 已压缩内容（如已 gzip 的 static file）不二次压缩
**步骤**：响应已有 `Content-Encoding: gzip`。  
**预期结果**：跳过压缩中间件。

### TC-EDGE-002: Accept-Encoding 多个值按优先级选择
**步骤**：`Accept-Encoding: br;q=1.0, gzip;q=0.8`。  
**预期结果**：选择 brotli（q 值最高）。

### TC-EDGE-003: 不支持任何已知编码时降级为不压缩
**步骤**：`Accept-Encoding: identity`。  
**预期结果**：不压缩。

---

## 四、回归测试

### TC-REG-001: 压缩后响应内容语义不变
**步骤**：解压响应并与未压缩对比。  
**预期结果**：JSON 内容完全一致。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-协商 | TC-COMP-001~003 | L2 |
| FR-压缩率 | TC-COMP-004~005 | L1+L2 |
| FR-性能 | TC-COMP-006 | L2 |
| FR-边界 | TC-EDGE-001~003 | L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| SSE 流式压缩 | GZipMiddleware 不支持流式 | 评估流式压缩方案 |
| 压缩字典复用 | Brotli 共享字典 | 生产环境调优后补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/47-需求-响应压缩优化.md`*