---
doc_type: module
prd_task_id: "YV-09-140"
title: "YV-09-140: 屏幕阅读器优化 — ARIA标签/活动区域/角色、动态内容公告、表单错误播报、替代文本审计工具 — 开发任务"
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
source_prd: "70-prd-屏幕阅读器优化.md"
---

# YV-09-140: 屏幕阅读器优化 — ARIA标签/活动区域/角色、动态内容公告、表单错误播报、替代文本审计工具 — 开发任务

> 来源 PRD：[70-prd-屏幕阅读器优化.md](../prds/2026-09/70-prd-屏幕阅读器优化.md)
> 需求编号：YV-09-140 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 制定 ARIA 标注规范 + 启用 ESLint 规则 | `.eslintrc.cjs` + 规范文档 | ESLint 检测出缺失 ARIA 的代码并报 warning | 0.02 |
| 2 | 实现 LiveAnnouncer 服务 + v-aria-announce 指令 | `src/services/live-announcer.ts` + `src/directives/aria-announce.ts` | 调用 announce() → 屏幕阅读器播报 → 去重生效 | 0.04 |
| 3 | 实现 ARIA 审计规则集 + 审计面板 | `src/types/aria-audit.ts` + `src/views/system/aria-audit.vue` | 运行审计 → 列出所有违规项 → 显示得分 | 0.05 |
| 4 | 增强 ProTable ARIA 标注 | `src/components/pro-table/ProTable.vue` | 排序按钮有 aria-sort——行选择复选框有 aria-label——分页器有描述 | 0.04 |
| 5 | 增强全站表单错误播报 | `src/views/**/forms/*.vue` | 提交表单 → 验证失败 → 错误信息被屏幕阅读器播报 | 0.05 |
| 6 | 实现图表替代渲染 + 增强全局组件 ARIA | 多个文件 | 图表页面有隐藏数据表——Tab/面包屑/通知有正确 ARIA 标注 | 0.05 |
| 7 | 全站审计跑分 + 修复 critical 问题 | ARIA 审计面板 | 审计得分 > 80——0 个 critical 违规 | 0.05 |

**总人天：0.3d**

---
