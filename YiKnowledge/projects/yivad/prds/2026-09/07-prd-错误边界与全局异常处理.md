---
doc_type: prd
title: 错误边界与全局异常处理
tags: [错误处理, ErrorBoundary, 异常捕获, 优雅降级, 错误上报]
category: 项目/管理后台/需求
created: '2026-09-09'
updated: '2026-09-15'
source: internal
type: 需求
status: 已完成
priority: 高
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: '202609'
prd_task_id: YV-09-23
estimate_frontend: 1.0
review_status: 已评审
implementation_progress: 全部10个文件已实现并测试通过（7个测试文件），ErrorBoundary/Card/Fallback/Empty组件+errorHandler/errorReporter+优雅降级
implementation_updated: '2026-09-15'
issue_type: 功能
roles: [engineer, qa]
source_okr: [yivad-001]
---

# 错误边界与全局异常处理

> 需求编号：YV-09-23 · 优先级：高 · 人天：1.0d

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY），不含实现方案与测试用例。
> 实现方案见 [开发方案](../../devs/2026-09/07-prd-task-错误边界与全局异常处理.md)，验证方案见 [测试方案](../../tests/2026-09/07-prd-test-错误边界与全局异常处理.md)。


## 目录

- [一、背景](#sec-1)
- [二、设计原则](#sec-2)
- [三、架构总览](#sec-3)
- [四、功能需求](#sec-4)
- [五、集成注册](#sec-5)
- [六、边缘场景处理](#sec-6)
- [七、与现有模块的关系](#sec-7)
- [八、验收标准](#sec-8)

---



### 功能需求摘要

| 编号 | 功能 | 说明 |
|------|------|------|
| FR-1 | 四层防御策略 | 参见 §四层防御策略 |
| FR-2 | 职责边界 | 参见 §职责边界 |
| FR-3 | Layer 1：组件级错误边界 | 参见 §Layer 1：组件级错误边界 |
| FR-4 | Layer 2：API 拦截器错误处理 | 参见 §Layer 2：API 拦截器错误处理 |
| FR-5 | Layer 3：全局错误处理器 | 参见 §Layer 3：全局错误处理器 |
| FR-6 | Layer 4：错误上报服务 | 参见 §Layer 4：错误上报服务 |
| FR-7 | 优雅降级 Composable | 参见 §优雅降级 Composable |
| FR-8 | 错误页面（路由级） | 参见 §错误页面（路由级） |

---

<a id="sec-1"></a>
## 一、背景

YiVad 作为 SPA，单个组件渲染异常可能导致整页白屏。当前错误处理存在以下问题：

| 问题 | 现状 | 影响 |
|------|------|------|
| 组件崩溃无隔离 | 一个子组件渲染异常导致整个页面白屏 | 用户无法继续操作其他区域 |
| 错误信息不友好 | 直接显示技术堆栈或空白 | 用户不理解发生了什么 |
| 异步错误无兜底 | Promise rejection 未统一捕获 | 静默失败，问题不可见 |
| 错误无上报 | 生产环境错误无法追踪 | 依赖用户反馈才能发现问题 |

本次需求建立四层防御策略：组件级隔离崩溃、API 层统一网络/业务错误、全局处理器兜底未捕获异常、上报服务收集并批量发送。目标：单点故障不白屏，用户始终看到有意义的反馈。

---

<a id="sec-2"></a>
## 二、设计原则

1. **分层隔离**：组件级 → API 级 → 全局级，逐层兜底，上层没捕获的下层兜底
2. **优雅降级**：错误发生时展示降级 UI 而非白屏，提供重试/返回等出口
3. **用户友好**：技术错误信息（堆栈、错误码）转换为用户可理解的中文提示
4. **可观测**：生产环境错误分类记录并批量上报，dev 环境打印详细堆栈

---

<a id="sec-3"></a>
## 三、架构总览

### 3.1 四层防御策略


*(接口/类型定义见开发方案)*


### 3.2 职责边界

| 层 | 职责 | 明确不做 |
|----|------|---------|
| ErrorBoundary | 捕获子树渲染异常，展示降级 UI，支持重试 | 不处理异步错误（Promise/事件回调） |
| API 拦截器 | 统一处理 HTTP 错误码，业务错误码映射友好提示 | 不处理渲染错误 |
| errorHandler | 全局兜底未捕获异常，错误分类（6 种），日志记录 | 不恢复组件状态 |
| errorReporter | 收集 + 指纹去重 + 批量上报，页面卸载前 flush | 不含 PII 敏感数据 |

---

<a id="sec-4"></a>
## 四、功能需求

### 4.1 Layer 1：组件级错误边界

#### ErrorBoundary 组件

**文件**：`src/components/error/ErrorBoundary.vue`

使用 Vue 3 `onErrorCaptured` 钩子捕获子树渲染期间的错误，返回 `false` 阻止错误继续向上传播。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fallbackTitle` | `string` | `"组件加载失败"` | 降级 UI 标题 |
| `componentName` | `string` | — | 组件名（用于错误上报） |

**行为**：
- 正常状态：透明透传子组件（`<slot v-if="!error" />`）
- 错误状态：渲染 `ErrorCard`，显示错误标题、消息、详情
- 重试：点击重试清除 error 状态，触发子组件重新渲染
- 错误上报：捕获时自动调用 `reportError({ type: "RENDER", ... })`

#### ErrorCard 组件

**文件**：`src/components/error/ErrorCard.vue`

基于 `el-result` 组件，5 种错误类型差异化展示：

| 类型 | 图标 | 触发场景 | 操作按钮 |
|------|------|---------|---------|
| `network` | warning | 网络断开、fetch 失败 | 重试 + 刷新 |
| `server` | error | 500/502/503 | 重试 + 刷新 |
| `permission` | warning | 401/403 | 返回上一页 |
| `notfound` | info | 404 | 返回上一页 + 刷新 |
| `unknown` | error | 未分类错误 | 重试 + 刷新 |

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | 必填 | 错误标题 |
| `message` | `string` | — | 错误描述 |
| `retryable` | `boolean` | `false` | 是否显示重试按钮 |
| `showGoBack` | `boolean` | `true` | 是否显示返回按钮 |
| `showReload` | `boolean` | `true` | 是否显示刷新按钮 |
| `showDetails` | `boolean` | DEV only | 是否显示错误详情折叠面板 |
| `errorDetail` | `string` | — | 错误详情（堆栈等） |
| `errorType` | `ErrorType` | `"unknown"` | 决定图标类型 |

设计要点：错误详情仅在开发环境展示（`import.meta.env.DEV`），生产环境隐藏技术堆栈；返回按钮智能判断（有历史记录 `router.back()`，否则跳转首页）。

#### ErrorEmpty 组件

**文件**：`src/components/error/ErrorEmpty.vue`

轻量空状态组件，基于 `el-empty`，用于列表/表格数据为空时的占位展示。支持自定义描述、图片大小和操作按钮。

#### ErrorFallback 组件

**文件**：`src/components/error/ErrorFallback.vue`

全局降级页，全屏居中布局。用于路由级别或页面级别错误，提供「刷新页面」和「回到首页」两个出口。错误详情仅在 DEV 环境展示。

### 4.2 Layer 2：API 拦截器错误处理

由 `RequestHttp` 响应拦截器统一处理，本次增强：

| HTTP 状态码 | 分类 | 用户提示 | 附加操作 |
|------------|------|---------|---------|
| 401 | `permission` | 登录已过期，请重新登录 | 清除 Token → 重定向登录页，保留当前 URL |
| 403 | `permission` | 您没有权限访问此资源 | — |
| 404 | `notfound` | 请求的资源不存在 | — |
| 500 | `server` | 服务器内部错误，请稍后重试 | — |
| 502 | `server` | 服务暂时不可用，请稍后重试 | — |
| 503 | `server` | 服务正在维护中，请稍后重试 | — |
| Network Error | `network` | 网络连接失败，请检查网络后重试 | — |
| Timeout | `network` | 请求超时，请稍后重试 | — |

重复错误过滤：API 拦截器抛出的错误带有 `status` 属性，全局 `errorHandler` 识别后跳过，避免同一错误被双重处理。

### 4.3 Layer 3：全局错误处理器

**文件**：`src/utils/errorHandler.ts`

#### 三通道兜底

| 通道 | 注册方式 | 覆盖范围 |
|------|---------|---------|
| Vue 渲染错误 | `app.config.errorHandler` | 组件渲染期间抛出的未捕获错误 |
| Promise 拒绝 | `window.addEventListener("unhandledrejection")` | 未 catch 的 Promise rejection |
| 脚本错误 | `window.onerror` | 非 Vue 上下文的 JS 运行时错误 |

#### 错误分类器（classifyError）

按错误消息关键字归类：

| 类别 | 关键字匹配 |
|------|-----------|
| `network` | `network`、`fetch`、`timeout` |
| `permission` | `401`、`unauthorized`、`forbidden` |
| `notfound` | `404`、`not found` |
| `server` | `500`、`internal server` |
| `unknown` | 无匹配（兜底） |

#### 用户友好消息映射（getUserFriendlyMessage）

8 条预设映射 + 子串模糊匹配 + 原始消息兜底，确保用户始终看到中文可理解的错误描述。

#### warnHandler

开发环境下将 Vue 警告输出到控制台（含组件名和追踪信息），生产环境静默。

### 4.4 Layer 4：错误上报服务

**文件**：`src/utils/errorReporter.ts`

| 机制 | 实现 | 参数 |
|------|------|------|
| 指纹去重 | `${type}:${message}:${componentName}` | 5 分钟窗口同指纹只上报一次 |
| 队列缓冲 | `ERROR_QUEUE[]` | 最大 100 条，溢出移除最早 |
| 批量发送 | `setInterval(flushErrors, 30000)` | 30 秒间隔 |
| 立即发送 | `immediate: true` 或 SCRIPT 类型 | 脚本错误立即上报 |
| 页面卸载 | `beforeunload` → `flushErrors()` | 关闭前发送剩余错误 |
| 传输方式 | `navigator.sendBeacon` 优先 | 回退 `fetch` + `keepalive: true` |
| 采样控制 | `sample` 参数（0-1） | 高频错误可配置采样率 |

去重映射超过 500 条时触发清理，删除 2 倍窗口未出现的条目，防止内存泄漏。

**安全约束**：不含 Token、用户输入、Cookie 等 PII；上报失败静默，不触发二次循环；开发环境仅 `console.group` 输出，不发网络请求。

### 4.5 优雅降级 Composable

**文件**：`src/hooks/useGracefulDegradation.ts`


*(接口/类型定义见开发方案)*


自动重试使用指数退避：5s → 10s → 20s → 放弃（最多 3 次）。组件卸载时自动清除定时器。

### 4.6 错误页面（路由级）

| 组件 | 文件 | 触发条件 |
|------|------|---------|
| Error403 | `src/components/error/Error403.vue` | 路由守卫检测权限不足 |
| Error404 | `src/components/error/Error404.vue` | 路由匹配失败 |
| Error500 | `src/components/error/Error500.vue` | 页面级未捕获错误 |

所有错误页面提供明确的出口路径（返回首页/上一页），与 ErrorCard 共享 `el-result` 视觉风格。

---

<a id="sec-5"></a>
## 五、集成注册

在 `main.ts` 中统一注册三个全局处理器：


*(接口/类型定义见开发方案)*


关键组件包裹策略：

| 场景 | 包裹方式 |
|------|---------|
| 路由页面 | `router-view` 外层包裹 ErrorBoundary |
| ProTable | 表格区域包裹，错误时显示 ErrorCard + 重试 |
| 图表组件 | ECharts 容器包裹，渲染失败显示降级提示 |
| 动态组件 | `<component :is>` 外层包裹，防动态加载失败白屏 |

---

<a id="sec-6"></a>
## 六、边缘场景处理

| 场景 | 处理策略 |
|------|---------|
| 子树组件崩溃 | `onErrorCaptured` 返回 `false` 隔离，兄弟组件不受影响 |
| 异步操作错误 | `unhandledrejection` 兜底，API 层 `try/catch` |
| ErrorBoundary 自身崩溃 | 全局 `errorHandler` 兜底，ErrorFallback 全屏降级 |
| 错误上报失败 | 静默失败，不触发二次上报，不含 PII |
| 重试后再次崩溃 | 重试按钮始终可用（组件级）；autoRetry 最多 3 次（composable 级） |
| 生产环境堆栈 | 上报 message 和 stack，ErrorCard 不展示 showDetails |
| API 错误与渲染错误重复 | errorHandler 过滤带 `status` 属性的错误 |
| 快速切换页面 | `retry()` 清除 error 状态，新组件正常挂载 |
| 去重 map 膨胀 | 超过 500 条触发清理，删除 2× 窗口未出现的条目 |

---

<a id="sec-7"></a>
## 七、与现有模块的关系

| 关联模块 | 关系 | 说明 |
|---------|------|------|
| 06-prd-代码质量收尾 | 互补 | 代码质量收尾解决编译期问题，错误边界解决运行时异常 |
| 04-prd-项目管理系统 | 消费方 | 项目页面各 Tab 使用 ErrorBoundary 包裹，Tab 崩溃不影响其他 |
| 10-prd-通知中心 | 消费方 | 全局错误可通过通知中心展示非阻塞错误提示 |
| YiAi 后端 | 上报目标 | `POST /api/error-report` 接收前端错误上报 |

---

<a id="sec-8"></a>
## 八、验收标准

- [ ] ErrorBoundary 包裹故意崩溃的组件 → 显示 ErrorCard 降级 UI（非白屏）
- [ ] ErrorBoundary 重试 → 清除错误状态，子组件重新渲染
- [ ] 兄弟组件不受相邻组件崩溃影响
- [ ] `classifyError` 5 种错误类型分类正确
- [ ] `getUserFriendlyMessage` 8 条预设映射 + 子串匹配正确
- [ ] `app.config.errorHandler` 捕获 Vue 渲染错误
- [ ] `unhandledrejection` 捕获未 catch 的 Promise rejection
- [ ] `window.onerror` 捕获非 Vue 脚本错误
- [ ] errorReporter 指纹去重（5 分钟窗口同错误只上报一次）
- [ ] errorReporter 队列缓冲（30s 批量）+ beforeunload flush
- [ ] 生产环境不展示错误堆栈详情（showDetails = false）
- [ ] 错误上报不含 PII（Token、用户输入等）
- [ ] `useGracefulDegradation` 指数退避自动重试（5s/10s/20s，最多 3 次）
- [ ] 7 个测试文件全部通过（1 hook + 4 组件 + 2 工具）
- [ ] `vue-tsc --noEmit` 通过

---

> **文档边界**：本文档定义 WHAT/WHY。实现细节见[开发方案](../../devs/2026-09/07-prd-task-错误边界与全局异常处理.md)，测试用例见[测试方案](../../tests/2026-09/07-prd-test-错误边界与全局异常处理.md)。
