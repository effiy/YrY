---
doc_type: test
title: "安全合规配置 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["13-合规-安全配置"]
source_modules: ["13-prd-task-安全配置"]
---

# 安全合规配置 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-SC01 | CSP script-src 'self' | 无 eval/inline/remote | P0 |
| TC-SC02 | host_permissions 最小化 | 仅 localhost+生产 API | P0 |
| TC-SC03 | web_accessible 精确 | assets/*, cdn/* | P1 |