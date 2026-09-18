---
doc_type: test
title: "错误边界与全局异常处理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-23"
source_prds: ["07-prd-错误边界与全局异常处理"]
source_modules: []
---
# 错误边界与全局异常处理 — 测试规格

> 来源 PRD：[07-prd-错误边界与全局异常处理.md](../../prds/2026-09/07-prd-错误边界与全局异常处理.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。
> 提取日期：2026-09-11

---


---

<a id="sec-strategy"></a>
## 测试策略

### 分层模型

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Composable/hook/工具函数纯逻辑 | Vitest | 每次提交 |
| L2 组件 | Vue 组件挂载与交互 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | Composable ↔ 组件 ↔ Store ↔ RPC | Vitest + mock | 每次提交 |
| L4 端到端 | 完整用户路径（需 YiAi 运行） | 手动 | 提测/回归 |

### 优先级定义

| 级别 | 含义 | 响应 |
|------|------|------|
| P0 | 核心路径，失败阻塞发布 | 立即修复 |
| P1 | 重要功能，失败需评估 | 当日修复 |
| P2 | 增强功能，可延后 | 排期修复 |

---

<a id="sec-env"></a>
## 测试环境与前置条件

| 项 | 要求 |
|----|------|
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版 |
| 框架 | Vitest + jsdom |
| 类型检查 | `pnpm exec vue-tsc --noEmit` |

```bash
pnpm test                                    # 全部测试
pnpm exec vitest run tests/hooks/            # 仅 hooks
pnpm exec vitest run --coverage             # 覆盖率
```

---

<a id="sec-criteria"></a>
## 准入与准出标准

### 准入

| # | 条件 |
|---|------|
| 1 | 对应 FR 的实现已提交 |
| 2 | `vue-tsc --noEmit` 无错误 |
| 3 | 功能在开发环境可正常使用 |

### 准出

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |

---

<a id="sec-defects"></a>
## 缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| Blocker | 阻塞测试或数据损坏 | 功能完全不可用 |
| Critical | 核心功能不可用 | 主要路径报错 |
| Major | 功能缺陷但有替代路径 | 边界条件处理不当 |
| Minor | 体验问题 | UI 偏移/文案错误 |
| Trivial | 视觉细节 | 间距微调 |

### 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | 四层防御策略 | CT + IT | ✅ 已完成 |
| FR-2 | 职责边界 | CT + IT | ✅ 已完成 |
| FR-3 | Layer 1：组件级错误边界 | CT + IT | ✅ 已完成 |
| FR-4 | Layer 2：API 拦截器错误处理 | CT + IT | ✅ 已完成 |
| FR-5 | Layer 3：全局错误处理器 | CT + IT | ✅ 已完成 |
| FR-6 | Layer 4：错误上报服务 | CT + IT | ✅ 已完成 |
| FR-7 | 优雅降级 Composable | CT | ✅ 已完成 |
| FR-8 | 错误页面（路由级） | CT + IT | ✅ 已完成 |




<a id="sec-6"></a>
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

---

## 覆盖矩阵

| 编号 | 用例 | 覆盖 FR | 优先级 | 自动化 |
|------|------|--------|--------|--------|
| TC-ERR-001 | ErrorCard 渲染网络错误 | FR-7.2 | P0 | ✅ ErrorCard.test.ts |
| TC-ERR-002 | ErrorCard 重试按钮 | FR-7.2 | P0 | ✅ ErrorCard.test.ts |
| TC-ERR-003 | ErrorBoundary 捕获渲染错误 | FR-7.1 | P0 | ✅ ErrorBoundary.test.ts |
| TC-ERR-004 | ErrorBoundary 重试恢复 | FR-7.1 | P0 | ✅ ErrorBoundary.test.ts |
| TC-ERR-005 | ErrorFallback 全局降级 | FR-7.3 | P0 | ✅ ErrorFallback.test.ts |
| TC-ERR-006 | ErrorEmpty 空状态 | FR-7.4 | P1 | ✅ ErrorEmpty.test.ts |
| TC-ERR-007 | errorHandler 分类 | FR-7.5 | P0 | ✅ errorHandler.test.ts |
| TC-ERR-008 | errorReporter 上报 | FR-7.9 | P1 | ✅ errorReporter.test.ts |
| TC-ERR-009 | useGracefulDegradation | FR-7.8 | P0 | ✅ useGracefulDegradation.test.ts |

## 执行状态

| 指标 | 值 |
|------|-----|
| 全局测试 | 78 文件 · 680 用例 · 100% 通过 |
| 本模块测试 | 7 文件 · 32 用例 · 全部通过 |
| 执行命令 | `cd YiVad && pnpm test` |
