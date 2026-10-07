---

doc_type: module
prd_task_id: "YP-07-00"
title: "YP-07-00: YiPet 七月需求总览 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
source_prd: "00-需求-需求总览.md"
source_okr: [yipet-001]
estimate_frontend: 13.5

type: task
---

# YP-07-00: 七月迭代总览 — 开发方案

> 需求编号：YP-07-00 · 优先级：P0 · 人天：13.5d

---

## 一、七月迭代主题

**从零搭建 YiPet Chrome MV3 扩展** — 完成 Vue 2 → Vue 3.5 技术栈迁移、MV3 扩展架构搭建、SSE 聊天框架、Content Script 双世界注入、浮窗宠物 UI。

### 1.1 背景

YiPett（前身）基于 Vue 2 + Webpack + MV2，存在三个架构债：
- **Vue 2 EOL**：2023 年底停止维护，无法享受 Composition API、`<script setup>`、TypeScript 严格模式支持
- **MV2 弃用**：Chrome 宣布 2025 年停止支持 MV2，Service Worker 替代 Background Page 是强制性迁移
- **构建工具老化**：Webpack 4 配置复杂（100+ 行），多入口构建（popup/content/background）需手动拼接

决策：**重写而非迁移** — 全新项目骨架（YiPet），仅复用 YiPett 的聊天窗口 UI 设计和宠物动画资源。

### 1.2 核心决策

| 决策 | 选择 | 替代方案 | 理由 |
|------|------|----------|------|
| 框架版本 | Vue 3.5 | Vue 2.7（过渡） | Composition API + `<script setup>` + 更好的 TS 支持 |
| 构建工具 | Rsbuild 1.x | Vite 5, Webpack 5 | 原生多入口支持 + 零配置 CSS Modules + Rspack 速度 |
| MV3 Service Worker | 是 | MV2 Background Page | Chrome 强制要求，SW 无法访问 DOM 需架构适配 |
| Content Script 注入 | ISOLATED + MAIN 双世界 | 纯 ISOLATED | MAIN world 需要访问页面 JS 对象（Vue app、router） |
| 状态管理 | Pinia 4.x | Vuex 4 | Vue 3 官方推荐，更好的 TS 推断 + DevTools |
| UI 库 | Element Plus 2.14 | Naive UI, Ant Design Vue | 与 YiVad 一致，减少跨项目学习成本 |
| 聊天窗口 | 独立 iframe (chrome-extension://) | 内联 ShadowDOM | iframe 隔离 CSS/JS、支持独立 CSP、不被宿主页面干扰 |

### 1.3 架构总览

```
┌────────────────────────────────────────────────────────────┐
│ Chrome Extension MV3                                       │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Popup        │  │ Chat Window  │  │ Options Page     │ │
│  │ (popup.html) │  │ (chat.html)  │  │ (options.html)   │ │
│  │ Vue 3.5 SPA  │  │ Vue 3.5 SPA  │  │ (future)         │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘ │
│         │                 │                                │
│         └────────┬────────┘                                │
│                  │ chrome.runtime.sendMessage              │
│         ┌────────▼────────┐                                │
│         │ Service Worker  │  (background.js)               │
│         │ — 消息路由      │                                │
│         │ — SSE 代理      │                                │
│         │ — Token 管理    │                                │
│         │ — 生命周期状态机│                                │
│         └────────┬────────┘                                │
│                  │ chrome.tabs.sendMessage                  │
│         ┌────────▼────────┐                                │
│         │ Content Script  │  (ISOLATED World)              │
│         │ — IPC 桥接      │                                │
│         │ — UI 注入协调   │                                │
│         └────────┬────────┘                                │
│                  │ window.postMessage                       │
│         ┌────────▼────────┐                                │
│         │ MAIN World      │  (<script> 注入)               │
│         │ — Vue 3.5 App   │                                │
│         │ — 宠物浮窗      │                                │
│         │ — 聊天窗口      │                                │
│         │ — ShadowDOM     │                                │
│         └─────────────────┘                                │
└────────────────────────────────────────────────────────────┘
```

---

## 二、交付模块

| # | 模块 | 需求编号 | 核心交付 | 人天 | 风险 |
|---|------|---------|---------|------|------|
| 1 | 技术栈迁移 | YP-07-01 | Vue 3.5 + TS 5 + Rsbuild 4 入口 + MV3 Manifest | 4.0 | 中 |
| 2 | 工具链迁移 | YP-07-02 | ESLint 10 + Prettier + commitlint + cz-git + lint-staged | 1.5 | 低 |
| 3 | 聊天框架搭建 | YP-07-03 | 4-Tier API + SSE 流式 + ChatStore + ChatInput/MessageList | 3.5 | 高 |
| 4 | RPC 参数与构建 | YP-07-04 | RPC 参数名契约 + 4 入口独立构建 + CSP 合规 | 1.5 | 中 |
| 5 | Content Script 注入 | YP-07-05 | 双世界注入 + `__YIPET_LOADED__` 防重复 + ShadowDOM 隔离 | 1.5 | 高 |
| 6 | 浮窗宠物 UI | YP-07-06 | 宠物浮窗 + 拖拽 + 动画 + 聊天窗口触发 + 位置持久化 | 1.5 | 低 |

---

## 三、技术风险与缓解

| # | 风险 | 概率 | 影响 | 缓解措施 |
|---|------|------|------|----------|
| R1 | Rsbuild 多入口构建 MV3 SW 失败 | 中 | 阻塞全部开发 | 提前验证 Rsbuild `output.target: "webworker"` 对 SW 的支持 |
| R2 | MAIN World 中 Vue 3 与宿主页面 Vue 冲突 | 中 | 宠物不显示、页面崩溃 | ShadowDOM 隔离 + Vue app 不挂载到 `#app` 而用唯一 container |
| R3 | Chrome SW 空闲 30s 终止导致消息路由中断 | 高 | 聊天功能不可靠 | `chrome.storage.local` 持久化 + activated 事件恢复状态 |
| R4 | `window.postMessage` 在 SPA 路由切换时监听器丢失 | 中 | MAIN↔ISOLATED 通信中断 | MutationObserver 检测 DOM 变更 + 定期心跳重建 |
| R5 | 第三方页面 CSP 阻止 `<script>` 标签注入 | 低 | 部分页面宠物不显示 | 降级为非注入模式，Popup 仍可用 |
| R6 | TypeScript strict 在 Vue SFC 中类型推断错误 | 低 | 类型检查阻塞 | `vue-tsc` 替代 `tsc` 处理 `.vue` 文件 |

---

## 四、里程碑

| 里程碑 | 日期 | 交付物 | 验证标准 |
|--------|------|--------|----------|
| M1 — 项目骨架 | 2026-07 第 1 周 | manifest.json + Rsbuild 配置 + 空 Popup | `npm run build` 成功，Chrome 加载扩展 |
| M2 — 聊天框架 | 2026-07 第 2 周 | SSE 流式 + ChatStore + 基础 UI | 发送消息 → AI 回复在聊天窗口渲染 |
| M3 — CS 注入 + 宠物 | 2026-07 第 3 周 | CS 双世界注入 + 宠物浮窗 + 拖拽 | 任意页面 → 宠物出现 → 双击 → 聊天窗口 |
| M4 — 集成 + 发布 | 2026-07 第 4 周 | 全部模块联调 + `tsc --noEmit` + lint | 全栈可用：Popup 配置 → 宠物聊天 → 会话持久化 |

---

## 五、技术主题

| 主题 | 说明 | 涉及模块 |
|------|------|----------|
| MV3 架构适配 | SW 非持久化、CSP 限制、双世界 IPC | M1, M5 |
| 4-Tier API | Component → Store → ApiClient → fetch | M3, M4 |
| TypeScript strict | 全项目 `strict: true`，零 `any` | M1, M2, M3 |
| 构建工程化 | 4 入口并行构建、CSP 合规、lint-staged | M1, M2, M4 |
| 注入架构 | ISOLATED + MAIN 双世界、ShadowDOM 隔离 | M5, M6 |

---

## 六、开发顺序依赖

```
M1 技术栈 ──→ M2 工具链 ──→ M3 聊天框架 ──→ M4 RPC+构建
                    │               │
                    └───→ M5 CS注入 ──→ M6 宠物UI
                                        │
                    所有模块 ──────────→ M4 集成发布
```

M1 是所有模块的前置。M2 可与 M3 并行。M5 依赖 M1（项目骨架）但独立于 M3。M6 依赖 M5（CS 注入是宠物 UI 的载体）。

---

## 七、完成定义（迭代级）

- [ ] 6 个模块按 §2 交付清单全部完成
- [ ] 4 个里程碑全部通过验证
- [ ] Chrome 扩展加载 → Popup 可用 → 任意页面宠物出现 → 聊天正常
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` 成功（popup/background/bootstrap/chat 4 入口）
- [ ] `npm test` 全量通过
- [ ] YiKnowledge 知识库更新（架构设计、开发规范、操作指南）