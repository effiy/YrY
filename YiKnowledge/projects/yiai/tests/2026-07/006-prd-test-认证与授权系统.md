---

doc_type: test
title: "YA-07-06: 认证与授权系统 — bcrypt 密码哈希 + JWT 令牌管理 + HS256 签名 — 测试规格"
status: 待开始
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YA-07-06"
source_prds: ["06-需求-认证与授权系统"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-07-06: 认证与授权系统 — bcrypt + JWT + 可选中间件 — 测试规格

> **文档职责**：本文档定义认证与授权系统的**怎么验证**（VERIFY），覆盖 bcrypt 密码哈希、JWT 签发/验证、Token 中间件、登录/登出流程和用户管理。

> 来源 PRD：[06-需求-认证与授权系统.md](../../prds/2026-07/06-需求-认证与授权系统.md)
> 来源 Dev：[06-prd-task-认证与授权系统.md](../../devs/2026-07/06-prd-task-认证与授权系统.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数级，无外部依赖 | pytest | bcrypt hash/verify、JWT create/decode、空/畸形输入处理 |
| L2 集成测试 | 真实 HTTP 请求 + MongoDB test db | pytest-asyncio + httpx + motor | 登录/登出流程、中间件拦截、Token 过期、角色权限下发 |
| L3 手动回归 | YiVad 登录页面 | 手动 | 完整登录 → Token 持久化 → 受保护页面访问 |
| L4 安全审计 | 渗透测试 | 手动 | 计时攻击测试、Token 篡改、暴力破解防护 |

### 1.2 测试数据

```python
# tests/conftest.py 新增 fixtures

@pytest.fixture
def plain_password():
    """测试用明文密码。"""
    return "TestPass123!"

@pytest.fixture
def hashed_password(plain_password):
    """bcrypt 哈希后的密码。"""
    from domain.auth.core import hash_password
    return hash_password(plain_password)

@pytest.fixture
def test_user_data():
    """测试用户数据。"""
    return {
        "username": "testuser",
        "password": "TestPass123!",
        "roles": ["admin"],
        "permissions": ["users:read", "users:write", "data:read"]
    }

@pytest.fixture
def test_jwt_token(test_user_data):
    """签发的 JWT Token。"""
    from domain.auth.core import create_jwt
    return create_jwt(
        user_id="test_user_key_001",
        username=test_user_data["username"]
    )

@pytest.fixture
def expired_jwt_token():
    """已过期的 JWT Token。"""
    import jwt
    from datetime import datetime, timedelta, timezone
    secret = "yi-ai-dev-secret"
    payload = {
        "sub": "test_user",
        "username": "expired_user",
        "iat": datetime.now(timezone.utc) - timedelta(hours=48),
        "exp": datetime.now(timezone.utc) - timedelta(hours=24),
    }
    return jwt.encode(payload, secret, algorithm="HS256")

@pytest.fixture
def tampered_jwt_token(test_jwt_token):
    """被篡改的 JWT Token（修改 payload 但不重新签名）。"""
    parts = test_jwt_token.split(".")
    # base64 decode, modify payload, re-encode (but can't re-sign)
    import base64, json
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + "==="))
    payload["roles"] = ["superadmin"]  # privilege escalation attempt
    tampered_payload = base64.urlsafe_b64encode(
        json.dumps(payload).encode()
    ).rstrip(b"=").decode()
    return f"{parts[0]}.{tampered_payload}.{parts[2]}"

@pytest.fixture
async def test_user_in_db(test_mongo_collection, test_user_data, hashed_password):
    """在 MongoDB 中插入测试用户。"""
    user_doc = {
        "key": "test_user_key_001",
        "username": test_user_data["username"],
        "password_hash": hashed_password,
        "roles": test_user_data["roles"],
        "permissions": test_user_data["permissions"],
    }
    await test_mongo_collection.insert_one(user_doc)
    yield user_doc
    await test_mongo_collection.delete_one({"key": "test_user_key_001"})

@pytest.fixture
async def auth_client():
    """带认证的 httpx AsyncClient。"""
    from httpx import AsyncClient, ASGITransport
    from main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 bcrypt 密码哈希

---

#### TC-AUTH-001: hash_password 生成有效 bcrypt 哈希

| 字段 | 内容 |
|------|------|
| **ID** | TC-AUTH-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `hash_password("TestPass123!")`<br/>2. 检查返回值格式 |
| **预期结果** | - 返回值以 `$2b$` 或 `$2a$` 开头（bcrypt 前缀）<br/>- 哈希长度约 60 字符<br/>- 包含随机盐值<br/>- 两次调用同一密码生成不同哈希 |

---

#### TC-AUTH-002: verify_password 正确密码返回 True

| 字段 | 内容 |
|------|------|
| **ID** | TC-AUTH-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `hashed = hash_password("TestPass123!")`<br/>2. `result = verify_password("TestPass123!", hashed)` |
| **预期结果** | - `result` 为 `True`<br/>- `checkpw` 时间恒定比较 |

---

#### TC-AUTH-003: verify_password 错误密码返回 False

| 字段 | 内容 |
|------|------|
| **ID** | TC-AUTH-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `hashed = hash_password("TestPass123!")`<br/>2. `result = verify_password("WrongPassword456!", hashed)` |
| **预期结果** | - `result` 为 `False`<br/>- 不抛出异常 |

---

#### TC-AUTH-004: verify_password 空/None 输入返回 False

| 字段 | 内容 |
|------|------|
| **ID** | TC-AUTH-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `verify_password("", "any_hash")`<br/>2. `verify_password(None, "any_hash")`<br/>3. `verify_password("pass", "")`<br/>4. `verify_password("pass", None)` |
| **预期结果** | - 所有情况返回 `False`<br/>- 不抛出 `ValueError` 或 500 |

---

#### TC-AUTH-005: verify_password 畸形哈希不崩溃

| 字段 | 内容 |
|------|------|
| **ID** | TC-AUTH-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `verify_password("pass", "not-a-valid-bcrypt-hash")`<br/>2. `verify_password("pass", "plaintext")`<br/>3. `verify_password("pass", "")` |
| **预期结果** | - 全部返回 `False`<br/>- `bcrypt.checkpw` 抛出的 `ValueError("Invalid salt")` 被捕获<br/>- WARNING 日志记录 "verify_password rejected malformed stored hash"<br/>- 不返回 500 |

---

### 2.2 JWT 令牌管理

---

#### TC-JWT-001: create_jwt 生成有效令牌

| 字段 | 内容 |
|------|------|
| **ID** | TC-JWT-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `token = create_jwt("user_001", "testuser")`<br/>2. 解码 token（不验证签名）<br/>3. 检查 payload 字段 |
| **预期结果** | - token 为三部分 JWT 格式 (`xxx.yyy.zzz`)<br/>- payload 包含 `sub: "user_001"`<br/>- payload 包含 `username: "testuser"`<br/>- payload 包含 `iat`（签发时间）<br/>- payload 包含 `exp`（过期时间 = iat + 1440min） |

---

#### TC-JWT-002: decode_jwt 验证有效 Token

| 字段 | 内容 |
|------|------|
| **ID** | TC-JWT-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `token = create_jwt("user_001", "testuser")`<br/>2. `decoded = decode_jwt(token)` |
| **预期结果** | - `decoded` 不为 `None`<br/>- `decoded["sub"]` = `"user_001"`<br/>- `decoded["username"]` = `"testuser"` |

---

#### TC-JWT-003: decode_jwt 过期 Token 返回 None

| 字段 | 内容 |
|------|------|
| **ID** | TC-JWT-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `expired_jwt_token` fixture |
| **步骤** | 1. `result = decode_jwt(expired_jwt_token)` |
| **预期结果** | - `result` 为 `None`<br/>- `jwt.ExpiredSignatureError` 被捕获 |

---

#### TC-JWT-004: decode_jwt 篡改 Token 返回 None

| 字段 | 内容 |
|------|------|
| **ID** | TC-JWT-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `tampered_jwt_token` fixture（payload 被修改但签名不变） |
| **步骤** | 1. `result = decode_jwt(tampered_jwt_token)` |
| **预期结果** | - `result` 为 `None`<br/>- `jwt.InvalidSignatureError` 被捕获<br/>- 签名校验防止权限提升 |

---

#### TC-JWT-005: decode_jwt 错误密钥返回 None

| 字段 | 内容 |
|------|------|
| **ID** | TC-JWT-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 使用不同密钥签发的 Token |
| **步骤** | 1. 用密钥 A 签发 Token<br/>2. 配置密钥 B 的环境下去解码 Token |
| **预期结果** | - `result` 为 `None`<br/>- `jwt.InvalidSignatureError` 被捕获 |

---

#### TC-JWT-006: JWT 过期时间可配置

| 字段 | 内容 |
|------|------|
| **ID** | TC-JWT-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 配置 `jwt.expire_minutes=60` |
| **步骤** | 1. `token = create_jwt("user_001", "testuser")`<br/>2. 检查 `exp` 与 `iat` 的差值 |
| **预期结果** | - `exp - iat` = 3600 秒（60 分钟）<br/>- 配置值生效 |

---

### 2.3 HTTP 中间件

---

#### TC-MW-001: 认证关闭时所有请求放行

| 字段 | 内容 |
|------|------|
| **ID** | TC-MW-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `middleware.auth_enabled=false` |
| **步骤** | 1. 不带 X-Token 访问任意 RPC 端点 |
| **预期结果** | - 请求正常处理<br/>- 中间件跳过所有认证逻辑<br/>- 不返回 401 |

---

#### TC-MW-002: 认证开启时无 Token 返回 401

| 字段 | 内容 |
|------|------|
| **ID** | TC-MW-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `middleware.auth_enabled=true` |
| **步骤** | 1. 不带 X-Token 访问受保护端点<br/>2. 检查响应 |
| **预期结果** | - HTTP 401<br/>- `{"code": 4001, "message": "Unauthorized", "data": null}` |

---

#### TC-MW-003: 认证开启时有效 Token 正常放行

| 字段 | 内容 |
|------|------|
| **ID** | TC-MW-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `middleware.auth_enabled=true` |
| **步骤** | 1. 带有效 `X-Token: <jwt>` 访问受保护端点 |
| **预期结果** | - 请求正常处理<br/>- `request.state.user` 包含解码后的用户信息 |

---

#### TC-MW-004: 过期 Token 返回 401

| 字段 | 内容 |
|------|------|
| **ID** | TC-MW-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `middleware.auth_enabled=true` |
| **步骤** | 1. 带过期 JWT 访问受保护端点 |
| **预期结果** | - HTTP 401<br/>- `{"code": 4001, "message": "Token expired", "data": null}` |

---

#### TC-MW-005: 白名单路径不受认证限制

| 字段 | 内容 |
|------|------|
| **ID** | TC-MW-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `middleware.auth_enabled=true` |
| **步骤** | 1. 不带 Token 访问 `/auth/login`<br/>2. 不带 Token 访问 `/health/live`<br/>3. 不带 Token 访问 `/about` |
| **预期结果** | - 全部返回正常响应（不返回 401）<br/>- 中间件白名单路径匹配正确 |

---

### 2.4 登录/登出流程

---

#### TC-LOGIN-001: 正确密码登录成功返回 Token

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOGIN-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测试用户已在 MongoDB 中 |
| **步骤** | 1. `POST /auth/login` body=`{username: "testuser", password: "TestPass123!"}` |
| **预期结果** | - HTTP 200<br/>- `data.token` 为有效 JWT 字符串<br/>- `data.user` 包含 `username`, `roles`, `permissions`<br/>- 密码哈希不在响应中 |

---

#### TC-LOGIN-002: 错误密码登录返回 401

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOGIN-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测试用户已在 MongoDB 中 |
| **步骤** | 1. `POST /auth/login` body=`{username: "testuser", password: "WrongPassword"}` |
| **预期结果** | - HTTP 401<br/>- `{"code": 4001, "message": "Invalid credentials"}`<br/>- 不区分"用户不存在"和"密码错误"（防枚举） |

---

#### TC-LOGIN-003: 不存在用户登录返回 401

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOGIN-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `POST /auth/login` body=`{username: "nonexistent", password: "any"}` |
| **预期结果** | - HTTP 401<br/>- 与错误密码的错误消息相同（防用户枚举） |

---

#### TC-LOGIN-004: 空用户名/密码返回验证错误

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOGIN-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. `POST /auth/login` body=`{username: "", password: ""}`<br/>2. `POST /auth/login` body=`{}` |
| **预期结果** | - `{code: 1001, message: "Missing required fields"}`<br/>- 或返回 401（不崩溃） |

---

#### TC-LOGIN-005: 登出成功清理状态

| 字段 | 内容 |
|------|------|
| **ID** | TC-LOGIN-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 已登录状态 |
| **步骤** | 1. `POST /auth/logout` 带有效 Token |
| **预期结果** | - HTTP 200<br/>- `{code: 0, message: "ok"}`<br/>- 前端清除 Token 存储 |

---

### 2.5 权限与角色

---

#### TC-PERM-001: 菜单按角色下发

| 字段 | 内容 |
|------|------|
| **ID** | TC-PERM-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测试用户角色为 `admin` |
| **步骤** | 1. 带 admin Token 调用 `/auth/menu/list` |
| **预期结果** | - 返回 admin 角色对应的完整菜单树<br/>- 菜单结构包含 `path`, `name`, `parent`, `component`, `meta` |

---

#### TC-PERM-002: 按钮权限按角色下发

| 字段 | 内容 |
|------|------|
| **ID** | TC-PERM-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测试用户 `permissions: ["users:read"]` |
| **步骤** | 1. 带 Token 调用 `/auth/buttons` |
| **预期结果** | - 返回 `["users:read"]`<br/>- 不包含其他权限（如 `users:write`） |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: bcrypt 多轮 hash 不降级

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 对同一密码连续 hash 100 次<br/>2. 每次用上一次的 hash 结果作为输入 |
| **预期结果** | - 每次 `verify_password` 正确返回 `True` 或 `False`<br/>- 不因多轮嵌套而崩溃 |

### TC-EDGE-002: 并发登录不产生竞态

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 `asyncio.gather` 同时发起 20 个登录请求<br/>2. 检查所有 Token 是否可解码 |
| **预期结果** | - 所有 Token 有效<br/>- MongoDB 无竞态错误 |

### TC-EDGE-003: Token 即将过期时前端刷新

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. 使用 `exp` 剩余 < 5 分钟的 Token<br/>2. 检查前端是否触发刷新逻辑 |
| **预期结果** | - 当前无自动刷新（JWT 无状态）<br/>- 前端在过期前弹出重新登录提示<br/>- 或在过期后自动跳转登录 |

### TC-EDGE-004: 密码包含特殊字符和 Unicode

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. `hash_password("P@ss!中文#emoji😀\x00null")`<br/>2. `verify_password("P@ss!中文#emoji😀\x00null", hashed)` |
| **预期结果** | - hash 和 verify 正常工作<br/>- 特殊字符和 Unicode 正确编码/解码 |

### TC-EDGE-005: 生产环境密钥未配置时警告

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 不配置 `jwt.secret`（使用默认值 `yi-ai-dev-secret`）<br/>2. 在非开发环境启动 |
| **预期结果** | - WARNING 日志: "JWT secret is using default dev key"<br/>- 生产环境应报错或强制要求配置 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 现有端点不受中间件影响（认证关闭时）

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 认证关闭时，所有已有 RPC 端点和 REST 端点正常响应 |
| **预期结果** | - 无 401 误拦截<br/>- 响应格式与加入认证系统前一致 |

### TC-REG-002: 用户密码修改后旧 Token 仍有效

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 用户登录获取 Token<br/>2. 修改密码<br/>3. 用旧 Token 访问受保护端点 |
| **预期结果** | - 旧 Token 仍有效（JWT 无状态特性）<br/>- 这是已知行为，非 bug——后续可引入 Token 黑名单 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-bcrypt 密码哈希 | domain/auth/core.py | TC-AUTH-001~005 | L1 |
| FR-JWT 签发 | domain/auth/core.py | TC-JWT-001, TC-JWT-006 | L1 |
| FR-JWT 验证 | domain/auth/core.py | TC-JWT-002~005 | L1 |
| FR-HTTP 中间件 | server/middleware.py | TC-MW-001~005 | L2 |
| FR-登录流程 | server/routes/auth.py | TC-LOGIN-001~005 | L2 |
| FR-角色权限下发 | server/routes/auth.py | TC-PERM-001~002 | L2 |
| FR-边缘场景 | core.py + middleware.py | TC-EDGE-001~005 | L1+L2 |
| — | — | TC-REG-001~002 (回归) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| Token 黑名单/撤销 | JWT 无状态特性，无服务端 Session 存储 | 后续引入 Redis Token 黑名单 |
| 暴力破解防护 | 当前无登录失败次数限制 | 后续引入 rate limiting |
| 多因素认证 (MFA) | 未在需求范围内 | 按需扩展 |
| 密码强度校验 | 前端未强制密码复杂度 | 在后端 `hash_password` 前添加强度检查 |
| OAuth2 / 第三方登录 | 内部管理后台不需要 | 暂不考虑 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [06-需求-认证与授权系统.md](../../prds/2026-07/06-需求-认证与授权系统.md) |
| 源 Dev Module | [06-prd-task-认证与授权系统.md](../../devs/2026-07/06-prd-task-认证与授权系统.md) |
| RPC 信封协议测试 | [0003-prd-test-RPC信封协议.md](./003-prd-test-RPC信封协议.md) |
| bcrypt 官方文档 | [pypi.org/project/bcrypt](https://pypi.org/project/bcrypt/) |
| PyJWT 官方文档 | [pyjwt.readthedocs.io](https://pyjwt.readthedocs.io/) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-07/06-需求-认证与授权系统.md`*