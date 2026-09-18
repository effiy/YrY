---
doc_type: test
title: "YP-07-01: 技术栈迁移 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202607"
source_prds: ["01-基础设施-技术栈迁移"]
source_modules: ["01-prd-task-技术栈迁移"]
---

# YP-07-01: 技术栈迁移 — 测试用例

## 测试分层

| 层级 | 覆盖 |
|------|------|
| L1 单元 | TypeScript 类型检查 |
| L2 集成 | Rsbuild 4 入口构建 |
| L3 E2E | Chrome 扩展加载验证 |

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-STACK-001 | 4 入口构建成功 | `npm run build` 产出正确 | P0 |
| TC-STACK-002 | Manifest 正确 | MV3 格式 + 权限声明 | P0 |
| TC-STACK-003 | Popup 渲染 | Vue 3 组件正常 | P0 |
| TC-STACK-004 | Service Worker 注册 | chrome://extensions SW 状态 | P0 |
| TC-STACK-005 | Content Script 注入 | `document_idle` 时机正确 | P0 |
| TC-STACK-006 | tsc --noEmit | 零类型错误 | P0 |

## 出口准则

- [ ] P0 用例 100% 通过
- [ ] 扩展在 Chrome 中正常加载