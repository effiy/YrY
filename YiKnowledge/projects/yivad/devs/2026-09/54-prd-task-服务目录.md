---
doc_type: module
prd_task_id: "YV-09-115"
title: "YV-09-115: 服务目录 — 微服务/API服务目录、服务列表含健康/负责人/版本、服务依赖地图、API端点浏览器、服务文档链接、服务归属追踪 — 开发任务"
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
source_prd: "54-prd-服务目录.md"
---

# YV-09-115: 服务目录 — 微服务/API服务目录、服务列表含健康/负责人/版本、服务依赖地图、API端点浏览器、服务文档链接、服务归属追踪 — 开发任务

> 来源 PRD：[54-prd-服务目录.md](../prds/2026-09/54-prd-服务目录.md)
> 需求编号：YV-09-115 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 创建服务配置文件 | `YiAi/services.yaml` | YAML 解析正确 | 0.03 |
| 2 | 实现 meta_service | `services/meta/meta_service.py` | RPC 返回服务列表 | 0.03 |
| 3 | 实现健康检查服务 | `services/health/health_service.py` | ping Ollama+MongoDB+索引 | 0.04 |
| 4 | 实现端点扫描器 | `services/meta/endpoint_scanner.py` | 收集所有 API 端点 | 0.03 |
| 5 | 实现服务列表+详情页 | `ServiceList.vue` + `ServiceDetail.vue` | 正确展示所有服务 | 0.05 |
| 6 | 实现依赖图 | `ServiceDependencyMap.vue` | Cytoscape.js 有向图渲染 | 0.05 |
| 7 | 实现 API 端点浏览器 | `APIEndpointBrowser.vue` | 搜索+分类+示例展示 | 0.04 |
| 8 | 实现健康仪表盘 | `ServiceHealth.vue` | 状态灯+延迟+错误统计 | 0.03 |

**总人天：0.3d**

---
