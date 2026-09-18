---
doc_type: test
title: "YP-07-02: 工具链迁移 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202607"
source_prds: ["02-基础设施-工具链迁移"]
source_modules: ["02-prd-task-工具链迁移"]
---

# YP-07-02: 工具链迁移 — 测试用例

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-TOOL-001 | ESLint 检查 | `npm run lint` 通过 | P0 |
| TC-TOOL-002 | Prettier 格式化 | 保存自动格式化 | P1 |
| TC-TOOL-003 | pre-commit hook | 不规范代码阻止提交 | P0 |
| TC-TOOL-004 | commitlint | 不规范提交信息拦截 | P0 |
| TC-TOOL-005 | Vitest 运行 | `npm test` 通过 | P0 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] Git hooks 生效