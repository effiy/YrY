---
doc_type: module
prd_task_id: "YV-09-60"
title: "API 令牌管理 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "28-prd-API令牌管理.md"
---

# API 令牌管理 — 开发任务

> 来源 PRD：[28-prd-API令牌管理.md](../prds/2026-09/28-prd-API令牌管理.md)
> 需求编号：YV-09-60 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 创建令牌 RPC 接口封装 | `src/api/token.ts` | 接口封装正确，参数名称符合 RPC 契约 | 0.03 |
| 2 | 创建令牌 Store | `src/stores/token.ts` | 令牌列表、创建、撤销功能正常 | 0.05 |
| 3 | 创建令牌管理页面 | `src/views/settings/ApiTokenManager.vue` | 页面渲染正确，令牌列表和详情展示正常 | 0.05 |
| 4 | 创建令牌创建对话框 | `src/components/token/TokenCreateDialog.vue` | 创建流程完整，令牌明文展示和复制正常 | 0.07 |
| 5 | 创建令牌列表组件 | `src/components/token/TokenList.vue` | 令牌掩码显示、状态标签、过期提示正确 | 0.05 |
| 6 | 创建令牌详情面板 | `src/components/token/TokenDetailPanel.vue` | 详情信息展示完整 | 0.03 |
| 7 | 创建令牌使用统计组件 | `src/components/token/TokenUsageStats.vue` | 折线图和统计数字正确 | 0.02 |

**总计：** 0.3d

---
