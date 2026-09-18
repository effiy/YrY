---
doc_type: test
title: "YP-07-04: RPC 参数与构建 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202607"
source_prds: ["04-缺陷修复-RPC参数与构建"]
source_modules: ["04-prd-task-RPC参数与构建"]
---

# YP-07-04: RPC 参数与构建 — 测试用例

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-RPC-001 | filter 参数正确 | `rg '"query"' src/api` 零结果 | P0 |
| TC-RPC-002 | target_file 参数正确 | `rg '"path"' src/api/services` 零结果 | P0 |
| TC-RPC-003 | cname 参数正确 | `rg 'collection_name' src/api` 零结果 | P0 |
| TC-RPC-004 | 构建产物正确 | `npm run build` filenameHash:false | P0 |
| TC-RPC-005 | CDN 资源 200 | `chrome.runtime.getURL` 返回正常 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 全局搜索零契约违规