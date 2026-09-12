---
doc_type: module
prd_task_id: "YV-09-204"
title: "YV-09-204: 用户账号删除 — 确认步骤、数据删除预览、带撤销的宽限期、最终确认、数据保留政策展示 — 开发任务"
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
source_prd: "78-prd-用户账号删除.md"
---

# YV-09-204: 用户账号删除 — 确认步骤、数据删除预览、带撤销的宽限期、最终确认、数据保留政策展示 — 开发任务

> 来源 PRD：[78-prd-用户账号删除.md](../prds/2026-09/78-prd-用户账号删除.md)
> 需求编号：YV-09-204 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现账号删除服务层 | `account-deletion-service.ts` | 预览/确认/状态/撤销 API | 0.04 |
| 2 | 实现账号删除主页面 | `AccountDeletionPage.vue` | 4 步流程 + 宽限期状态 | 0.06 |
| 3 | 实现身份验证步骤 | `DeletionStepIdentity.vue` | 密码 + 2FA 验证 | 0.04 |
| 4 | 实现数据预览步骤 | `DeletionStepPreview.vue` | 数据清单 + 内容处理选择 | 0.04 |
| 5 | 实现后果告知步骤 | `AccountDeletionPage.vue` | 确认勾选 | 0.03 |
| 6 | 实现最终确认步骤 | `AccountDeletionPage.vue` | 确认短语输入 + 提交 | 0.04 |
| 7 | 实现删除状态卡片 | `DeletionStatusCard.vue` | 宽限期倒计时 + 撤销按钮 | 0.03 |
| 8 | 添加路由和导航入口 | `routes.ts` | 安全设置中的账号删除入口 | 0.02 |

**总人天：0.3d**

---
