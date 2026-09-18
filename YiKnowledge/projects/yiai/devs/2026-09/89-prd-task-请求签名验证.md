---
doc_type: module
prd_task_id: "YA-09-43"
title: "YA-09-43: 请求签名验证 — HMAC + 时间戳防重放 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "89-需求-请求签名验证.md"
source_okr: [yiai-001]
---

# YA-09-43: 请求签名验证 — HMAC + 时间戳防重放 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[89-需求-请求签名验证.md](../../prds/2026-09/89-需求-请求签名验证.md)
> 需求编号：YA-09-43 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

为敏感端点（`/write-file`、`data_service.create_document`）增加请求签名校验，防止请求体被篡改和重放攻击。

### 签名算法

```python
import hmac, hashlib, time

def sign_request(method: str, path: str, body: str, secret: str, timestamp: int) -> str:
    message = f"{method}\n{path}\n{body}\n{timestamp}"
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

# 客户端发送
headers = {
    "X-Signature": sign_request("POST", "/write-file", body, secret, ts),
    "X-Timestamp": str(ts),
}

# 服务端验证
def verify(request, secret) -> bool:
    ts = int(request.headers["X-Timestamp"])
    if abs(time.time() - ts) > 300:  # 5 分钟窗口
        return False  # 重放保护
    expected = sign_request(request.method, request.url.path, await request.body(), secret, ts)
    return hmac.compare_digest(expected, request.headers["X-Signature"])
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | HMAC 中间件 | 签名错误返回 403 | 0.5 |
| 2 | 时间戳重放保护 + 测试 | 过期请求被拒绝 | 0.5 |

**合计：1.0d**。