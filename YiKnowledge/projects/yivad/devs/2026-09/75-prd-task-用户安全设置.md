---
doc_type: module
prd_task_id: "YV-09-201"
title: "YV-09-201: 用户安全设置 — 密码修改、双因素认证、会话管理、登录历史、活动日志、安全建议 — 开发任务"
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
source_prd: "75-prd-用户安全设置.md"
---

# YV-09-201: 用户安全设置 — 密码修改、双因素认证、会话管理、登录历史、活动日志、安全建议 — 开发任务

> 来源 PRD：[75-prd-用户安全设置.md](../prds/2026-09/75-prd-用户安全设置.md)
> 需求编号：YV-09-201 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现安全 API 服务 | `security-service.ts` | 密码修改/2FA/会话/历史 API | 0.04 |
| 2 | 实现安全设置主页面 | `SecuritySettings.vue` | Tab 切换 + 安全评分展示 | 0.04 |
| 3 | 实现安全评分卡片 | `SecurityScoreCard.vue` | 多维度评分 + 建议列表 | 0.03 |
| 4 | 实现密码修改表单 | `PasswordChange.vue` | 旧密码验证 + 新密码强度校验 | 0.04 |
| 5 | 实现 2FA 设置向导 | `TwoFactorSetup.vue` | QR 码展示 + 验证码确认 + 恢复码 | 0.04 |
| 6 | 实现会话管理组件 | `SessionList.vue` | 会话列表 + 单个/批量失效 | 0.04 |
| 7 | 实现登录历史表格 | `LoginHistory.vue` | 分页列表 + 异常标注 | 0.03 |
| 8 | 实现活动日志表格 | `ActivityLog.vue` | 分页列表 + 操作类型筛选 | 0.04 |

**总人天：0.3d**

---
