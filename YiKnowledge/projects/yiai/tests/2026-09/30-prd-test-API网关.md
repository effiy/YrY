---

doc_type: test
title: "YA-09-26: API 网关 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-26"
source_prds: ["30-需求-API网关"]
source_modules: []
source_okr: [yiai-002]

type: test
---

# YA-09-26: API 网关 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖统一入口请求转发、认证注入、CORS 处理、请求日志记录。

> 来源 PRD：[30-需求-API网关.md](../../prds/2026-09/30-需求-API网关.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 路由匹配、Header 注入 | pytest | URL 重写、认证头注入、CORS 预检 |
| L2 集成测试 | FastAPI 中间件 + httpx | pytest-asyncio + httpx | 请求转发、认证校验、OPTIONS 预检 |

### 1.2 网关功能矩阵

| 功能 | 描述 | 配置方式 |
|------|------|---------|
| 统一入口 | 所有请求通过 `/api/*` 进入 | 路由表 |
| CORS | 处理跨域预检和响应头 | Middleware |
| 认证注入 | 从 X-Token 解析用户信息注入请求 | Middleware |
| 请求日志 | 记录所有请求和响应状态 | Middleware |
| 超时控制 | 请求超时 30s | Middleware |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def gateway_routes():
    """网关路由配置。"""
    return {
        "/api/data": {"target": "http://localhost:10086", "method": "POST"},
        "/api/files": {"target": "http://localhost:10086", "method": "POST"},
        "/api/knowledge": {"target": "http://localhost:10086", "method": "POST"},
        "/api/chat": {"target": "http://localhost:10086", "method": "POST", "timeout": 300},
        "/health": {"target": "http://localhost:10086", "method": "GET", "auth_required": False},
    }

@pytest.fixture
def valid_auth_token():
    """有效 JWT Token。"""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdF91c2VyIiwicm9sZSI6ImFkbWluIn0.abc123"

@pytest.fixture
def expired_auth_token():
    """过期的 JWT Token。"""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdCIsImV4cCI6MTYwOTQ1OTIwMH0.xyz789"

@pytest.fixture
def rpc_envelope():
    """标准 RPC 请求体。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {"cname": "bugs", "filter": {}, "pageNum": 1, "pageSize": 10},
    }

@pytest.fixture
def cors_preflight_request():
    """CORS 预检请求。"""
    return {
        "method": "OPTIONS",
        "headers": {
            "Origin": "http://localhost:8848",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, X-Token",
        },
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 请求转发

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GW-01 | POST /api/data 转发到后端 | gateway_routes 配置 | 1. POST /api/data 含 RPC 信封<br>2. 检查响应 | 转发到 http://localhost:10086，返回后端响应 | P0 |
| TC-GW-02 | GET /health 免认证转发 | auth_required=False | 1. GET /health 无 Token<br>2. 检查响应 | 200 OK | P1 |
| TC-GW-03 | 未配置路由返回 404 | POST /api/unknown | 1. 请求未配置路由<br>2. 检查响应 | 404 Not Found | P1 |
| TC-GW-04 | 后端不可达返回 502 | 后端 YiAi 未启动 | 1. POST /api/data<br>2. 检查响应 | 502 Bad Gateway | P1 |

### 3.2 认证注入

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GW-05 | 有效 Token 注入请求头 | valid_auth_token | 1. POST /api/data 含 X-Token<br>2. 检查转发请求头 | 转发请求含 X-User: test_user, X-Role: admin | P0 |
| TC-GW-06 | 过期 Token 返回 401 | expired_auth_token | 1. POST /api/data 含过期 Token<br>2. 检查响应 | 401 Unauthorized | P1 |
| TC-GW-07 | 无 Token 的受保护路由返回 401 | 无 X-Token | 1. POST /api/data 无 Token<br>2. 检查响应 | 401 Unauthorized | P1 |
| TC-GW-08 | 免认证路由不校验 Token | GET /health | 1. 无 Token 请求<br>2. 检查响应 | 200 OK | P2 |

### 3.3 CORS 处理

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GW-09 | OPTIONS 预检返回允许方法 | cors_preflight_request | 1. OPTIONS /api/data<br>2. 检查响应头 | Access-Control-Allow-Methods: POST, Access-Control-Allow-Origin: http://localhost:8848 | P1 |
| TC-GW-10 | CORS 响应头附加 | POST 请求含 Origin | 1. POST /api/data<br>2. 检查响应头 | Access-Control-Allow-Origin 正确 | P1 |
| TC-GW-11 | 未授权 Origin 被拒绝 | Origin: http://evil.com | 1. 不在白名单的 Origin<br>2. 检查响应 | CORS 拒绝（根据配置） | P2 |

### 3.4 请求日志

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-GW-12 | 请求日志含方法/路径/状态码 | 正常请求 | 1. POST /api/data<br>2. 检查日志 | 日志含 POST /api/data 200 15ms | P2 |
| TC-GW-13 | 错误请求日志含错误信息 | 401 请求 | 1. 无 Token 请求<br>2. 检查日志 | 日志含 POST /api/data 401 "unauthorized" | P2 |
| TC-GW-14 | 超时请求日志 | 后端响应 > 30s | 1. POST /api/data<br>2. 检查日志 | 日志含 "timeout" 标记 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-GW-01 | 超大请求体 | 请求体 > 10MB | 413 Payload Too Large | P2 |
| EG-GW-02 | 请求体格式错误 | Body 非 JSON | 400 Bad Request | P1 |
| EG-GW-03 | Header 注入攻击 | X-Token: "admin\\r\\nX-Injected: true" | 过滤换行符，防止 Header 注入 | P1 |
| EG-GW-04 | 并发 100 请求 | 100 并发 POST /api/data | 全部正确转发，无连接泄漏 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-GW-01 | 直接访问后端不受影响 | 网关上线 | 直连 localhost:10086 行为不变 | P1 |
| RG-GW-02 | YiVad/YiPet 通过网关正常工作 | 前端改为通过网关访问 | 所有现有功能正常 | P0 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 请求转发 | TC-GW-01 ~ TC-GW-04 | 转发/免认证/404/502 |
| FR2: 认证注入 | TC-GW-05 ~ TC-GW-08 | 有效/过期/无Token/免认证 |
| FR3: CORS | TC-GW-09 ~ TC-GW-11 | 预检/响应头/白名单 |
| FR4: 请求日志 | TC-GW-12 ~ TC-GW-14 | 正常/错误/超时 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| WebSocket 代理 | 网关不支持 WebSocket | 添加 WebSocket upgrade 代理测试 |
| 速率限制在网关层 | 限流在网关而非后端 | 添加网关层令牌桶限流测试 |
| 响应缓存 | 网关层可缓存 GET 响应 | 添加网关 Cache-Control 头处理测试 |
| gRPC 代理 | 仅支持 HTTP/JSON | 添加 gRPC-web 代理支持测试 |