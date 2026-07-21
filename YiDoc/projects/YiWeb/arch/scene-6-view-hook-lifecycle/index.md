# §0 Effect Sketch — View & Hook Lifecycle

**What this scene demonstrates**: YiWeb 的三个核心 View（aicr / claude / story）的完整生命周期——从 `createBaseView` 初始化、`createStore` 状态创建，到 `useComputed` + `useMethods` 的 hook 绑定，再到组件树挂载和销毁。追踪 CDN 组件（markdown 渲染器、CDN 工具库）与 Vue 3 应用之间的交互时序。

**Why it matters**: YiWeb 的 3 个 View 各自独立，但共享核心服务层和 CDN 工具库。理解 View 的初始化顺序、hook 模式的数据流，以及 CDN 组件（如 markdown 渲染器）的异步加载时机，是扩展 View 和调试状态问题的前提。

```mermaid
graph TD
    subgraph Bootstrap
        CI[createBaseView] --> CS[createStore]
        CS --> UC[useComputed]
        CS --> UM[useMethods]
        UC --> MO[mount Vue App]
        UM --> MO
    end
    subgraph Views · 3 Panels
        MO --> V1[aicrView]
        MO --> V2[claudeView]
        MO --> V3[storyView]
    end
    subgraph Core Services
        V1 --> API[requestHelper · API]
        V2 --> API
        V3 --> API
        API --> AUTH[authUtils · X-Token]
        API --> CRUD[crud · streamPrompt]
    end
    subgraph CDN Layer
        V1 --> MD[Markdown Renderer]
        V2 --> CDN[cdn/utils · log/error/storage]
        V3 --> MAP[fileToStoryMapper]
    end
```

---

# §1 Test Design — Verification Steps

## Step 1: 验证 View 初始化顺序
**Action**: 检查 `src/views/aicr/index.js`、`src/views/claude/index.js`、`src/views/story/index.js` 中的 `createBaseView` 调用
**Expected**: 每个 View 独立调用 createBaseView，传入各自的 store/computed/methods 和容器选择器
**Files**: `src/views/aicr/index.js`, `src/views/claude/index.js`, `src/views/story/index.js`

## Step 2: 验证 Hook 模式数据流
**Action**: 读取 `src/views/aicr/hooks/` 下 store.js → useComputed.js → useMethods.js 的依赖链
**Expected**: store 持有原始 reactive 状态；useComputed 纯派生，无副作用；useMethods 返回闭包函数，操作 store 并可能触发 API 调用
**Files**: `src/views/aicr/hooks/store.js`, `src/views/aicr/hooks/useComputed.js`, `src/views/aicr/hooks/useMethods.js`

## Step 3: 验证 CDN 组件加载时序
**Action**: 检查 `cdn/markdown/index.js` 和 `cdn/utils/core/` 的加载方式，确认其与 Vue 应用挂载的前后关系
**Expected**: CDN 工具库在 View 初始化前通过 `<script>` 同步加载；markdown 渲染器支持异步组件注册
**Files**: `cdn/markdown/index.js`, `cdn/utils/core/log.js`, `cdn/utils/core/error.js`

## Step 4: 验证跨 View 数据共享
**Action**: 检查 `src/utils/fileToStoryMapper.js` 和 `src/core/services/`
**Expected**: 核心服务层（requestHelper, crud, authUtils）为所有 View 共享；fileToStoryMapper 在 aicr 和 story view 之间建立双向关联
**Files**: `src/utils/fileToStoryMapper.js`, `src/core/services/`

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `src/views/aicr/index.js` | file | aicr View 入口 · View 生命周期 bootstrap |
| `src/views/claude/index.js` | file | claude View 入口 |
| `src/views/story/index.js` | file | story View 入口 |
| `src/views/aicr/hooks/store.js` | file | aicr 响应式状态 · sessions / fileTree / filters |
| `src/views/aicr/hooks/useComputed.js` | file | aicr 派生状态 · tags / filteredCount |
| `src/views/aicr/hooks/useMethods.js` | file | aicr 方法 · search / chat / CRUD / streaming |
| `src/core/services/helper/requestHelper.js` | file | HTTP 客户端 · fetch 封装 |
| `src/core/services/helper/authUtils.js` | file | X-Token 管理 · API 配置对话框 |
| `src/core/services/modules/crud.js` | file | 通用 CRUD 操作 · streamPrompt |
| `src/utils/fileToStoryMapper.js` | file | 文件到 Story 的知识图谱映射器 |
| `cdn/markdown/index.js` | file | Markdown 渲染器 · 流式 + 静态 |
| `cdn/utils/core/log.js` | file | 结构化日志 · logInfo / logWarn / logError |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | 3 个 View 独立创建，bootstrap 模式一致 |
| 2 | ✅ | Hook 模式数据流清晰 · store → computed → methods |
| 3 | ✅ | CDN 组件同步加载 + markdown 异步注册 |
| 4 | ✅ | 核心服务层共享 + fileToStoryMapper 跨 View 关联 |

**Overall**: pass — 4/4 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- 多个 View 同时挂载时（如 iframe 场景），`createStore` 创建的响应式状态可能冲突
- `streamPrompt` 流式响应在中途断开时，`useMethods` 中的闭包可能持有过期的 store 引用
- CDN 工具库和 View 的加载顺序依赖 `<script>` 标签的排列顺序，缺少显式的依赖声明

## Suggested Improvements
- 为 View 初始化添加命名空间隔离，防止多实例状态冲突
- 为 `useMethods` 中的流式调用添加 AbortController 清理机制
- 建立 CDN 模块的显式 import/export 依赖图，替代隐式的 `<script>` 顺序依赖
- 为 `fileToStoryMapper` 添加双向关联的完整性校验

## Limitations
- View 之间通过核心服务层共享数据，但没有统一的状态管理中心
- Markdown 渲染器的插件系统尚未从 YiPet 完全迁移，部分插件不可用
- `streamPrompt` 依赖原生 `fetch`，不支持 WebSocket 长连接
