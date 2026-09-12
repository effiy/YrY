---
doc_type: test
title: "错误边界与全局异常处理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-23"
source_prds: ["07-prd-错误边界与全局异常处理"]
source_modules: []
---
# 错误边界与全局异常处理 — 测试规格

> 来源 PRD：[07-prd-错误边界与全局异常处理.md](../../prds/2026-09/07-prd-错误边界与全局异常处理.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 单元测试：ErrorCard

#### Scenario: 渲染网络错误卡片
- **GIVEN** `errorType = "network"`, `title = "网络连接失败"`, `message = "请检查网络"`
- **WHEN** 挂载 `ErrorCard` 组件
- **THEN** 渲染标题 "网络连接失败"，显示重试按钮和刷新按钮

#### Scenario: 点击重试按钮
- **GIVEN** `retryable = true`
- **WHEN** 点击 "重试" 按钮
- **THEN** 触发 `retry` 事件

#### Scenario: 权限错误不显示重试
- **GIVEN** `errorType = "permission"`, `retryable = false`
- **WHEN** 挂载 `ErrorCard` 组件
- **THEN** 不显示重试按钮，仅显示 "返回上一页" 按钮

### 单元测试：ErrorBoundary

#### Scenario: 正常渲染子组件
- **GIVEN** 子组件正常渲染
- **WHEN** 挂载 `ErrorBoundary` 包裹子组件
- **THEN** 子组件内容正常显示

#### Scenario: 捕获子组件渲染错误
- **GIVEN** 子组件 `setup` 中抛出 `new Error("Render failed")`
- **WHEN** 挂载 `ErrorBoundary` 包裹该子组件
- **THEN** 显示 ErrorCard 组件，错误消息为 "Render failed"

#### Scenario: 重试恢复
- **GIVEN** 子组件已崩溃，ErrorCard 显示
- **WHEN** 点击 "重试" 按钮
- **THEN** ErrorCard 消失，子组件重新渲染

### 单元测试：errorHandler

#### Scenario: classifyError 分类
- **GIVEN** `new Error("Network Error")`
- **WHEN** 调用 `classifyError(error)`
- **THEN** 返回 `"network"`
- **GIVEN** `new Error("Request failed with status code 500")`
- **WHEN** 调用 `classifyError(error)`
- **THEN** 返回 `"server"`

#### Scenario: getUserFriendlyMessage 映射
- **GIVEN** `"Network Error"`
- **WHEN** 调用 `getUserFriendlyMessage("Network Error")`
- **THEN** 返回 `"网络连接失败，请检查网络后重试"`
- **GIVEN** `"Some unknown error"`
- **WHEN** 调用 `getUserFriendlyMessage("Some unknown error")`
- **THEN** 返回原始消息 `"Some unknown error"`

### 集成测试：API 错误拦截

#### Scenario: 500 错误响应
- **GIVEN** Mock API 返回 500 错误
- **WHEN** 调用 `getProjectList({})`
- **THEN** Promise reject，`error.friendlyMessage` 为 `"服务器内部错误，请稍后重试"`

#### Scenario: 401 错误响应
- **GIVEN** Mock API 返回 401 错误
- **WHEN** 调用 `getProjectList({})`
- **THEN** Token 被清除，路由重定向到 `/login`

---


## 补充：单元测试用例

### UT-ER01: classifyError

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 网络错误 | `TypeError: Failed to fetch` | category='network' |
| 2 | API 业务错误 | `{code:1001, message:'参数错误'}` | category='business' |
| 3 | 权限错误 | `{code:4002}` | category='auth' |
| 4 | 未知错误 | 随机 Error | category='unknown' |

### UT-ER02: useGracefulDegradation

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 初始状态 | 组件正常挂载 | error=null, retrying=false |
| 2 | 错误处理 | 子组件抛出错误 | error 含错误信息 |
| 3 | 重试 | 调用 retry() | 重新渲染子组件 |
| 4 | 自动重试 | 指数退避 1s→2s→4s | 最多重试 3 次 |

