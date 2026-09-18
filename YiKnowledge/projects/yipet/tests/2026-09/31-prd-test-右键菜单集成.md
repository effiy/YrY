---
doc_type: test
title: "右键菜单集成 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["31-功能实现-右键菜单集成"]
source_modules: ["31-prd-task-右键菜单集成"]
---

# 右键菜单集成 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CTX01 | 复制文本 | navigator.clipboard | P0 |
| TC-CTX02 | 编辑消息 | 内联编辑模式 | P1 |
| TC-CTX03 | 引用回复 | 插入引用块 | P1 |
| TC-CTX04 | 重新生成 | 重新发送 AI 请求 | P1 |