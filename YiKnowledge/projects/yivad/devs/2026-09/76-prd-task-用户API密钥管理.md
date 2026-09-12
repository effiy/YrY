---
doc_type: module
prd_task_id: "YV-09-202"
title: "YV-09-202: 用户API密钥管理 — 创建/查看/吊销密钥、权限范围、最后使用时间、使用统计、安全提示 — 开发任务"
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
source_prd: "76-prd-用户API密钥管理.md"
---

# YV-09-202: 用户API密钥管理 — 创建/查看/吊销密钥、权限范围、最后使用时间、使用统计、安全提示 — 开发任务

> 来源 PRD：[76-prd-用户API密钥管理.md](../prds/2026-09/76-prd-用户API密钥管理.md)
> 需求编号：YV-09-202 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 API 密钥服务层 | `api-key-service.ts` | 密钥 CRUD + 统计 API | 0.04 |
| 2 | 实现密钥管理主页面 | `ApiKeyManagement.vue` | 密钥列表 + 创建按钮 | 0.04 |
| 3 | 实现创建密钥弹窗 | `ApiKeyCreateDialog.vue` | 命名 + 选 scope + 设过期 | 0.04 |
| 4 | 实现权限范围选择器 | `ScopeSelector.vue` | 模板选择 + 模块/操作勾选 | 0.04 |
| 5 | 实现创建成功展示 | `ApiKeyManagement.vue` | 一次性展示完整密钥 + 复制 | 0.03 |
| 6 | 实现密钥详情弹窗 | `ApiKeyDetailDialog.vue` | 使用统计图表 + 元信息 | 0.04 |
| 7 | 实现安全提示面板 | `SecurityTipsPanel.vue` | 安全建议列表 | 0.03 |
| 8 | 实现吊销确认 | `ApiKeyManagement.vue` | 二次确认 + 不可撤销提示 | 0.04 |

**总人天：0.3d**

---
