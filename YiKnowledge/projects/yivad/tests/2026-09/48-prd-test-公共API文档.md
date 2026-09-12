---
doc_type: test
title: "YV-09-101: 公共 API 文档 — 端点目录、认证指南、代码示例与交互式控制台 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-101"
source_prds: ["48-prd-公共API文档"]
source_modules: []
---
# YV-09-101: 公共 API 文档 — 端点目录、认证指南、代码示例与交互式控制台 — 测试规格

> 来源 PRD：[48-prd-公共API文档.md](../../prds/2026-09/48-prd-公共API文档.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：CodeSamples

#### Scenario: curl 示例渲染
- **GIVEN** 端点 `GET /api/v1/items` 有 2 个必需查询参数
- **WHEN** 切换到 curl 标签
- **THEN** 显示完整 curl 命令，包含参数、Header、URL

#### Scenario: Python 示例渲染
- **GIVEN** 端点 `POST /api/v1/items` 有请求体
- **WHEN** 切换到 Python 标签
- **THEN** 显示 `requests.post()` 代码，包含 headers、body

### 组件测试：EndpointDetail

#### Scenario: 端点详情完整渲染
- **GIVEN** 端点有 3 个参数（2 个 query + 1 个 body）、2 个响应（200 + 400）
- **WHEN** 渲染 EndpointDetail
- **THEN** 显示请求参数表（3 行）、响应示例（2 个 tab）、代码示例

#### Scenario: 废弃端点标记
- **GIVEN** 端点 `deprecated_since=v2.0`，替代端点为 `/api/v2/items`
- **WHEN** 渲染 EndpointDetail
- **THEN** 显示黄色"已废弃"标签、替代端点链接

### 组件测试：ApiConsole

#### Scenario: 控制台发送请求并显示结果
- **GIVEN** 用户填写 Token 和参数，点击"发送"
- **WHEN** API 返回 200 + JSON 数据
- **THEN** 显示状态码 200（绿色）、响应时间、格式化的 JSON

#### Scenario: 控制台错误响应
- **GIVEN** 用户填写了错误的参数
- **WHEN** API 返回 400 + error 信息
- **THEN** 显示状态码 400（红色）、错误消息

### 集成测试：ApiDocs

#### Scenario: 浏览端点目录并查看详情
- **GIVEN** 侧边栏显示 5 个模块
- **WHEN** 点击"数据 /data"模块 → 点击"查询文档"
- **THEN** 主内容区显示 `GET /api/v1/documents` 的完整文档

#### Scenario: 搜索端点
- **GIVEN** API 文档有 30 个端点
- **WHEN** 在侧边栏搜索框输入"query"
- **THEN** 过滤显示包含"query"的端点（如 query_documents）

---

