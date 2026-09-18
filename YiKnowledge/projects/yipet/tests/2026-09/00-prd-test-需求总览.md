---
doc_type: test
title: "九月迭代总览 — 测试策略"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["00-prd-需求总览"]
source_modules: ["00-prd-task-需求总览"]
---

# 九月迭代总览 — 测试策略

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试分层

| 层级 | 工具 | 覆盖 |
|------|------|------|
| L1 单元 | Vitest | 工具函数、ApiClient |
| L2 集成 | Vitest + mock chrome | SW/CS/IPC |
| L3 E2E | 加载扩展 | 完整链路 |

## 核心用例

| 模块 | 关键用例 | 优先级 |
|------|---------|--------|
| Content Script | SPA 路由不丢失、防重复注入 | P0 |
| Service Worker | 心跳保活、唤醒恢复 | P0 |
| SSE 流式 | 断连重连、AbortSignal | P0 |
| API 合规 | 参数名 filter、无直接 fetch | P0 |
| 安全 | CSP 无 eval、XSS DOMPurify | P0 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 扩展在 Chrome 中正常加载