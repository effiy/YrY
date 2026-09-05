---
lifecycle: active
title: YiPet Engineering — README
status: stable
type: summary
category: engineer/learn/projects/yipet
tags:
  - yipet
  - engineering
  - readme
  - project-meta
created: 2026-08-03
updated: 2026-08-07
source: internal
last_verified: 2026-08-07
roles:
- engineer
benefit: "Engineers can understand and apply yipet engineering — readme with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
review_cycle: quarterly
tacit: false
related:
  - ./claude.md
  - ../README.md
---

# YiPet — 温柔陪伴

> **作为** engineer，**我希望**理解并应用 YiPet 工程 — README，**以便**项目上下文被保留并可供团队访问。

> 一个 Chrome MV3 浏览器扩展，可将交互式陪伴伙伴注入任何网页，支持多角色 AI 聊天、React 18 + Ant Design 5 弹窗、按需 CDN 资源注入、完整的 i18n（en + zh_CN）和时区感知显示。由本地 YiAi FastAPI 后端驱动。使用 **Rsbuild + TypeScript** 构建。

> **新人 onboarding** -> `YiKnowledge/engineer/run/onboarding/yipet/onboarding.md`（8 个章节：环境搭建 / 工作流 / 踩坑速查 / 第一天任务）

## 摘要

- YiPet 是一个 Chrome MV3 浏览器扩展，采用三层架构：content scripts（ISOLATED + MAIN 双世界）、React 18 + Ant Design 5 弹窗控制面板，以及支持 SSE 流式和每条消息操作的聊天窗口——全部由本地 YiAi FastAPI 后端驱动
- 双世界边界（ISOLATED + MAIN）是最重要的架构约束——`chrome.runtime.*` 仅在 ISOLATED 中可用，页面上下文全局变量仅在 MAIN 中可用，打破此边界会导致难以调试的静默失败
- CDN 资源注入是架构中最脆弱的部分——从本地 `chrome-extension://` URL 加载 80+ 个 vendor 库需要精确的目录维护、版本对齐和全局存在性检查，以防止重复加载
- 四层 API 层（client → endpoints → types → services）对于单后端项目来说过度工程化，但在与 YiVad 的跨项目一致性方面得到了回报
- Rsbuild 多入口构建（popup、chat、CDN utils、bootstrap）使配置复杂度倍增——chat 打包需要 `--mode production` 是一个在单入口构建中不会存在的踩坑点

## 核心观点

**双世界边界（ISOLATED + MAIN）是 YiPet 中最重要的架构约束。** Chrome MV3 将 content scripts 与页面 JavaScript 隔离。bootstrap 模块的自注入模式桥接了此差距，但每行代码都必须尊重哪些 API 在哪个世界中可用。`chrome.runtime.*` 仅在 ISOLATED 中有效；页面上下文全局变量仅在 MAIN 中有效。打破此边界会导致静默失败，难以调试，因为错误出现在与源代码不同的执行上下文中。

**四层 API 层对于单后端项目来说过度工程化，但在跨项目一致性方面得到了回报。** `client -> endpoints -> types -> services` 架构对于与单个 FastAPI 后端通信的 Chrome 扩展来说，结构上比严格必要的要多。然而，回报是相同的模式在 YiPet 和 YiVad 中使用，使得跨项目导航可预测，且 `filter`/`query` 的 bug 可在一处修复。

**CDN 资源注入是 YiPet 架构中最脆弱的部分。** 从本地 `chrome-extension://` URL 加载 80+ 个 vendor 库需要精确的目录维护、版本对齐和全局存在性检查，以防止重复加载。React 和 ReactDOM 之间的单个版本不匹配，或缺少 CDN 条目，都可能破坏整个扩展。`src/content/cdn/catalog.ts` 中的目录是关键基础设施。

**Rsbuild 多入口构建使配置复杂度倍增。** YiPet 有四个独立的 Rsbuild 配置（popup、chat、CDN utils、bootstrap），每个都有自己的入口、输出和插件集。chat 打包需要 `--mode production`（以避免 `jsxDEV is not a function`）是一个在单入口构建中不会存在的踩坑点。每个新入口点都增加一个新的 Rsbuild 配置、一个新的构建脚本和新的失败模式。

**MV3 CSP 合规不是可选的，每个依赖都必须本地打包。** `script-src 'self'` 策略意味着没有远程代码、没有 `eval`、没有内联脚本。所有 80+ 个 vendor 库必须位于 `public/cdn/vendor/` 下，并通过 `chrome-extension://` URL 加载。添加新依赖意味着将其添加到 CDN 目录中，而不仅仅是 `npm install`。这一约束是安全特性，但使依赖管理显著更加手动化。

---

## 目录

- [概述](#概述)
- [亮点](#亮点)
- [架构](#架构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [快速开始](#快速开始)
- [命令流程](#命令流程)
- [项目结构](#项目结构)
- [国际化（i18n）](#国际化i18n)
- [时区处理](#时区处理)
- [权限与安全](#权限与安全)
- [领域语言](#领域语言)
- [配置](#配置)
- [近期变更](#近期变更)
- [浏览器支持](#浏览器支持)

---

## 概述

YiPet 是一个 Chrome Manifest V3 扩展，采用三层架构：

1. **Content Script** — 在 `manifest.json` 中声明，在 ISOLATED 世界中运行于每个页面。bootstrap 模块自注入到 MAIN 世界以暴露 `window.YiPet` 并按需自动加载 CDN 资源。
2. **弹窗控制面板**（`action.default_popup`）— 一个 React 18 + Ant Design 5 单页应用，用于切换陪伴可见性、尺寸、角色和颜色主题。所有面向用户的字符串通过 `chrome.i18n` 外部化。
3. **聊天窗口** — 一个 React 18 + Ant Design 5 组件（独立的 Rsbuild 入口），支持多角色 AI 聊天，SSE 流式传输和每条消息操作（重新生成/重试/重新发送/删除/编辑）。
4. **HTTP API 层** — 类型化的服务类（`AuthService`、`SessionService`、`ChatService` 等），封装基于 `fetch` 的客户端，支持重试、超时和 SSE 流式传输。

状态通过 `chrome.storage.local` 持久化。弹窗到 content script 的通信使用 `chrome.tabs.sendMessage`。YiAi 后端在 `http://localhost:10086` 提供聊天、会话、认证和配置服务。

---

## 亮点

- **交互式陪伴伙伴** — 注入到任何页面的动画 DOM 元素，具有角色图片、颜色主题渐变和可配置尺寸。
- **多角色 AI 聊天窗口** — 通过 SSE 流式响应，每条消息操作（重新生成/重试/重新发送/删除/编辑）、重命名、侧边栏和 Esc 关闭。
- **React 18.3 + Ant Design 5.21 弹窗 + 聊天** — 函数组件 + hooks，实时 `ConfigProvider` 主题切换。
- **按需 CDN 资源注入** — 80+ 个版本化库本地打包在 `public/cdn/vendor/` 下，MV3 CSP 合规。
- **完整的 i18n** — 通过 `chrome.i18n` 支持英文 + 简体中文，类型化的 `t()` 封装确保编译时安全。
- **时区感知显示** — ISO 8601 UTC 存储，`Intl.DateTimeFormat` 渲染，支持用户/系统时区检测。
- **四层 API 层** — `client → endpoints → types → services`，通过构造函数注入 `ApiClient`。
- **双执行上下文** — ISOLATED 世界用于 chrome.runtime API，MAIN 世界用于页面上下文全局变量。
- **Biome 2.5 linting** — 快速的 Rust 基础 linter/formatter，替代 ESLint + Prettier。
- **Vitest 2 测试** — jsdom 支持的单元测试运行器。

---

## 架构

YiPet 沿**组件化 + 四层 API** 轴线推进：弹窗和聊天 UI 使用 React 18 函数组件 + hooks，配合共同定位的 CSS；API 层遵循严格的四层架构。

```
┌────────────────────────────────────────────────────────────────┐
│  Popup（action.default_popup）                                  │
│  React 18.3 + Ant Design 5.21 · Rsbuild 打包的 TSX              │
│  通过 chrome.i18n 实现 i18n · 挂载时读取 chrome.storage.local   │
│  分发 chrome.tabs.sendMessage → content script                  │
└──────────────────────┬─────────────────────────────────────────┘
                       │ chrome.tabs.sendMessage
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  Content Script（ISOLATED 世界）                                │
│  src/content/index.ts — 消息中继到 MAIN 世界                    │
│  src/content/bootstrap.ts — 自注入到 MAIN 世界                   │
└──────────────────────┬─────────────────────────────────────────┘
                       │ <script> 注入 + CustomEvent
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  MAIN 世界（页面的 JS 上下文）                                    │
│  window.YiPet API · CDN 资源加载器（80+ 个库）                   │
│  陪伴 DOM 元素 · 交互行为                                        │
│  DevTools: YiPet.help() / YiPet.list() / YiPet.load()          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  聊天窗口（独立 Rsbuild 入口）                                   │
│  src/chat/controller.ts — 状态、流式、操作                       │
│  src/chat/components/ — 每个 UI 组件一个文件夹                    │
│  通过 fetch + AbortController 实现 SSE · 每条消息操作            │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP（fetch）
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  HTTP API 层（src/api/）                                        │
│  client.ts → endpoints.ts → types.ts → services/*.ts            │
│  聊天 SSE 流式 · 重试 + 超时 · 错误解析                           │
│  绑定到 RSBUILD_API_BASE（默认：http://localhost:10086）        │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP（fetch）
                       ▼
              ┌──────────────────┐
              │  YiAi Backend    │
              │  (FastAPI :10086)│
              └──────────────────┘
```

**数据流：**

- **弹窗 → Content Script：** `chrome.tabs.sendMessage` 配合类型化的 action 负载。
- **Content Script → MAIN 世界：** `<script>` 元素注入桥接 ISOLATED 世界边界，配合 `CustomEvent` 进行状态交接。
- **Bootstrap → CDN 目录：** 从本地 `chrome-extension://` URL 顺序加载 JS + 并行加载 CSS。全局存在性检查防止重复加载。
- **聊天 → YiAi：** `api.chat.stream()` 返回中止函数 + chunk 回调；逐行解析 SSE。
- **API 层 → YiAi：** 类型化服务类（`api.auth.login()`、`api.chat.stream()`、`api.sessions.list()`）封装共享的 `ApiClient`，支持重试和 SSE。

---

## 模块边界

### API 层（四层）

| 层 | 文件 | 公共 API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` 类——封装 `public/cdn/utils/api-client.ts`（fetch + 重试 + 错误提取），配合开发环境日志 + SSE 流式。其他层**不得**直接调用 `fetch`。 |
| 2 — Endpoints | `src/api/endpoints.ts` | 按领域划分的路径常量（`/auth/login`、`/sessions`、`/chat` 等）。 |
| 3 — Types | `src/api/types.ts` | 请求/响应接口（`LoginRequest`、`RpcRequest`、`QueryParams`、`ChatParams`、`SessionRecord` 等）。单一事实来源——services 和调用者从此处导入类型。 |
| 4 — Services | `src/api/services/*.ts` | 领域服务类（`AuthService`、`ChatService`、`SessionService`、`ConfigService`、`DatabaseService`、`FaqService`）。每个通过构造函数注入接收 `ApiClient`。`createApiServices(config)` 聚合它们。 |

### 跨项目协议契约

| 操作 | 请求格式 | 备注 |
|---|---|---|
| RPC | `{ module_name, method_name, parameters }` | 每个数据操作使用的信封 |
| `data_service.query_documents` | `{ cname, filter?: dict, pageNum?, pageSize?, limit? }` | **`filter`，不是 `query`**——后端静默忽略 `query`。 |
| `data_service.create_document` | `{ cname, data }` | |
| `data_service.update_document` | `{ cname, key, data }` | |
| `data_service.delete_document` | `{ cname, key }` | |
| Chat（SSE） | `{ model, messages, stream: true, system?, images? }` | 通过 `services.ai.chat_service.chat` 发送 |
| RAG query/chat | `{ question, scope? }` / `{ messages, scope? }` | YiAi `/rag` 端点（已完全接入——支持按文件和按文件夹范围） |
| Knowledge scan/read | `{ path?, ... }` | YiAi `/knowledge` 端点（已完全接入——树浏览器 + 预览 + 保存） |

### UI 层

| 模块 | 公共 API |
|---|---|
| `src/popup/` | `App.tsx`（根）、`index.tsx`（挂载）、`data.ts`（配置适配器）、`components/*`（每个 UI 组件一个文件夹，共同定位 TSX + CSS） |
| `src/chat/` | `controller.ts`（状态/流式/操作）、`components/*`、`types.ts` |
| `src/content/` | `bootstrap.ts`（双世界入口）、`cdn/catalog.ts` + `cdn/injector.ts`、`ipc/messages.ts`、`rendering/overlay.ts`、`state/` |
| `src/shared/` | `i18n/`、`theme/`、`roles.ts`、`locale/`、`timezone/`、`datetime/`、`env.ts`、`log.ts`、`state.ts` |
| `src/popup/services/` | `chrome.ts`（tabs/storage）、`connect.ts`（content-script ping）、`notify.ts`（toast） |

---

## 数据流

### 聊天（流式）

```
用户在聊天框输入
   │
   │ ChatController.send(text)
   ▼
api.chat.stream({ user, system?, model?, images?, conversation_id? })
   │
   │ fetch POST /  body: {module_name: "services.ai.chat_service",
   │                      method_name: "chat",
   │                      parameters: {model, messages, stream: true, system?, images?}}
   │ signal: AbortController
   ▼
YiAi FastAPI  →  StreamingResponse(text/event-stream)
   │  yields: data: {"data": {"message": "..."}}\n\n
   │  ends:   data: {"done": true}\n\n
   ▼
ApiClient 逐行解析 SSE，调用 onChunk(text) / onDone() / onError(err)
   │
   ▼
ChatController 将增量追加到进行中的陪伴消息
   │
   ▼
React 重新渲染；中止时，消息标记 aborted=true 并持久化
```

### 会话持久化

```
ChatController 在发送/接收/编辑/删除时
   │
   ▼
api.sessions.upsert({key, messages, ...})
   │ fetch POST /  body: {module_name: "services.database.data_service",
   │                      method_name: "update_document" or "create_document",
   │                      parameters: {cname: "sessions", key, data}}
   ▼
YiAi data_service → repository.create_document / update_document
   ▼
MongoDB sessions 集合
```

### 弹窗 → content script → MAIN 世界

```
弹窗（React）分发操作
   │ chrome.tabs.sendMessage(tabId, {type: 'TOGGLE_PET', payload})
   ▼
Content Script（ISOLATED）通过 chrome.runtime.onMessage 接收
   │ 通过 CustomEvent 转发到 MAIN 世界
   ▼
Bootstrap（MAIN 世界）监听 window，操作陪伴 DOM
```

---

## 快速开始

### 前置条件

- Node.js 18+ 和 npm
- [YiAi 后端](../../../../../YiAi/) 运行在 `http://localhost:10086`

### 安装与构建

```bash
# 安装依赖
npm install

# 生产构建（popup + chat + CDN utils + bootstrap）
npm run build

# 开发构建，带文件监听和 sourcemaps
npm run dev

# 类型检查（不输出文件）
npm run typecheck

# 运行单元测试
npm test
```

### 加载扩展

1. 构建项目（见上文）。
2. 在 Chrome 中打开 `chrome://extensions`。
3. 启用**开发者模式**（右上角切换开关）。
4. 点击**加载已解压的扩展** → 选择 `YiPet/dist/` 目录。
5. 打开任意网页。点击 YiPet 工具栏图标或使用键盘快捷键。

---

## 命令流程

| 触发方式 | 操作 |
|---|---|
| 工具栏图标点击 / `Ctrl+Shift+P`（macOS 上为 ⌘+Shift+P） | 打开弹窗控制面板 |
| `Ctrl+Shift+X`（macOS 上为 ⌘+Shift+X） | 切换聊天窗口 |
| `Esc`（聊天打开时） | 关闭聊天窗口 |
| DevTools 控制台 → `YiPet.help()` | 打印 CDN 资源使用指南 |
| DevTools 控制台 → `YiPet.list()` | 列出所有 80+ 个可用 CDN 资源 |
| DevTools 控制台 → `YiPet.load(key)` | 以编程方式加载 CDN 资源 |

---

## 项目结构

```
YiPet/
├── manifest.json              # MV3 manifest — default_locale、__MSG__ i18n、content_scripts、commands
├── package.json               # npm 脚本：dev、build、typecheck、test、lint
├── tsconfig.base.json         # 共享 TS strict 配置
├── tsconfig.json              # 弹窗 TS 配置（路径别名 @/）
├── rsbuild.config.ts          # 弹窗构建入口（HTML）
├── rsbuild.config.cdn.ts      # CDN utils IIFE 打包（UrlBuilder、LoggerUtils、YiPetApi）
├── rsbuild.config.chat.ts     # 聊天窗口构建入口
├── rsbuild.config.bootstrap.ts# Content script bootstrap 构建入口
├── vitest.config.ts           # Vitest + jsdom 测试运行器
├── biome.json                 # Biome linter/formatter 配置（替代 ESLint + Prettier）
├── .env / .env.production     # 环境变量
├── public/                    # 由 Rsbuild 原样复制到 dist/
│   ├── cdn/                   # 预打包的 vendor 库（React、dayjs、Ant Design、GSAP…）
│   │   ├── styles/            # CSS 设计令牌 + reset
│   │   ├── utils/             # UrlBuilder、LoggerUtils、YiPetApi — 作为 CDN IIFE 构建
│   │   └── vendor/            # 80+ 个版本化库（react@18.3.1、dayjs@1.11.21 等）
│   ├── _locales/              # Chrome i18n 消息文件
│   │   ├── en/messages.json   # 英文（源语言，55+ 个键）
│   │   └── zh_CN/messages.json # 中文翻译
│   └── assets/                # 图标（16/32/48/128 px）+ 陪伴角色图片
└── src/
    ├── api/                   # HTTP API 层（四层架构）
    │   ├── client.ts          #   第 1 层：封装 CDN api-client，添加日志 + SSE 流式
    │   ├── endpoints.ts       #   第 2 层：按领域划分的路径常量（auth、sessions、chat…）
    │   ├── types.ts           #   第 3 层：请求/响应接口
    │   ├── index.ts           #   桶导出
    │   └── services/          #   第 4 层：领域服务类
    │       ├── auth.ts        #     登录、登出、刷新、个人资料
    │       ├── chat.ts        #     Prompt + SSE 流式
    │       ├── config.ts      #     应用配置获取/更新/重置
    │       ├── database.ts    #     通用集合 CRUD
    │       ├── faq.ts         #     FAQ 管理 + 批量重排序
    │       ├── sessions.ts   #     会话 CRUD、搜索、收藏、导出/导入
    │       └── index.ts       #     createApiServices() 聚合器
    ├── background/            # Service worker — 命令分发 + 消息路由
    ├── chat/                  # 聊天窗口（Rsbuild 多入口构建）
    │   ├── controller.ts      #   聊天控制器（状态、流式、操作）
    │   ├── components/         #   每个聊天 UI 组件一个文件夹
    │   ├── styles/            #   聊天特定 CSS（markdown、窗口）
    │   └── types.ts           #   聊天领域类型
    ├── config/
    │   ├── defaults.ts        # 纯数据配置（无逻辑）
    │   └── config.ts          # 环境感知编排器 + API 客户端配置
    ├── content/
    │   ├── bootstrap.ts       # 双世界自注入 + YiPet API 设置
    │   ├── cdn/               # CDN 资源目录 + 注入器
    │   ├── ipc/               # 进程间消息类型
    │   ├── rendering/         # 陪伴覆盖层渲染
    │   └── state/             # 内容内状态管理
    ├── popup/
    │   ├── App.tsx            # 根组件（hooks、生命周期、i18n 初始化）
    │   ├── index.tsx          # React 根挂载
    │   ├── popup.html         # Rsbuild 入口 — Ant Design + 模块入口
    │   ├── data.ts            # 配置适配器（AppConfig → PopupConfig 格式）
    │   ├── services/          # 工厂模式服务模块（chrome、connect、notify）
    │   └── components/        # 每个 UI 组件一个文件夹（共同定位 TSX + CSS）
    ├── shared/                # 跨层共享模块
    │   ├── i18n/              # 类型化的 t() 封装 + MessageKey 联合类型
    │   ├── theme/             # 调色板 + Ant Design 主题令牌
    │   ├── roles.ts           # 角色验证（Teacher、Doctor、Chef、Police）
    │   └── ...                # locale、timezone、datetime、env、log、messages、state
    ├── typings.d.ts           # 模块声明（*.css、*.png）
    ├── types/                 # React CDN 全局变量 + JSX 命名空间
    └── utils/                 # datetime、env、log 辅助函数
```

---

## 国际化（i18n）

YiPet 使用 Chrome 内置的 `chrome.i18n` API。所有 55+ 个面向用户的字符串已外部化到 `public/_locales/<lang>/messages.json`。

| 语言 | 文件 | 覆盖范围 |
|---|---|---|
| English（en） | `_locales/en/messages.json` | 源语言——所有键 |
| 中文（zh_CN） | `_locales/zh_CN/messages.json` | 完整翻译 |

**工作原理：**

- `manifest.json` 使用 `__MSG_extName__`、`__MSG_cmd*__` 占位符。
- `popup.html` 对静态内容使用 `__MSG_popupTitle__`，对动态切换使用 `data-i18n` 属性。
- TypeScript 代码使用类型化的 `t('key')` 封装——`t('popupSwitchLabel')` → `"Show Pet"`（en）/ `"Show Pet"`（zh_CN — 英文镜像）。
- 语言解析：用户偏好（`chrome.storage`）→ Chrome UI 语言 → 回退到 `en`。
- 添加新语言：创建 `_locales/<lang>/messages.json` 并将语言代码追加到 `src/shared/i18n/locale.ts` 中的 `SUPPORTED_LOCALES`。

---

## 时区处理

通过 `Intl.DateTimeFormat` 和 dayjs（含 timezone 插件）实现时区感知的日期时间显示。

- **存储：** 所有时间戳使用 ISO 8601 UTC（`new Date().toISOString()`）。
- **显示：** `formatDateTime(utcISO, locale, timeZone)` 转换到用户时区。
- **解析：** 用户偏好（`chrome.storage`）→ 系统时区（`Intl.DateTimeFormat().resolvedOptions().timeZone`）。
- **相对时间：** `formatRelativeTime(utcISO, locale)` 使用 `Intl.RelativeTimeFormat`。
- **dayjs：** `timezone.js` 插件在 CDN 目录中可用，键为 `dayjs-tz`。

---

## 权限与安全

| 权限 | 用途 |
|---|---|
| `storage` | 持久化用户偏好、语言和时区 |
| `tabs` | 访问活动标签页以进行消息中继 |
| `scripting` | 以编程方式注入 content script |
| `webRequest` | 网络请求观察 |
| `host_permissions: <all_urls>` | Content script 在所有页面上运行 |

> **CSP 说明：** MV3 默认强制执行 `script-src 'self'; object-src 'self'`。YiPet 合规——所有 CDN 库本地打包在 `public/cdn/vendor/` 下，通过 `web_accessible_resources` 以 `chrome-extension://` URL 加载。无远程代码、无 `eval`、无内联脚本。

---

## 领域语言

### 核心术语

- **Pet** — 注入到页面 DOM 中的交互式视觉元素。具有角色图片、颜色主题渐变和可配置尺寸。
- **Role** — 陪伴的职业身份（Teacher / Doctor / Pastry Chef / Police Officer）。决定外观。四种角色。
- **Popup** — `action.default_popup` 页面。一个 React 18 + Ant Design 5 设置面板。作为短生命周期、临时页面存在——点击外部即关闭。
- **Chat Window** — 一个独立的 React 18 + Ant Design 5 组件（自有 Rsbuild 入口），用于多角色 AI 聊天，支持流式、每条消息操作和重命名。
- **Content Script** — 在 `manifest.json` 的 `content_scripts` 中声明。在 `document_end` 时于 ISOLATED 世界中运行。拥有 `chrome.runtime.*` API 但无法看到页面 JS 全局变量。
- **MAIN 世界** — 网页自身的 JS 执行上下文。bootstrap 自注入后，`window.YiPet` 可从 DevTools 访问（页面上下文，而非扩展上下文）。
- **ISOLATED 世界** — 默认的 content script 环境。共享页面 DOM 但不共享 JS 全局变量。使用 `"world": "ISOLATED"`（MV3 默认）。
- **CDN Catalog** — `src/content/cdn/catalog.ts` 中的资源清单（`CDN_CATALOG` 数组）。将短键（`vue`、`react`、`gsap`）映射到 `cdn/vendor/` 下的文件路径。全部本地——无远程 CDN。
- **Bootstrap** — 不是 CSS Bootstrap。指 `src/content/bootstrap.ts`，双世界入口，自注入到 MAIN 世界并设置 `window.YiPet`。
- **ChatController** — `src/chat/controller.ts` 中的状态机，拥有流式、每条消息操作（重新生成/重试/重新发送/删除/编辑）、重命名和中止。使用 `useSyncExternalStore` 暴露 React 友好的状态。
- **RPC 信封** — 用于每次跨项目调用 YiAi 的 `{module_name, method_name, parameters}` 请求格式。
- **`filter`（不是 `query`）** — `query_documents` 中的 MongoDB 过滤参数名。后端静默忽略 `query`；始终使用 `filter`。

### 关系图

- **弹窗 → Content Script → MAIN 世界：** 用户切换 → `chrome.tabs.sendMessage({ action })` → content script 中继 → 页面 DOM 更新。
- **Bootstrap → CDN 目录：** Bootstrap 在每次页面加载时从目录中顺序注入 JS 和并行注入 CSS。
- **Config → 弹窗（通过 data.ts）：** `defaults.ts` + `config.ts` → `data.ts` 适配为 `PopupConfig` → React 组件消费。
- **弹窗 Services → Chrome APIs：** `services/chrome.ts` 封装 `chrome.tabs.*`/`chrome.storage.*`；`services/connect.ts` 以退避策略 ping content script；`services/notify.ts` 管理 toast 自动关闭。
- **ChatController → YiAi：** `api.chat.stream()` → SSE → onChunk 增量 → React 重新渲染。
- **API Services → YiAi Backend：** `src/api/services/*.ts` → `client.ts` → `fetch()` 到 `http://localhost:10086`。

### 歧义消除

| 术语 | 不要混淆于 |
|---|---|
| **Bootstrap**（双世界入口） | CSS Bootstrap 框架——YiPet 使用 Ant Design，而非 Bootstrap |
| **CDN Catalog** | 远程 CDN——所有条目都是打包到扩展中的本地文件 |
| **Pet** | 聊天窗口——Pet 是注入的 DOM 陪伴；聊天窗口是独立的 UI |
| **Role** | 用户账户角色——此处指陪伴的职业外观 |
| **`filter`** | 不是 `query`；不是 Mongo 的 `$filter` 聚合阶段 |

---

## 配置

环境变量位于 `.env` 和 `.env.production`：

| 变量 | 默认值 | 用途 |
|---|---|---|
| `RSBUILD_API_BASE` | `http://localhost:10086` | YiAi FastAPI 后端 URL |
| `RSBUILD_LOG_LEVEL` | `info` | 开发环境日志详细程度 |

用户偏好持久化在 `chrome.storage.local`：

| 键 | 类型 | 用途 |
|---|---|---|
| `locale` | `'en' \| 'zh_CN' \| null` | 覆盖 Chrome UI 语言 |
| `timezone` | `string \| null` | 覆盖系统时区 |
| `petVisible` | `boolean` | 显示/隐藏陪伴 |
| `petSize` | `number` | 陪伴显示尺寸 |
| `petRole` | `Role` | 活跃角色 |
| `petTheme` | `string` | 活跃颜色主题 |

---

## 行动建议

1. **在下一个 sprint 内添加 CI 检查，验证 CDN 目录和全局存在性检查是否同步。** CDN 目录（`CDN_CATALOG` 数组）和注入器的全局存在性检查（`window.React`、`window.dayjs` 等）必须对每个资源匹配。单个不匹配会导致重复加载或缺少依赖。编写一个脚本，从目录中提取所有 `global` 字段值，并验证注入器对每个值都有对应的存在性检查。这应在 CI 中运行，并在失败时阻止合并。

2. **RAG 和 Knowledge 服务现已完全接入（2026-08-05 完成）。** YiPet 聊天窗口支持按文件和按文件夹范围的 RAG 知识增强、知识树浏览、文件预览和保存到知识库。剩余差距是 agent 模式（pi 风格的工具循环）——YiVad 的 aiChat 已有此功能；将 agent SSE 协议移植到 YiPet 的聊天控制器，将支持从浮动聊天窗口执行多轮工具调用任务。

3. **添加 pre-commit hook，在允许提交前验证 `npm run typecheck` 通过。** "提交前构建"的铁律已有文档但未强制执行。Rsbuild/SWC 在构建时剥离类型但不检查它们，因此类型错误下成功的构建会产生运行时失败。一个运行 `tsc --noEmit` 并在失败时阻止提交的 pre-commit hook 可以在最早的时间点捕获类型错误。这是一个 3 行的 husky 配置变更。

4. **在下个季度内将四个 Rsbuild 配置合并为支持多入口的单一配置。** 当前设置（popup、chat、CDN utils、bootstrap 各有自己的配置）使配置复杂度倍增，并产生如 chat 打包需要 `--mode production` 的踩坑点。Rsbuild 支持在单一配置中使用多个入口点。合并将把配置表面积从 4 个文件减少到 1 个，并消除每个入口的构建脚本差异。

5. **编写一个集成测试，验证双世界 bootstrap 自注入在真实 Chrome 扩展上下文中端到端工作。** 当前使用 happy-dom 的 Vitest 测试可以模拟消息传递，但无法模拟 Chrome 实际的 ISOLATED/MAIN 执行环境。使用 `@anthropic-ai/chrome-extension-testing` 或基于 puppeteer 的测试，在真实 Chrome 实例中加载扩展，从弹窗发送消息到 content script，并验证 MAIN 世界接收到它。这可以捕获仅在真实 Chrome 运行时中出现的跨世界 bug。

## 反模式

- **从 MAIN 世界代码调用 `chrome.runtime.*` API。** 双世界边界是绝对的：Chrome API 仅在 ISOLATED 世界中可用。从通过 bootstrap 注入的 MAIN 世界代码调用它们会静默抛出或返回 `undefined`。所有 Chrome API 调用必须留在 ISOLATED 世界代码中。

- **在不理解 `--mode production` 要求的情况下添加新的 Rsbuild 入口。** chat 打包需要 `--mode production` 以避免 `jsxDEV is not a function` 错误。使用 React 但在开发模式中运行的新 Rsbuild 入口会遇到相同的 bug。始终使用 `npm run dev` 和 `npm run build` 测试新入口。

- **提交前跳过 `npm run typecheck`。** Rsbuild/SWC 在构建时剥离类型但不检查它们。`tsc --noEmit` 是唯一的类型检查通道。类型错误下成功的构建会产生本可在编译时捕获的运行时错误。

- **在 RPC 调用 `data_service.query_documents` 中使用 `query` 而非 `filter`。** YiAi 后端的 `_build_filter` 读取 `filter` 键，而非 `query`。传递 `query` 会静默返回所有文档或空。这曾在 `SessionService.list/get` 中导致真实 bug。始终在 parameters 字典中使用 `filter`。

- **修改 CDN 目录而不更新全局存在性检查逻辑。** `CDN_CATALOG` 数组是所有可注入资源的单一事实来源。添加新条目而不验证全局存在性检查正确，将导致重复加载或缺少依赖。目录和注入器必须保持同步。

## 近期变更

### 2026-07-28 — Bug 修复（API 层）

- **`src/api/services/sessions.ts`**：`SessionService.list()` 和 `SessionService.get(id)` 在 RPC 参数中发送 `query: {...}`，但 YiAi 的 `query_documents` 只识别 `filter`。两者现在发送 `filter: {...}`。没有此修复，list/get 会静默返回所有会话或空。
- **`src/api/types.ts`**：`QueryParams.query?: Record<string, unknown>` 重命名为 `QueryParams.filter?: Record<string, unknown>`，并附有说明后端合并契约的文档字符串。

### 2026-07-27 — 聊天框移植

- 将 YiPett 的快捷方式 + 聊天框移植到扩展中。`Esc` 关闭聊天，`Ctrl+Shift+X` 切换，角色系统 prompt 已接入，对话持久化。YiPett 的完整功能集不在范围内。

### 2026-07-28 — 技术栈迁移

- React 15 + Bootstrap → **React 18.3 + Ant Design 5.21**。ESLint → **Biome 2.5**。文档已更新以匹配。

### 2026-07-28 — 聊天开发模式 jsxDEV 不匹配

- 开发模式 React 插件 + 生产 `NODE_ENV` 定义导致运行时 `jsxDEV is not a function`。修复：chat 打包开发脚本现在使用 `--mode production` 运行。

### 2026-08-05 — Knowledge + RAG 完全接入聊天

- **侧边栏知识树浏览器**：`ChatSidebar` 新增 Knowledge 标签页，使用 antd `Tree` 渲染。点击节点 → `setRagScopeFromNode(path)` → 显示 scope 标签。分类过滤下拉框缩小可见树 + 应用于 RAG 查询。拖放知识文件到聊天区域以种子化会话。
- **RAG 状态 + 按文件知识增强**：`ChatController` 按 `ragScopeIsFile` 路由知识增强查询：叶子 scope → `RagService.streamFileChat`（按文件索引）；文件夹 scope → `RagService.streamChat`。工具栏中的 RAG 状态徽章（绿/黄/蓝），含重建操作。RAG 来源在最新陪伴消息下方渲染，含路径 + 分数。
- **RAG 预检来源预览 + 子问题分解**：发送前预览来源（一次性检索，无 LLM）。将复杂问题分解为子问题，含每个子问题的答案 + 综合。
- **KnowledgePreviewDialog**：双击任意知识叶子节点打开模态框，渲染文件的 markdown 正文 + frontmatter 元数据条（status/lifecycle/review_cycle/tacit/type/category/tags）+ 可点击的 `related` 链接。
- **保存到 YiKnowledge**：陪伴消息现在有保存按钮 → 模态框含 path/title/category/type/tags → `KnowledgeService.write` → 自动刷新知识树。
- **侧边栏 Stories 标签页**：第三个侧边栏标签页渲染来自 `KnowledgeService.listStories` 的项目 onboarding stories；点击在 `KnowledgePreviewDialog` 中打开 story markdown。

### 2026-08-05 — 跨项目中心（bug 报告 + 桥梁 + 导航）

- **跨项目 bug 报告**：`BugReportDialog` 模态框含完整表单（severity/priority/status/type/frequency/project/module/assignee/tags/description/steps/expected/actual）。元数据 → MongoDB `bugs` 集合；长文本正文 → `YiKnowledge/lessons/failures/bugs/<key>.md`。`detectProjectFromUrl` 自动填充项目字段。
- **侧边栏 Recent Bugs 标签页**：第四个侧边栏标签页，列出 MongoDB 中最近 30 个 bug。点击 → 在 YiVad 中打开详情；"Discuss"按钮 → 从 bug 的 `contentPath` 种子化聊天输入 + RAG scope。
- **到 YiVad aiChat 的跨项目桥梁**：工具栏按钮通过 `SessionService.create` 以页面上下文（URL + title + body）种子化 YiVad aiChat 会话，然后 `window.open` `http://localhost:8848/#/aiChat?session=<key>`。
- **每条消息"在 YiVad aiChat 中打开"**：每条陪伴消息有 `ExportOutlined` 按钮，以消息内容 + 前一个用户问题种子化 YiVad 会话。
- **跨项目导航下拉框**：工具栏下拉框含 YiAi 后端、YiVad 管理后台、aiChat、code-review/bugs、BRD 和 Story Board 的快速链接。
- **页面感知会话过滤**：`EnvironmentOutlined` 按钮过滤会话仅显示来自当前页面（hostname + pathname + hash-path）的会话。可切换开关。
- **页面感知上下文芯片**：检测 YiVad 详情页面（bug/BRD/story）并提供一键上下文 prompt（"讨论 bug <key>"、"总结 BRD <key>"、"带我了解 <key>"）。

### 2026-08-05 — 会话功能（导出、分支、总结、自动标题）

- **导出会话为 markdown**：`DownloadOutlined` 按钮将消息格式化为带 frontmatter 头部 + 每条消息章节的 markdown 文档，触发 `.md` 下载。
- **从消息分支**：任意消息上的 `BranchesOutlined` 按钮从该消息分叉出一个新会话，包含到该点为止的消息。标签包含 `branch-of:<origId>` 用于追溯。
- **会话摘要模态框**：`ProfileOutlined` 按钮流式生成当前会话的 5-8 条 LLM 摘要。可复制，留在模态框中（不追加到聊天）。
- **自动生成会话标题**：会话编辑弹窗中的 `ThunderboltOutlined` 按钮要求 LLM 从前 4 条用户消息生成 4-6 个词的标题。显示在输入框中供保存前审查。

### 2026-08-05 — UX 改进（聊天窗口 + 输入 + 状态）

- **SessionStatusBar（pi 风格紧凑型）**：位于消息和输入之间——模型、消息数、~token 估算 vs 8K 上下文窗口（低/中/高）、上下文/RAG 指示器芯片、流式阶段芯片（send/regenerate/resend）。
- **ContextScopeBar**：聊天区域上方的紧凑芯片，显示活跃的 RAG scope + 页面上下文。点击查看，X 清除。
- **聊天输入中的 @-mention 文件下拉框**：在输入中键入 `@` → 从知识树实时搜索文件 → 选择 → RAG scope 设置 + 知识增强自动启用。
- **Prompt 历史**：输入中的 ArrowUp/ArrowDown 调用之前的 prompts（持久化到 `chrome.storage.local`）。工具栏弹出框用于可视化浏览。
- **"将选中内容插入为 prompt"**：`HighlightOutlined` 工具栏按钮读取 `window.getSelection()` 并将其推入聊天输入。
- **每条消息 token 芯片**：每个消息气泡显示 `~Nt`（chars/4 估算），按角色颜色编码（输入=蓝色，输出=绿色）。
- **紧凑成本迷你图**：SessionStatusBar 中的 SVG 迷你图，显示累计 $ 花费轨迹。悬停区域滚动到对应消息。
- **工具调用时间线（三段阶段指示器）**：thinking | retrieving | streaming 迷你时间线，位于状态栏中。活跃段以发光效果点亮。
- **顶部边缘拖拽调整大小手柄**：拖动聊天窗口顶部边缘向下推同时变高——保持项目页面上半部分可见。
- **侧边栏拖拽调整大小手柄**：侧边栏和聊天区域之间的 4px 垂直分隔符，带 `col-resize` 光标。宽度持久化到 `chrome.storage.local`。

---

## 浏览器支持

- Chrome 114+（需要 Manifest V3）。
- Edge 114+（基于 Chromium，支持 MV3）。
- 其他 Chromium 浏览器——未测试但应可工作。

> Firefox 使用不同的扩展模型——YiPet 不支持 Firefox。

## 相关

- [YiPet engineering CLAUDE.md](./claude.md) — 项目配置、模块边界、数据流、自我约束和近期变更
- [YiPet architecture](../架构设计.md) — 双世界边界、四层 API 层、CDN 资源注入
- [YiPet development standards](../开发规范.md) — 编码规范、构建配置和 API 层标准
- [YiPet functional modules](../功能模块.md) — 弹窗、聊天、内容、API 和共享模块清单
- [YiVad README](../../yivad/README.md) — 跨项目伙伴，共享 RPC 信封契约