# YiPet — Gentle Companion

> 一个 Chrome MV3 浏览器扩展，将交互式伴侣注入任何网页，支持多角色 AI 聊天、React 18 + Ant Design 5 弹窗、按需 CDN 资源注入、完整的 i18n（en + zh_CN）以及时区感知显示。由本地 YiAi FastAPI 后端驱动。使用 **Rsbuild + TypeScript** 构建。

> **入门指南** → `YiKnowledge/projects/YiPet/onboarding.md`（8 个部分：环境搭建 / 工作流 / 已知陷阱 / 第 1 天任务）

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

1. **Content Script** — 在 `manifest.json` 中声明，在 ISOLATED 世界中运行于每个页面。bootstrap 模块自我注入到 MAIN 世界，暴露 `window.YiPet` 并按需自动加载 CDN 资源。
2. **弹窗控制面板**（`action.default_popup`）— 一个 React 18 + Ant Design 5 单页应用，用于切换宠物可见性、大小、角色和颜色主题。所有面向用户的字符串通过 `chrome.i18n` 外部化。
3. **聊天窗口** — 一个 React 18 + Ant Design 5 组件（独立的 Rsbuild 入口），支持多角色 AI 聊天，带 SSE 流式传输和每条消息操作（重新生成 / 重试 / 重新发送 / 删除 / 编辑）。
4. **HTTP API 层** — 类型化的服务类（`AuthService`、`SessionService`、`ChatService` 等），包装了基于 `fetch` 的客户端，支持重试、超时和 SSE 流式传输。

状态通过 `chrome.storage.local` 持久化。弹窗到内容脚本的通信使用 `chrome.tabs.sendMessage`。YiAi 后端在 `http://localhost:10086` 提供聊天、会话、认证和配置服务。

---

## 亮点

- **交互式宠物伴侣** — 注入到任何页面的动画 DOM 元素，带有角色图片、颜色主题渐变和可配置的大小。
- **多角色 AI 聊天窗口** — 通过 SSE 流式响应，每条消息操作（重新生成 / 重试 / 重新发送 / 删除 / 编辑），重命名，侧边栏，Esc 关闭。
- **React 18.3 + Ant Design 5.21 弹窗 + 聊天** — 函数组件 + hooks，实时 `ConfigProvider` 主题切换。
- **按需 CDN 资源注入** — 80+ 个版本化的库本地打包在 `public/cdn/vendor/` 下，MV3 CSP 合规。
- **完整的 i18n** — 通过 `chrome.i18n` 支持英文 + 简体中文，类型化的 `t()` 包装器确保编译时安全。
- **时区感知显示** — ISO 8601 UTC 存储，`Intl.DateTimeFormat` 渲染，支持用户/系统时区检测。
- **四层 API 层** — `client → endpoints → types → services`，通过构造函数注入 `ApiClient`。
- **双执行上下文** — ISOLATED 世界用于 chrome.runtime API，MAIN 世界用于页面上下文全局变量。
- **Biome 2.5 代码检查** — 快速的 Rust 实现代码检查器/格式化器，替代 ESLint + Prettier。
- **Vitest 2 测试** — jsdom 支持的单元测试运行器。

---

## 架构

YiPet 沿着 **组件化 + 四层 API** 轴前进：弹窗和聊天 UI 使用 React 18 函数组件 + hooks，就近放置 CSS；API 层遵循严格的四层架构。

```
┌────────────────────────────────────────────────────────────────┐
│  弹窗（action.default_popup）                                  │
│  React 18.3 + Ant Design 5.21 · Rsbuild 打包的 TSX            │
│  i18n 通过 chrome.i18n · 挂载时读取 chrome.storage.local      │
│  分发 chrome.tabs.sendMessage → 内容脚本                       │
└──────────────────────┬─────────────────────────────────────────┘
                       │ chrome.tabs.sendMessage
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  内容脚本（ISOLATED 世界）                                     │
│  src/content/index.ts — 消息中继到 MAIN 世界                   │
│  src/content/bootstrap.ts — 自我注入到 MAIN 世界               │
└──────────────────────┬─────────────────────────────────────────┘
                       │ <script> 注入 + CustomEvent
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  MAIN 世界（页面的 JS 上下文）                                 │
│  window.YiPet API · CDN 资源加载器（80+ 库）                   │
│  宠物 DOM 元素 · 交互行为                                      │
│  DevTools: YiPet.help() / YiPet.list() / YiPet.load()         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  聊天窗口（独立的 Rsbuild 入口）                               │
│  src/chat/controller.ts — 状态、流式传输、操作                 │
│  src/chat/components/ — 每个 UI 组件一个文件夹                 │
│  SSE 通过 fetch + AbortController · 每条消息操作               │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP（fetch）
                       ▼
┌────────────────────────────────────────────────────────────────┐
│  HTTP API 层（src/api/）                                       │
│  client.ts → endpoints.ts → types.ts → services/*.ts           │
│  聊天 SSE 流式传输 · 重试 + 超时 · 错误解析                    │
│  绑定到 RSBUILD_API_BASE（默认: http://localhost:10086）       │
└──────────────────────┬─────────────────────────────────────────┘
                       │ HTTP（fetch）
                       ▼
              ┌──────────────────┐
              │  YiAi 后端       │
              │  (FastAPI :10086)│
              └──────────────────┘
```

**数据流：**

- **弹窗 → 内容脚本：** `chrome.tabs.sendMessage` 使用类型化的操作载荷。
- **内容脚本 → MAIN 世界：** `<script>` 元素注入桥接 ISOLATED 世界边界，使用 `CustomEvent` 传递状态。
- **Bootstrap → CDN 目录：** 从本地 `chrome-extension://` URL 顺序加载 JS + 并行加载 CSS。全局存在性检查防止重复加载。
- **聊天 → YiAi：** `api.chat.stream()` 返回一个 abort 函数 + chunk 回调；SSE 逐行解析。
- **API 层 → YiAi：** 类型化的服务类（`api.auth.login()`、`api.chat.stream()`、`api.sessions.list()`）包装共享的 `ApiClient`，支持重试和 SSE。

---

## 模块边界

### API 层（四层）

| 层 | 文件 | 公共 API |
|---|---|---|
| 1 — Client | `src/api/client.ts` | `ApiClient` 类 — 包装 `public/cdn/utils/api-client.ts`（fetch + 重试 + 错误提取），增加开发模式日志 + SSE 流式传输。其他层禁止直接调用 `fetch`。 |
| 2 — Endpoints | `src/api/endpoints.ts` | 按域划分的路径常量（`/auth/login`、`/sessions`、`/chat`、...）。 |
| 3 — Types | `src/api/types.ts` | 请求/响应接口（`LoginRequest`、`RpcRequest`、`QueryParams`、`ChatParams`、`SessionRecord`、...）。单一数据源 — services 和调用方从这里导入类型。 |
| 4 — Services | `src/api/services/*.ts` | 域服务类（`AuthService`、`ChatService`、`SessionService`、`ConfigService`、`DatabaseService`、`FaqService`）。每个通过构造函数注入接收 `ApiClient`。`createApiServices(config)` 聚合它们。 |

### 跨项目协议契约

| 操作 | 请求形状 | 备注 |
|---|---|---|
| RPC | `{ module_name, method_name, parameters }` | 每个数据操作使用的信封 |
| `data_service.query_documents` | `{ cname, filter?: dict, pageNum?, pageSize?, limit? }` | **`filter`，不是 `query`** — 后端会静默忽略 `query`。 |
| `data_service.create_document` | `{ cname, data }` | |
| `data_service.update_document` | `{ cname, key, data }` | |
| `data_service.delete_document` | `{ cname, key }` | |
| Chat（SSE） | `{ model, messages, stream: true, system?, images? }` | 通过 `services.ai.chat_service.chat` 发送 |
| RAG 查询/聊天 | `{ question, scope? }` / `{ messages, scope? }` | YiAi `/rag` 端点（可用，YiPet 尚未调用） |
| Knowledge 扫描/读取 | `{ path?, ... }` | YiAi `/knowledge` 端点（可用，YiPet 尚未调用） |

### UI 层

| 模块 | 公共 API |
|---|---|
| `src/popup/` | `App.tsx`（根组件）、`index.tsx`（挂载）、`data.ts`（配置适配器）、`components/*`（每个 UI 组件一个文件夹，就近放置 TSX + CSS） |
| `src/chat/` | `controller.ts`（状态/流式/操作）、`components/*`、`types.ts` |
| `src/content/` | `bootstrap.ts`（双世界入口）、`cdn/catalog.ts` + `cdn/injector.ts`、`ipc/messages.ts`、`rendering/overlay.ts`、`state/` |
| `src/shared/` | `i18n/`、`theme/`、`roles.ts`、`locale/`、`timezone/`、`datetime/`、`env.ts`、`log.ts`、`state.ts` |
| `src/popup/services/` | `chrome.ts`（标签页/存储）、`connect.ts`（内容脚本 ping）、`notify.ts`（通知） |

---

## 数据流

### 聊天（流式）

```
用户在聊天框中输入
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
ChatController 将增量追加到进行中的宠物消息
   │
   ▼
React 重新渲染；中止时，消息标记为 aborted=true 并持久化
```

### 会话持久化

```
ChatController 在发送 / 接收 / 编辑 / 删除时
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

### 弹窗 → 内容脚本 → MAIN 世界

```
弹窗（React）分发操作
   │ chrome.tabs.sendMessage(tabId, {type: 'TOGGLE_PET', payload})
   ▼
内容脚本（ISOLATED）通过 chrome.runtime.onMessage 接收
   │ 通过 CustomEvent 转发到 MAIN 世界
   ▼
Bootstrap（MAIN 世界）监听 window，修改宠物 DOM
```

---

## 快速开始

### 前置条件

- Node.js 18+ 和 npm
- [YiAi 后端](../YiAi/) 在 `http://localhost:10086` 上运行

### 安装与构建

```bash
# 安装依赖
npm install

# 生产构建（弹窗 + 聊天 + CDN utils + bootstrap）
npm run build

# 开发构建，带文件监听和 sourcemap
npm run dev

# 类型检查（不输出文件）
npm run typecheck

# 运行单元测试
npm test
```

### 加载扩展

1. 构建项目（见上文）。
2. 在 Chrome 中打开 `chrome://extensions`。
3. 启用 **开发者模式**（右上角切换开关）。
4. 点击 **加载已解压的扩展** → 选择 `YiPet/dist/` 目录。
5. 打开任意网页。点击 YiPet 工具栏图标或使用键盘快捷键。

---

## 命令流程

| 触发方式 | 操作 |
|---|---|
| 工具栏图标点击 / `Ctrl+Shift+P`（macOS 上为 ⌘+Shift+P） | 打开弹窗控制面板 |
| `Ctrl+Shift+X`（macOS 上为 ⌘+Shift+X） | 切换聊天窗口 |
| `Esc`（聊天打开时） | 关闭聊天窗口 |
| DevTools 控制台 → `YiPet.help()` | 打印 CDN 资源使用指南 |
| DevTools 控制台 → `YiPet.list()` | 列出所有 80+ 可用 CDN 资源 |
| DevTools 控制台 → `YiPet.load(key)` | 编程方式加载 CDN 资源 |

---

## 项目结构

```
YiPet/
├── manifest.json              # MV3 manifest — default_locale, __MSG__ i18n, content_scripts, commands
├── package.json               # npm 脚本：dev, build, typecheck, test, lint
├── tsconfig.base.json         # 共享的 TS strict 配置
├── tsconfig.json              # 弹窗 TS 配置（路径别名 @/）
├── rsbuild.config.ts          # 弹窗构建入口（HTML）
├── rsbuild.config.cdn.ts      # CDN utils IIFE 打包（UrlBuilder, LoggerUtils, YiPetApi）
├── rsbuild.config.chat.ts     # 聊天窗口构建入口
├── rsbuild.config.bootstrap.ts# 内容脚本 bootstrap 构建入口
├── vitest.config.ts           # Vitest + jsdom 测试运行器
├── biome.json                 # Biome 代码检查器/格式化器配置（替代 ESLint + Prettier）
├── .env / .env.production     # 环境变量
├── public/                    # 由 Rsbuild 原样复制到 dist/
│   ├── cdn/                   # 预打包的 vendor 库（React, dayjs, Ant Design, GSAP…）
│   │   ├── styles/            # CSS 设计 token + reset
│   │   ├── utils/             # UrlBuilder, LoggerUtils, YiPetApi — 构建为 CDN IIFE
│   │   └── vendor/            # 80+ 版本化库（react@18.3.1, dayjs@1.11.21, …）
│   ├── _locales/              # Chrome i18n 消息文件
│   │   ├── en/messages.json   # 英文（源语言，55+ 键）
│   │   └── zh_CN/messages.json # 中文翻译
│   └── assets/                # 图标（16/32/48/128 px）+ 宠物角色图片
└── src/
    ├── api/                   # HTTP API 层（四层架构）
    │   ├── client.ts          #   第 1 层：包装 CDN api-client，添加日志 + SSE 流式传输
    │   ├── endpoints.ts       #   第 2 层：按域划分的路径常量（auth, sessions, chat…）
    │   ├── types.ts           #   第 3 层：请求/响应接口
    │   ├── index.ts           #   桶导出
    │   └── services/          #   第 4 层：域服务类
    │       ├── auth.ts        #     登录、登出、刷新、个人信息
    │       ├── chat.ts        #     提示词 + SSE 流式传输
    │       ├── config.ts      #     应用配置获取/更新/重置
    │       ├── database.ts    #     通用集合 CRUD
    │       ├── faq.ts         #     FAQ 管理 + 批量重排序
    │       ├── sessions.ts   #     会话 CRUD、搜索、收藏、导出/导入
    │       └── index.ts       #     createApiServices() 聚合器
    ├── background/            # Service worker — 命令分发 + 消息路由
    ├── chat/                  # 聊天窗口（Rsbuild 多入口构建）
    │   ├── controller.ts      #   聊天控制器（状态、流式传输、操作）
    │   ├── components/         #   每个聊天 UI 组件一个文件夹
    │   ├── styles/            #   聊天专用 CSS（markdown、窗口）
    │   └── types.ts           #   聊天域类型
    ├── config/
    │   ├── defaults.ts        # 纯数据配置（无逻辑）
    │   └── config.ts          # 环境感知编排器 + API 客户端配置
    ├── content/
    │   ├── bootstrap.ts       # 双世界自我注入 + YiPet API 设置
    │   ├── cdn/               # CDN 资源目录 + 注入器
    │   ├── ipc/               # 进程间消息类型
    │   ├── rendering/         # 宠物覆盖层渲染
    │   └── state/             # 内容内状态管理
    ├── popup/
    │   ├── App.tsx            # 根组件（hooks、生命周期、i18n 初始化）
    │   ├── index.tsx          # React 根节点挂载
    │   ├── popup.html         # Rsbuild 入口 — Ant Design + 模块入口
    │   ├── data.ts            # 配置适配器（AppConfig → PopupConfig 形状）
    │   ├── services/          # 工厂模式服务模块（chrome、connect、notify）
    │   └── components/        # 每个 UI 组件一个文件夹（就近放置 TSX + CSS）
    ├── shared/                # 跨层共享模块
    │   ├── i18n/              # 类型化的 t() 包装器 + MessageKey 联合类型
    │   ├── theme/             # 颜色调色板 + Ant Design 主题 token
    │   ├── roles.ts           # 角色验证（Teacher, Doctor, Chef, Police）
    │   └── ...                # locale, timezone, datetime, env, log, messages, state
    ├── typings.d.ts           # 模块声明（*.css、*.png）
    ├── types/                 # React CDN 全局类型 + JSX 命名空间
    └── utils/                 # datetime、env、log 辅助函数
```

---

## 国际化（i18n）

YiPet 使用 Chrome 内置的 `chrome.i18n` API。所有 55+ 个面向用户的字符串外部化到 `public/_locales/<lang>/messages.json`。

| 语言 | 文件 | 覆盖率 |
|---|---|---|
| English（en） | `_locales/en/messages.json` | 源语言 — 所有键 |
| 中文（zh_CN） | `_locales/zh_CN/messages.json` | 完整翻译 |

**工作原理：**

- `manifest.json` 使用 `__MSG_extName__`、`__MSG_cmd*__` 占位符。
- `popup.html` 使用 `__MSG_popupTitle__` 用于静态内容，`data-i18n` 属性用于动态切换。
- TypeScript 代码使用类型化的 `t('key')` 包装器 — `t('popupSwitchLabel')` → `"Show Pet"`（en）/ `"Show Pet"`（zh_CN — 英文镜像）。
- 语言解析：用户偏好（`chrome.storage`）→ Chrome UI 语言 → 回退到 `en`。
- 添加新语言：创建 `_locales/<lang>/messages.json` 并将语言代码追加到 `src/shared/i18n/locale.ts` 中的 `SUPPORTED_LOCALES`。

---

## 时区处理

通过 `Intl.DateTimeFormat` 和带时区插件的 dayjs 实现时区感知的日期时间显示。

- **存储：** 所有时间戳以 ISO 8601 UTC 格式（`new Date().toISOString()`）。
- **显示：** `formatDateTime(utcISO, locale, timeZone)` 转换为用户时区。
- **解析：** 用户偏好（`chrome.storage`）→ 系统时区（`Intl.DateTimeFormat().resolvedOptions().timeZone`）。
- **相对时间：** `formatRelativeTime(utcISO, locale)` 使用 `Intl.RelativeTimeFormat`。
- **dayjs：** `timezone.js` 插件在 CDN 目录中可用，键为 `dayjs-tz`。

---

## 权限与安全

| 权限 | 用途 |
|---|---|
| `storage` | 持久化用户偏好、语言和时区 |
| `tabs` | 访问活动标签页以进行消息中继 |
| `scripting` | 编程方式注入内容脚本 |
| `webRequest` | 网络请求观察 |
| `host_permissions: <all_urls>` | 内容脚本在每个页面上运行 |

> **CSP 说明：** MV3 默认强制执行 `script-src 'self'; object-src 'self'`。YiPet 符合要求 — 所有 CDN 库本地打包在 `public/cdn/vendor/` 下，通过 `web_accessible_resources` 使用 `chrome-extension://` URL 加载。无远程代码，无 `eval`，无内联脚本。

---

## 领域语言

### 核心术语

- **Pet** — 注入到页面 DOM 中的交互式视觉元素。具有角色图片、颜色主题渐变和可配置的大小。
- **Role** — 宠物的职业身份（Teacher / Doctor / Pastry Chef / Police Officer）。决定外观。四个角色。
- **Popup** — `action.default_popup` 页面。一个 React 18 + Ant Design 5 设置面板。作为短生命周期的瞬态页面存在 — 在外部点击时关闭。
- **Chat Window** — 一个独立的 React 18 + Ant Design 5 组件（自有 Rsbuild 入口），用于多角色 AI 聊天，支持流式传输、每条消息操作和重命名。
- **Content Script** — 在 `manifest.json` 的 `content_scripts` 中声明。在 ISOLATED 世界中以 `document_end` 运行。拥有 `chrome.runtime.*` API 但无法看到页面 JS 全局变量。
- **MAIN World** — 网页自身的 JS 执行上下文。bootstrap 自我注入后，`window.YiPet` 可从 DevTools 访问（页面上下文，而非扩展上下文）。
- **ISOLATED World** — 默认内容脚本环境。共享页面 DOM 但不共享 JS 全局变量。使用 `"world": "ISOLATED"`（MV3 默认）。
- **CDN Catalog** — `src/content/cdn/catalog.ts` 中的资源清单（`CDN_CATALOG` 数组）。将短键（`vue`、`react`、`gsap`）映射到 `cdn/vendor/` 下的文件路径。全部本地 — 无远程 CDN。
- **Bootstrap** — 不是 CSS Bootstrap。指 `src/content/bootstrap.ts`，双世界入口，自我注入到 MAIN 世界并设置 `window.YiPet`。
- **ChatController** — `src/chat/controller.ts` 中的状态机，管理流式传输、每条消息操作（重新生成 / 重试 / 重新发送 / 删除 / 编辑）、重命名和中止。使用 `useSyncExternalStore` 暴露 React 友好的状态。
- **RPC 信封** — `{module_name, method_name, parameters}` 请求形状，用于每次到 YiAi 的跨项目调用。
- **`filter`（不是 `query`）** — `query_documents` 中的 MongoDB 过滤器参数名。后端会静默忽略 `query`；始终使用 `filter`。

### 关系图

- **弹窗 → 内容脚本 → MAIN 世界：** 用户切换 → `chrome.tabs.sendMessage({ action })` → 内容脚本中继 → 页面 DOM 更新。
- **Bootstrap → CDN 目录：** Bootstrap 在每次页面加载时从目录顺序注入 JS（顺序）和 CSS（并行）。
- **配置 → 弹窗（通过 data.ts）：** `defaults.ts` + `config.ts` → `data.ts` 适配为 `PopupConfig` → React 组件消费。
- **弹窗服务 → Chrome API：** `services/chrome.ts` 包装 `chrome.tabs.*`/`chrome.storage.*`；`services/connect.ts` 通过退避 ping 内容脚本；`services/notify.ts` 管理通知自动关闭。
- **ChatController → YiAi：** `api.chat.stream()` → SSE → onChunk 增量 → React 重新渲染。
- **API Services → YiAi 后端：** `src/api/services/*.ts` → `client.ts` → `fetch()` 到 `http://localhost:10086`。

### 术语辨析

| 术语 | 不要混淆为 |
|---|---|
| **Bootstrap**（双世界入口） | CSS Bootstrap 框架 — YiPet 使用 Ant Design，不是 Bootstrap |
| **CDN Catalog** | 远程 CDN — 所有条目都是打包到扩展中的本地文件 |
| **Pet** | 聊天窗口 — Pet 是注入的 DOM 伴侣；聊天窗口是单独的 UI |
| **Role** | 用户账户角色 — 这里指宠物的职业外观 |
| **`filter`** | 不是 `query`；不是 Mongo 的 `$filter` 聚合阶段 |

---

## 配置

环境变量位于 `.env` 和 `.env.production`：

| 变量 | 默认值 | 用途 |
|---|---|---|
| `RSBUILD_API_BASE` | `http://localhost:10086` | YiAi FastAPI 后端 URL |
| `RSBUILD_LOG_LEVEL` | `info` | 开发模式日志详细程度 |

用户偏好持久化在 `chrome.storage.local`：

| 键 | 类型 | 用途 |
|---|---|---|
| `locale` | `'en' \| 'zh_CN' \| null` | 覆盖 Chrome UI 语言 |
| `timezone` | `string \| null` | 覆盖系统时区 |
| `petVisible` | `boolean` | 显示/隐藏宠物 |
| `petSize` | `number` | 宠物显示大小 |
| `petRole` | `Role` | 活动角色 |
| `petTheme` | `string` | 活动颜色主题 |

---

## 近期变更

### 2026-07-28 — Bug 修复（API 层）

- **`src/api/services/sessions.ts`**：`SessionService.list()` 和 `SessionService.get(id)` 在 RPC 参数中发送了 `query: {...}`，但 YiAi 的 `query_documents` 只识别 `filter`。两者现在都发送 `filter: {...}`。没有此修复，list/get 会静默返回所有会话或空。
- **`src/api/types.ts`**：`QueryParams.query?: Record<string, unknown>` 重命名为 `QueryParams.filter?: Record<string, unknown>`，并添加了说明后端合并契约的文档注释。

### 2026-07-27 — 聊天框移植

- 将 YiPett 的快捷键 + 聊天框移植到扩展中。`Esc` 关闭聊天，`Ctrl+Shift+X` 切换，角色系统提示词已连接，对话持久化。YiPett 的完整功能集不在范围内。

### 2026-07-28 — 技术栈迁移

- React 15 + Bootstrap → **React 18.3 + Ant Design 5.21**。ESLint → **Biome 2.5**。文档已更新匹配。

### 2026-07-28 — 聊天开发模式 jsxDEV 不匹配

- 开发模式 React 插件 + 生产环境 `NODE_ENV` define 在运行时产生 `jsxDEV is not a function`。修复：聊天打包开发脚本现在运行 `--mode production`。

---

## 浏览器支持

- Chrome 114+（需要 Manifest V3）。
- Edge 114+（基于 Chromium，支持 MV3）。
- 其他 Chromium 浏览器 — 未经测试但应该可以工作。

> Firefox 使用不同的扩展模型 — YiPet 不支持 Firefox。