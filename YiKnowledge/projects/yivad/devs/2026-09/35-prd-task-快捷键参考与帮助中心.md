---
doc_type: module
prd_task_id: "YV-09-70"
title: "YV-09-70: 快捷键参考与帮助中心 — 上下文感知帮助面板、可搜索文档、快捷键速查、更新日志 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.2
source_prd: "35-prd-快捷键参考与帮助中心.md"
---

# YV-09-70: 快捷键参考与帮助中心 — 上下文感知帮助面板、可搜索文档、快捷键速查、更新日志 — 开发任务

> 来源 PRD：[35-prd-快捷键参考与帮助中心.md](../prds/2026-09/35-prd-快捷键参考与帮助中心.md)
> 需求编号：YV-09-70 · 优先级：P2 · 人天：0.2d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 定义帮助中心类型和数据结构 | `src/components/help-center/types.ts` | 类型定义完整 | 0.02 |
| 2 | 实现上下文感知帮助 | `src/composables/usePageHelp.ts` | 路由匹配正确 | 0.03 |
| 3 | 实现帮助中心面板 UI | `src/components/help-center/help-center-panel.vue` | 面板打开/关闭/Tab 切换 | 0.05 |
| 4 | 实现快捷键速查 Tab | `src/components/help-center/shortcuts-tab.vue` | 展示所有快捷键 | 0.03 |
| 5 | 实现页面帮助 Tab | `src/components/help-center/page-help-tab.vue` | 上下文感知展示 | 0.02 |
| 6 | 实现更新日志 Tab | `src/components/help-center/changelog-tab.vue` | 展示 CHANGELOG.md | 0.02 |
| 7 | 实现反馈 Tab | `src/components/help-center/feedback-tab.vue` | 表单提交成功 | 0.03 |

**总人天：0.2d**

---
