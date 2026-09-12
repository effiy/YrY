---
doc_type: test
title: "YV-09-115: 服务目录 — 微服务/API服务目录、服务列表含健康/负责人/版本、服务依赖地图、API端点浏览器、服务文档链接、服务归属追踪 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-115"
source_prds: ["54-prd-服务目录"]
source_modules: []
---
# YV-09-115: 服务目录 — 微服务/API服务目录、服务列表含健康/负责人/版本、服务依赖地图、API端点浏览器、服务文档链接、服务归属追踪 — 测试规格

> 来源 PRD：[54-prd-服务目录.md](../../prds/2026-09/54-prd-服务目录.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：服务列表查看

**GIVEN** 后端返回 10 个服务的元数据
**WHEN** 打开服务目录页面
**THEN** 表格显示所有 10 个服务（名称、版本、状态、负责人）
**AND** 状态列用彩点标识（绿色 active、黄色 maintenance、灰色 deprecated）
**AND** 可搜索/筛选/排序
**AND** 点击服务行展开详情面板

### 场景 2：服务详情查看

**GIVEN** 用户在服务列表中点击 chat_service
**WHEN** 详情面板展开
**THEN** 显示完整服务信息：模块路径、描述、版本、负责人+邮箱
**AND** 显示依赖列表（ollama_service、rag_service）为可点击链接
**AND** 显示 RPC 方法列表（chat、get_history 等）
**AND** 文档链接可跳转

### 场景 3：健康检查

**GIVEN** Ollama 正常运行、MongoDB 连接正常
**WHEN** 用户查看服务健康面板
**THEN** ollama_service 显示绿色 "healthy"，延迟 < 10ms
**AND** repository 显示绿色 "healthy"，MongoDB 延迟 < 5ms
**AND** 如果 RAG 索引为空，rag_service 显示黄色 "degraded"，提示 "索引文档数为 0"
**AND** 显示上一次检查时间

### 场景 4：服务依赖有向图

**GIVEN** 加载所有服务的依赖关系
**WHEN** 查看依赖图视图
**THEN** 节点按层级排列：底层（ollama、repository）、中层（rag、agent）、上层（chat、data）
**AND** 边显示箭头方向（从调用方到被调用方）
**AND** 点击 chat_service 节点，相关节点和边高亮
**AND** 依赖关系与 services.yaml 一致

### 场景 5：API 端点浏览器

**GIVEN** 后端扫描收集所有 RPC 和 REST 端点
**WHEN** 打开 API 端点浏览器
**THEN** 支持按分类筛选（RPC / REST / Knowledge / RAG / File）
**AND** 支持搜索（按路径、模块名、方法名）
**AND** 每个端点显示 method、path、module、description
**AND** 有示例的端点可展开查看请求/响应示例

### 场景 6：服务过滤和搜索

**GIVEN** 服务列表加载 10 个服务
**WHEN** 在搜索框输入 "Ollama"
**THEN** 表格过滤为仅显示 ollama_service（名称匹配）
**AND** 依赖图为空时支持按 category 筛选：core/data/ai/integration
**AND** 清空搜索恢复显示所有服务

---

