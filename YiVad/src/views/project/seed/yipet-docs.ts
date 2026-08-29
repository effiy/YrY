/**
 * Seed documentation pages for the YiPet project.
 */
import type { SeedPage } from "./yivad-docs";

export const yipetDocs: SeedPage[] = [
  {
    order: 1,
    tag: "getting-started",
    title: "快速开始",
    content: `# 快速开始

## 环境要求

- **Node.js** >= 16.18.0
- **Chrome** 浏览器 (MV3 支持)
- **YiAi 后端** 必须运行在 \`http://localhost:10086\`

## 安装与启动

\`\`\`bash
cd YiPet

# 安装依赖
npm install

# 构建
npm run build

# 开发模式 (watch)
npm run dev

# 类型检查
npm run typecheck

# 运行测试
npm test
\`\`\`

## 加载扩展

1. 打开 Chrome → \`chrome://extensions/\`
2. 开启"开发者模式"
3. "加载已解压的扩展程序" → 选择 \`dist/\` 目录

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 前端框架 |
| TypeScript | 5.5 | 类型系统 |
| Rsbuild | 1 | 构建工具 |
| Element Plus | 2.14 | UI 组件库 |
| Chrome MV3 | — | 扩展平台 |
| Vitest | 2 | 测试框架 |
| Biome | 2.5 | Lint + Format |
`
  },
  {
    order: 2,
    tag: "architecture",
    title: "目录结构",
    content: `# 目录结构

\`\`\`
YiPet/
├── manifest.json             # Chrome MV3 扩展清单
├── public/
│   ├── cdn/                  # CDN 资源 (vendor libs, styles, utils)
│   └── _locales/             # i18n 消息文件 (en + zh_CN)
├── src/
│   ├── api/                  # 四层 API 架构
│   │   ├── client.ts         # 第 1 层: ApiClient 扩展封装
│   │   ├── endpoints.ts      # 第 2 层: 路径常量
│   │   ├── types.ts          # 第 3 层: 请求/响应类型
│   │   ├── index.ts          # createApiServices 工厂
│   │   └── services/         # 第 4 层: 领域服务类
│   ├── background/           # Service Worker
│   ├── chat/                 # 聊天窗口 (独立 Rsbuild entry)
│   │   ├── index.tsx         # 入口
│   │   ├── controller.ts     # 状态管理 + 流式聊天
│   │   ├── types.ts          # ChatState 类型
│   │   └── components/       # 聊天 UI 组件 (20+)
│   ├── config/               # 配置 (defaults + config)
│   ├── content/              # Content Script
│   │   ├── bootstrap.ts      # 双世界入口 (ISOLATED → MAIN)
│   │   ├── cdn/              # CDN 资源管理
│   │   ├── ipc/              # 跨世界通信
│   │   ├── rendering/        # 宠物渲染 (overlay)
│   │   └── state/            # 内容脚本状态
│   ├── popup/                # 弹出窗口 (独立 Rsbuild entry)
│   │   ├── App.tsx           # 根组件 (皮肤中心)
│   │   ├── data.ts           # 配置适配
│   │   └── components/       # Popup UI 组件
│   ├── shared/               # 跨模块共享
│   │   ├── i18n/             # 国际化 (chrome.i18n)
│   │   ├── theme/            # 主题系统
│   │   └── state.ts          # Chrome Storage 封装
│   ├── types/                # React CDN 全局类型
│   └── utils/                # 工具函数
├── rsbuild.config.ts         # 主构建配置 (popup + background)
├── rsbuild.config.chat.ts    # 聊天窗口构建配置
├── rsbuild.config.cdn.ts     # CDN 资源构建配置
├── rsbuild.config.bootstrap.ts # Bootstrap 构建配置
└── vitest.config.ts          # 测试配置
\`\`\`
`
  },
  {
    order: 3,
    tag: "architecture",
    title: "扩展架构",
    content: `# 扩展架构

## MV3 双执行上下文

\`\`\`
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
\`\`\`

## 多入口构建

| 入口 | 配置文件 | 输出 | 运行环境 |
|------|----------|------|----------|
| popup | \`rsbuild.config.ts\` | \`dist/popup.html\` + \`popup.js\` | 扩展弹窗 |
| background | \`rsbuild.config.ts\` | \`dist/assets/background.js\` | Service Worker |
| chat | \`rsbuild.config.chat.ts\` | \`dist/assets/chat.js\` | MAIN World 注入 |
| cdn | \`rsbuild.config.cdn.ts\` | \`dist/cdn/\` | 按需注入 |
| bootstrap | \`rsbuild.config.bootstrap.ts\` | \`dist/assets/bootstrap.js\` | Content Script |

## 键盘快捷键

| 快捷键 | 命令 | 说明 |
|--------|------|------|
| \`Ctrl+Shift+P\` | \`toggle-pet\` | 切换宠物显隐 |
| \`Ctrl+Shift+X\` | \`open-chat\` | 打开聊天窗口 |
`
  },
  {
    order: 4,
    tag: "architecture",
    title: "权限管理",
    content: `# 权限管理 (Chrome Permissions)

## Manifest 权限

| 权限 | 用途 |
|------|------|
| \`storage\` | 扩展状态持久化 |
| \`tabs\` | 标签页操作 |
| \`scripting\` | 动态脚本注入 |
| \`webRequest\` | 网络请求拦截 |
| \`<all_urls>\` | 所有页面注入 |

## CSP 合规

MV3 禁止远程代码执行，所有资源本地化：

- Vendor libs 存放在 \`public/cdn/vendor/\`
- 所有资源通过 \`chrome-extension://\` URL 加载
- 无 \`eval\`、无内联脚本
- \`web_accessible_resources\` 白名单声明可访问资源

## 存储权限

- \`chrome.storage.local\` — 扩展状态 (会话、配置、皮肤)
- \`chrome.storage.sync\` — 跨设备同步 (可选)
`
  },
  {
    order: 5,
    tag: "architecture",
    title: "网络请求",
    content: `# 网络请求 (API 层)

## 四层 API 架构

\`\`\`
第 4 层: services/*.ts     → 领域服务类
第 3 层: types.ts           → 请求/响应接口
第 2 层: endpoints.ts       → 路径常量
第 1 层: client.ts          → ApiClient (fetch + retry + SSE)
\`\`\`

## ApiClient 特性

| 特性 | 说明 |
|------|------|
| 基座 | \`public/cdn/utils/api-client.ts\` |
| 扩展 | 日志注入、SSE 流、YiAi 信封解包 |
| RPC | \`client.rpc(moduleName, methodName, params)\` |
| 流式 | \`client.stream(path, body, signal)\` → AsyncGenerator |
| 超时 | 流式请求 10 分钟超时 |

## 领域服务

| 服务 | 说明 |
|------|------|
| AuthService | 认证 |
| ChatService | AI 聊天 (SSE 流式) |
| SessionService | 会话 CRUD |
| KnowledgeService | 知识库扫描/读取/写入 |
| RagService | RAG 检索/聊天/分解 |
| BugService | Bug 报告/列表 |

## 关键参数约定

| 正确 | 错误 | 说明 |
|------|------|------|
| \`filter\` | \`query\` | SessionService.list/get |
| \`target_file\` | \`path\` | 文件读写接口 |
`
  },
  {
    order: 6,
    tag: "deployment",
    title: "构建部署",
    content: `# 构建部署

## 构建流程

\`\`\`bash
npm run build
  → npm run build:cdn        # CDN 资源
  → rsbuild build            # popup + background
  → npm run build:chat       # 聊天窗口
  → npm run build:bootstrap  # Content Script
\`\`\`

## 构建特性

| 特性 | 说明 |
|------|------|
| 文件名哈希 | 禁用 (MV3 manifest 引用固定文件名) |
| 代码分割 | 禁用 (Service Worker 需要单文件) |
| 自动导入 | Element Plus 组件 + Vue API |
| 构建元数据 | 自动生成 \`dist/build-meta.json\` |
| Manifest 复制 | 自动复制 \`manifest.json\` 到 \`dist/\` |

## 构建产物

\`\`\`
dist/
├── manifest.json            # 扩展清单
├── build-meta.json          # 构建元数据
├── popup.html               # 弹窗页面
├── assets/
│   ├── popup.js             # 弹窗脚本
│   ├── background.js        # Service Worker
│   ├── chat.js              # 聊天窗口
│   └── bootstrap.js         # Content Script
├── cdn/                     # CDN 资源
└── _locales/                # i18n 消息
\`\`\`
`
  },
  {
    order: 7,
    tag: "conventions",
    title: "项目规范",
    content: `# 项目规范

## 编码规范

| 领域 | 标准 |
|------|------|
| 组件风格 | Vue 3 SFC \`<script setup lang="ts">\` |
| 状态管理 | \`useSyncExternalStore\` (ChatController) |
| 样式 | 组件同目录 CSS |
| UI 组件 | Element Plus 2.14 |
| 路径导入 | \`@/\` 别名跨模块 |
| i18n | \`chrome.i18n\` API，\`t('key')\` |
| 时间 | UTC 存储，\`Intl.DateTimeFormat\` 展示 |

## 代码质量

| 工具 | 用途 |
|------|------|
| TypeScript 5.5 | 类型检查 (strict) |
| Vitest 2 | 单元测试 (97 tests) |
| Biome 2.5 | Lint + Format |

## 自约束

- **API 层四层架构** — 不允许跨层调用
- **组件 CSS 同目录** — 不集中管理
- **\`filter\` 不是 \`query\`** — 必须用 \`filter\`
- **MV3 CSP 合规** — 无远程代码、无 eval
- **双世界边界** — \`chrome.runtime.*\` 仅在 ISOLATED 可用
`
  },
  {
    order: 8,
    tag: "architecture",
    title: "组件分析",
    content: `# 组件分析

## ChatController — 核心状态管理

\`src/chat/controller.ts\` 是聊天窗口的**唯一状态管理中心** (~3000 行)。

核心操作：
- \`sendMessage(text)\` — 发送消息 (Chat/RAG/Agent)
- \`regenerateMessageAt(ts)\` — 重新生成
- \`branchFromMessage(ts)\` — 从消息分支
- \`exportCurrentSessionMarkdown()\` — 导出 Markdown
- \`summarizeCurrentSession()\` — 摘要会话
- \`openMessageInYiVad(ts)\` — 桥接到 YiVad
- \`discussInYiVadAiChat()\` — 讨论当前页面
- \`previewRagSources(q)\` — 预览 RAG 来源
- \`decomposeRagQuestion(q)\` — 子问题分解
- \`openBugReport()\` / \`confirmBugReport()\` — Bug 报告

## 聊天窗口组件

| 组件 | 用途 |
|------|------|
| ChatWindow | 主窗口容器 (拖拽、缩放、全屏) |
| ChatInput | 输入框 (@mention, prompt 历史) |
| ChatMessages | 消息列表 |
| MessageBubble | 消息气泡 (操作按钮、token 芯片) |
| ChatSidebar | 侧边栏 (会话/知识/Stories/Bugs) |
| ChatToolbar | 工具栏 (导出/分支/跨项目) |
| SessionStatusBar | 状态栏 (token/模型/sparkline) |
| ContextScopeBar | 上下文范围条 |

## Popup 组件

| 组件 | 用途 |
|------|------|
| AppHeader | 渐变色头部 |
| PetPreview | 宠物预览 (皮肤环) |
| ColorPicker | 6 色皮肤选择器 |
| RolePicker | 2 列角色卡片 |
`
  },
  {
    order: 9,
    tag: "architecture",
    title: "架构设计",
    content: `# 架构设计

## 整体架构

\`\`\`
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
\`\`\`

## 跨项目桥接

| 功能 | 方向 | 机制 |
|------|------|------|
| 讨论当前页面 | YiPet → YiVad | \`window.open\` + session seed |
| 讨论 Bug | YiPet → YiVad | 深度链接到 Bug 详情 |
| Bug 报告 | YiPet → YiVad + YiKnowledge | MongoDB + 知识库 |
| 保存到知识库 | YiPet → YiKnowledge | KnowledgeService.write |

## 降级策略

| 场景 | 处理 |
|------|------|
| YiAi 不可达 | API 客户端指数退避重试 |
| CDN 资源已加载 | 全局存在检查短路 |
| 存储配额超限 | 写入静默失败 |
| 语言消息缺失 | 回退 en → key |
`
  },
  {
    order: 10,
    tag: "dependencies",
    title: "开发依赖",
    content: `# 开发依赖

## 运行时依赖

| 包 | 版本 | 用途 |
|----|------|------|
| vue | ^3.5.40 | 前端框架 |
| element-plus | ^2.14.3 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.2 | 图标库 |
| @vueuse/core | ^14.3.0 | Vue 组合式工具 |
| pinia | ^4.0.2 | 状态管理 |
| dayjs | ^1.11.21 | 日期处理 |
| marked | ^15.0.12 | Markdown 渲染 |

## 构建工具

| 包 | 版本 | 用途 |
|----|------|------|
| @rsbuild/core | ^1.0.0 | 构建引擎 |
| @rsbuild/plugin-vue | ^1.0.0 | Vue SFC 编译 |
| @rsbuild/plugin-vue-jsx | ^1.0.0 | JSX/TSX 支持 |
| @rsbuild/plugin-sass | ^1.0.0 | SCSS 预处理 |
| typescript | ^6.0.3 | TypeScript 编译器 |
| vue-tsc | ^3.3.8 | Vue 类型检查 |
| vitest | ^2.0.0 | 测试框架 |
| jsdom | ^29.1.1 | DOM 测试环境 |
| @types/chrome | ^0.0.270 | Chrome API 类型 |

## 代码质量

| 包 | 版本 | 用途 |
|----|------|------|
| eslint | ^10.8.0 | 代码检查 |
| prettier | ^3.9.6 | 代码格式化 |
| stylelint | ^17.14.1 | 样式检查 |
| husky | ^9.1.7 | Git hooks |
| @commitlint/cli | ^21.2.1 | 提交规范检查 |
`
  },
  {
    order: 11,
    tag: "core-code",
    title: "核心代码",
    content: `# 核心代码

## 入口文件

| 文件 | 说明 |
|------|------|
| \`manifest.json\` | MV3 扩展清单 |
| \`src/popup/main.ts\` | Popup 入口 |
| \`src/background/index.ts\` | Service Worker 入口 |
| \`src/content/bootstrap.ts\` | Content Script 双世界入口 |
| \`src/chat/index.tsx\` | 聊天窗口入口 |

## 关键模块

| 模块 | 路径 | 核心逻辑 |
|------|------|----------|
| ChatController | \`src/chat/controller.ts\` | 聊天窗口所有状态 + 操作 |
| ChatState | \`src/chat/types.ts\` | 聊天窗口状态类型 |
| ApiClient | \`src/api/client.ts\` | fetch + SSE + RPC + 信封解包 |
| CDN Catalog | \`src/content/cdn/catalog.ts\` | CDN 资源清单 |
| CDN Injector | \`src/content/cdn/injector.ts\` | 资源注入器 |
| Bootstrap | \`src/content/bootstrap.ts\` | 双世界注入 |
| Pet Overlay | \`src/content/rendering/overlay.ts\` | 浮动宠物 DOM |
| Popup App | \`src/popup/App.tsx\` | 皮肤中心根组件 |
| i18n | \`src/shared/i18n/index.ts\` | \`t('key')\` 国际化 |
| State | \`src/shared/state.ts\` | Chrome Storage 封装 |
| SessionService | \`src/api/services/sessions.ts\` | 会话 CRUD |
| BugService | \`src/api/services/bug.ts\` | Bug 报告 + 列表 |
`
  }
];