---

doc_type: test
prd_test_id: "YA-09-115"
title: "YA-09-115: 代码去重 — 测试方案"
status: 已完成
priority: P3
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"

type: test
---

# YA-09-115: 代码去重 — 测试方案

> **测试结果**：457 passed, 0 failed

## 1. 等价性验证

| 场景 | `_article_ts()` 旧行为 | `parse_ms_ts()` 新行为 |
|------|----------------------|----------------------|
| 秒级时间戳 `1700000000` | `1700000000000` | `1700000000000` |
| 毫秒级时间戳 `1700000000000` | `1700000000000` | `1700000000000` |
| ISO 格式 `2026-09-23T15:30:00Z` | ms timestamp | ms timestamp |
| 日期字符串 `2026-09-23` | ms timestamp | ms timestamp |
| 空值 `None` | `None` | `None` |
| 无效字符串 `"abc"` | `None` | `None` |

## 2. 回归测试

```bash
python -m pytest tests/unit/ -q
# 457 passed
```

## 3. 导入验证

```bash
# 确认 rss.py 不包含内联 _article_ts
grep -c "_article_ts" src/server/routes/dashboard/rss.py
# 预期：0

# 确认使用共享 parse_ms_ts
grep -c "parse_ms_ts" src/server/routes/dashboard/rss.py
# 预期：1
```