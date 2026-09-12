---
doc_type: module
prd_task_id: "YV-09-85"
title: "YV-09-85: 知识管理面板 — 知识库管理仪表盘、内容创建工作流、健康指标、贡献排行榜、知识缺口可视化、RAG 性能关联、YiKnowledge 同步状态 — 开发任务"
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
source_prd: "38-prd-知识管理面板.md"
---

# YV-09-85: 知识管理面板 — 知识库管理仪表盘、内容创建工作流、健康指标、贡献排行榜、知识缺口可视化、RAG 性能关联、YiKnowledge 同步状态 — 开发任务

> 来源 PRD：[38-prd-知识管理面板.md](../prds/2026-09/38-prd-知识管理面板.md)
> 需求编号：YV-09-85 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 后端仪表盘聚合查询 | `YiAi/knowledge_service.py` | 返回正确的仪表盘数据 | 0.05 |
| 2 | 后端健康指标服务 | `YiAi/health_service.py` | 过期/不完整/低质量检测 | 0.05 |
| 3 | 前端仪表盘 UI | `YiVad/KnowledgeDashboard.vue` | 概览/图表/指标展示 | 0.08 |
| 4 | 前端知识编辑器 | `YiVad/KnowledgeEditor.vue` | 创建/编辑/保存知识文件 | 0.05 |
| 5 | 前端贡献排行榜 | `YiVad/ContributionLeaderboard.vue` | 排名和数据展示 | 0.03 |
| 6 | 前端同步状态 | `YiVad/SyncStatus.vue` | 同步状态实时展示 | 0.02 |
| 7 | 集成测试 | 前后端 | 完整流程验证 | 0.02 |

**总人天：0.3d**

---
