---
doc_type: test
title: "API调试控制台 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-48"
source_prds: ["22-prd-API调试控制台"]
source_modules: []
---
# API调试控制台 — 测试规格

> 来源 PRD：[22-prd-API调试控制台.md](../../prds/2026-09/22-prd-API调试控制台.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：JsonNode

#### Scenario: 渲染对象节点
- **GIVEN** `value={name: "test", age: 30}`
- **WHEN** 挂载 JsonNode 组件
- **THEN** 渲染折叠箭头、`{`、`"name":`、`"test"`（绿色字符串）、`"age":`、`30`（蓝色数字）、`}`

#### Scenario: 折叠数组
- **GIVEN** `value=[1, 2, 3]`, `defaultCollapsed=true`
- **WHEN** 挂载 JsonNode 组件
- **THEN** 渲染 `[`、`3 items`、`...`、`]`，不显示数组元素

#### Scenario: 搜索高亮
- **GIVEN** `value="hello world"`, `searchText="world"`
- **WHEN** 挂载 JsonNode 组件
- **THEN** 字符串中 "world" 被 `<mark>` 标签包裹并高亮

### Store 测试：apiConsole

#### Scenario: 请求历史 FIFO 淘汰
- **GIVEN** 历史记录已有 200 条，MAX_HISTORY=200
- **WHEN** 添加第 201 条记录
- **THEN** 历史记录仍为 200 条，最旧的记录被移除

#### Scenario: 环境切换持久化
- **GIVEN** 当前环境为 "dev"
- **WHEN** 调用 `setEnvironment("staging")`
- **THEN** `activeEnvironment` 变为 "staging"，localStorage 中存储 "staging"

### 组件测试：ResponseMetrics

#### Scenario: 成功状态渲染
- **GIVEN** `status=200`, `time=150`, `size=2048`
- **WHEN** 挂载 ResponseMetrics 组件
- **THEN** 状态码显示为绿色 "200"，时间显示 "150ms"，大小显示 "2.0 KB"

---

