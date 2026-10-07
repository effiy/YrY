---

doc_type: test
prd_test_id: "YA-09-118"
title: "YA-09-118: URL 守卫抽取 + CI 门禁 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-118: URL 守卫 + CI 门禁 — 测试方案

> **测试结果**：478 passed, 0 failed

## 新增测试

`tests/unit/shared/test_url_guard.py` — 21 用例

| 类别 | 用例数 | 覆盖 |
|------|--------|------|
| 拦截-回环 | 4 | localhost, 127.0.0.1, [::1] |
| 拦截-私有 | 3 | 10.0.0.1, 172.16.0.1, 192.168.1.1 |
| 拦截-元数据 | 2 | 169.254.169.254, metadata.google.internal |
| 拦截-IPv6 | 2 | fe80::1, fd12::1 |
| 放行-公网 | 4 | google.com, github.com, 8.8.8.8, 1.1.1.1 |
| 边界 | 2 | 空URL, 非法URL |

## CI 检查

```bash
bash scripts/ci-check.sh
# 5/5 PASS
```

## 回归

```bash
python -m pytest tests/unit/ -q
# 478 passed
```