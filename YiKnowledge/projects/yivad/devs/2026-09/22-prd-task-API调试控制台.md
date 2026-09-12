---
doc_type: module
prd_task_id: "YV-09-48"
title: "API调试控制台 — 开发任务"
status: 需求已编写
priority: 中
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "22-prd-API调试控制台.md"
---

# API调试控制台 — 开发任务

> 来源 PRD：[22-prd-API调试控制台.md](../prds/2026-09/22-prd-API调试控制台.md)
> 需求编号：YV-09-48 · 优先级：中 · 人天：0.5d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|------|------|
| 1 | 创建 apiConsole Store | `apiConsole.ts` | 历史/集合/环境 CRUD 正确，localStorage 持久化 | 0.05 |
| 2 | 创建 JsonNode 递归组件 | `JsonNode.vue` | 对象/数组/字符串/数字/布尔/null 六种类型渲染正确 | 0.08 |
| 3 | 创建 JsonViewer 组件 | `JsonViewer.vue` | 搜索高亮、折叠展开、复制功能正常 | 0.05 |
| 4 | 创建 ResponseMetrics 组件 | `ResponseMetrics.vue` | 状态码/时间/大小显示正确，颜色区分 | 0.02 |
| 5 | 创建 CurlExporter 工具 | `CurlExporter.vue` | Curl 命令格式正确，可复制 | 0.02 |
| 6 | 创建 RequestBuilder 组件 | `RequestBuilder.vue` | RPC 模式/原始模式切换、请求发送 | 0.10 |
| 7 | 创建 ResponseViewer 组件 | `ResponseViewer.vue` | JSON 高亮、响应指标、错误提示 | 0.05 |
| 8 | 创建 RequestHistory 组件 | `RequestHistory.vue` | 历史列表渲染、回放、清空 | 0.05 |
| 9 | 创建 RequestCollections 组件 | `RequestCollections.vue` | 集合 CRUD、请求保存 | 0.05 |
| 10 | 注册路由并整体验证 | 路由注册 + 集成测试 | 控制台页面可用，完整调试流程 | 0.03 |

**总计：** 0.5d

---
