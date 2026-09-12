---
title: "ADR: YiPet Chrome MV3 Dual-World Boundary"
tags: [adr, yipet, chrome-extension, mv3, architecture]
category: leader/decisions/yipet
created: 2026-08-21
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解 Chrome MV3 双世界架构决策——为什么 ISOLATED 和 MAIN 世界必须分离，以及如何通过自注入模式建立桥梁"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../../engineer/learn/projects/yipet/01-项目-架构设计.md
---

# ADR: YiPet Chrome MV3 双世界边界架构

> **状态**：已接受 — 已通过 bootstrap 自注入模式实现
>
> 此 ADR 定义了 YiPet 扩展中 ISOLATED 与 MAIN 两个执行世界的边界规则。这一架构决策影响到 YiPet 的每一个 content script 和 DOM 操作，是理解 YiPet 架构的基础。

## 上下文

Chrome MV3 要求 content scripts 默认运行在 ISOLATED 世界中。这意味着 content scripts 共享页面 DOM，但不共享 JavaScript 全局变量。YiPet 作为页面宠物伴侣，需要同时访问两种能力：

- **页面上下文 API**（DOM 操作、`window` 全局变量）— 仅在 MAIN 世界中可用
- **Chrome 扩展 API**（`chrome.runtime`、`chrome.storage`）— 仅在 ISOLATED 世界中可用

这创造了一个根本性的能力分裂：没有任何单一执行上下文能同时拥有两种能力。任何试图在一个世界中调用另一个世界 API 的代码都会静默失败。

**典型场景**：
- Popup 向当前页面发送消息 → 需要 ISOLATED 世界的 `chrome.tabs.sendMessage`
- 宠物 DOM 元素需要在页面上渲染 → 需要 MAIN 世界的 DOM 访问
- Popup 需要读取当前页面 URL → 需要 MAIN 世界的 `window.location`

## 决策

**采用双世界架构，通过 bootstrap 自注入模式建立跨世界通信：**

### 架构层次

```
Popup (扩展 UI)
  │ chrome.tabs.sendMessage
  ▼
ISOLATED 世界 (src/content/index.ts)
  │ 在 manifest.json 中声明
  │ 拥有 chrome.runtime.* API
  │ 接收来自 popup 的消息
  │ 通过 CustomEvent 转发到 MAIN 世界
  │
  │ CustomEvent (ISOLATED → MAIN)
  │ window.postMessage (MAIN → ISOLATED)
  ▼
MAIN 世界 (src/content/bootstrap.ts)
  │ 通过 <script> 元素自注入
  │ 拥有页面上下文全局变量
  │ 托管 window.YiPet API
  │ 加载 CDN 资源
  │ 渲染宠物 DOM
```

### 边界规则

- `chrome.runtime.*` 仅在 ISOLATED 世界中可用 — 在 MAIN 世界中调用静默失败
- 页面全局变量仅在 MAIN 世界中可用 — ISOLATED 世界不可见
- 跨世界通信：ISOLATED → MAIN 通过 `CustomEvent`；MAIN → ISOLATED 通过 `window.postMessage`
- 每个源文件的代码必须明确知道自己在哪个世界中运行

### 自注入实现

MAIN 世界的内容脚本不通过 `manifest.json` 声明——它在 ISOLATED 世界的脚本运行时动态注入：

```typescript
// ISOLATED 世界 (src/content/index.ts)
const script = document.createElement('script');
script.src = chrome.runtime.getURL('content/bootstrap.js');
document.documentElement.appendChild(script);
```

这种"自注入"模式是 MV3 中唯一能在 MAIN 世界执行扩展代码的方式。

## 选择理由

- MV3 的 ISOLATED 世界是默认选项且无法选择退出
- 自注入是访问页面上下文全局变量的唯一方式
- 双向事件桥实现了 popup → content script → MAIN 世界的完整通信链路
- 边界是绝对的——每行代码必须遵守所在世界中可用的 API 集合

## 后果

### 正面影响
- 清晰的边界强制执行代码在哪运行、哪些 API 可用
- 双向事件桥实现了 popup 到页面 DOM 的完整通信
- `window.YiPet` API 为其他扩展或页面脚本提供了稳定的集成点

### 负面影响
- 调试更困难：错误出现在与源代码不同的执行上下文中
- CDN 资源必须在 MAIN 世界中通过 `chrome-extension://` URL 加载
- 所有 80+ 厂商库必须在 `web_accessible_resources` 中声明
- 新开发者容易混淆两个世界的 API 可用性——需要明确的文档指引

### 运行风险
- `window.open` 到 YiVad 可能被浏览器的弹窗拦截器阻止
- `localhost:8848` URL 硬编码——如果 YiVad 端口变更，桥接将失效

## 适用场景

- Chrome 扩展架构设计时评估 MV3 双世界模型
- 调试跨世界通信问题时理解 API 可用性边界
- 向新成员解释 YiPet 扩展的运行模型

## 常见问题

**Q: 为什么不把一切都放在 ISOLATED 世界？**
A: ISOLATED 世界无法访问页面 JavaScript 上下文，这意味着无法操作页面 DOM 的某些方面、无法读取页面全局变量、也无法与页面上的其他脚本交互。YiPet 需要在页面上渲染宠物元素——这需要 MAIN 世界的 DOM 访问能力。

**Q: 为什么不用 `window.postMessage` 进行双向通信？**
A: `window.postMessage` 可以用于双向通信，但 `CustomEvent` 从 ISOLATED 到 MAIN 更直接——事件在同一个 DOM 树上传播，不需要序列化/反序列化消息。我们使用了两种机制：ISOLATED → MAIN 用 `CustomEvent`（直接、高效），MAIN → ISOLATED 用 `window.postMessage`（MAIN 世界唯一能向 ISOLATED 世界发送消息的方式）。

## 反模式

- **混淆两个世界的 API 调用。** 最常见的问题是在 MAIN 世界中调用 `chrome.storage`——这不会抛出错误，而是静默返回 `undefined`。所有 Chrome API 调用必须严格限制在 ISOLATED 世界中
- **通过共享全局变量通信。** 两个世界不共享 JavaScript 上下文——在一个世界中设置的全局变量在另一个世界中不可见。必须使用事件机制进行跨世界通信