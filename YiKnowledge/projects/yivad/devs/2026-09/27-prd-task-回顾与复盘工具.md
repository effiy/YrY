---
doc_type: module
prd_task_id: "YV-09-57"
title: "回顾与复盘工具 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "27-prd-回顾与复盘工具.md"
---

# 回顾与复盘工具 — 开发任务

> 来源 PRD：[27-prd-回顾与复盘工具.md](../prds/2026-09/27-prd-回顾与复盘工具.md)
> 需求编号：YV-09-57 · 优先级：P2 · 人天：0.5d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义回顾类型接口 | `types/retrospective.ts` | TypeScript 类型检查通过 | 0.03 |
| 2 | 实现回顾 API 服务 | `services/retrospective.service.ts` | 接口调用返回正确数据结构 | 0.03 |
| 3 | 实现 useRetrospective Composable | `composables/useRetrospective.ts` | 卡片/投票/行动项逻辑正确 | 0.05 |
| 4 | 实现 RetroColumn 列组件 | `components/retrospective/RetroColumn.vue` | 列渲染、卡片拖拽移动正常 | 0.04 |
| 5 | 实现 RetroCard 卡片组件 | `components/retrospective/RetroCard.vue` | 卡片编辑/投票/删除正常 | 0.04 |
| 6 | 实现 VotingPanel 投票面板 | `components/retrospective/VotingPanel.vue` | 投票/取消投票/结果显示正常 | 0.04 |
| 7 | 实现 ActionItemList 行动项列表 | `components/retrospective/ActionItemList.vue` | 行动项 CRUD/关联 Issue 正常 | 0.04 |
| 8 | 实现 RetroTimer 计时器 | `components/retrospective/RetroTimer.vue` | 倒计时/警告/超时/暂停正常 | 0.03 |
| 9 | 实现 RetroBoard 看板页面 | `views/retrospective/RetroBoard.vue` | 看板整体功能正常 | 0.06 |
| 10 | 实现 RetroList 列表页面 | `views/retrospective/RetroList.vue` | 列表/搜索/新建正常 | 0.03 |
| 11 | 实现 RetroTemplateSelector | `components/retrospective/RetroTemplateSelector.vue` | 3 种模板选择正常 | 0.02 |
| 12 | 实现 RetroHistory 历史回顾 | `components/retrospective/RetroHistory.vue` | 历史列表/重复标记正常 | 0.03 |
| 13 | 实现 ExportDialog 导出 | `components/retrospective/ExportDialog.vue` | Markdown 导出正常 | 0.02 |
| 14 | 样式文件 | `styles/retrospective.scss` | 看板布局、卡片样式、计时器样式正常 | 0.02 |
| 15 | 组件测试 | 测试文件 | 6 个测试场景通过 | 0.02 |

**总计：** 0.5d

---
