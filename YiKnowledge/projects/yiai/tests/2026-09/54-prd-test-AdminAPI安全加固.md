---

doc_type: test
title: "YA-09-50: 服务 Admin API 安全加固 — 运维端点 Token 认证与审计日志 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-50"
source_prds: ["54-需求-AdminAPI安全加固"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-50: 服务 Admin API 安全加固 — 测试规格

> **文档职责**：本文档定义 Admin API 安全加固的**怎么验证**（VERIFY），覆盖 Token 认证、审计日志、权限校验和 IP 限制。

> 来源 PRD：[54-需求-AdminAPI安全加固.md](../../prds/2026-09/54-需求-AdminAPI安全加固.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | Token 验证、IP 匹配 | pytest | Admin Token 格式、过期检测 |
| L2 集成 | 受保护端点访问 | pytest + httpx | 401/403 响应、审计记录 |
| L3 手动 | 审计日志审查 | 手动 | 日志完整性、敏感操作可追溯 |

### 1.2 测试数据

```python
@pytest.fixture
def admin_token():
    """有效 Admin Token。"""
    return "yiai-admin-token-2026-secure"

@pytest.fixture
def admin_headers(admin_token):
    return {"X-Admin-Token": "yiai-admin-token-2026-secure"}

@pytest.fixture
def admin_endpoints():
    return ["/admin/clear-cache", "/admin/reload-config", "/admin/kill-session"]
```

---

## 二、测试用例

### 2.1 Token 认证

#### TC-ADM-001: 有效 Admin-Token 访问受保护端点

| **ID** | TC-ADM-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. POST `/admin/clear-cache` with valid `X-Admin-Token` |
| **预期结果** | - HTTP 200<br/>- 缓存清除成功<br/>- 审计日志记录管理员操作 |

#### TC-ADM-002: 缺失 Admin-Token 返回 401

| **ID** | TC-ADM-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. POST `/admin/clear-cache` 无 Token |
| **预期结果** | - HTTP 401<br/>- `{code: 4001, message: "Admin authentication required"}` |

#### TC-ADM-003: 无效 Admin-Token 返回 403

| **ID** | TC-ADM-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. POST with `X-Admin-Token: wrong-token` |
| **预期结果** | - HTTP 403<br/>- `{code: 4002, message: "Invalid admin token"}`<br/>- 连续 5 次失败触发 IP 临时封禁 |

### 2.2 审计日志

#### TC-ADM-004: 所有 Admin 操作记录审计日志

| **ID** | TC-ADM-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 执行 clear-cache, reload-config, kill-session<br/>2. 检查审计日志 |
| **预期结果** | - 每条日志包含: `operation`, `admin_user`, `source_ip`, `timestamp`, `result`<br/>- 3 条独立审计记录 |

#### TC-ADM-005: 审计日志不可删除（防篡改）

| **ID** | TC-ADM-005 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 尝试 DELETE /admin/audit-logs |
| **预期结果** | - 该端点不存在或返回 403<br/>- 审计日志为 append-only |

### 2.3 权限分级

#### TC-ADM-006: read-only Admin 不能执行写入操作

| **ID** | TC-ADM-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 read-only Token 访问 `/admin/kill-session` |
| **预期结果** | - HTTP 403<br/>- `{code: 4002, message: "Read-only admin cannot perform write operations"}` |

#### TC-ADM-007: super-admin 可执行全部操作

| **ID** | TC-ADM-007 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 super-admin Token 访问所有 `/admin/*` 端点 |
| **预期结果** | - 所有端点返回 200<br/>- 无权限限制 |

---

## 三、边界与异常测试

### TC-EDGE-001: Admin-Token 过期
**步骤**：Token 设置 `expires_at: 2026-01-01`，当前 2026-09-23。  
**预期结果**：403 + "Admin token expired"。

### TC-EDGE-002: IP 白名单限制
**步骤**：非白名单 IP 访问 Admin API。  
**预期结果**：403 + "IP not in admin whitelist"。

### TC-EDGE-003: 暴力破解保护——5 次失败后封禁 15 分钟
**步骤**：连续 5 次错误 Token。  
**预期结果**：第 6 次返回 429 "Too many attempts. IP blocked for 15min"。

---

## 四、回归测试

### TC-REG-001: 公开 RPC 端点不受 Admin 中间件影响
**步骤**：发送正常 RPC 请求（无 X-Admin-Token）。  
**预期结果**：正常处理。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-Token 认证 | TC-ADM-001~003 | L2 |
| FR-审计日志 | TC-ADM-004~005 | L1+L2 |
| FR-权限分级 | TC-ADM-006~007 | L2 |
| FR-边界 | TC-EDGE-001~003 | L2 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| MFA 双因素认证 | 未实现 | 后续版本评估 |
| Admin Token 轮换自动化 | 手动轮换 | 密钥管理测试补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/54-需求-AdminAPI安全加固.md`*