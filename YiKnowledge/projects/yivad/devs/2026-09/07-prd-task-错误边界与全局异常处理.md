---
doc_type: module
prd_task_id: "YV-09-23"
title: "YV-09-23: 错误边界与全局异常处理 — 分层错误处理 + 优雅降级 + 错误上报 — 开发方案"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "07-prd-错误边界与全局异常处理.md"
source_okr: [yivad-001]
---

# YV-09-23: 错误边界与全局异常处理 — 开发方案

> 来源 PRD：[07-prd-错误边界与全局异常处理.md](../../prds/2026-09/07-prd-错误边界与全局异常处理.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。
> 需求编号：YV-09-23 · 优先级：高 · 人天：1.0d

---

## 源码索引

| 文件 | 说明 | 文件路径 |
|------|------|------|
| `src/components/error/ErrorBoundary.vue` | 错误边界组件 | `YiVad/src/components/error/ErrorBoundary.vue` |
| `src/components/error/ErrorCard.vue` | 错误卡片 | `YiVad/src/components/error/ErrorCard.vue` |
| `src/components/error/ErrorFallback.vue` | 错误回退 | `YiVad/src/components/error/ErrorFallback.vue` |
| `src/components/error/ErrorEmpty.vue` | 空错误状态 | `YiVad/src/components/error/ErrorEmpty.vue` |
| `src/components/ErrorMessage/Error403.vue` | 403 错误页 | `YiVad/src/components/ErrorMessage/Error403.vue` |
| `src/components/ErrorMessage/Error404.vue` | 404 错误页 | `YiVad/src/components/ErrorMessage/Error404.vue` |
| `src/components/ErrorMessage/Error500.vue` | 500 错误页 | `YiVad/src/components/ErrorMessage/Error500.vue` |


## 目录

- [一、方案概述](#sec-1)
- [二、文件清单](#sec-2)
- [三、模块设计](#sec-3)
- [四、实施步骤与验证](#sec-4)
- [五、边缘场景](#sec-5)
- [六、完成定义（DoD）](#sec-6)

---

---

<a id="sec-1"></a>
## 一、方案概述

### 1.1 架构定位

错误处理采用分层策略——组件级 ErrorBoundary 隔离子树崩溃，全局 errorHandler 兜底未捕获异常，API 拦截器统一处理网络/业务错误，三层协同保证单点故障不白屏。


*(见源码索引)*


### 1.2 职责边界

| 层 | 职责 | 明确不做 |
|----|------|---------|
| ErrorBoundary | 捕获子树渲染异常，展示降级 UI | 不处理异步错误 |
| API 拦截器 | 统一处理网络/业务错误 | 不处理渲染错误 |
| errorHandler | 全局兜底、错误分类、日志记录 | 不恢复组件状态 |
| errorReporter | 收集 + 排队上报 | 不含 PII 敏感数据 |

---

<a id="sec-2"></a>
## 二、文件清单

| 文件 | 类型 | 职责 |
|------|------|------|
| `src/components/ErrorBoundary/ErrorBoundary.vue` | 新增 | Vue 错误边界组件 |
| `src/components/ErrorBoundary/ErrorCard.vue` | 新增 | 5 种错误类型卡片 |
| `src/components/ErrorBoundary/ErrorEmpty.vue` | 新增 | 空状态组件 |
| `src/components/ErrorBoundary/ErrorFallback.vue` | 新增 | 全局降级页 |
| `src/utils/errorHandler.ts` | 新增 | 全局错误处理器 |
| `src/utils/errorReporter.ts` | 新增 | 错误上报服务 |
| `src/hooks/useGracefulDegradation.ts` | 新增 | 优雅降级 composable |

---

<a id="sec-3"></a>
## 三、模块设计

### 3.1 ErrorBoundary — Vue 错误边界


*(见源码索引)*


**设计要点：**
- `onErrorCaptured` 返回 `false` 阻止错误继续向上传播——子树崩溃不影响兄弟组件
- `retry()` 清除 error 状态，触发子组件重新渲染
- 仅捕获**渲染期间**的错误，异步错误需 `try/catch` 或 Promise rejection 处理

### 3.2 ErrorCard — 5 种错误类型

| 类型 | 触发场景 | UI 展示 |
|------|---------|---------|
| `render` | 组件渲染异常 | 「页面渲染出错」+ 错误详情 + 重试 |
| `network` | API 网络错误 | 「网络连接失败」+ 重试 |
| `timeout` | 请求超时 | 「请求超时」+ 重试 |
| `permission` | 403/401 错误 | 「无权限访问」+ 返回 |
| `unknown` | 未分类错误 | 「未知错误」+ 重试 + 刷新 |


*(见源码索引)*


### 3.3 全局错误处理器


*(见源码索引)*


### 3.4 优雅降级 Composable


*(见源码索引)*


---

<a id="sec-4"></a>
## 四、实施步骤与验证

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | ErrorCard + ErrorBoundary 组件 | `ErrorCard.vue`, `ErrorBoundary.vue` | 包裹故意崩溃的组件 → 显示降级 UI | 0.3 |
| 2 | ErrorEmpty + ErrorFallback | `ErrorEmpty.vue`, `ErrorFallback.vue` | 空状态和全局降级页渲染 | 0.1 |
| 3 | 全局错误处理器 | `errorHandler.ts` | 触发错误 → 控制台输出分类信息 | 0.15 |
| 4 | 错误上报服务 | `errorReporter.ts` | dev 打印，生产排队上报 | 0.15 |
| 5 | API 拦截器错误增强 | `request.ts` | 模拟 500/断网 → 友好提示 | 0.1 |
| 6 | 优雅降级 composable | `useGracefulDegradation.ts` | 子组件崩溃 → 父组件显示降级 UI | 0.1 |
| 7 | main.ts 注册 + 集成测试 | `main.ts` | 全局错误被捕获，不白屏 | 0.1 |

**合计：1.0d**

---

<a id="sec-5"></a>
## 五、边缘场景

| 场景 | 处理策略 |
|------|---------|
| 子树组件崩溃 | ErrorBoundary 隔离，兄弟组件不受影响 |
| 异步操作错误 | `unhandledrejection` 兜底，API 层 `try/catch` |
| 错误上报失败 | 静默失败，不触发二次上报循环 |
| 生产环境堆栈 | 仅上报 message，不上报完整 stack（防泄漏） |

---

<a id="sec-6"></a>
## 六、完成定义（DoD）

- [ ] 7 个文件按 §2 清单落地
- [ ] ErrorBoundary 包裹崩溃组件 → 显示降级 UI（非白屏）
- [ ] 全局 errorHandler 捕获未处理异常
- [ ] `unhandledrejection` 监听注册
- [ ] `vue-tsc --noEmit` 通过

---

## 实现记录

> 复核日期：2026-09-15 · 状态：已完成

### 源码产出

| 分类 | 文件数 | 内容 |
|------|--------|------|
| Hooks | 1 | 核心逻辑 composable
| Stores | 0 | —
| API | 0 | —
| 组件 | 7 | Vue UI 组件
| 页面 | 0 | —
| **源码合计** | **8** | |

### 测试覆盖

| 分类 | 文件数 | 说明 |
|------|--------|------|
| Hook 测试 | 1 (useGracefulDegradation) | Vitest 单元测试
| 组件测试 | 4 (ErrorBoundary/Card/Empty/Fallback) | @vue/test-utils
| 工具测试 | 2 (errorHandler/errorReporter) | 纯函数单元测试
| **测试合计** | **7** | |

### 缺口

| — | 无显著缺口 | |


## 架构总览

### 三层错误处理体系


*(见源码索引)*


## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 错误边界实现 | Vue `onErrorCaptured` | 官方 API，返回 false 阻止向上传播 |
| 错误分类 | 4 类 (network/business/auth/unknown) | 每类对应不同的 UI 和处理策略 |
| 生产环境堆栈 | 仅上报 message，不上报 stack | 防止源码路径等敏感信息泄露 |
| 错误上报失败 | 静默失败 | 不触发二次上报循环 |
| 优雅降级 | `wrap(fn, fallback)` 模式 | 调用方无需 try/catch，异常时自动返回 fallback |



---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：已完成

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |
