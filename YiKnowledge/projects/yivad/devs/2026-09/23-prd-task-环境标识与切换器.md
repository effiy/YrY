---
doc_type: module
prd_task_id: "YV-09-49"
title: "环境标识与切换器 — 开发任务"
status: 需求已编写
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "23-prd-环境标识与切换器.md"
---

# 环境标识与切换器 — 开发任务

> 来源 PRD：[23-prd-环境标识与切换器.md](../prds/2026-09/23-prd-环境标识与切换器.md)
> 需求编号：YV-09-49 · 优先级：中 · 人天：0.3d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|------|------|
| 1 | 创建环境配置 | `environments.ts` | 3 个环境配置完整，featureFlags 正确 | 0.03 |
| 2 | 创建环境 Store | `environment.ts` | 环境切换/持久化逻辑正确 | 0.03 |
| 3 | 创建环境 Composable | `useEnvironment.ts` | 标题更新、危险操作确认 | 0.03 |
| 4 | 创建 EnvironmentBadge 组件 | `EnvironmentBadge.vue` | 非生产环境显示彩色横幅 | 0.03 |
| 5 | 创建 EnvironmentSwitcher 组件 | `EnvironmentSwitcher.vue` | 管理员可切换环境，页面刷新 | 0.03 |
| 6 | 创建 ProdWarningDialog 组件 | `ProdWarningDialog.vue` | 生产环境危险操作需输入 CONFIRM | 0.03 |
| 7 | 创建页面标题工具 | `title.ts` | 页面标题包含环境前缀 | 0.02 |
| 8 | 更新环境变量文件 | `.env` / `.env.staging` / `.env.production` | 构建时环境变量注入正确 | 0.02 |
| 9 | 集成到全局布局 | `AppHeader.vue` | 横幅和切换器正确显示 | 0.03 |
| 10 | 集成到危险操作按钮 | 各页面的删除/批量操作按钮 | 生产环境需要确认 | 0.05 |

**总计：** 0.3d

---
