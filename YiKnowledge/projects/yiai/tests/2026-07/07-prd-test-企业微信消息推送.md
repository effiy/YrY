---

doc_type: test
title: "企业微信机器人消息推送集成 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YI-07-07"
source_prds: ["07-需求-企业微信消息推送"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# 企业微信机器人消息推送集成 — 测试规格

> **文档职责**：本文档定义企业微信消息推送模块的**怎么验证**（VERIFY），覆盖 Webhook URL 验证、消息体构建、aiohttp 异步发送、Token 缓存刷新和 SSRF 防护。

> 来源 PRD：[07-需求-企业微信消息推送.md](../../prds/2026-07/07-需求-企业微信消息推送.md)
> 来源 Dev：[07-prd-task-企业微信消息推送.md](../../devs/2026-07/07-prd-task-企业微信消息推送.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级，mock aiohttp | pytest + unittest.mock + aioresponses | URL 验证、payload 构建、errcode 处理、Token 缓存逻辑 |
| L2 集成测试 | 真实 HTTP (mock 企微 API) | pytest-asyncio + httpx + aioresponses | send_message 端到端、Token 刷新、并发保护 |
| L3 手动回归 | 真实企微 Webhook | 手动 + curl | 消息送达企微群、文本格式正确 |
| L4 安全审计 | SSRF 渗透测试 | 手动 | 内部 URL 重定向、域名白名单绕过 |

### 1.2 测试数据

```python
# tests/conftest.py 新增 fixtures

@pytest.fixture
def valid_webhook_url():
    """有效的企微 Webhook URL。"""
    return "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test-key-12345"

@pytest.fixture
def invalid_webhook_url_not_wecom():
    """非企微域名的 Webhook URL（SSRF 尝试）。"""
    return "https://evil.com/webhook/send?key=test"

@pytest.fixture
def invalid_webhook_url_internal():
    """内部网络的 URL（SSRF 尝试）。"""
    return "http://192.168.1.1:8080/admin"

@pytest.fixture
def empty_webhook_url():
    """空 Webhook URL。"""
    return ""

@pytest.fixture
def valid_text_content():
    """有效的文本消息内容。"""
    return "这是一条来自 YiAi 的测试消息"

@pytest.fixture
def long_content():
    """超长消息内容（> 4096 字节）。"""
    return "x" * 5000

@pytest.fixture
def wework_success_response():
    """企微 API 成功响应。"""
    return {"errcode": 0, "errmsg": "ok"}

@pytest.fixture
def wework_error_response():
    """企微 API 错误响应。"""
    return {"errcode": 93000, "errmsg": "invalid webhook url"}

@pytest.fixture
def mock_wecom_api():
    """Mock 企微 Webhook API（使用 aioresponses）。"""
    from aioresponses import aioresponses
    with aioresponses() as m:
        yield m

@pytest.fixture
def cached_token():
    """模拟缓存中的 Access Token。"""
    return {
        "token": "test_access_token_abc123",
        "expires_at": time.time() + 7200  # 2h later
    }

@pytest.fixture
def expired_cached_token():
    """模拟过期的 Access Token。"""
    return {
        "token": "expired_token_xyz",
        "expires_at": time.time() - 60  # 60s ago (expired)
    }
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 Webhook URL 验证

---

#### TC-WEWORK-001: 有效企微域名 URL 通过验证

| 字段 | 内容 |
|------|------|
| **ID** | TC-WEWORK-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_validate_webhook_url("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=abc")` |
| **预期结果** | - 验证通过<br/>- 不抛出异常 |

---

#### TC-WEWORK-002: 非企微域名 URL 被拒绝 (SSRF 防护)

| 字段 | 内容 |
|------|------|
| **ID** | TC-WEWORK-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_validate_webhook_url("https://evil.com/webhook/send?key=test")` |
| **预期结果** | - 抛出 `BusinessException`<br/>- message 包含 "Invalid webhook URL domain"<br/>- 不能向非企微域名发送请求 |

---

#### TC-WEWORK-003: 内网 IP URL 被拒绝 (SSRF 防护)

| 字段 | 内容 |
|------|------|
| **ID** | TC-WEWORK-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. `_validate_webhook_url("http://192.168.1.1:8080/admin")`<br/>2. `_validate_webhook_url("http://10.0.0.1/api")`<br/>3. `_validate_webhook_url("http://127.0.0.1:10086/secret")` |
| **预期结果** | - 全部被拒绝<br/>- 保护内网服务不被 SSRF 攻击 |

---

#### TC-WEWORK-004: 空 URL 被拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-WEWORK-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_validate_webhook_url("")` |
| **预期结果** | - 抛出 `BusinessException`<br/>- message 包含 "Webhook URL is required" |

---

#### TC-WEWORK-005: 非 HTTPS URL 被警告或拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-WEWORK-005 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. 调用 `_validate_webhook_url("http://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test")` (HTTP 而非 HTTPS) |
| **预期结果** | - WARNING 日志: "Webhook URL should use HTTPS"<br/>- 实际处理策略根据代码实现（可能拒绝或放行加 WARNING） |

---

### 2.2 消息体构建

---

#### TC-MSG-001: text 类型 payload 构建

| 字段 | 内容 |
|------|------|
| **ID** | TC-MSG-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_build_text_payload("测试消息")`<br/>2. 检查返回的 dict |
| **预期结果** | - `{"msgtype": "text", "text": {"content": "测试消息"}}`<br/>- payload 可被 `json.dumps` 序列化 |

---

#### TC-MSG-002: 空内容被拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-MSG-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | — |
| **步骤** | 1. 调用 `_validate_content("")` |
| **预期结果** | - 抛出 `BusinessException`<br/>- message 包含 "Content cannot be empty" |

---

#### TC-MSG-003: 超长内容截断或拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-MSG-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 企业微信文本消息限制 2048 字节，markdown 限制 4096 字节 |
| **步骤** | 1. 构建 5000 字符的消息内容<br/>2. 调用 `_build_text_payload()` |
| **预期结果** | - 内容被截断到限制长度<br/>- 或抛出 `BusinessException` 提示内容过长<br/>- WARNING 日志记录截断 |

---

#### TC-MSG-004: 特殊字符正确处理

| 字段 | 内容 |
|------|------|
| **ID** | TC-MSG-004 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | — |
| **步骤** | 1. 构建包含 `\n`, `\t`, `"`, `'`, `<`, `>`, `&`, 中文, emoji 的消息内容<br/>2. 序列化为 JSON |
| **预期结果** | - JSON 正确序列化<br/>- 特殊字符被正确转义<br/>- 中文和 emoji 不被损坏 |

---

### 2.3 消息发送 (aiohttp)

---

#### TC-SEND-001: 成功发送消息 (mock 企微 API)

| 字段 | 内容 |
|------|------|
| **ID** | TC-SEND-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Mock 企微 API 返回 `{"errcode": 0, "errmsg": "ok"}` |
| **步骤** | 1. 配置 mock 返回 `wework_success_response`<br/>2. 调用 `send_message(webhook_url, content)`<br/>3. 检查返回值和 mock 调用 |
| **预期结果** | - 返回 `{"errcode": 0, "errmsg": "ok"}`<br/>- `aiohttp.ClientSession.post` 被调用 1 次<br/>- URL 为 `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=test-key-12345`<br/>- Content-Type 为 `application/json` |

---

#### TC-SEND-002: API 返回非零 errcode

| 字段 | 内容 |
|------|------|
| **ID** | TC-SEND-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Mock 企微 API 返回 `{"errcode": 93000, "errmsg": "invalid webhook url"}` |
| **步骤** | 1. 配置 mock 返回 `wework_error_response`<br/>2. 调用 `send_message(webhook_url, content)` |
| **预期结果** | - 抛出 `BusinessException`<br/>- message 包含 "WeCom API error: 93000 - invalid webhook url" |

---

#### TC-SEND-003: API 返回非 200 HTTP 状态码

| 字段 | 内容 |
|------|------|
| **ID** | TC-SEND-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Mock 企微 API 返回 HTTP 500 |
| **步骤** | 1. 配置 mock 返回 status=500<br/>2. 调用 `send_message(webhook_url, content)` |
| **预期结果** | - 抛出 `BusinessException`<br/>- message 包含 HTTP 状态码信息 |

---

#### TC-SEND-004: 网络超时

| 字段 | 内容 |
|------|------|
| **ID** | TC-SEND-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Mock 网络超时（不响应） |
| **步骤** | 1. 配置 mock 延迟 > 10s<br/>2. 调用 `send_message(webhook_url, content)` |
| **预期结果** | - `aiohttp.ClientTimeout(total=10)` 触发<br/>- 抛出 `asyncio.TimeoutError`<br/>- 或转换为 `BusinessException` |

---

#### TC-SEND-005: 连接拒绝

| 字段 | 内容 |
|------|------|
| **ID** | TC-SEND-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | Mock 连接被拒绝 |
| **步骤** | 1. 配置 mock 抛出 `aiohttp.ClientConnectorError`<br/>2. 调用 `send_message(webhook_url, content)` |
| **预期结果** | - 抛出 `BusinessException`<br/>- message 包含连接错误信息 |

---

### 2.4 Access Token 管理

---

#### TC-TOKEN-001: 首次获取 Token

| 字段 | 内容 |
|------|------|
| **ID** | TC-TOKEN-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 缓存为空，Mock 企微 Token API |
| **步骤** | 1. 清除 Token 缓存<br/>2. 调用 `_get_access_token()` |
| **预期结果** | - 调用企微 API 获取新 Token<br/>- Token 写入缓存<br/>- `expires_at` 设置正确 |

---

#### TC-TOKEN-002: 缓存有效时直接返回

| 字段 | 内容 |
|------|------|
| **ID** | TC-TOKEN-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 缓存中有未过期 Token |
| **步骤** | 1. `cached_token` 剩余 2h<br/>2. 调用 `_get_access_token()` |
| **预期结果** | - 直接从缓存返回<br/>- 不调用企微 API<br/>- 日志 "Using cached access token" |

---

#### TC-TOKEN-003: Token 提前 60s 刷新

| 字段 | 内容 |
|------|------|
| **ID** | TC-TOKEN-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 缓存 Token 剩余 < 60s |
| **步骤** | 1. `cached_token.expires_at = time.time() + 30` (剩余 30s)<br/>2. 调用 `_get_access_token()` |
| **预期结果** | - `time.time() < expires_at - 60` 判断为 False<br/>- 触发刷新，调用企微 API 获取新 Token<br/>- 新 Token 写入缓存 |

---

#### TC-TOKEN-004: Token 已过期时重新获取

| 字段 | 内容 |
|------|------|
| **ID** | TC-TOKEN-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `expired_cached_token` fixture |
| **步骤** | 1. 缓存 Token 已过期<br/>2. 调用 `_get_access_token()` |
| **预期结果** | - 调用企微 API 重新获取<br/>- 新 Token 写入缓存 |

---

#### TC-TOKEN-005: 并发刷新 Token 仅请求一次

| 字段 | 内容 |
|------|------|
| **ID** | TC-TOKEN-005 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Token 即将过期，20 个并发请求同时触发 |
| **步骤** | 1. 设置 Token 为即将过期状态<br/>2. 使用 `asyncio.gather` 同时调用 20 次 `_get_access_token()` |
| **预期结果** | - `asyncio.Lock` 保护，仅调用企微 API 一次<br/>- 双重检查：等待锁期间 Token 已被刷新，直接返回<br/>- 所有 20 次调用返回相同的 Token |

---

### 2.5 前后端集成

---

#### TC-INTEG-001: RPC 端点 /wework/send-message 正常调用

| 字段 | 内容 |
|------|------|
| **ID** | TC-INTEG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Mock 企微 API |
| **步骤** | 1. `POST /wework/send-message` body=`{webhook_url: "...", content: "test"}` |
| **预期结果** | - HTTP 200<br/>- `{code: 0, data: {errcode: 0}}` |

---

#### TC-INTEG-002: 前端转发失败不影响对话流程

| 字段 | 内容 |
|------|------|
| **ID** | TC-INTEG-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Mock 企微 API 返回错误 |
| **步骤** | 1. AI Chat 完成 → 触发 `forwardReplyToWeCom`<br/>2. 企微转发失败<br/>3. 检查 Chat 流程是否中断 |
| **预期结果** | - `.catch(() => {})` 静默忽略转发失败<br/>- 对话完成流程不受影响<br/>- 错误日志记录但用户无感知 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: Webhook Key 未配置时跳过

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 不配置 `wework.webhook_key`<br/>2. 尝试调用 `send_message()` |
| **预期结果** | - 日志 WARNING: "WeWork webhook key not configured"<br/>- 返回明确错误或跳过<br/>- 不崩溃 |

### TC-EDGE-002: 企业微信频率限制 (rate limit)

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | Mock 企微 API 返回 rate limit 错误 (`errcode: 45009`) |
| **步骤** | 1. 快速连续发送 20 条消息<br/>2. 检查错误处理 |
| **预期结果** | - 前 N 条成功<br/>- 超出频率限制后返回 `errcode: 45009`<br/>- 每条失败独立处理，不阻断后续 |

### TC-EDGE-003: URL 包含 @ 符号绕过域名检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. `_validate_webhook_url("https://qyapi.weixin.qq.com@evil.com/webhook")`<br/>2. 检查域名解析结果 |
| **预期结果** | - URL 解析后实际域名为 `evil.com`<br/>- 被拒绝（域名白名单不匹配） |

### TC-EDGE-004: 消息包含 Markdown 格式（当前仅 text）

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. 发送包含 `**bold**`, `# Title`, 代码块的 Markdown 内容 |
| **预期结果** | - 当前仅支持 text，Markdown 语法被保留为纯文本<br/>- 企业微信中显示为原始 Markdown 文本<br/>- 后续可扩展 `msgtype: "markdown"` |

### TC-EDGE-005: `send_message` 未配置时优雅降级

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 企微相关配置全部缺失<br/>2. 调用 `send_message()` |
| **预期结果** | - 不抛 `AttributeError`（配置字段不存在）<br/>- 返回明确的配置错误<br/>- 或发送模块自动禁用 |

### TC-EDGE-006: localStorage 中机器人配置损坏

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-006 |
| **层级** | L2 集成 |
| **优先级** | P2 |
| **步骤** | 1. localStorage `chat_wechat_robots` 值为非法 JSON<br/>2. 前端调用 `loadRobots()` |
| **预期结果** | - `JSON.parse` 错误被 catch<br/>- 返回空数组 `[]`<br/>- 不阻止消息发送流程 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: AI Chat 非企微路径不受影响

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 未配置任何企微机器人<br/>2. 正常进行 AI Chat 对话<br/>3. 检查 SSE 流是否正常 |
| **预期结果** | - 对话流程完全正常<br/>- `forwardReplyToWeCom` 因无目标机器人而直接返回<br/>- 无任何企微相关异常 |

### TC-REG-002: WeWork 模块作为独立领域模块

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 移除 `domain/wework/` 目录<br/>2. 检查 AI Chat 是否受影响 |
| **预期结果** | - AI Chat 核心功能不受影响<br/>- 仅企业微信转发功能不可用<br/>- WeWork 是独立模块，无紧耦合 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-URL 域名白名单 (SSRF) | client.py | TC-WEWORK-001~005 | L1 |
| FR-消息体构建 (text) | client.py | TC-MSG-001~004 | L1 |
| FR-aiohttp 发送 + errcode | client.py | TC-SEND-001~005 | L2 |
| FR-Access Token 缓存刷新 | client.py | TC-TOKEN-001~005 | L1+L2 |
| FR-RPC 端点 | routes/wework.py | TC-INTEG-001~002 | L2 |
| FR-前端转发静默失败 | YiVad aiChat.ts | TC-INTEG-002 | L2 |
| FR-边缘场景 | client.py | TC-EDGE-001~006 | L1+L2 |
| — | — | TC-REG-001~002 (回归) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 真实企微 Webhook E2E | 测试环境无真实企微 Webhook URL | 使用企业微信测试群进行手动回归 |
| markdown 消息类型 | 当前仅实现 text，markdown 未开发 | 后续迭代补充 markdown 类型测试 |
| 消息发送速率限制 (客户端) | 当前无 rate limiter | 后续引入 client-side rate limiter |
| 消息发送历史记录 | 未实现 | 在可观测性迭代中补充审计日志 |
| 跨设备机器人配置同步 | localStorage 无法跨设备 | 后续将配置存储到 MongoDB |
| 多机器人并发发送 | 当前 `Promise.all` 并发发送 | 补充并发量和超时控制测试 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [07-需求-企业微信消息推送.md](../../prds/2026-07/07-需求-企业微信消息推送.md) |
| 源 Dev Module | [07-prd-task-企业微信消息推送.md](../../devs/2026-07/07-prd-task-企业微信消息推送.md) |
| 企业微信 API 文档 | [developer.work.weixin.qq.com](https://developer.work.weixin.qq.com/document/path/91770) |
| 企微 Token 刷新无并发保护 Bug | [../../bugs/2026-09/企业微信/01-企微-Token刷新无并发保护.md](../../bugs/2026-09/企业微信/01-企微-Token刷新无并发保护.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-07/07-需求-企业微信消息推送.md`*