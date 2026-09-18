---
doc_type: test
title: "安全合规 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202608"
source_prds: ["03-合规-安全合规"]
source_modules: ["03-prd-task-安全合规"]
---

# 安全合规 — 测试用例

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CSP-001 | CSP 无 eval | `rg "eval\("` 零匹配 | P0 |
| TC-CSP-002 | Token 加密存储 | chrome.storage 隔离 | P0 |
| TC-CSP-003 | XSS DOMPurify | script 标签被清洗 | P0 |
| TC-CSP-004 | 最小权限 | manifest 仅声明必需权限 | P1 |
| TC-CSP-005 | web_accessible 精确 | 仅 assets/*, cdn/* | P1 |

## 出口准则

- [ ] P0 用例 100% 通过