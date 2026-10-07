---

doc_type: test
title: "YA-09-45: 服务端 CORS 安全策略增强 — 动态 Origin 白名单与凭证管理 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-45"
source_prds: ["49-需求-CORS安全策略增强"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-45: 服务端 CORS 安全策略增强 — 测试规格

> **文档职责**：本文档定义 CORS 安全策略增强的**怎么验证**（VERIFY），覆盖 Origin 白名单、预检请求、凭证控制和动态配置。

> 来源 PRD：[49-需求-CORS安全策略增强.md](../../prds/2026-09/49-需求-CORS安全策略增强.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | Origin 匹配、通配符规则、白名单验证 | pytest | 匹配算法、模式解析 |
| L2 集成 | 真实 CORS 预检 + 实际请求 | pytest + httpx | OPTIONS 响应、CORS headers |

### 1.2 测试数据

```python
@pytest.fixture
def allowed_origins():
    return [
        "http://localhost:8848",
        "chrome-extension://*",
        "https://*.yry.example.com",
    ]

@pytest.fixture
def cors_client(app_with_cors):
    async with AsyncClient(
        transport=ASGITransport(app=app_with_cors), base_url="http://test"
    ) as ac:
        yield ac
```

---

## 二、测试用例

### 2.1 Origin 白名单

#### TC-CORS-001: 白名单 Origin 通过 CORS

| **ID** | TC-CORS-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `Origin: http://localhost:8848` 发送 OPTIONS 请求 |
| **预期结果** | - `Access-Control-Allow-Origin: http://localhost:8848`<br/>- HTTP 200 |

#### TC-CORS-002: 非白名单 Origin 被拒绝

| **ID** | TC-CORS-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `Origin: https://evil.com` 发送 OPTIONS 请求 |
| **预期结果** | - 无 `Access-Control-Allow-Origin` header<br/>- HTTP 400<br/>- 日志: "CORS blocked: origin https://evil.com not in whitelist" |

#### TC-CORS-003: 通配符匹配

| **ID** | TC-CORS-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. `Origin: https://app.yry.example.com` 匹配 `https://*.yry.example.com` |
| **预期结果** | - 匹配成功<br/>- `Access-Control-Allow-Origin: https://app.yry.example.com` |

### 2.2 预检请求

#### TC-CORS-004: OPTIONS 返回允许的方法和 headers

| **ID** | TC-CORS-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `Access-Control-Request-Method: POST` 发送 OPTIONS |
| **预期结果** | - `Access-Control-Allow-Methods: POST, GET, OPTIONS`<br/>- `Access-Control-Allow-Headers: Content-Type, X-Token`<br/>- `Access-Control-Max-Age: 86400` (24h) |

#### TC-CORS-005: 预检请求不经过业务逻辑

| **ID** | TC-CORS-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送 OPTIONS 请求<br/>2. 检查是否有 MongoDB 操作 |
| **预期结果** | - 无数据库查询<br/>- 响应延迟 < 1ms<br/>- 中间件直接返回 |

### 2.3 凭证控制

#### TC-CORS-006: 允许 credentials 时 Origin 不能为 *

| **ID** | TC-CORS-006 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 配置 `allow_credentials=True`<br/>2. 检查 Origin 是否为 `*` |
| **预期结果** | - 启动时 WARNING: "Credentials with wildcard origin is insecure"<br/>- 必须设置具体 Origin 列表 |

#### TC-CORS-007: YiPet chrome-extension 支持

| **ID** | TC-CORS-007 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `Origin: chrome-extension://abcdefghijkl` |
| **预期结果** | - `Access-Control-Allow-Origin: chrome-extension://abcdefghijkl`<br/>- chrome-extension Origin 有效 |

---

## 三、边界与异常测试

### TC-EDGE-001: 无 Origin header（非浏览器请求）
**步骤**：发送无 Origin header 的请求。  
**预期结果**：跳过 CORS 检查（允许通过）。

### TC-EDGE-002: Origin 白名单为空
**步骤**：`allowed_origins=[]`。  
**预期结果**：拒绝所有跨域请求。

### TC-EDGE-003: 超大白名单（1000+ Origin）
**步骤**：注册 1000 个 Origin。  
**预期结果**：匹配延迟 < 1ms（使用集合查找，非遍历）。

---

## 四、回归测试

### TC-REG-001: 现有前端（YiVad :8848, YiPet extension）CORS 正常
**步骤**：以 YiVad/YiPet Origin 发送请求。  
**预期结果**：全部通过。无 CORS 错误。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-白名单 | TC-CORS-001~003 | L1+L2 |
| FR-预检 | TC-CORS-004~005 | L2 |
| FR-凭证 | TC-CORS-006~007 | L1+L2 |
| FR-边界 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 动态白名单（数据库存储） | 当前为静态配置 | 配置中心热更新测试中补充 |
| CSP header 配合 | 不同安全层 | 前端安全测试补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/49-需求-CORS安全策略增强.md`*