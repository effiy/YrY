---
doc_type: test
title: "多标签页同步 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["38-架构设计-多标签页同步"]
source_modules: ["38-prd-task-多标签页同步"]
---

# 多标签页同步 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-SYN01 | 皮肤同步 | 标签A改皮肤→标签B更新 | P0 |
| TC-SYN02 | chrome.storage.onChanged | 监听正确触发 | P0 |
| TC-SYN03 | 会话同步 | 新建会话→其他标签可见 | P1 |
| TC-SYN04 | Pet 显隐同步 | 隐藏/显示跨标签同步 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过