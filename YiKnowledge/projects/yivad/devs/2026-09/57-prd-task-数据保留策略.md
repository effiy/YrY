---
doc_type: module
prd_task_id: "YV-09-125"
title: "YV-09-125: 数据保留策略 — 按集合配置数据保留规则、自动归档/删除、保留策略预览、合规仪表盘 — 开发任务"
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
source_prd: "57-prd-数据保留策略.md"
---

# YV-09-125: 数据保留策略 — 按集合配置数据保留规则、自动归档/删除、保留策略预览、合规仪表盘 — 开发任务

> 来源 PRD：[57-prd-数据保留策略.md](../prds/2026-09/57-prd-数据保留策略.md)
> 需求编号：YV-09-125 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 类型定义 + API 服务 | `types/retentionPolicy.ts`, `services/retentionPolicyService.ts` | 类型检查通过 | 0.03 |
| 2 | useRetentionPolicy 状态管理 | `composables/useRetentionPolicy.ts` | CRUD+预览逻辑正确 | 0.04 |
| 3 | PolicyEditor 策略编辑器 | `PolicyEditor.vue` | 规则添加+编辑+预览+保存 | 0.06 |
| 4 | PolicyPreview 影响预览 | `PolicyPreview.vue` + `utils/policyPreview.ts` | 数据量估算+样本展示 | 0.04 |
| 5 | RetentionPolicies 策略列表 | `RetentionPolicies.vue` | 列表+启停+执行记录 | 0.04 |
| 6 | ComplianceDashboard 合规仪表盘 | `ComplianceDashboard.vue` | 各集合状态+趋势图+存储预估 | 0.05 |
| 7 | RecycleBin 回收站 | `RecycleBin.vue` | 恢复+永久删除+到期倒计时 | 0.03 |
| 8 | 路由+菜单配置 | `routes.ts` | 保留策略页面可访问 | 0.01 |

**总计：0.3d**

---
