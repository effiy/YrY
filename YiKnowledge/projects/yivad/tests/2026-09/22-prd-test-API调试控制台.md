---
title: "YV-09-52: API调试控制台 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-52"
source_prds: ["22-prd-API调试控制台"]
source_modules: ["22-prd-task-API调试控制台"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, API调试控制台]
benefit: "测试用例：API调试控制台"
lifecycle: active
---

# YV-09-52: API调试控制台 — 测试用例

> 来源 PRD：[22-prd-API调试控制台.md](../../prds/2026-09/22-prd-API调试控制台.md)
> 开发方案：[22-prd-task-API调试控制台.md](../../devs/2026-09/22-prd-task-API调试控制台.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | RPC 请求构造/响应解析逻辑 | Vitest | 每次提交 |
| L2 组件 | ApiConsole 组件渲染与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | API调用 ↔ YiAi 真实端点 | Vitest + mock | 每次提交 |
| L4 端到端 | 完整调试流程（构造→发送→查看响应） | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | RPC 信封构造器（module/method/params） | CT + IT | ✅ |
| FR-2 | 请求发送 + 响应展示（JSON格式化） | CT + IT | ✅ |
| FR-3 | 请求历史记录（localStorage） | CT | ✅ |
| FR-4 | 常用请求收藏 | CT | ✅ |
| FR-5 | 响应时间显示 | CT | ✅ |

---

## L1 单元测试

### UT-01: RPC 信封构造

**GIVEN** 用户填写 module=`data_service`, method=`query_documents`, params=`{ cname: "issues" }`  
**WHEN** 调用 `buildRpcEnvelope(module, method, params)`  
**THEN** 返回 `{ module_name: "data_service", method_name: "query_documents", parameters: { cname: "issues" } }`

### UT-02: JSON 响应格式化

**GIVEN** API 返回 `{ code: 0, data: { list: [...] }, message: "ok" }`  
**WHEN** 调用 `formatResponse(response)`  
**THEN** 返回语法高亮的 JSON 字符串（带缩进 2 空格）  
**AND** `code: 0` 显示为绿色，`code !== 0` 显示为红色

---

## L2 组件测试

### CT-01: 请求表单渲染

**GIVEN** ApiConsole 组件挂载  
**THEN** 应显示 3 个输入区：Module (el-input) / Method (el-input) / Parameters (JSON editor)  
**AND** 「发送」按钮

### CT-02: 发送请求 + 响应展示

**GIVEN** 用户填写 module=`data_service`, method=`query_documents`, params=`{ "cname": "issues" }`  
**WHEN** 点击「发送」  
**THEN** RequestHttp POST `/rpc` 被调用  
**AND** 响应面板显示格式化的 JSON（语法高亮）  
**AND** 显示响应时间（如 "234ms"）

### CT-03: 响应时间着色

**GIVEN** API 调用耗时 50ms  
**WHEN** 展示响应时间  
**THEN** 文字为绿色（<200ms）  
**GIVEN** 耗时 500ms  
**THEN** 文字为橙色（200-1000ms）  
**GIVEN** 耗时 2000ms  
**THEN** 文字为红色（>1000ms）

### CT-04: 请求历史

**GIVEN** 用户发送了 3 次请求  
**WHEN** 查看历史面板  
**THEN** 显示最近 20 条记录（时间倒序）  
**AND** 每条显示 module/method + 时间戳  
**AND** 点击历史项 → 自动填充请求表单

### CT-05: 收藏请求

**GIVEN** 用户配置了一个常用请求  
**WHEN** 点击「收藏」⭐ 按钮  
**THEN** 该请求保存到 localStorage `yivad-api-favorites`  
**AND** 收藏列表中显示该请求（名称+描述）

---

## L3 集成测试

### IT-01: 真实 API 调用

**GIVEN** YiAi 后端正在运行  
**WHEN** 用户发送 RPC 请求 `data_service.query_documents`  
**THEN** 返回 `{ code: 0, data: { list, total } }`  
**AND** 响应面板正确展示数据

### IT-02: API 错误处理

**GIVEN** 用户发送不存在的 module_name  
**WHEN** 点击「发送」  
**THEN** 返回 `{ code: 1002, message: "module not found" }`  
**AND** 响应面板显示红色错误信息

---

## L4 端到端场景

### E2E-01: 完整调试流程

1. 管理员打开 `/api-console`
2. 填写 module: `data_service`, method: `query_documents`
3. 填写 params: `{ "cname": "issues", "pageSize": 10 }`
4. 点击「发送」→ 响应面板显示数据（绿色 code:0）
5. 耗时显示 "45ms"（绿色）
6. 点击 ⭐ 收藏 → 命名「查询最近 Issues」
7. 刷新页面 → 收藏列表保留该请求
8. 点击收藏项 → 表单自动填充