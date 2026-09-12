---
doc_type: module
prd_task_id: "YV-09-134"
title: "YV-09-134: 字段级权限控制 — 按角色显隐字段、只读字段、数据脱敏、字段访问审计、项目级字段权限 — 开发任务"
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
source_prd: "64-prd-字段级权限控制.md"
---

# YV-09-134: 字段级权限控制 — 按角色显隐字段、只读字段、数据脱敏、字段访问审计、项目级字段权限 — 开发任务

> 来源 PRD：[64-prd-字段级权限控制.md](../prds/2026-09/64-prd-字段级权限控制.md)
> 需求编号：YV-09-134 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 YiAi FieldPermissionService（CRUD + 缓存） | `YiAi/services/auth/field_permission_service.py` | 创建、查询、更新、删除字段权限规则正常 | 0.05 |
| 2 | 实现脱敏引擎 MaskingEngine | `YiAi/services/auth/masking_engine.py` | 手机号、邮箱、身份证脱敏正确 | 0.03 |
| 3 | 实现字段权限中间件 + 审计服务 | `YiAi/middleware/field_permission.py` + `field_access_auditor.py` | 数据响应携带字段权限元数据，字段访问日志记录 | 0.04 |
| 4 | 实现 YiVad v-field 指令 | `YiVad/src/directives/v-field.ts` | 隐藏字段 display:none，只读字段 disabled，脱敏字段标记 | 0.04 |
| 5 | 实现 useFieldPermission Composable + Store | `YiVad/src/composables/useFieldPermission.ts` + `stores/fieldPermission.ts` | 权限加载、缓存、字段过滤方法正确 | 0.04 |
| 6 | 实现字段权限配置页面 | `YiVad/src/views/system/field-permission-config.vue` | 按角色/项目/表单配置字段权限，矩阵式编辑 | 0.06 |
| 7 | 路由注册 + 集成测试 | `YiVad/src/router/` + 测试文件 | 配置页面可访问，端到端验证字段权限生效 | 0.04 |

**总人天：0.3d**

---
