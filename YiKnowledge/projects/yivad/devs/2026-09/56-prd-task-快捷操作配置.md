---
doc_type: module
prd_task_id: "YV-09-124"
title: "YV-09-124: 快捷操作配置 — 可配置快捷操作工具栏、用户个性化收藏、拖拽排序、基于使用频率的操作建议、快捷键绑定到操作 — 开发任务"
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
source_prd: "56-prd-快捷操作配置.md"
---

# YV-09-124: 快捷操作配置 — 可配置快捷操作工具栏、用户个性化收藏、拖拽排序、基于使用频率的操作建议、快捷键绑定到操作 — 开发任务

> 来源 PRD：[56-prd-快捷操作配置.md](../prds/2026-09/56-prd-快捷操作配置.md)
> 需求编号：YV-09-124 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 操作注册机制+类型定义 | `types/actionRegistry.ts`, `utils/actionRegistry.ts` | 静态声明+动态注册均可用 | 0.04 |
| 2 | 快捷工具栏配置类型+API | `types/quickActionConfig.ts`, `services/quickActionService.ts` | 配置可持久化到后端 | 0.03 |
| 3 | 使用频率追踪器+推荐引擎 | `composables/useActionTracker.ts`, `utils/recommendationEngine.ts` | 追踪准确+推荐得分合理 | 0.04 |
| 4 | QuickActionBar 工具栏 UI | `QuickActionBar.vue`, `ActionButton.vue` | 拖拽排序+折叠+推荐提示 | 0.06 |
| 5 | QuickActionSettings 配置页 | `QuickActionSettings.vue` | 操作选择+排序+收藏管理 | 0.05 |
| 6 | ShortcutEditor + CheatSheet | `ShortcutEditor.vue`, `CheatSheet.vue` | 快捷键绑定+冲突检测+提示面板 | 0.05 |
| 7 | MainLayout 集成 + 路由配置 | `MainLayout.vue`, `routes.ts` | 全局工具栏可见+配置页可访问 | 0.03 |

**总计：0.3d**

---
