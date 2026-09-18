---
doc_type: test
title: "语言包热切换 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["44-功能实现-语言包热切换"]
---

# 语言包热切换 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-LNG01 | 即时切换 | 不需要刷新 | P1 |
| TC-LNG02 | chrome.storage 持久化 | 刷新恢复语言 | P1 |
| TC-LNG03 | 跟随系统 | Chrome 语言设置 | P2 |