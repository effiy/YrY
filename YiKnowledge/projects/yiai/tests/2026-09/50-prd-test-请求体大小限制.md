---

doc_type: test
title: "YA-09-46: 服务端请求体大小限制与流式上传 — 大文件分块上传与进度追踪 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-46"
source_prds: ["50-需求-请求体大小限制"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-46: 服务端请求体大小限制与流式上传 — 测试规格

> **文档职责**：本文档定义请求体大小限制与流式上传的**怎么验证**（VERIFY），覆盖大小限制、分块上传、进度追踪和端点差异化配置。

> 来源 PRD：[50-需求-请求体大小限制.md](../../prds/2026-09/50-需求-请求体大小限制.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 大小限制中间件、字节计数 | pytest | 阈值判断、拒绝逻辑 |
| L2 集成 | 真实请求发送 + 流式读取 | pytest + httpx | 413 响应、分块上传、进度回调 |

### 1.2 测试数据

```python
@pytest.fixture
def body_limit_config():
    return {"default_max_bytes": 1 * 1024 * 1024,  # 1MB default
            "file_upload_max_bytes": 10 * 1024 * 1024}  # 10MB file endpoint

@pytest.fixture
def small_body():
    return {"data": "hello"}  # < 100 bytes

@pytest.fixture
def large_body():
    return {"data": "x" * (2 * 1024 * 1024)}  # 2MB
```

---

## 二、测试用例

### 2.1 大小限制

#### TC-BODY-001: 超过默认限制返回 413

| **ID** | TC-BODY-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 2MB 请求体（超过 1MB 默认限制） |
| **预期结果** | - HTTP 413 Payload Too Large<br/>- `{code: 1001, message: "Request body exceeds 1MB limit (received 2.00MB)"}`<br/>- 请求体不读取完整 |

#### TC-BODY-002: 正常大小请求通过

| **ID** | TC-BODY-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 small_body（< 1MB） |
| **预期结果** | - HTTP 200<br/>- 请求正常处理 |

#### TC-BODY-003: 端点差异化限制

| **ID** | TC-BODY-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发送 5MB 到 `/write-file`（file_upload 限制 10MB）<br/>2. 发送同样大小到 `/query_documents`（默认限制 1MB） |
| **预期结果** | - `/write-file`: 通过（5MB < 10MB）<br/>- `/query_documents`: 413（5MB > 1MB） |

### 2.2 流式上传

#### TC-BODY-004: 分块上传支持大于默认限制的文件

| **ID** | TC-BODY-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 以 1MB 块上传 5MB 文件<br/>2. 发送 `X-Upload-Chunk: 1/5` header |
| **预期结果** | - 每块独立验证（< endpoint 限制）<br/>- 合并后文件完整<br/>- `Content-Range` 正确 |

#### TC-BODY-005: 上传进度回调

| **ID** | TC-BODY-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 上传过程中检查进度<br/>2. chunk 1/5 -> 20%, chunk 3/5 -> 60% |
| **预期结果** | - `X-Upload-Progress: 60%`<br/>- 客户端可展示进度条 |

### 2.3 Content-Length 预检查

#### TC-BODY-006: 已知 Content-Length 超限时提前拒绝

| **ID** | TC-BODY-006 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. `Content-Length: 5242880`（5MB）发到默认限制端点 |
| **预期结果** | - 不读取请求体<br/>- 立即返回 413<br/>- 节省带宽和内存 |

#### TC-BODY-007: 未提供 Content-Length 时流式增量检查

| **ID** | TC-BODY-007 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 分块传输编码（无 Content-Length）<br/>2. 累计读取到超过限制 |
| **预期结果** | - 累计超过限制时断开连接<br/>- 不缓冲整个请求体 |

---

## 三、边界与异常测试

### TC-EDGE-001: 恰好等于限制大小
**步骤**：发送恰好 1MB 请求。  
**预期结果**：通过（`<=` 限制）。

### TC-EDGE-002: 空请求体
**步骤**：发送 `Content-Length: 0`。  
**预期结果**：正常处理（空 parameters）。

### TC-EDGE-003: Content-Length 与实际不符
**步骤**：`Content-Length: 100` 但实际发送 500 字节。  
**预期结果**：读取 100 字节后截断；超出的 400 字节被忽略或引发连接重置。

### TC-EDGE-004: 超大 Content-Length 溢出检查
**步骤**：`Content-Length: 9999999999999`（超过 Python int 合理范围）。  
**预期结果**：`ValueError` 捕获，返回 400。

---

## 四、回归测试

### TC-REG-001: 正常大小请求全部通过
**步骤**：运行全部 76 个测试（均 < 1MB 请求）。  
**预期结果**：100% 通过。无 413。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-大小限制 | TC-BODY-001~003 | L2 |
| FR-流式上传 | TC-BODY-004~005 | L2 |
| FR-预检查 | TC-BODY-006~007 | L1 |
| FR-边界 | TC-EDGE-001~004 | L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| WebSocket 消息大小 | 不同协议 | WebSocket 测试补充 |
| Nginx/反向代理层限制 | 反向代理可能更早截断 | 部署环境端到端测试 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/50-需求-请求体大小限制.md`*