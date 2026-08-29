---
title: YiPet 项目知识库
aliases: [yipet-knowledge, yipet-project, chrome-extension]
tags: [yipet, chrome-extension, mv3, vue3, element-plus, rsbuild]
category: engineer/projects
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "YiPet Chrome 扩展的完整开发参考：快速开始、架构、双世界通信、API 层、组件、构建部署"
acceptance_criteria:
  - "新开发者可在 10 分钟内完成环境搭建并加载扩展"
  - "MV3 双执行上下文的边界清晰可查"
  - "API 四层架构和组件系统明确"
related:
  - ../../../../YiPet/CLAUDE.md
  - ../../../../YiPet/manifest.json
  - ../../../../YiPet/package.json
---

# YiPet — Chrome MV3 浏览器扩展

> **类型**: Chrome Extension | **框架**: Vue 3.5 + Element Plus 2.14 | **构建**: Rsbuild 1 | **测试**: Vitest 2

YiPet 是 YrY 微前端的**浏览器扩展**，以浮动宠物形象注入任意页面，提供多角色 AI 聊天、知识库浏览、Bug 报告、跨项目桥接等功能。

---

## 快速开始

```bash
cd YiPet

# 安装依赖
npm install

# 构建 (生产环境)
npm run build

# 开发模式 (watch)
npm run dev

# 类型检查
npm run typecheck

# 运行测试
npm test
```

**加载扩展**: 打开 Chrome → `chrome://extensions/` → 开启"开发者模式" → "加载已解压的扩展程序" → 选择 `dist/` 目录。

**前置条件**: Node.js >= 16.18.0，YiAi 后端需运行在 `http://localhost:10086`。

---

## 目录结构

```
YiPet/
├── manifest.json             # Chrome MV3 扩展清单
├── public/
│   ├── cdn/                  # CDN 资源 (vendor libs, styles, utils)
│   │   ├── utils/            # api-client.ts (基础 fetch 封装)
│   │   ├── styles/           # variables.css, chat.css
│   │   └── vendor/           # 第三方库 (本地化，MV3 CSP 合规)
│   └── _locales/             # i18n 消息文件 (en + zh_CN)
├── src/
│   ├── api/                  # 四层 API 架构
│   │   ├── client.ts         # 第 1 层: ApiClient 扩展封装
│   │   ├── endpoints.ts      # 第 2 层: 路径常量
│   │   ├── types.ts          # 第 3 层: 请求/响应类型
│   │   ├── index.ts          # createApiServices 工厂 + 类型导出
│   │   └── services/         # 第 4 层: 领域服务类
│   │       ├── auth.ts       # 认证服务
│   │       ├── chat.ts       # 聊天服务 (SSE 流式)
│   │       ├── sessions.ts   # 会话服务
│   │       ├── config.ts     # 配置服务
│   │       ├── database.ts   # 数据服务
│   │       ├── faq.ts        # FAQ 服务
│   │       ├── knowledge.ts  # 知识库服务
│   │       ├── rag.ts        # RAG 服务
│   │       ├── bug.ts        # Bug 报告服务
│   │       └── index.ts      # ApiServices 聚合接口
│   ├── background/           # Service Worker
│   │   └── index.ts          # 命令分发 + 消息路由
│   ├── chat/                 # 聊天窗口 (独立 Rsbuild entry)
│   │   ├── index.tsx         # 入口
│   │   ├── controller.ts     # 状态管理 + 流式聊天 + 所有操作
│   │   ├── types.ts          # ChatState 类型定义
│   │   └── components/       # 聊天 UI 组件
│   │       ├── ChatWindow/   # 主窗口 (拖拽/缩放/全屏)
│   │       ├── ChatInput/    # 输入框 (@mention, 文件预览, 发送)
│   │       ├── ChatMessages/ # 消息列表
│   │       ├── MessageBubble/ # 消息气泡 (操作按钮, token 芯片)
│   │       ├── ChatSidebar/  # 侧边栏 (会话/知识库/Stories/Bugs)
│   │       ├── ChatToolbar/  # 工具栏 (导出/分支/跨项目导航)
│   │       ├── ChatHeader/   # 头部 (角色头像 + 控制按钮)
│   │       ├── SessionStatusBar/ # 状态栏 (token/模型/阶段/sparkline)
│   │       ├── ContextScopeBar/ # 上下文范围条
│   │       ├── SearchBar/    # 搜索栏 (会话搜索 + 页面过滤)
│   │       ├── QuickButtons/  # 快捷按钮
│   │       ├── FileMentionDropdown/ # @文件提及下拉
│   │       ├── KnowledgePreviewDialog/ # 知识预览弹窗
│   │       ├── RagSourcesPreviewDialog/ # RAG 来源预览
│   │       ├── RagDecomposeDialog/ # 子问题分解
│   │       ├── SessionSummaryDialog/ # 会话摘要
│   │       ├── SessionEditDialog/ # 会话编辑
│   │       ├── BugReportDialog/ # Bug 报告
│   │       ├── SaveToKnowledgeDialog/ # 保存到知识库
│   │       └── PageContextEditor/ # 页面上下文编辑
│   ├── config/               # 配置
│   │   ├── defaults.ts       # 默认值 (角色/颜色/模型/皮肤)
│   │   └── config.ts         # 环境感知配置编排
│   ├── content/              # Content Script
│   │   ├── bootstrap.ts      # 双世界入口 (ISOLATED → MAIN)
│   │   ├── cdn/              # CDN 资源管理
│   │   │   ├── catalog.ts    # 资源清单 (单一事实来源)
│   │   │   └── injector.ts   # 资源注入器
│   │   ├── ipc/              # 跨世界通信
│   │   │   └── messages.ts   # 消息类型定义
│   │   ├── rendering/        # 宠物渲染
│   │   │   └── overlay.ts    # 浮动宠物 DOM
│   │   └── state/            # 内容脚本状态
│   ├── popup/                # 弹出窗口 (独立 Rsbuild entry)
│   │   ├── main.ts           # 入口
│   │   ├── popup.html        # HTML 模板
│   │   ├── App.tsx           # 根组件 (皮肤中心)
│   │   ├── data.ts           # 配置适配 (颜色/角色/模型)
│   │   ├── types.ts          # PopupState 类型
│   │   ├── components/       # Popup UI 组件
│   │   │   ├── AppHeader/    # 渐变色头部
│   │   │   ├── PetPreview/   # 宠物预览 (皮肤环)
│   │   │   ├── ColorPicker/  # 颜色选择器
│   │   │   ├── RolePicker/   # 角色选择器
│   │   │   ├── AppFooter/    # 底部提示
│   │   │   └── AboutCard/    # 关于信息
│   │   └── services/         # Chrome API 封装
│   │       ├── chrome.ts     # tabs/storage 操作
│   │       ├── connect.ts    # Content Script 通信
│   │       └── notify.ts     # 通知
│   ├── shared/               # 跨模块共享
│   │   ├── i18n/             # 国际化 (chrome.i18n)
│   │   ├── theme/            # 主题系统
│   │   ├── roles.ts          # 角色定义
│   │   ├── state.ts          # Chrome Storage 封装
│   │   ├── env.ts            # 环境检测
│   │   └── log.ts            # 开发日志
│   ├── types/                # React CDN 全局类型
│   └── utils/                # 工具函数 (datetime, env, log)
├── rsbuild.config.ts         # 主构建配置 (popup + background)
├── rsbuild.config.chat.ts    # 聊天窗口构建配置
├── rsbuild.config.cdn.ts     # CDN 资源构建配置
├── rsbuild.config.bootstrap.ts # Bootstrap 构建配置
├── vitest.config.ts          # 测试配置
├── tsconfig.json             # TypeScript 配置
└── package.json
```

---

## 扩展架构

### MV3 双执行上下文

```
┌─────────────────────────────────────────────────────┐
│  ISOLATED World (Content Script)                     │
│  ├── chrome.runtime API 可用                         │
│  ├── chrome.storage API 可用                         │
│  ├── 通过 CustomEvent 与 MAIN World 通信             │
│  └── src/content/bootstrap.ts (第一阶段)              │
├─────────────────────────────────────────────────────┤
│  MAIN World (Page Context)                           │
│  ├── 页面 DOM 访问                                   │
│  ├── window 全局变量                                 │
│  ├── chrome.runtime API 不可用                       │
│  └── src/content/bootstrap.ts (第二阶段)              │
└─────────────────────────────────────────────────────┘
```

### 多入口构建

| 入口 | 配置文件 | 输出 | 运行环境 |
|------|----------|------|----------|
| popup | `rsbuild.config.ts` | `dist/popup.html` + `dist/assets/popup.js` | 扩展弹窗 |
| background | `rsbuild.config.ts` | `dist/assets/background.js` | Service Worker |
| chat | `rsbuild.config.chat.ts` | `dist/assets/chat.js` | MAIN World 注入 |
| cdn | `rsbuild.config.cdn.ts` | `dist/cdn/` | 按需注入 |
| bootstrap | `rsbuild.config.bootstrap.ts` | `dist/assets/bootstrap.js` | Content Script |

### 扩展权限 (`manifest.json`)

| 权限 | 用途 |
|------|------|
| `storage` | 扩展状态持久化 |
| `tabs` | 标签页操作 |
| `scripting` | 动态脚本注入 |
| `webRequest` | 网络请求拦截 |
| `<all_urls>` | 所有页面注入 |

### 键盘快捷键

| 快捷键 | 命令 | 说明 |
|--------|------|------|
| `Ctrl+Shift+P` / `Cmd+Shift+P` | `toggle-pet` | 切换宠物显隐 |
| `Ctrl+Shift+X` / `Cmd+Shift+X` | `open-chat` | 打开聊天窗口 |

---

## 权限管理 (Chrome Permissions)

### CSP 合规

MV3 禁止远程代码执行，所有资源本地化：

- Vendor libs 存放在 `public/cdn/vendor/`
- 所有资源通过 `chrome-extension://` URL 加载
- 无 `eval`、无内联脚本
- `web_accessible_resources` 白名单声明可访问资源

### 存储权限

- `chrome.storage.local` — 扩展状态 (会话、配置、皮肤)
- `chrome.storage.sync` — 跨设备同步 (可选)

---

## 网络请求 (API 层)

### 四层 API 架构

```
第 4 层: services/*.ts     → 领域服务类 (AuthService, ChatService, ...)
第 3 层: types.ts           → 请求/响应接口定义
第 2 层: endpoints.ts       → 路径常量
第 1 层: client.ts          → ApiClient (fetch + retry + SSE)
```

### ApiClient (`src/api/client.ts`)

| 特性 | 说明 |
|------|------|
| 基座 | `public/cdn/utils/api-client.ts` (fetch + retry + 错误提取) |
| 扩展 | 日志注入、SSE 流支持、YiAi 信封解包 |
| RPC | `client.rpc(moduleName, methodName, parameters)` |
| 流式 | `client.stream(path, body, signal)` → AsyncGenerator |
| 超时 | 流式请求 10 分钟超时 |

### 领域服务

| 服务 | 文件 | 说明 |
|------|------|------|
| AuthService | `services/auth.ts` | 认证 |
| ChatService | `services/chat.ts` | AI 聊天 (SSE 流式) |
| SessionService | `services/sessions.ts` | 会话 CRUD |
| ConfigService | `services/config.ts` | 配置管理 |
| DatabaseService | `services/database.ts` | 数据 CRUD |
| FaqService | `services/faq.ts` | FAQ 管理 |
| KnowledgeService | `services/knowledge.ts` | 知识库扫描/读取/写入 |
| RagService | `services/rag.ts` | RAG 检索/聊天/分解 |
| BugService | `services/bug.ts` | Bug 报告/列表 |

### 关键参数约定

| 正确 | 错误 | 说明 |
|------|------|------|
| `filter` | `query` | SessionService.list/get 的过滤参数 |
| `target_file` | `path` | 文件读写接口 |

---

## 构建部署

### 构建流程

```bash
# 完整构建
npm run build
  → npm run build:cdn        # CDN 资源
  → rsbuild build            # popup + background
  → npm run build:chat       # 聊天窗口
  → npm run build:bootstrap  # Content Script

# 开发模式
npm run dev
  → build:cdn (一次性)
  → rsbuild build --watch (popup + background)
  → rsbuild build --watch --config rsbuild.config.chat.ts (聊天窗口)
  → rsbuild build --watch --config rsbuild.config.bootstrap.ts (bootstrap)
```

### 构建特性

| 特性 | 说明 |
|------|------|
| 文件名哈希 | 禁用 (MV3 manifest 引用固定文件名) |
| 代码分割 | 禁用 (Service Worker 需要单文件) |
| 自动导入 | Element Plus 组件 + Vue API |
| 构建元数据 | 自动生成 `dist/build-meta.json` |
| Manifest 复制 | 自动复制 `manifest.json` 到 `dist/` |
| background.html 清理 | 自动删除 (MV3 SW 是 JS-only) |

### 构建产物

```
dist/
├── manifest.json            # 扩展清单
├── build-meta.json          # 构建元数据
├── popup.html               # 弹窗页面
├── assets/
│   ├── popup.js             # 弹窗脚本
│   ├── background.js        # Service Worker
│   ├── chat.js              # 聊天窗口 (注入 MAIN World)
│   └── bootstrap.js         # Content Script (双世界入口)
├── cdn/                     # CDN 资源
│   ├── utils/               # api-client.js
│   ├── styles/              # variables.css, chat.css
│   └── vendor/              # 第三方库
└── _locales/                # i18n 消息
```

---

## 项目规范

### 编码规范

| 领域 | 标准 |
|------|------|
| 组件风格 | Vue 3 SFC `<script setup lang="ts">` + Composition API |
| 状态管理 | `useSyncExternalStore` (ChatController) |
| 样式 | 组件同目录 CSS，`buildChatCSS()` 拼接 |
| UI 组件 | Element Plus 2.14 |
| 路径导入 | `@/` 别名跨模块，相对路径同目录 |
| i18n | `chrome.i18n` API，`t('key')` 函数 |
| 时间 | UTC 存储，`Intl.DateTimeFormat` 展示 |

### 代码质量工具链

| 工具 | 用途 |
|------|------|
| TypeScript 5.5 | 类型检查 (strict mode) |
| Vitest 2 | 单元测试 (97 tests) |
| Biome 2.5 | Lint + Format |

### 自约束

- **API 层四层架构** — 不允许跨层调用
- **组件 CSS 同目录** — 不集中管理样式
- **`filter` 不是 `query`** — 调用 `data_service.query_documents` 时必须用 `filter`
- **MV3 CSP 合规** — 无远程代码、无 eval、无内联脚本
- **双世界边界** — `chrome.runtime.*` 仅在 ISOLATED 可用

---

## 组件分析

### ChatController — 核心状态管理

`src/chat/controller.ts` 是聊天窗口的**唯一状态管理中心**，通过 `useSyncExternalStore` 暴露给 React 组件。

核心操作：
- `sendMessage(text)` — 发送消息 (路由到 Chat/RAG/Agent)
- `regenerateMessageAt(timestamp)` — 重新生成
- `resendMessageAt(timestamp)` — 重新发送
- `branchFromMessage(timestamp)` — 从消息分支
- `exportCurrentSessionMarkdown()` — 导出 Markdown
- `summarizeCurrentSession()` — 摘要会话
- `autoGenerateSessionTitle()` — 自动生成标题
- `openMessageInYiVad(timestamp)` — 桥接到 YiVad
- `discussInYiVadAiChat()` — 讨论当前页面
- `createSessionFromKnowledgeFile(path)` — 从知识文件创建会话
- `insertSelectionAsInput()` — 插入选中文本
- `previewRagSources(question)` — 预览 RAG 来源
- `decomposeRagQuestion(question)` — 子问题分解
- `openBugReport()` / `confirmBugReport()` — Bug 报告
- `openSaveToKnowledge(timestamp)` — 保存到知识库

### 聊天窗口组件

| 组件 | 用途 |
|------|------|
| ChatWindow | 主窗口容器 (拖拽、缩放、全屏、drop target) |
| ChatInput | 输入框 (@mention、文件预览、prompt 历史) |
| ChatMessages | 消息列表 (滚动、自动滚动) |
| MessageBubble | 消息气泡 (操作按钮、token 芯片、来源列表) |
| ChatSidebar | 侧边栏 (会话/知识/Stories/Bugs 四个标签) |
| ChatToolbar | 工具栏 (导出/分支/摘要/跨项目导航) |
| SessionStatusBar | 状态栏 (模型/消息数/token/阶段/sparkline) |
| ContextScopeBar | 上下文范围条 (RAG scope + 页面上下文) |

### Popup 组件

| 组件 | 用途 |
|------|------|
| AppHeader | 渐变色头部 (图标 + 标题 + 状态指示) |
| PetPreview | 宠物预览 (角色图片 + 皮肤环 + 浮动动画) |
| ColorPicker | 6 色皮肤选择器 |
| RolePicker | 2 列角色卡片选择器 |

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│  Popup (Vue 3 + Element Plus)                           │
│  皮肤中心: 角色/颜色/模型选择 → chrome.storage           │
├─────────────────────────────────────────────────────────┤
│  Background Service Worker                              │
│  命令分发 + 消息路由                                     │
├─────────────────────────────────────────────────────────┤
│  Content Script (ISOLATED World)                        │
│  bootstrap.ts → 消息转发 → MAIN World                   │
├─────────────────────────────────────────────────────────┤
│  Chat Window (Vue 3, MAIN World 注入)                   │
│  ChatController → ApiClient → YiAi Backend              │
├─────────────────────────────────────────────────────────┤
│  Floating Pet (MAIN World DOM)                          │
│  overlay.ts → 皮肤环 + 角色图片 + 工具提示               │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
用户输入 (ChatInput)
  → ChatController.sendMessage()
    → 路由: grounded → RagService.streamChat()
            agent → AgentService.streamChat()
            normal → ChatService.streamWithCallback()
    → ApiClient.stream() → fetch POST YiAi
    → SSE 流式解析
    → ChatController 更新 state
    → useSyncExternalStore → React 重渲染
```

### 跨项目桥接

| 功能 | 方向 | 机制 |
|------|------|------|
| 讨论当前页面 | YiPet → YiVad | `window.open` + session seed |
| 讨论 Bug | YiPet → YiVad | 深度链接到 Bug 详情 |
| Bug 报告 | YiPet → YiVad + YiKnowledge | MongoDB + 知识库 |
| 保存到知识库 | YiPet → YiKnowledge | `KnowledgeService.write` |
| 知识文件拖拽 | YiPet 侧边栏 → 聊天 | `createSessionFromKnowledgeFile` |

### 降级策略

| 场景 | 处理 |
|------|------|
| YiAi 不可达 | API 客户端指数退避重试，返回类型化错误 |
| CDN 资源已加载 | 全局存在检查短路重复注入 |
| Chrome 存储配额超限 | 写入静默失败，dev 模式日志警告 |
| 语言消息缺失 | 回退到 `en` 源语言，再回退到 key 本身 |
| TS 严格模式违规 | `npm run typecheck` 阻止构建 |

---

## 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.5.40 | 前端框架 |
| element-plus | ^2.14.3 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.2 | 图标库 |
| @vueuse/core | ^14.3.0 | Vue 组合式工具集 |
| pinia | ^4.0.2 | 状态管理 |
| dayjs | ^1.11.21 | 日期处理 |
| marked | ^15.0.12 | Markdown 渲染 |
| @vue/devtools-api | ^8.1.5 | Vue DevTools |

---

## 构建依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| @rsbuild/core | ^1.0.0 | 构建工具 |
| @rsbuild/plugin-vue | ^1.0.0 | Vue SFC 编译 |
| @rsbuild/plugin-vue-jsx | ^1.0.0 | Vue JSX 支持 |
| @rsbuild/plugin-sass | ^1.0.0 | SCSS 编译 |
| typescript | ^6.0.3 | 类型检查 |
| vue-tsc | ^3.3.8 | Vue 类型检查 |
| unplugin-auto-import | ^21.0.0 | 自动导入 API |
| unplugin-vue-components | ^32.1.0 | 自动导入组件 |
| vitest | ^2.0.0 | 测试框架 |
| jsdom | ^29.1.1 | DOM 测试环境 |
| @types/chrome | ^0.0.270 | Chrome API 类型 |
| eslint | ^10.8.0 | 代码检查 |
| prettier | ^3.9.6 | 代码格式化 |
| stylelint | ^17.14.1 | 样式检查 |
| husky | ^9.1.7 | Git hooks |
| lint-staged | ^17.2.0 | 暂存文件检查 |
| @commitlint/cli | ^21.2.1 | 提交规范检查 |
| cz-git | ^1.13.1 | 交互式提交 |
| sass | ^1.102.0 | SCSS 编译器 |
| postcss | ^8.5.23 | CSS 后处理 |
| autoprefixer | ^10.5.4 | CSS 前缀 |

---

## 核心代码

### 入口文件

| 文件 | 说明 |
|------|------|
| `manifest.json` | MV3 扩展清单 |
| `src/popup/main.ts` | Popup 入口 |
| `src/background/index.ts` | Service Worker 入口 |
| `src/content/bootstrap.ts` | Content Script 双世界入口 |
| `src/chat/index.tsx` | 聊天窗口入口 |

### 关键模块

| 模块 | 路径 | 核心逻辑 |
|------|------|----------|
| ChatController | `src/chat/controller.ts` | 聊天窗口所有状态 + 操作 (~3000 行) |
| ChatState | `src/chat/types.ts` | 聊天窗口状态类型定义 |
| ApiClient | `src/api/client.ts` | fetch 封装 + SSE 流 + RPC + 信封解包 |
| CDN Catalog | `src/content/cdn/catalog.ts` | CDN 资源清单 (单一事实来源) |
| CDN Injector | `src/content/cdn/injector.ts` | 资源注入器 |
| Bootstrap | `src/content/bootstrap.ts` | 双世界注入 (ISOLATED → MAIN) |
| Pet Overlay | `src/content/rendering/overlay.ts` | 浮动宠物 DOM (皮肤环) |
| Popup App | `src/popup/App.tsx` | 皮肤中心根组件 |
| Popup Data | `src/popup/data.ts` | 颜色/角色/模型配置 |
| Config | `src/config/defaults.ts` | 默认配置值 |
| i18n | `src/shared/i18n/index.ts` | `t('key')` 国际化函数 |
| State | `src/shared/state.ts` | Chrome Storage 封装 |
| SessionService | `src/api/services/sessions.ts` | 会话 CRUD (filter 参数) |
| BugService | `src/api/services/bug.ts` | Bug 报告 + 列表 |