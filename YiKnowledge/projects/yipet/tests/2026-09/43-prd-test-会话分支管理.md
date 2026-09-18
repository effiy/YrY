---
doc_type: test
title: "会话分支管理 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["43-功能实现-会话分支管理"]
source_modules: ["43-prd-task-会话分支管理"]
---

# 会话分支管理 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-BRH01 | 从消息创建分支 | 新分支独立对话 | P0 |
| TC-BRH02 | 分支切换 | 分支间消息互不影响 | P0 |
| TC-BRH03 | 分支树可视化 | 树形展示所有分支 | P2 |
| TC-BRH04 | 分支持久化 | chrome.storage 刷新恢复 | P1 |