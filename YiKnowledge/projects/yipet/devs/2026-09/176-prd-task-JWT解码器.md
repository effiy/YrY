---
doc_type: module
prd_task_id: "YP-09-170"
title: "YP-09-170: JWT 解码器 — 开发方案"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prd: "176-工具-JWT解码器.md"
---

# YP-09-170: JWT 解码器 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-170 · 状态：待开始

## JWT 工具

| 功能 | 说明 |
|------|------|
| 解码 | Base64 解码 Header+Payload |
| 验证 | 签名验证(需密钥) |
| 过期检测 | exp 字段检查 |
| 格式化 | JSON 美化展示 |