---
title: YiPet Onboarding — Day 1 Quick Start
tags: [onboarding, yipet, setup, quick-start]
category: engineer/run/onboarding
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "New YiPet engineers set up their dev environment and understand the Chrome extension architecture within the first day"
acceptance_criteria:
  - "Setup steps verified working"
  - "Key architectural concepts explained (dual-world, CDN, four-tier API)"
  - "Common gotchas documented"
  - "Day-1 task checklist included"
related:
  - ./README.md
  - ./03-入职-YiVad入职.md
  - ./01-入职-YiAi入职.md
  - ../../../../YiPet/CLAUDE.md
  - ../../learn/projects/yipet/README.md
---

# YiPet 入职指南 —— 第一天快速上手

> **目标**：在第一天结束时，你能够构建并加载 YiPet 到 Chrome、理解双世界架构、追踪从 Popup 到宠物浮动图标的完整消息流。

## 前置条件

- Node.js 18+ 和 npm（推荐使用 nvm 管理版本）
- Chrome 114+（支持 Manifest V3）
- YiAi 后端需运行在 `http://localhost:10086`（参见 [YiAi 入职指南](./01-入职-YiAi入职.md)）

## 环境搭建（预计 30 分钟）

```bash
cd YiPet

# 安装依赖
npm install

# 完整构建（多入口：popup + chat + CDN + bootstrap）
npm run build

# 类型检查
npm run typecheck    # tsc --noEmit

# 运行测试（97 个测试）
npm test             # Vitest 2 + jsdom
```

### 加载扩展到 Chrome

1. 打开 Chrome，地址栏输入 `chrome://extensions`
2. 开启右上角**开发者模式**
3. 点击**加载已解压的扩展程序**
4. 选择 `YiPet/dist/` 目录
5. 打开任意网页——宠物浮动图标应该出现在页面右下角

### 验证环境是否正常

| 验证项 | 操作 | 预期结果 |
|---|---|---|
| 宠物可见 | 打开任意网页 | 页面右下角出现浮动宠物图标 |
| 聊天窗口 | 按 `Ctrl+Shift+X`（Mac: `Cmd+Shift+X`） | 聊天窗口弹出 |
| 宠物显隐切换 | 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`） | 宠物图标切换显示/隐藏 |
| 构建通过 | `npm run build` | 无错误退出 |
| 类型检查通过 | `npm run typecheck` | 0 错误 |
| 测试通过 | `npm test` | 97 个测试全部通过 |

### 常见启动问题排查

| 问题 | 原因 | 解决方案 |
|---|---|---|
| 扩展加载后页面没有宠物 | `npm run build` 失败或 dist 目录不完整 | 重新运行 `npm run build`，确认 dist/ 目录存在所有产出 |
| 聊天窗口无法打开 | YiAi 后端未运行 | 确保 YiAi 运行在 `http://localhost:10086` |
| 聊天窗口报 `jsxDEV is not a function` | 聊天窗口使用开发模式 JSX 编译器 | 确认 `dev:chat` 脚本带有 `--mode production`（参见 [gotcha 文档](../../learn/lessons/gotchas/04-陷阱-YiPet-jsxDEV生产模式.md)） |
| `npm run typecheck` 报错 | TypeScript 类型不匹配 | 检查代码变更是否引入了类型错误。注意 Rsbuild 构建会**静默剥离类型**——typecheck 是唯一的检查手段 |
| 会话列表为空或异常 | RPC 参数使用了 `query` 而非 `filter` | 检查 API 调用中 SessionService 的参数键名是否为 `filter`（参见 [RPC 参数名不匹配](../../learn/lessons/gotchas/02-陷阱-RPC参数名不匹配.md)） |
| CDN 资源加载失败 | Vendor 库未在 catalog 中注册 | 检查 `src/content/cdn/catalog.ts` 是否包含该资源的条目 |

## 架构概览

先阅读项目 [YiPet/CLAUDE.md](../../../../YiPet/CLAUDE.md)。以下是关键概念：

| 概念 | 是什么 | 在哪里 |
|---|---|---|
| 双世界边界 | ISOLATED（`chrome.runtime.*` API 可用）+ MAIN（页面 JS 上下文） | `src/content/bootstrap.ts` |
| 四层 API | client（fetch 封装）→ endpoints（路径常量）→ types（类型定义）→ services（领域服务） | `src/api/` |
| CDN 目录 | 80+ 本地 vendor 库，MV3 CSP 合规（`script-src 'self'`） | `src/content/cdn/catalog.ts` |
| Chat Store | Pinia Store（状态管理 + 所有聊天操作） | `src/chat/stores/chat.ts` |
| 多入口构建 | 4 个 Rsbuild 配置（popup、chat、CDN、bootstrap） | `rsbuild.config.*.ts` |
| 跨项目桥接 | 种子化 YiVad 会话、上报 Bug 到 MongoDB | `src/chat/stores/chat.ts` |

### 消息追踪：从输入到渲染

```
用户在聊天窗口输入消息
  → chatStore.sendMessage(text)
  → api.chat.stream({messages, model, stream: true})
  → fetch POST / body: {module_name: "services.ai.chat_service", method_name: "chat", ...}
  → YiAi FastAPI → Ollama → SSE text/event-stream
  → ApiClient 解析 SSE 帧 → onChunk(text) 增量回调
  → Pinia Store 追加 delta 文本 → Vue 响应式重新渲染

Popup 到 Content Script 的通信:
  Popup (Vue 3) → chrome.tabs.sendMessage({type, payload})
  → Content Script (ISOLATED World) → CustomEvent
  → Bootstrap (MAIN World) → 修改宠物 DOM
```

## 关键陷阱

1. **`chrome.runtime.*` 只在 ISOLATED World 可用** —— 在 MAIN World 代码中调用 Chrome API 会**静默失败**。所有 Chrome API 调用必须留在 ISOLATED World。在调试时注意 DevTools 的上下文切换（Content Script 上下文 vs top 上下文）。
2. **聊天窗口构建必须带 `--mode production`** —— 开发模式下的 Vue 插件 + 生产环境 NODE_ENV define = 构建不兼容。聊天窗口的 dev 脚本已处理此问题。如需创建新入口，确保使用相同的 `--mode production`。
3. **`filter` 不是 `query`** —— 与 YiVad 相同的 RPC 参数名契约。后端静默忽略 `query`。在 SessionService 和所有 data_service 调用中检查参数键名。
4. **CDN 目录是负载承重的——单一事实来源** —— 新增依赖不仅要 `npm install`，还要在 `src/content/cdn/catalog.ts` 的 `CDN_CATALOG` 中添加条目并实现全局存在检查函数。缺少任一项都会导致依赖不被加载或重复加载。
5. **组件 CSS 同目录** —— 组件的 CSS 文件与组件放在同一目录。`buildChatCSS()` 函数在构建时将每个组件的 CSS 拼接为 `dist/cdn/styles/chat.css`。

## 第一天任务清单

- [ ] 运行 `npm run build` 并在 Chrome 中加载扩展（`chrome://extensions` → 加载已解压的扩展程序）
- [ ] 打开任意网页，验证宠物浮动图标出现在页面右下角
- [ ] 按 `Ctrl+Shift+X`（Mac: `Cmd+Shift+X`）打开聊天窗口，发送一条测试消息
- [ ] 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）验证宠物显隐切换
- [ ] 阅读 `YiPet/CLAUDE.md`（约 30 分钟）
- [ ] 打开 `src/content/bootstrap.ts`，追踪双世界注入流程（第一阶段 ISOLATED → 第二阶段 MAIN）
- [ ] 打开 `src/api/` 目录，理解四层架构：`client.ts` → `endpoints.ts` → `types.ts` → `services/`
- [ ] 打开 `src/chat/controller.ts`，找到 `sendMessage` 操作——这是所有聊天功能的入口
- [ ] 做一个小改动：在 Popup 中添加一行 `console.log("Hello YiPet")`，重新构建，重载扩展，验证日志出现
- [ ] 运行 `npm run typecheck`，验证 0 错误
- [ ] 运行 `npm test`，验证 97 个测试全部通过

## 后续学习

- [YiPet 工程文档](../../learn/projects/yipet/01-项目-架构设计.md) —— 深层架构、反模式
- [YiPet CLAUDE.md](../../../../YiPet/CLAUDE.md) —— 权威参考
- [跨项目 RPC 协议](../../build/cross-project-rpc-protocol.md) —— API 契约
- [YiPet 跨项目 Hub 成功案例](../../learn/lessons/wins/01-成果-YiPet跨项目Hub.md) —— 架构模式启发