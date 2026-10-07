---

doc_type: test
prd_test_id: "YA-09-116"
title: "YA-09-116: Agent SSRF 防护 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-116: Agent SSRF 防护 — 测试方案

> **测试结果**：457 passed, 0 failed

## 测试矩阵

| 场景 | 预期 | 验证 |
|------|------|------|
| `http://localhost:10086` | 拦截 | 静态验证 |
| `http://169.254.169.254/latest` | 拦截 | 静态验证 |
| `http://10.0.0.1:27017` | 拦截 | 静态验证 |
| `http://[::1]:10086` | 拦截 | 静态验证 |
| `https://google.com` | 放行 | 静态验证 |
| DNS 解析到私有 IP | 拦截 | 静态验证 |
| `_ALLOWED_DOMAINS` 白名单优先 | `_is_url_allowed` 先于 `_is_private_url` | 静态验证 |

## 回归

```bash
python -m pytest tests/unit/ -q
# 457 passed
```