---
doc_type: test
title: "页面注入控制策略 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["23-功能实现-页面注入控制策略"]
source_modules: ["23-prd-task-页面注入控制策略"]
---

# 页面注入控制策略 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-INJ01 | 全页面模式 | 所有页面注入 Pet | P0 |
| TC-INJ02 | 白名单模式 | 仅指定域名注入 | P1 |
| TC-INJ03 | 黑名单排除 | chrome:// 等排除 | P0 |
| TC-INJ04 | 配置持久化 | chrome.storage 保存策略 | P1 |