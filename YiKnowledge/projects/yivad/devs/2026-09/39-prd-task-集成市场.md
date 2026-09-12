---
doc_type: module
prd_task_id: "YV-09-86"
title: "YV-09-86: 集成市场 — 第三方集成目录、安装/配置/卸载流程、集成健康状态、使用统计、OAuth 配置助手 — 开发任务"
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
source_prd: "39-prd-集成市场.md"
---

# YV-09-86: 集成市场 — 第三方集成目录、安装/配置/卸载流程、集成健康状态、使用统计、OAuth 配置助手 — 开发任务

> 来源 PRD：[39-prd-集成市场.md](../prds/2026-09/39-prd-集成市场.md)
> 需求编号：YV-09-86 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 后端集成注册表 + 统一接口 | `YiAi/integration_service.py` | 注册/查询集成 | 0.05 |
| 2 | 后端 OAuth PKCE 服务 | `YiAi/oauth_service.py` | PKCE 流程正确 | 0.05 |
| 3 | 前端集成目录 UI | `YiVad/IntegrationCatalog.vue` | 目录展示和筛选 | 0.05 |
| 4 | 前端安装流程向导 | `YiVad/InstallFlow.vue` | 多步骤流程正确 | 0.06 |
| 5 | 前端 OAuth 配置助手 | `YiVad/OAuthHelper.vue` | PKCE 流程 UI | 0.03 |
| 6 | 前端健康状态 + 统计 | `YiVad/IntegrationHealth.vue` | 状态指示和详情 | 0.04 |
| 7 | 集成测试 | 前后端 | Slack/GitHub 完整安装流程 | 0.02 |

**总人天：0.3d**

---
