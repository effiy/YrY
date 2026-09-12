---
doc_type: module
prd_task_id: "YV-09-133"
title: "YV-09-133: 安全事件日志 — 登录失败/密码修改/权限变更/API 密钥使用记录、严重度分级、实时告警、安全仪表盘 — 开发任务"
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
source_prd: "63-prd-安全事件日志.md"
---

# YV-09-133: 安全事件日志 — 登录失败/密码修改/权限变更/API 密钥使用记录、严重度分级、实时告警、安全仪表盘 — 开发任务

> 来源 PRD：[63-prd-安全事件日志.md](../prds/2026-09/63-prd-安全事件日志.md)
> 需求编号：YV-09-133 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 定义事件类型枚举 + 严重度映射 | `YiAi/services/security/` | 枚举定义完整 | 0.02 |
| 2 | 实现 SecurityEventService（记录/查询/统计） | `YiAi/services/security/security_event_service.py` | 记录、查询、聚合正常 | 0.05 |
| 3 | 实现暴力破解检测 + 告警分发 | `YiAi/services/security/brute_force_detector.py` + `alert_dispatcher.py` | 检测逻辑 + 企微推送 | 0.04 |
| 4 | 集成到各模块（登录/用户/权限/API密钥） | 各模块 handler | 事件在操作时自动记录 | 0.05 |
| 5 | 实现 YiVad 安全仪表盘 | `YiVad/src/views/system/security-dashboard.vue` | 统计卡片 + 趋势图 + 分布图 | 0.06 |
| 6 | 实现安全事件列表 + 确认机制 | `YiVad/src/views/system/security-events.vue` | 列表/筛选/确认 | 0.04 |
| 7 | 路由注册 + 集成测试 | 路由文件 + 测试文件 | 端到端验证 | 0.04 |

**总人天：0.3d**

---
