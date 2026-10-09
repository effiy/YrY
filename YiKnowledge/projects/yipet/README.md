---
title: YiPet 知识库索引
tags: [yipet, chrome-extension, mv3, vue3, rsbuild, pinia, i18n, csp]
category: projects/yipet
created: 2026-08-25
updated: 2026-10-09
source: YiPet
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, product, curator]
benefit: "YiPet Chrome MV3 扩展完整知识体系索引——双世界执行模型、4-Tier API 分层、跨项目桥接、220+ 功能 PRD、新人 5 天上手路线图"
benefit_secondary: "覆盖 860+ 知识产物（84 PRD · 261 Dev · 257 Task · 258 Test），STRIDE 威胁模型全覆盖"
acceptance_criteria:
  - "双世界执行模型（ISOLATED + MAIN）能力边界清晰说明"
  - "4-Tier API 分层：Component → Pinia Store → ApiClient → fetch"
  - "MV3 CSP 合规性检查清单：无 eval · 无远程代码 · 全部 vendor 本地化"
  - "IPC 跨世界通信：dispatchSecureEvent + IPC_SECRET 验证机制"
  - "新人 5 天上手路线图：Day1~Day5 任务 + Checklist + 常见坑"
related:
  - ../INDEX.md
  - ../README.md
  - ../../MEMORY.md
  - ../../../YiPet/CLAUDE.md
aliases:
  - yipet-readme
  - yipet-overview
  - yi-family-chrome-extension
  - yipet-mv3-dual-world
  - yipet-4-tier-architecture
---

# YiPet 项目知识库

> **Gentle Companion Chrome 扩展** — 浏览器中的交互式宠物伴侣，同时是 Yi 家族的跨项目入口。页面注入浮动宠物、Vue 3 + Element Plus 聊天窗口（SSE 流式对话）、Popup 皮肤中心、侧边栏 4 标签页（Sessions / Knowledge / Stories / Bugs）、84+ 功能模块（图片编辑 · 翻译工具 · 快捷面板 · 翻译推荐 · 状态同步等），与 YiVad 管理后台、YiAi 后端深度桥接。

---

## 0. 新人入职指南 — 5 天上手路线图

| 阶段 | 核心任务 | 交付物 | 参考文档 | Checklist |
|------|---------|--------|---------|-----------|
| **Day 1 · 环境搭建** | Node 18+ · pnpm/yarn · Rsbuild · 加载扩展到 Chrome | Chrome 工具栏出现 YiPet 图标，Popup 可打开 | [快速开始](./workflows/操作指南/001-指南-快速开始.md) | `pnpm typecheck && pnpm build` 通过 ✓ · dist/ 目录可被 Chrome 加载 ✓ |
| **Day 2 · 架构概念** | 双世界模型 · 4-Tier API · IPC Relay · MV3 CSP 合规 | 手绘双世界数据流图一张，标注 API 可用性 | [架构概览](./workflows/架构设计/001-架构-架构概览.md) · [扩展架构](./workflows/架构设计/002-架构-扩展架构.md) | 能口述 MAIN 世界为什么不能用 chrome.* ✓ |
| **Day 3 · 调试单测** | Vitest 97/97 用例全绿 · Chrome DevTools 调试 Content Script / SW / Chat | 用 devtools 断点 chatStore.sendMessage 流程 | [测试指南](./workflows/操作指南/003-指南-测试指南.md) · [调试排错](./workflows/操作指南/004-指南-调试排错.md) | `pnpm test` 全绿 ✓ · 能在三世界（ISOLATED/MAIN/Popup）各打断点 ✓ |
| **Day 4 · 功能开发** | 独立开发 1 个小功能（如：新增工具栏按钮 + 对应 Action） | PR 合入，通过 Code Review | [添加新功能](./workflows/操作指南/002-指南-添加新功能.md) · [组件规范](./workflows/开发规范/009-规范-组件规范.md) | `<script setup lang="ts">` ✓ · Store Actions 操作状态 ✓ · 卸载 cancel AbortController ✓ |
| **Day 5 · PR 准备** | 阅读 CR 16 项 Checklist · 运行 `pnpm check`（typecheck + lint + test） | 独立产出符合规范的 PR | [双世界模型](./workflows/架构设计/003-架构-双世界执行模型.md) · [错误处理](./workflows/开发规范/011-规范-错误处理模式.md) | 0 tsc 错误 ✓ · 0 lint 告警 ✓ · 97/97 test ✓ |

---

## 0.1 快速入门 — 三阶上手（30 秒 / 5 分钟 / 30 分钟）

> 与 YiPot / YiAi / YiVad / YiKnowledge 统一三阶入门结构，避免跨项目信息格式不一致。

### 0.1.1 30 秒速览（YiPet 是什么 + 3 条红线 + 角色入口）

| 我想了解 | 跳转位置 | 30 秒掌握关键 |
|---------|---------|-------------|
| YiPet 一句话定位 | 上方页面简介 + §1 项目画像的类型/框架/CSP 行 | Chrome MV3 宠物伴侣扩展（MV3），同时是 Yi Family 跨项目前端入口：浮动宠物 + 聊天窗口 + 侧边栏 4 标签页 + 84+ 功能模块，后端统一走 YiAi 10086 |
| 硬约束红线（违反=线上 CSP 报错 / 审核拒登）| §9 关键约束速查（Hard Constraints）顶部 4 条 | ① 双世界模型**严禁破坏**：ISOLATED vs MAIN 必须经过 `IPC_SECRET` 签名 IPC Relay 通信（§2 双世界）<br/>② MV3 CSP 100% 合规：public/cdn 必须本地化全部 vendor（无远程代码 / 无 eval），manifest `web_accessible_resources` 必须包含 `_locales/` 目录 <br/>③ 4 入口构建（popup/chat/cdn/bootstrap）独立，不得混写跨域共享 <br/>④ 4-Tier API 分层（C-001~C-004）禁止 Tier0 直连 Tier3（强分层防 CSP）|
| 接手从哪开始 | §0.2 按角色学习路径 | 找自己的角色（FE / Chrome Extension Dev / QA / Product / Leader）|

> **结束条件**：能向同事解释「为什么 MAIN 世界不能用 chrome.*」，能说出 4 条红线中的至少 3 条。

### 0.1.2 5 分钟快速启动（加载扩展 + 看到浮动宠物 + 跑 97 tests）

> 前提：Node 18+ · pnpm · Chrome / Edge 最新版（MV3 支持）。缺依赖 → §0 Day1 环境搭建 + [快速开始](./workflows/操作指南/001-指南-快速开始.md)。

| 步骤 | 命令 / 动作 | 预期结果 | 异常排查跳转 |
|------|------------|---------|------------|
| ① 安装依赖 | `cd /Users/yi/YrY/YiPet && pnpm install && pnpm typecheck` | 0 type error · 0 WARN 红色 | [快速开始](./workflows/操作指南/001-指南-快速开始.md) · §10.1 FAQ MV3 常见坑 |
| ② 构建 MV3 4 入口 | `pnpm build`（Rsbuild 同时构建 popup / chat / cdn / bootstrap）| `dist/` 目录生成 4 入口；manifest.json 无错误，web_accessible_resources 齐全 | [扩展架构](./workflows/架构设计/002-架构-扩展架构.md) · §6 4 入口构建体系 |
| ③ Chrome 加载扩展 | Chrome 访问 `chrome://extensions/` → 右上角「开发者模式 ON」→ 「加载已解压的扩展程序」→ 选 `dist/` | Chrome 工具栏出现 YiPet 宠物爪图标；任意网页打开有浮动宠物出现 | [调试排错](./workflows/操作指南/004-指南-调试排错.md) · §2 双世界权限错误排查 |
| ④ 体验核心三件套 | 1) 任意网页 → 浮动宠物右键 → 打开聊天；2) 工具栏 Popup 皮肤中心切 3 个主题；3) 侧边栏 Sessions / Knowledge / Stories / Bugs 4 Tab | 聊天 SSE 流式消息正常流出（CanceledError 不出现）· 皮肤切换无白屏 · 侧边栏筛选正常 | §4 IPC 跨世界通信 · §10.1 #3 CSP Refused to load script |
| ⑤ 质量门禁（5 分钟内快速子集）| `pnpm check`（typecheck + lint）· `pnpm vitest run tests/unit/ipc.test.ts tests/unit/mv3_csp.test.ts tests/unit/tier_api.test.ts` | typecheck 0 · lint 0 · 3 tests PASS（97/97 全量 Day 5 跑）| §10.2 CR 16 项 · [测试指南](./workflows/操作指南/003-指南-测试指南.md) |

> **结束条件**：Chrome 扩展成功加载 + 网页浮动宠物 + 聊天窗口正常 + 3 tests + typecheck + lint 全绿。

### 0.1.3 30 分钟主线（独立交付一个小功能模块）

| 步骤 | 主题 | 用时 | 跳转锚点 / 参考文档 | 交付物 |
|------|------|------|-------------------|-------|
| ① | 模式对齐：读 §2 双世界 + §3 4-Tier 分层 + §4 IPC Relay · Gold Copy：侧边栏 Bugs Tab 页面实现 | 6 分 | §2 双世界执行模型 · [双世界模型规范](./workflows/架构设计/003-架构-双世界执行模型.md) · §3 4-Tier 分层 | 能画出 ISOLATED ↔ IPC_SECRET ↔ MAIN ↔ Service Worker ↔ YiAi 跨世界数据流向图 |
| ② | Day 4 模板生成 6 文件：src/content/features/xxx.ts · src/main/ui/xxx.vue · src/background/actions/xxx.ts · src/api/tier2/xxx.ts · tests/unit/xxx.test.ts · PRD | 10 分 | [添加新功能](./workflows/操作指南/002-指南-添加新功能.md) · §6 4 入口构建 Rsbuild | 6 文件骨架；Tier API 调用按 4-Tier 分层（不跨级）|
| ③ | 实现 + IPC Relay 签名 + AbortController 卸载取消（防内存泄漏）| 8 分 | §4 IPC 跨世界安全通信 · [错误处理模式](./workflows/开发规范/011-规范-错误处理模式.md) · [组件规范](./workflows/开发规范/009-规范-组件规范.md) | `<script setup>` 单入口；卸载 cleanup 无警告；MV3 CSP 本地扫描 0 报错 |
| ④ | CR 自查 16 项 + 双世界 Unit Test 覆盖率 ≥ 70% + lint + typecheck | 4 分 | §9 Hard Constraints · [代码审查](./workflows/流程规范/003-流程-代码审查.md) CR 16 项 | 自查 16/16 ✅；coverage ≥ 70% |
| ⑤ | PR 关联 PRD / Dev / Test（知识库 Frontmatter related 字段）| 2 分 | INDEX §4 OKR→PRD→Task 追溯 · [Bug 模板](./bugs/模板/) | PR 标题 `feat(yipet/xxx): 新增 xxx 功能/按钮/页面`；links 3 个知识库文件 |

> **结束条件**：PR 已发出；CI（Rsbuild build × 4 入口 + typecheck + lintstaged + vitest 97/97）全绿。

---

## 0.2 按角色学习路径（我是 FE/MV3 Dev/QA/Product/Leader 从哪切入）

| 角色 | 首选章节顺序 | 重点锚点 | 2 周内典型交付任务 |
|------|------------|---------|----------------|
| **前端工程师 FE（页面/Vue 组件）** | §0.1.2 5 分钟启动 → §2 双世界 MAIN 层能做什么 → §4 IPC Relay → §8 快速导航矩阵 → §10 技术栈 → §11 开发命令 | MAIN 世界 Vue 3 + Element Plus 组件 · Pinia 持久化（chrome.storage.local）· 国际化 i18n · 侧边栏 4 标签页布局 | 新增聊天窗口 Tab · 皮肤主题 3 套新增 · Popup UI 响应式（小屏 320px 不折行）|
| **Chrome 扩展 Dev（MV3/IPC/SW）** | §2 双世界模型 → §3 4-Tier API → §4 IPC Relay + IPC_SECRET 签名 → §6 4 入口 Rsbuild → §10.1 MV3 10 坑 | Service Worker 30s 闲置 kill 恢复机制 · Manifest 字段与 CSP 合规 · web_accessible_resources 与 `_locales/` · 跨 Tab 广播 | 新增一个 Tier 2 API（不跨级到 Tier3/4）· SW idle 唤醒逻辑优化 · manifest 新权限声明合规评审 |
| **QA / 测试工程师** | §2 双世界（ISOLATED vs MAIN 边界用例）→ §3 4-Tier API（强分层 ×6 场景）→ §4 IPC 签名（伪造签名必须失败）→ §10 Playwright + vitest | MV3 10 坑每条 ≥ 2 个用例 · 双世界 3 断点调试 · CSP 本地扫描器自动化 · AbortController 取消无泄漏 | 新增 12 条 Playwright E2E（Chrome 真实加载扩展）· 测试金字塔 70/20/10 · DORA 变更失败率基线 |
| **Product 产品经理** | §5 核心 84 功能模块 → §1 项目画像能力边界 → §0 Day1-Day5 能力矩阵 · OKR→PRD 追溯 | 84+ PRD 功能域分类 · 浮动宠物交互矩阵 · 聊天 SSE 用户体验指标 · 侧边栏 4 Tab 信息架构 | 写一份「YiPet 2026-Q4 皮肤中心×会员体系」PRD（对齐 RICE × OKR goal-002 品牌重构）|
| **后端对接工程师（YiAi 侧）** | §3 4-Tier API 边界 → §4 IPC 格式 → §5 功能模块 × YiAi RPC（模块名/方法名）| 4-Tier API 调用链（Tier4 → YiAi RPC 信封）· bridge_service 一次性签名 · C-003 翻译推荐请求 shape | 新增 Tier4 功能对应 YiAi 后端 RPC 新接口（callService 参数对齐）|
| **Leader / 架构师** | §2 双世界 + §3 4-Tier + §4 IPC（安全模型核心）→ §9 Hard Constraints 4 红线 → [跨项目契约 §15 跨项目 6 契约](../../yipot/README.md#L560-L713) · [INDEX 技能协作链](../INDEX.md) | MV3 CSP 0 报错全仓扫描 · 4-Tier 强分层防越权 · IPC_SECRET 防 XSS 窃取 · 跨项目 C-004 翻译推荐（YiPet ↔ YiPot ↔ YiAi 三角）| ADR-015「MV3 双世界 + 4-Tier + IPC 标准模式」· 2027-Q1 扩展到 Edge/Firefox/Safari 多浏览器评估 ADR |

---

## 1. 项目画像

| 维度 | 规格 |
|------|------|
| **项目名称** | YiPet — Gentle Browser Companion |
| **类型** | Chrome Extension · Manifest V3 |
| **版本** | 1.2.0 |
| **前端框架** | Vue 3.5 · Composition API · `<script setup lang="ts">` |
| **状态管理** | Pinia 4 · Setup Function 语法 · chrome.storage.local 持久化 |
| **构建工具** | Rsbuild 1.x（Rspack 内核）· **4 入口多构建**：popup/chat/cdn/bootstrap |
| **UI 组件** | Element Plus 2.14 · unplugin-vue-components 自动导入 |
| **类型系统** | TypeScript 6.x · strict mode ON · vue-tsc --noEmit |
| **国际化** | chrome.i18n API · en + zh_CN 双语 · 200+ message keys |
| **测试框架** | Vitest 2 · jsdom 29 · 97/97 测试用例全通过 |
| **代码质量** | ESLint 10 · Prettier 3 · Stylelint 17 · husky 9 + lint-staged 17 |
| **提交规范** | commitlint 21 + cz-git（Conventional Commits） |
| **MV3 CSP** | 100% 合规 — 所有 vendor 本地化 public/cdn · 无 eval · 无远程代码 |
| **后端口** | YiAi FastAPI `http://localhost:10086`（SSE 流式 + RPC 信封） |
| **知识产物** | 84 PRD · 261 Dev · 257 Task · 258 Test · 合计 **860+** 文件 |

---

## 2. 双世界执行模型（MV3 核心约束）

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Chrome 渲染进程 — 某个 Tab 的 JS 环境                                   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  ISOLATED World  (Content Script Context)                       │    │
│  │  ✅ chrome.runtime.* / chrome.storage.* / chrome.tabs.*         │    │
│  │  ✅ 可访问扩展资源（chrome-extension://<id>/）                  │    │
│  │  ❌ 不能直接操作页面 DOM 的原生 JS 对象                         │    │
│  │  ❌ 不能访问页面 MAIN World 定义的 window 全局变量               │    │
│  │                                                                  │    │
│  │  ┌─ src/content/bootstrap.ts (入口 A) ──────────────────────┐   │    │
│  │  │ ① 作为 Content Script 运行在 ISOLATED                     │   │    │
│  │  │ ② 创建 <script src=chrome.runtime.getURL(bootstrap.js)>   │   │    │
│  │  │    → 注入到 MAIN World                                    │   │    │
│  │  │ ③ 建立 IPC Relay：CustomEvent + IPC_SECRET 签名验证        │   │    │
│  │  └───────────────────────────────────────────────────────────┘   │    │
│  │                              ▲ 双向事件                          │    │
│  │                              │ IPC_SECRET 签名                   │    │
│  │                              ▼                                   │    │
│  │  ┌─ MAIN World (真实页面 DOM 上下文) ──────────────────────────┐ │    │
│  │  │ ✅ 完整页面 DOM · window.* · 页面 JS 库                    │ │    │
│  │  │ ❌ chrome.* API 全部不可用（！！！）                        │ │    │
│  │  │                                                             │ │    │
│  │  │  ┌─ 浮动宠物 Overlay (Vue 3 挂载)                          │ │    │
│  │  │  └─ 聊天窗口 (Vue 3 挂载，独立入口)                        │ │    │
│  │  └─────────────────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─ Service Worker (SW, 独立进程) ──────────────────────────────────┐  │
│  │ ✅ chrome.* API 最全（runtime/storage/alarms/tabs/notifications）│  │
│  │ ❌ 无 DOM · 生命周期短（30s 闲置被 kill，事件唤醒）                │  │
│  │ ┌─ src/background/index.ts                                       │  │
│  │ └─ 命令分发 · 消息路由 · 跨 Tab 广播 · 定时任务                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─ Popup (点击工具栏图标弹出，独立页面) ─────────────────────────────┐ │
│  │ ✅ chrome.* API                                                    │ │
│  │ ┌─ Vue 3 + Element Plus 皮肤中心                                  │ │
│  │ └─ 角色选择 · 皮肤调色板 · 模型切换 · 实时宠物预览                 │ │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 API 可用性矩阵（高频踩坑点）

| API | ISOLATED World | MAIN World | Service Worker | Popup | 真实 Bug 案例 |
|-----|:--------------:|:----------:|:--------------:|:-----:|--------------|
| `chrome.runtime.sendMessage` | ✅ | ❌ | ✅ | ✅ | MAIN 世界调用 → `chrome.runtime is not defined` |
| `chrome.storage.local.get/set` | ✅ | ❌ | ✅ | ✅ | MAIN 世界存 localStorage → 跨站隔离丢失 |
| `chrome.runtime.getURL(...)` | ✅ | ❌ | ✅ | ✅ | MAIN 世界无法解析扩展资源路径 |
| `window.getSelection()` | ⚠️ 仅扩展内 DOM | ✅ | ❌ | ⚠️ 无选区 | ISOLATED 里取不到页面选中文本 |
| `document.body.innerText` | ⚠️ 受限 | ✅ | ❌ | ⚠️ 小范围 | CS 和 MAIN 看到的 document 是**隔离的** |
| `fetch(...)` | ✅ (受扩展 CSP) | ✅ (受页面 CORS) | ✅ | ✅ | 同域名两边看到的 Cookie/Credentials 不同 |

---

## 3. 4-Tier API 分层架构

```
  组件层 (Vue SFC · <script setup>)
    │  导入：stores + api/services
    │  ✅ 只调用 Store Actions，不直接 fetch
    ▼
  Store 层 (Pinia · Setup Function)
    │  状态：响应式 ref/reactive
    │  操作：Action 函数（含业务编排）
    │  ✅ 通过 ApiServices 调用 API，不直接 fetch
    ▼
  API Services 层 (7 个领域服务类)
    │  src/api/services/{auth,bridge,chat,knowledge,rag,search,wework,translation,dashboard,bug,session}.ts
    │  构造函数注入 ApiClient
    │  ✅ 不 new AbortController（上层透传），不操作 DOM
    ▼
  ApiClient + Endpoints + Types
    │  src/api/client.ts    ← fetch 包装 · 重试 · 错误提取 · SSE 流式 · DevLog
    │  src/api/endpoints.ts ← URL 常量（唯一数据源）
    │  src/api/types.ts     ← 请求/响应接口（单一真相源）
    │  ✅ 唯一可以调用 fetch 的层
    ▼
  YiAi FastAPI :10086 (RPC 信封 {module_name, method_name, parameters})
```

### 3.1 跨项目 RPC 参数契约（与 YiAi 一致）

| 字段名 | 正确写法 | 错误写法 | 错误后果 | 真实 Bug 时间 |
|--------|---------|---------|---------|------------|
| Mongo 过滤器参数 | **`filter`** | `query` | 后端**静默忽略**，返回全量结果 | 2026-07 |
| 文件操作路径 | **`target_file`** | `path` | 422 Unprocessable Entity | 2026-07 |
| 集合名称 | `cname` 或 `collection_name` | — | — | — |

---

## 4. IPC 跨世界安全通信机制

```
 Popup / SW (ISOLATED 能力)
    │  chrome.tabs.sendMessage(tabId, {action, payload})
    │  （或 chrome.runtime.sendMessage 广播）
    ▼
 Content Script · ISOLATED World
    │  chrome.runtime.onMessage.addListener
    │  验证扩展来源
    │
    │  ┌─ dispatchSecureEvent(type, payload) ──────────────────────────┐
    │  │  1. 生成 nonce + 时间戳                                        │
    │  │  2. HMAC-SHA256(payload + nonce + ts, IPC_SECRET) → signature │
    │  │  3. new CustomEvent(`yipet:${type}`, {detail: {payload,      │
    │  │     nonce, ts, signature}})                                    │
    │  │  4. window.dispatchEvent → 冒泡到 document                    │
    │  └───────────────────────────────────────────────────────────────┘
    ▼
 MAIN World · 页面上下文
    │  document.addEventListener(`yipet:${type}`)
    │  ┌─ verifyAndParseEvent(e) ─────────────────────────────────────┐
    │  │  1. nonce 重放检查（5 分钟滑动窗口）                           │
    │  │  2. ts 时间差 < 30s                                          │
    │  │  3. HMAC 签名重算对比 == e.detail.signature？                  │
    │  │  4. 全部通过 → 返回 payload，否则 drop + warn 日志             │
    │  └───────────────────────────────────────────────────────────────┘
    ▼
 浮动宠物 / 聊天窗口 (Vue 3)
    更新 Pinia Store → 响应式重渲染
```

---

## 5. 核心功能模块（84+ PRD 功能域）

| 功能域 | 代表模块 | 关键文件位置 |
|--------|---------|------------|
| **聊天核心** | SSE 流式对话 · 消息气泡 · 会话管理 · 分支线程 · Markdown 导出 | `src/chat/stores/chat.ts` · `src/chat/components/*` |
| **浮动宠物** | 皮肤环 · 角色渲染 · 拖拽定位 · prefers-reduced-motion | `src/content/rendering/overlay.ts` · `src/popup/components/PetPreview.vue` |
| **皮肤中心 Popup** | 6 色调色板 · 4 角色卡片 · 3 模型选择 · 实时宠物预览 | `src/popup/App.vue` · `src/popup/data.ts` · `src/popup/components/*` |
| **侧边栏 4 标签** | Sessions / Knowledge / Stories / Bugs | `src/chat/components/ChatSidebar.vue` |
| **跨项目桥接** | 每条消息 → YiVad aiChat · 讨论此页面 · Bug 记录器 | `src/api/services/bridge.ts` · `src/chat/components/MessageBubble/*` |
| **翻译推荐** | 选中文本即时翻译 · 24h 健康度智能推荐引擎 | `src/api/services/translation.ts` · `src/chat/stores/chat.ts:translateSelection()` |
| **图片工具箱** | 编辑器 · 滤镜 · 批量处理 · AI 工具 · 导出转换 | `src/shared/image-editor.ts` · prds/2026-09/01-prd-图片编辑器.md |
| **效率工具箱 100+** | 颜色/二维码/正则/哈希/JWT/UUID/时间戳/摩斯/Markdown/数学公式/条形码 | `src/shared/utility-tools.ts` · `src/shared/shortcutTypes.ts` |
| **快捷键面板** | `⌘K` 命令面板 · 分类搜索 · 100+ 命令 | `src/shared/shortcuts.ts` · shortcuts/categories.ts |
| **知识库 RAG** | 文件拖拽到聊天 · @ 提及下拉 · 上下文芯片 · 3 段流式时间线 | `src/chat/components/ContextFilesPanel/` · `src/chat/components/FileMentionDropdown.vue` |
| **国际化 i18n** | 中英双语 · chrome.i18n API · MessageKey 联合类型同步 | `src/shared/i18n/` · `public/_locales/**/messages.json` |
| **主题系统** | Lavender/Pink/Sakura/Ocean/Sunset/None 6 套 · CSS 变量语义化 | `src/shared/theme/` · `src/styles/var.scss` |

---

## 6. 4 入口构建体系（Rsbuild）

| Rsbuild 配置 | 入口文件 | 产物目录 | 构建模式 | 关键约束 |
|-------------|---------|---------|---------|---------|
| `rsbuild.config.ts`（默认） | `src/popup/main.ts` + `src/background/index.ts` | `dist/popup` + `dist/background` | dev / pro | **禁用文件名哈希**（manifest.json 硬编码引用）|
| `rsbuild.config.chat.ts` | `src/chat/index.ts` | `dist/chat` | **仅 production** | 聊天用 dev 模式会注入 jsxDEV，冲突生产 Vue → `jsxDEV is not a function` Bug |
| `rsbuild.config.cdn.ts` | `public/cdn/utils/*` | `dist/cdn/utils` | 任何模式 | 纯 JS + 无 Vue，注入 MAIN 世界作为规范基础库 |
| `rsbuild.config.bootstrap.ts` | `src/content/bootstrap.ts` | `dist/content` | dev / pro | **禁用代码分割**（CS 需单文件）|

### 6.1 MV3 CSP 合规 Checklist

发布到 Chrome Web Store 之前，必须 100% 满足：

- [ ] **无 `eval` / `new Function`**（搜索 `eval\(` / `new Function`）
- [ ] **无内联脚本**（manifest.json 的 `content_scripts` 只引用外部文件）
- [ ] **无远程代码**（不 fetch 远程 JS 并 `eval` 执行）
- [ ] **所有 vendor 本地化**：`public/cdn/libs/*`（MD5 / Axios / Marked 全部本地文件）
- [ ] `manifest.json` 中 `content_security_policy` 仅包含：`self` + `chrome-extension://*`
- [ ] 构建产物无哈希文件名：`popup.js` / `chat.js` / `background.js`（非 `popup.abc123.js`）
- [ ] Service Worker 单文件输出（禁用 code split）
- [ ] 所有图片/字体通过 `chrome.runtime.getURL(...)` 访问，不引用远程 CDN

---

## 7. 目录结构（知识库内）

```
YiKnowledge/projects/yipet/
├── README.md                  # 本文件 — 总索引
├── okrs/                      # OKR 目标与关键结果（按季度）
│   └── 2026-Q3/  2026-Q4/
├── prds/                      # 产品需求（84+，按月归档）
│   ├── 模板/00-模板-需求文档.md
│   ├── 2026-07/ · 2026-08/ · 2026-09/
│   │   └─ 00-prd-需求总览.md → 01/02/.../229+ PRD
│   │     （图片编辑 7 · 工具箱 100+ · 翻译 · 快捷键 · 命令面板 · ...）
├── devs/                      # 开发方案（261+）
│   ├── 模板/00-模板-开发方案.md
│   └── 2026-07/ · 2026-08/ · 2026-09/
├── tests/                     # 测试规格（258+）
│   ├── 模板/00-模板-测试规格.md
│   └── 2026-09/
├── bugs/                      # 缺陷与威胁模型
│   ├── README.md              # 缺陷索引 + 排查流程
│   └── 2026-09/
│       └── STRIDE-YiPet威胁模型.md  # 仿冒/篡改/抵赖/信息泄露/拒绝服务/提权
└── workflows/                 # 工作流（31+ 规范/指南/模式）
    ├── 架构设计/  7 篇  概览·扩展架构·双世界·目录·核心模块·IPC·CDN注入
    ├── 开发规范/  11 篇  项目·OpenSpec·依赖·API·认证·TS·i18n·组件·状态·错误
    ├── 操作指南/  5 篇  快速开始·添加新功能·测试·调试排错·性能优化
    ├── 功能模式/  2 篇  ChatStore 状态管理 · 导航与视图管理
    └── 流程规范/  6 篇  分支·变更落地·变更状态·PRD→Proposal·构建部署·扩展发布
```

---

## 8. 快速导航矩阵

### 8.1 遇到问题 → 排查定位（高频 12 坑）

| 症状 / 错误信息 | 根因首猜 | 去哪看 | 修复方法 |
|----------------|---------|-------|---------|
| 宠物不显示 / `__YIPET_LOADED__`=false | MAIN 注入失败或重复注入短路 | [调试排错 #宠物不显示](./workflows/操作指南/004-指南-调试排错.md) | 检查 CSP · IPC 签名 · 注入前全局存在性检查 |
| 聊天窗口打不开 / Ctrl+Shift+X 无反应 | 快捷键冲突 / SW 被 kill | [调试排错 #聊天窗口不响应](./workflows/操作指南/004-指南-调试排错.md) | chrome://extensions/ → 查看 Service Worker 日志 |
| API 返回空数据 / `query` 参数无效 | 参数名错误：用了 `query` 而非 `filter` | [API架构 #参数契约](./workflows/开发规范/005-规范-API架构与规范.md) | 替换 `parameters.query` → `parameters.filter` |
| `chrome.runtime is not defined` | **MAIN 世界**代码里错误调用 chrome API | [双世界模型 #能力边界](./workflows/架构设计/003-架构-双世界执行模型.md) | 改为通过 IPC（dispatchSecureEvent）请求 ISOLATED 代为调用 |
| 构建失败 / SW 未注册 | Rsbuild 4 入口未全部构建完 | [构建部署 #常见问题](./workflows/流程规范/005-流程-构建部署.md) | `pnpm build` 顺序：cdn → 默认(含 popup/sw) → chat → bootstrap |
| `jsxDEV is not a function` | chat 用了 dev 模式构建 | 同上 | `rsbuild build --mode production --config rsbuild.config.chat.ts` |
| Token 401 / 认证失败 | Token 过期 / X-Token 头缺失 | [认证与权限 #Token管理](./workflows/开发规范/006-规范-认证与权限.md) | bridge_service 一次性桥接 · 重新登录 |
| SSE 连接中断 / 消息发送失败 | 网络切换 / 后端重启 | [错误处理 #降级层级](./workflows/开发规范/011-规范-错误处理模式.md) | AbortController + 指数退避 3 次重试 · 消息持久化后可重放 |
| chrome.storage 写入静默失败 | QUOTA_BYTES 配额超出（5MB 默认）| [状态管理 #持久化策略](./workflows/开发规范/010-规范-状态管理模式.md) | 配额检查 · 老数据 LRU 清理 · 大对象用 IndexedDB |
| 弹窗配置变更后宠物不响应 | IPC 消息时序问题 / MAIN 未监听到 | [IPC通信 #消息流时序](./workflows/架构设计/006-架构-IPC跨世界通信.md) | 等待 200ms + 重试 3 次 · 超时后 warn 日志 |
| CDN 资源加载 404 | 路径大小写 / manifest web_accessible_resources 缺失 | [CDN注入 #MV3 CSP合规](./workflows/架构设计/007-架构-CDN资源注入.md) | 检查 catalog.ts 与 manifest.json 同步 |
| Chrome Web Store 审核被拒 | 隐私声明缺失 / 权限最小化原则违反 | [扩展发布 #审核拒因](./workflows/流程规范/006-流程-扩展发布流程.md) | 对照 Store 政策 · privacy-manifest.json 声明 |

### 8.2 Code Review 16 项必查清单

| # | 检查项 | 违规后果 | 参考 |
|---|--------|---------|------|
| 1 | **禁止直接 fetch**，必须过 `ApiClient`（4-Tier 分层）| 重试 / 错误提取 / SSE 全失效 | [API架构](./workflows/开发规范/005-规范-API架构与规范.md) |
| 2 | 严格 4-Tier：不跳层（组件→Store→Services→Client）| 业务散落，无法测试 | 同上 |
| 3 | CS（ISOLATED）和 MAIN 状态严格分离，不跨世界闭包共享 | 数据损坏 · 内存泄漏 | [扩展架构 #双世界](./workflows/架构设计/002-架构-扩展架构.md) |
| 4 | MAIN 世界代码 **绝不** 调用 `chrome.*` | `chrome.runtime is not defined` 崩溃 | [双世界模型](./workflows/架构设计/003-架构-双世界执行模型.md) |
| 5 | 参数名 `filter`（非 query）· `target_file`（非 path）| 返回全量 / 422 | [API架构 #参数契约](./workflows/开发规范/005-规范-API架构与规范.md) |
| 6 | 持久化用 `chrome.storage.local`，不用 `localStorage` | 跨站隔离 · 清缓存丢失 | [认证与权限 #安全约束](./workflows/开发规范/006-规范-认证与权限.md) |
| 7 | IPC 消息必须走 `dispatchSecureEvent` + IPC_SECRET 验证 | 恶意页面伪造事件操作宠物 | [IPC跨世界通信](./workflows/架构设计/006-架构-IPC跨世界通信.md) |
| 8 | 组件**只通过 Store Actions**操作状态，不直接赋值 | 响应式丢失 · 无法持久化同步 | [组件规范 #Store集成](./workflows/开发规范/009-规范-组件规范.md) |
| 9 | 组件卸载时 **必须 cancel AbortController** | 请求泄漏 · 回调访问已卸载 DOM 报错 | [组件规范 #反模式](./workflows/开发规范/009-规范-组件规范.md) |
| 10 | 错误对用户可见 + 有恢复路径（重试/降级），静默失败禁止 | 用户卡住，无法恢复 | [错误处理模式](./workflows/开发规范/011-规范-错误处理模式.md) |
| 11 | 组件使用 `<script setup lang="ts">`（禁止 Options API）| TS 类型不完整 · 维护成本高 | 同上 |
| 12 | TypeScript 类型检查 0 错误（`vue-tsc --noEmit`）| 构建失败 / 运行时类型错误 | [TS 类型规范](./workflows/开发规范/007-规范-TypeScript类型规范.md) |
| 13 | 构建**禁用哈希文件名**（MV3 manifest 固定引用）| 扩展加载时报资源找不到 | [目录结构 #构建约束](./workflows/架构设计/004-架构-目录结构.md) |
| 14 | 构建**禁用代码分割**（Service Worker 单文件）| SW 注册失败 | 同上 |
| 15 | 所有用户可见文本走国际化（`t('key')`），不硬编码中文/英文 | 双语用户体验不一致 | [国际化](./workflows/开发规范/008-规范-国际化.md) |
| 16 | 注入前检查 `__YIPET_LOADED__`，重复 Tab 不重复注入 | 重复挂载 Overlay · 样式冲突 · 状态重复 | [双世界模型](./workflows/架构设计/003-架构-双世界执行模型.md) |

---

## 9. 关键约束速查（Hard Constraints）

### ✅ 必须遵守

1. **4-Tier API 分层**：Component → Pinia Store Actions → Api Services → ApiClient.fetch。任何层不跳级
2. **双世界分离**：ISOLATED ↔ MAIN 状态、闭包、能力绝不混用；所有 chrome.* 调用在 ISOLATED 侧
3. **chrome.storage 持久化**：所有跨会话状态用 chrome.storage.local（不用 localStorage）
4. **构建输出约束**：
   - 文件名**禁用哈希**（manifest.json 引用固定文件名）
   - Service Worker **禁用代码分割**（单文件输出）
5. **i18n 全量覆盖**：用户可见文本 100% 通过 `chrome.i18n.getMessage(key)`
6. **IPC 安全**：MAIN ↔ ISOLATED 通信必须使用 `dispatchSecureEvent` + IPC_SECRET + nonce 重放防护
7. **SSE 取消**：所有流式请求透传 `AbortSignal`，组件卸载 100% cancel
8. **参数契约**：`filter` 非 `query` · `target_file` 非 `path`（与 YiAi 后端严格对齐）
9. **MAIN 世界注入前检查**：`if (window.__YIPET_LOADED__) return`，防重复挂载
10. **MV3 CSP 零容忍**：无 eval · 无远程 JS · 无内联脚本，全部 vendor 本地化

### ❌ 严格禁止

1. MAIN 世界调用 `chrome.runtime.*` / `chrome.storage.*` / `chrome.tabs.*`（→ 抛错）
2. ISOLATED World 直接操作页面原生 JS DOM 对象（→ 上下文隔离限制）
3. 绕过 ApiClient 直接 `fetch` / `axios`（→ 重试、日志、错误提取、取消全失效）
4. 混用 Content Script 状态和 Service Worker 状态（→ 两边不同步，内存泄漏）
5. 动态加载远程 JS 并执行（→ CSP 违规，Store 审核直接拒）
6. 无理由使用 `any` 类型（→ strict strict 模式白开）
7. 一次性使用场景创建过度抽象层（→ 复杂度飙升）
8. 忘记组件卸载时调用 `abortController.abort()`（→ 内存泄漏 + 回调崩溃）
9. 使用 `localStorage` 存储用户状态（→ 清缓存丢失 / 跨站隔离失效）
10. Popup 中长时间运行任务（→ Popup 关闭即销毁，状态丢失，应迁 SW 执行）

---

## 10. 技术栈速查表

| 分类 | 技术 | 版本 | 核心用途 |
|------|------|------|---------|
| **UI 框架** | Vue | 3.5.40 | Composition API · 响应式 · 30+ 组件 |
| **TS 编译器** | TypeScript | 6.0.3 | strict mode · vue-tsc --noEmit 构建阻断 |
| **构建工具** | Rsbuild | 1.0.0 | Rspack 内核 · 4 入口多构建 · 速度较 Webpack 5~10× |
| **UI 组件库** | Element Plus | 2.14.3 | 对话框 · 表单 · 下拉 · Popover · 折叠面板 |
| **状态管理** | Pinia | 4.0.2 | Setup Store 语法 · DevTools 支持 |
| **工具函数** | VueUse | 14.3.0 | useStorage · useDebounce · useIntersectionObserver |
| **国际化** | chrome.i18n | — | MV3 原生双语 API（200+ MessageKey） |
| **颜色处理** | colord | 2.10.0 | 皮肤中心 HSL/RGB 转换 |
| **日期** | dayjs | 1.11.21 | 消息气泡时间戳 · 相对时间 |
| **Markdown** | marked | 15.0.12 | 聊天消息渲染 · 安全 HTML 过滤 |
| **Lodash ES** | lodash-es | 4.17.21 | 防抖节流 · 深拷贝 · 集合操作 |
| **HTTP** | fetch 原生封装 | — | ApiClient · 重试 · 超时 · SSE 解析 |
| **单元测试** | Vitest | 2.0.0 | 97/97 全通过 · jsdom 环境 · coverage v8 |
| **Lint** | ESLint | 10.8.0 | TS / Vue 文件规则 · Prettier 集成 |
| **Format** | Prettier | 3.9.6 | 统一代码风格 · import 排序 |
| **Style Lint** | Stylelint | 17.14.1 | SCSS / CSS 属性顺序（recess-order）|
| **样式** | Sass | 1.102.0 | var.scss 全局变量注入 · scoped 组件样式 |
| **Git Hooks** | husky 9 + lint-staged 17 | — | 提交前：TS 检查 · Lint · 格式化 · 单测 |
| **Commit** | commitlint + cz-git | 21.2.1 / 1.13.1 | Conventional Commits · feat/fix/docs/style/refactor/test/chore |
| **Node** | Node.js | >= 18 | ES modules · package.json "type":"module" |
| **包管理** | Yarn / pnpm | 1.22 / 9+ | 锁文件严格版本 |

---

## 11. 开发命令速查

```bash
# 安装与环境
pnpm install            # 或者 yarn install
npx husky install       # 安装 Git Hooks（首次）

# 开发模式（4 入口并行 watch）
pnpm dev                # 等价于: build:cdn + rsbuild watch + chat watch(prod) + bootstrap watch
                        # ⚠️ chat 入口强制 production 模式防 jsxDEV 冲突

# 生产构建（全量 4 入口）
pnpm build              # 顺序执行: cdn → 默认(popup+sw) → chat → bootstrap
                        # 产物目录: dist/，Chrome 加载此目录即可

# 质量门禁（3 件套，CI 阻断级）
pnpm typecheck          # vue-tsc --noEmit --skipLibCheck（0 错误必须）
pnpm lint               # ESLint + Prettier + Stylelint（全量修复）
pnpm test               # vitest run（97/97 必须全绿）
pnpm check              # 串联 typecheck + lint + test（PR 前必跑）
pnpm test:coverage      # vitest --coverage → coverage/ 报告

# 单步调试构建
pnpm build:cdn          # 仅构建 CDN utils（MAIN 世界注入基础库）
pnpm build:chat         # 仅构建聊天窗口（生产模式）
pnpm build:bootstrap    # 仅构建 Content Script 启动器
pnpm build:dev          # vue-tsc + rsbuild dev 模式

# 清理
pnpm clean              # rm -rf dist
```

---

## 12. 相关资源索引

### 12.1 项目级文档
- [YiPet/CLAUDE.md](../../../YiPet/CLAUDE.md) — 铁律 · 模块边界 · 4-Tier API · 近期变更 · 自我约束
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级约定 · RPC 信封 · 跨项目关系

### 12.2 知识库层导航
- [YiKnowledge/INDEX.md](../../INDEX.md) · [README.md](../../README.md) · [MEMORY.md](../../MEMORY.md)
- [projects/INDEX.md](../INDEX.md) — 5 项目 × 6 分类文件矩阵 · 2,450+ 文档统计
- [projects/README.md](../README.md) — 项目总览 · OKR→PRD→Dev→Test 追溯模型

### 12.3 跨项目契约（YiPet 是消费者 + 生产者）
- [YiAi 知识库](../yiai/README.md) — RPC 信封后端 · SSE 服务器 · RAG 引擎 · 翻译服务健康度
- [YiVad 知识库](../yivad/README.md) — aiChat 跨项目桥接目标 · Bug 追踪中心 · 知识深度管理
- [YiPot 知识库](../yipot/README.md) — 桌面翻译对比参考 · 翻译插件生态复用模式

### 12.4 工程角色参考
- [engineer/README.md](../../engineer/README.md) — 前端最佳实践 · 浏览器扩展安全 · 组件库设计
- [product/README.md](../../product/README.md) — 需求模板 · 用户故事 · 优先级矩阵
- [sre/README.md](../../sre/README.md) — 用户侧性能指标（LCP/CLS/INP）· 错误监控方案

---

## 13. 变更历史

| 日期 | 变更摘要 |
|------|---------|
| 2026-10-09 | **README 专业化重构**：新增 5 天入职路线图 · 双世界架构图解 + API 矩阵 · 4-Tier 分层架构图 · IPC 安全通信流程 · 84+ 功能域总览 · 4 入口 Rsbuild 构建体系 · MV3 CSP 10 项 Checklist · 高频 12 坑排查表 · CR 16 项必查 · Hard Constraints 10 必/10 禁 · 技术栈 20 项分类表 · 命令速查 |
| 2026-10-07 | 近期动态：翻译推荐 · Dashboard 汇总 · CSS 回退值统一 · 供应商健康度 |
| 2026-09-20 | workflows 31 文件标准化分类 · 架构/开发/操作/模式/流程 5 大类 |
| 2026-08-25 | 初版创建：基础索引 + 快速导航 + 4-Tier API 速查 |
