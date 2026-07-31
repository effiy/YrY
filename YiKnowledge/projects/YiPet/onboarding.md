---
title: YiPet 新人引导
tags: [新人, 引导, 浏览器扩展, Chrome MV3, React, TypeScript, YiPet]
category: projects/YiPet
created: 2026-07-31
updated: 2026-07-31
source: internal
type: onboarding
status: stable
---

# YiPet 新人引导

> Chrome MV3 浏览器扩展。在任意网页注入宠物伴侣 + 多角色 AI 聊天，React 18 + Ant Design 5。

## 1. 项目定位

YiPet 是 Yi 家族的浏览器扩展，提供「在任意网页注入宠物形象 + 多角色 AI 聊天窗」的能力。三层架构：内容脚本（ISOLATED + MAIN 双世界）、Popup 控制面板、Chat 窗（独立 Rsbuild 入口）。技术栈：React 18.3 + Ant Design 5.21 + Rsbuild 1 + TypeScript 5.5 + Biome 2.5。后端走 YiAi `http://localhost:10086`。

## 2. 首日 setup（30 分钟跑通）

### 前置依赖

- Node.js 18+ / npm
- YiAi 后端在 `http://localhost:10086` 跑着
- Chrome 114+

### 步骤

```bash
# 1. 克隆（如已在 YrY 仓库内可跳过）
cd /path/to/YrY/YiPet

# 2. 装依赖
npm install

# 3. 构建（首次必须 full build，因为 popup/chat/bootstrap/cdn 是四个独立 bundle）
npm run build

# 4. 开 dev watch（推荐日常开发：改源码自动重打包）
npm run dev
# 这会启动 3 个 watch 进程：popup / chat / bootstrap，产物在 dist/

# 5. 加载扩展
# 5a. 打开 chrome://extensions
# 5b. 右上角开 Developer mode
# 5c. 点 Load unpacked → 选 YiPet/dist/
# 5d. 任意网页点工具栏 YiPet 图标 → 弹出 popup

# 6. 类型检查（可选）
npm run typecheck   # tsc --noEmit
```

### 验证清单

- [ ] `chrome://extensions` 看到 YiPet 卡片，状态 Enabled
- [ ] 任意网页点工具栏图标，弹出 React popup（看到角色切换 / 主题色等）
- [ ] `Ctrl+Shift+X`（macOS `⌘+Shift+X`）打开聊天窗
- [ ] 聊天窗输入一句话，能看到 SSE 流式返回（依赖 YiAi + Ollama 在跑）
- [ ] DevTools Console（页面上下文）输入 `YiPet.help()` 有输出
- [ ] `npm run typecheck` 退出 0

## 3. 三个高频 workflow

### Workflow A：加一个聊天窗 UI 组件

例：在聊天窗加一个「清空会话」按钮。

1. 在 `src/chat/components/ClearButton/` 下建 `ClearButton.tsx` + `ClearButton.css`（co-located）
2. `ClearButton.tsx`：React function component，调 `useChatController` 拿 dispatch
3. 在父组件里挂载（如 `ChatWindow.tsx`）
4. CSS 在父组件 import 时会被 `buildChatCSS()` 合并到 `dist/cdn/styles/chat.css`
5. 改完不用刷新扩展 —— dev watch 会重打包，但扩展需在 `chrome://extensions` 点 reload

### Workflow B：加一个 popup 组件 + 接 chrome API

例：加一个「导出会话」按钮。

1. `src/popup/components/ExportButton/ExportButton.tsx` + `.css`
2. 用 `src/popup/services/chrome.ts` 封装的 `chrome.storage` / `chrome.tabs` API
3. 通过 `chrome.tabs.sendMessage` 通知 content script，由 content script 转发到 MAIN 世界（如需要页内执行）
4. i18n 字符串加到 `public/_locales/en/messages.json` + `zh_CN/messages.json`，组件里用 `t('exportButtonLabel')`

### Workflow C：加一个 API service

例：调 YiAi 新接口 `/foo`。

1. `src/api/endpoints.ts` 加 `FOO = "/foo"`
2. `src/api/types.ts` 定义 `FooRequest` / `FooResponse` interface
3. `src/api/services/foo.ts` 写 `FooService` class，构造函数收 `ApiClient`
4. `src/api/services/index.ts` 的 `createApiServices` 里实例化并 export
5. 调用方 import `api.foo.xxx(...)`，不要直接 `fetch`（铁律）

## 4. 新人坑速查

| 现象 | 原因 | 解决 |
|---|---|---|
| `SessionService.list()` 返回全部 / 空 | RPC 参数用了 `query` | 改成 `filter`（铁律，已修但易回退） |
| 聊天窗运行时报 `jsxDEV is not a function` | dev 模式 React 插件 + 生产 `NODE_ENV` define 冲突 | chat bundle dev 脚本必须 `--mode production`（已修，看 `package.json:scripts.dev`） |
| 在 MAIN 世界代码里调 `chrome.runtime.*` | MV3 限制：chrome API 只在 ISOLATED 可用 | 跨世界通信用 `CustomEvent` + `window.dispatchEvent` |
| `Cannot find module '@/xxx'` | 路径别名 | 用 `@/` 别名（指向 `src/`），不要用 `../../../` |
| 扩展改了不生效 | dist/ 没更新 / 扩展没 reload | `chrome://extensions` 点 YiPet 卡片的 reload 图标 |
| `chrome.i18n` 取不到 key | `messages.json` 没加 / key 拼错 | 看 `public/_locales/en/messages.json`，`MessageKey` 类型联合要同步 |
| 双重加载 CDN 库 | 全局存在性检查失效 | 看 `src/content/cdn/injector.ts`，确认 global-existence check |
| `npm run build` 后 popup 空白 | popup 入口 HTML 路径错 | 看 `rsbuild.config.ts` 的 `source.entry` |

## 5. 接下来读什么

| 文档 | 看什么 |
|---|---|
| `YiPet/CLAUDE.md`（仓库根） | 模块边界、跨项目协议、铁律 |
| `YiKnowledge/projects/YiPet/engineering/readme.md` | 架构图、数据流、命令流、目录结构 |
| `YiPet/manifest.json` | MV3 manifest — 权限、content_scripts、commands |
| `YiPet/src/content/bootstrap.ts` | 双世界自注入逻辑（核心难点） |
| `YiPet/src/api/` | 四层 API 架构（client → endpoints → types → services） |
| `YiPet/src/chat/controller.ts` | 聊天状态机 + SSE + per-message actions |
| `YiPet/biome.json` | Biome 配置（替代 ESLint + Prettier） |

## 6. Day-1 任务清单

- [ ] `npm install` + `npm run build` 跑通，`dist/` 生成
- [ ] `chrome://extensions` Load unpacked → 选中 `YiPet/dist/`
- [ ] 任意网页点工具栏图标看到 popup，`Ctrl+Shift+X` 开聊天
- [ ] `npm run typecheck` 退出 0
- [ ] 读完 `YiPet/CLAUDE.md` 的 Module Boundaries + Dual Execution Context
- [ ] 在 `src/popup/components/` 下加一个 `HelloBox` 组件（静态文字），popup 显示，提交 PR
- [ ] 在 DevTools 跑一次 `YiPet.help()` 和 `YiPet.list()`
- [ ] 找同事做一次 30 分钟走读

## 7. 负责人 / 联系人

| 角色 | 名字 | 联系方式 |
|---|---|---|
| 项目主负责人 | TBD | TBD |
| MV3 / 内容脚本 | TBD | TBD |
| Popup / Chat UI | TBD | TBD |
| API 层 | TBD | TBD |
| Code review | TBD | TBD |

> 占位字段，请项目主负责人填入后删除本行。

## 8. 常见报错速查表

| 报错信息 | 原因 | 解决 |
|---|---|---|
| `Module not found: 'react'` | npm install 没跑 / lockfile 损坏 | 删 `node_modules` + `package-lock.json`，重装 |
| `jsxDEV is not a function` | dev React 插件 + 生产 NODE_ENV | chat bundle dev 脚本 `--mode production` |
| `chrome.runtime is undefined` 在 MAIN 世界 | 跨世界限制 | chrome API 只在 ISOLATED 用；MAIN 走 CustomEvent |
| `Cannot read properties of undefined (reading 'locale')` | i18n 未初始化 | 看 `src/shared/i18n/index.ts`，确认 `t()` 在 mount 后调 |
| `Uncaught (in promise) TypeError: api.chat.stream` | ApiClient 未注入 | 看 `createApiServices(config)`，确认 ChatService 实例化 |
| CSP 违规 `script-src 'self'` | 引了远程 CDN / 内联 script | MV3 禁止远程代码；vendor 全部本地 `public/cdn/vendor/` |
| `Extension manifest v2 is deprecated` | 用了 MV2 manifest | YiPet 是 MV3；别误装老版本 |
| `chrome.tabs.sendMessage` 没响应 | content script 没注入 / ISOLATED 监听没起 | 看 `manifest.json:content_scripts`；DevTools 看 console |

---

有疑问先看 §4 和 §8；找不到答案再问 §7 里的对应负责人。
