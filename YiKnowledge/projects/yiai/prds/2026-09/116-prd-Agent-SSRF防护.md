---

doc_type: module
prd_id: "YA-09-116"
title: "YA-09-116: Agent Web-Fetch SSRF 防护 — 补齐工具层安全边界"
status: 已完成
priority: P1
owner: Claude
roles: [engineer, sre]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: 需求
---

# YA-09-116: Agent Web-Fetch SSRF 防护

> **PRD 版本**：v1.0 · **状态**：已完成

## 1. 背景

B21 修复了 `/web-fetch` HTTP 路由的 SSRF 漏洞。但 Agent 工具层的 `web_fetch` 工具（`domain/ai/tools/builtin/web_tools.py`）存在同类漏洞——`_is_url_allowed()` 在 `_ALLOWED_DOMAINS` 为空时返回 `True`（放行所有 URL），且无私有 IP 拦截。

## 2. 问题

`_is_url_allowed` 仅校验域名白名单，不校验 IP 地址范围。攻击者可通过恶意 Prompt 诱导 Agent 调用 `web_fetch` 访问内网服务。

## 3. 修复

在 `web_tools.py` 中添加 `_is_private_url()` 函数（与 `server/routes/search.py` 同逻辑），拦截 9 段私有/保留 IP：

```python
_PRIVATE_NETWORKS = [
    ipaddress.ip_network("10.0.0.0/8"),     # RFC 1918
    ipaddress.ip_network("172.16.0.0/12"),  # RFC 1918
    ipaddress.ip_network("192.168.0.0/16"), # RFC 1918
    ipaddress.ip_network("127.0.0.0/8"),    # loopback
    ipaddress.ip_network("169.254.0.0/16"), # link-local
    ipaddress.ip_network("0.0.0.0/8"),      # "This" network
    ipaddress.ip_network("fc00::/7"),       # IPv6 ULA
    ipaddress.ip_network("::1/128"),         # IPv6 loopback
    ipaddress.ip_network("fe80::/10"),       # IPv6 link-local
]
```

## 4. 验收标准

- [x] Agent `_web_fetch` 调用 `_is_private_url()` 拦截私有 IP
- [x] `localhost`、`169.254.169.254`、`10.0.0.1` 等被拦截
- [x] 公网 URL 正常通过
- [x] 457 个单元测试全部通过