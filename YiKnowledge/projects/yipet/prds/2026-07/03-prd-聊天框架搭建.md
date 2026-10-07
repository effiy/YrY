---
title: "YP-07-03: 聊天框架搭建 — 四层 API 架构 / SSE 流式 / 状态管理"
tags: [需求文档, 聊天框架, API架构, SSE, Chrome扩展, 前端]
category: 项目/浏览器扩展/需求
created: 2026-07-27
updated: 2026-09-16
source: 内部
type: 需求
status: 已完成
priority: P0
project: YiPet
project_id: yipet
owner: 陈铭
prd_month: "202607"
prd_task_id: YP-07-03
estimate_frontend: 2.0
review_status: 已评审
issue_type: 功能
roles: [engineer]
source_okr: [yipet-002]
related_modules: [03-prd-task-聊天框架搭建]
related_tests: [03-prd-test-聊天框架搭建]
---

# YP-07-03: 聊天框架搭建

> 需求编号：YP-07-03 · 优先级：P0 · 人天：2.0d · 状态：已完成
> 依赖：YP-07-01（技术栈迁移，React 18 + TypeScript + Rsbuild）

---

## 一、背景

YiPet 继承自 YiPett（React 15 遗留代码），七月前仅能注入宠物动画覆盖层，无任何交互能力。需搭建基础聊天框架，使 YiPet 具备与 YiAi 通信、发送消息、SSE 流式接收、持久化会话的核心能力。

### 痛点

| 痛点 | 严重度 | 影响 |
|------|--------|------|
| 无 API 通信层 | **致命** | 无法与 YiAi 通信，扩展完全孤立 |
| 无聊天 UI | 高 | 用户无法输入消息、查看回复 |
| 无状态管理 | 高 | 消息/会话/流式状态无处存储 |
| 无会话持久化 | 高 | 刷新后历史丢失 |
| 无流式处理 | 高 | 无法接收 SSE 流式回复 |

---

## 二、用户故事

| ID | 作为 | 我想要 | 以便 | 优先级 |
|----|------|--------|------|--------|
| US-01 | 用户 | 在任意网页打开聊天窗口，输入消息并流式查看 AI 回复 | 在浏览网页时随时获得 AI 辅助 | **P0** |
| US-02 | 用户 | 聊天窗口独立于弹出窗口 | 切换网页不影响正在进行的对话 | **P0** |
| US-03 | 开发者 | 使用统一的四层 API 架构调用后端 | 类型安全、错误处理一致、与 YiVad 开发模式统一 | **P0** |
| US-04 | 用户 | 刷新页面后恢复聊天历史 | 不丢失对话记录 | P1 |

---

## 三、功能需求

### FR-01：四层 API 架构

| 层 | 文件 | 职责 |
|----|------|------|
| Client | `ApiClient` | fetch/SSE/RPC 信封封装、X-Token 注入、错误映射 |
| Endpoints | `endpoints/` | RPC 方法路径常量 |
| Types | `types/` | 请求/响应 TypeScript 接口 |
| Services | `services/` | 业务调用封装（Chat/Session/Data/Knowledge） |

### FR-02：SSE 流式聊天

| 属性 | 描述 |
|------|------|
| RPC 调用 | `ApiClient.stream("services.ai.chat_service", "chat", params)` |
| 流式解析 | `fetch` + `ReadableStream` → 逐 token yield |
| 中断 | `AbortController.abort()` 取消连接 |

### FR-03：独立聊天窗口

| 属性 | 描述 |
|------|------|
| 入口 | `chat/index.ts` — 独立 iframe 页面 |
| 布局 | 侧边栏 + 聊天区域 + 输入框，可拖拽调整大小 |
| 持久化 | 不受 Popup 生命周期影响 |

### FR-04：状态管理

| 属性 | 描述 |
|------|------|
| 方案 | `useChatStore` (Pinia setup-function)，通过 `chrome.storage.local` 持久化 |
| 状态 | conversations, activeKey, messages, sending, streamingPhase, input |

---

## 四、非功能需求

| 指标 | 目标 |
|------|------|
| 首 Token 延迟 | < 2s（取决于 YiAi 后端） |
| 消息持久化 | < 50ms（chrome.storage.local） |
| API 类型安全 | `tsc --noEmit` 通过 |
| 内存占用 | < 100MB（Chrome 扩展限制） |

---

## 五、验收标准

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | 用户在任意网页 | 点击 YiPet 图标 → 打开聊天 | 独立窗口显示聊天界面 |
| AC-02 | 输入框有文本 | Enter 发送 | 消息显示 + AI 流式回复 |
| AC-03 | AI 正在回复 | 关闭聊天窗口 | 对话不被中断（独立 iframe） |
| AC-04 | 有对话历史 | 刷新页面 | 会话和消息完整恢复 |
| AC-05 | `tsc --noEmit` | CI 运行 | 零类型错误 |

---

## 六、不做

| 项目 | 后续 |
|------|------|
| 提示词历史 | YP-08-01 |
| 会话分支/导出/搜索 | YP-08-01 |
| RAG 知识库集成 | YP-08-02 |
| 跨项目桥接 | YP-08-04 |

---

*关联：[开发方案](../../devs/2026-07/03-prd-task-聊天框架搭建.md) · [测试规格](../../tests/2026-07/03-prd-test-聊天框架搭建.md)*