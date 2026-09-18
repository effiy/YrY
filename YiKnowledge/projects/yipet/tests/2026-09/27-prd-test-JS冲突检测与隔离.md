---
doc_type: test
title: "JS 冲突检测与隔离 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["27-稳定性-JS冲突检测与隔离"]
source_modules: ["27-prd-task-JS冲突检测与隔离"]
---

# JS 冲突检测与隔离 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-ISO01 | 全局变量隔离 | Shadow DOM+IIFE 不污染 | P0 |
| TC-ISO02 | 原型链检测 | Array.prototype 未被修改 | P1 |
| TC-ISO03 | 事件命名空间 | yipet: 前缀防冲突 | P1 |
| TC-ISO04 | Symbol 私有属性 | WeakMap 避免内存冲突 | P2 |