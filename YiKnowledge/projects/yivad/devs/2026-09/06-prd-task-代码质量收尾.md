---
doc_type: module
prd_task_id: ""
title: "11-需求-代码质量收尾 — 开发任务"
status: 草稿
priority: 中
owner: 
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: ""
estimate_frontend: 
source_prd: "06-prd-代码质量收尾.md"
---

# 11-需求-代码质量收尾 — 开发任务

> 来源 PRD：[06-prd-代码质量收尾.md](../prds/2026-09/06-prd-代码质量收尾.md)
> 需求编号： · 优先级：中 · 人天：d

## 实施步骤

按依赖顺序排列，每步可独立验证和提交：

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 类型定义提取到 types.ts | `types.ts` | +10 类型 + 12 常量 + 1 工具函数 | 0.25 |
| 2 | roleTagType 提取为公共工具函数 | `src/utils/role.ts` | 消除 2 处重复定义 | 0.15 |
| 3 | activityColor/priorityColor 统一 | `useProjectStats.ts` | 颜色映射统一管理 | 0.1 |
| 4 | markdown 样式组件化 | `styles/markdown-preview.scss` | `:deep()` 穿透 scoped 隔离 | 0.25 |
| 5 | 非 scoped 样式清理 | `detail.vue` | -70 行非 scoped 样式 | 0.15 |
| 6 | 导入路径别名化 | 全部 composable/组件 | `../../` → `@/` | 0.15 |
| 7 | 死代码清理 | `detail.vue` + composables | 无引用代码删除 | 0.1 |
| 8 | 整体验证 | 全模块 | `vue-tsc` + `madge --circular` + `lint` + `build` | 0.15 |

**总计：1.5d**

---
