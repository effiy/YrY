---
doc_type: test
title: "E2E 自动化测试 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["59-测试-E2E自动化测试"]
source_modules: ["59-prd-task-E2E自动化测试"]
---

# E2E 自动化测试 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-E2E01 | 扩展加载 | Popup 渲染正常 | P0 |
| TC-E2E02 | Content Script 注入 | Pet 可见 | P0 |
| TC-E2E03 | 聊天流程 | 发送→SSE 流式→回复 | P1 |
| TC-E2E04 | 跨项目桥接 | YiPet→YiVad 跳转 | P2 |