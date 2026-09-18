---
doc_type: test
title: "YP-07-05: Content Script 注入架构 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202607"
source_prds: ["05-架构设计-ContentScript注入架构"]
source_modules: ["05-prd-task-ContentScript注入架构"]
---

# YP-07-05: Content Script 注入架构 — 测试用例

## 测试分层

| 层级 | 工具 | 覆盖 |
|------|------|------|
| L1 单元 | Vitest | bootstrap 防重复逻辑 |
| L2 集成 | Vitest + mock chrome | 注入流程、Shadow DOM 创建 |
| L3 E2E | 加载扩展 | 各页面类型注入验证 |

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CS-001 | 静态页面注入 | `__YIPET_LOADED__` 标记+Pet 可见 | P0 |
| TC-CS-002 | 防重复注入 | 刷新页面 `__YIPET_LOADED__` 仅一次 | P0 |
| TC-CS-003 | Shadow DOM 样式隔离 | 宿主 CSS 不影响 Pet | P0 |
| TC-CS-004 | chrome:// 页面跳过 | 静默跳过，无报错 | P0 |
| TC-CS-005 | SPA 路由切换不丢失 | MutationObserver 保持注入 | P1 |
| TC-CS-006 | 注入失败清除标记 | 失败后重试允许 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 无 console.error 注入错误