---
title: YiPet 缺陷索引
tags: [yipet, bugs, index, defect-tracking, chrome-extension]
category: projects/yipet/bugs
created: 2026-09-07
updated: 2026-09-23
source: YiPet
type: bug-index
status: active
---

# YiPet 缺陷追踪

> Chrome 扩展缺陷记录，按月份 → 分类归档。每个缺陷包含复现步骤、根因分析、修复方案和预防措施。

## 目录结构

```
bugs/
├── README.md
├── 2026-07/
│   └── 模板/
├── 2026-08/
│   └── 模板/
└── 2026-09/
    ├── 模板/
    ├── 代码质量/
    ├── 内容脚本/
    ├── 安全/
    ├── 接口/
    ├── 构建/
    ├── 状态/
    ├── 聊天/
    └── Service-Worker/
```

## 严重度

| 严重度 | 定义 |
|--------|------|
| **critical** | 扩展不可用、数据丢失或安全漏洞 |
| **major** | 核心功能不可用，但扩展可基本运行 |
| **minor** | 功能受损但不影响核心流程 |
| **trivial** | 视觉瑕疵、文案错误 |

## 优先级

| 优先级 | 响应 |
|--------|------|
| **P0** | 即时修复，阻塞发布 |
| **P1** | 下一迭代 |
| **P2** | 计划内修复 |
| **P3** | 积压待排 |

## 生命周期

```
open → analyzing → in_progress → resolved → verified → closed
  │                                              │
  └── cannot_reproduce / wont_fix                └── 验证失败 → open
```

## 缺陷列表

| 月份 | ID | 标题 | 严重度 | 优先级 | 分类 | 模块 | 状态 | 日期 |
|------|----|------|--------|--------|------|------|------|------|
| 2026-09 | 1 | [SPA 路由切换后宠物消失](./2026-09/内容脚本/001-内容脚本-SPA路由切换宠物注入失败.md) | major | p1 | content | src/content/rendering/overlay.ts | resolved | 2026-09-05 |
| 2026-09 | 2 | [Service Worker 空闲终止后 IPC 消息丢失](./2026-09/Service-Worker/01-Service-Worker-空闲终止IPC消息丢失.md) | major | p1 | worker | src/background/index.ts | resolved | 2026-09-04 |
| 2026-09 | 3 | [SSE 流式响应断连后未自动重连](./2026-09/聊天/001-聊天-SSE断连未自动重连.md) | major | p1 | chat | src/api/client.ts | resolved | 2026-09-06 |
| 2026-09 | 4 | [ApiClient 绕过导致参数名使用 query 而非 filter](./2026-09/接口/001-接口-ApiClient绕过导致RPC参数名错误.md) | minor | p2 | api | src/api/services/sessions.ts | resolved | 2026-09-07 |
| 2026-09 | 5 | [标签页后台隐藏后状态未冻结](./2026-09/状态/001-状态-标签页后台隐藏后状态未冻结.md) | major | p1 | state | src/chat/stores/chat.ts | resolved | 2026-09-07 |
| 2026-09 | 6 | [扩展更新后 CDN 资源 404](./2026-09/构建/001-构建-扩展更新后CDN资源加载失败.md) | major | p1 | build | src/content/cdn/injector.ts | resolved | 2026-09-07 |
| 2026-09 | 7 | [IPC postMessage 未限制消息接收方](./2026-09/安全/001-安全-跨世界IPC通信Token泄漏风险.md) | critical | p0 | security | src/content/ipc/relay.ts | resolved | 2026-09-07 |
| 2026-09 | 8 | [createPopupConfig 未从 popup/data 导出](./2026-09/接口/002-接口-createPopupConfig-not-exported.md) | minor | p3 | api | src/popup/data.ts | closed | 2026-09-09 |
| 2026-09 | 9 | [chat/utils.ts 使用已弃用的 escape/unescape 函数](./2026-09/代码质量/009-代码质量-使用已废弃的escape-unescape.md) | trivial | p3 | code-quality | src/chat/utils.ts | closed | 2026-09-09 |
| 2026-09 | 10 | [多个 composable/hook 模块存在死代码](./2026-09/代码质量/055-代码质量-未使用的composables死代码.md) | trivial | p3 | code-quality | src/chat/composables/ + src/hooks/ | open | 2026-09-09 |
| 2026-09 | 11 | [chrome.storage.local 写入未处理配额超限](./2026-09/代码质量/011-代码质量-chrome-storage配额未处理.md) | minor | p2 | code-quality | src/chat/stores/chat.ts + 5 files | open | 2026-09-09 |
| 2026-09 | 12 | [chat/stores/chat.ts 超大 Store 文件](./2026-09/代码质量/001-代码质量-chat-store体积过大.md) | minor | p2 | code-quality | src/chat/stores/chat.ts | open | 2026-09-09 |
| 2026-09 | 13 | [content/state/persistence.ts chrome.storage 调用无错误恢复](./2026-09/代码质量/002-代码质量-storage持久化静默失败.md) | minor | p2 | code-quality | src/content/state/persistence.ts | closed | 2026-09-09 |
| 2026-09 | 14 | [Mermaid SVG 和更新横幅使用 innerHTML 注入 DOM](./2026-09/代码质量/003-代码质量-innerHTML注入风险.md) | trivial | p3 | code-quality | src/chat/utils.ts, src/content/rendering | open | 2026-09-09 |
| 2026-09 | 15 | [背景脚本消息处理缺少超时保护](./2026-09/代码质量/004-代码质量-background消息无超时.md) | trivial | p3 | code-quality | src/background/index.ts | closed | 2026-09-09 |
| 2026-09 | 16 | [connect-src CSP 硬编码为 localhost 限制生产部署](./2026-09/代码质量/005-代码质量-CSP-connect-src硬编码localhost.md) | minor | p2 | code-quality | manifest.json + build plugin | closed | 2026-09-09 |
| 2026-09 | 17 | [内容脚本注入缺少已存在性检查可能重复注入](./2026-09/代码质量/006-代码质量-content-script重复注入.md) | trivial | p3 | code-quality | src/content/bootstrap.ts | closed | 2026-09-09 |
| 2026-09 | 18 | [Service Worker onInstalled 向所有标签页广播更新通知](./2026-09/代码质量/007-代码质量-broadcast更新所有标签页.md) | trivial | p3 | code-quality | src/background/index.ts | open | 2026-09-09 |
| 2026-09 | 19 | [chrome.storage.local 存储键分散且命名不一致](./2026-09/代码质量/008-代码质量-storage键命名不一致.md) | trivial | p3 | code-quality | 7 个文件 | open | 2026-09-09 |
| 2026-09 | 29 | [requestIdleCallback 未设置超时可能导致无限延期](./2026-09/代码质量/019-代码质量-requestIdleCallback无超时.md) | trivial | p3 | code-quality | src/content/bootstrap.ts | open | 2026-09-09 |
| 2026-09 | 63 | [CDN 中包含已停止维护的库](./2026-09/代码质量/053-代码质量-CDN库无人维护.md) | trivial | p3 | code-quality | cdn/catalog.ts | open | 2026-09-09 |
| 2026-09 | 64 | [RAG 检索摘要可能显示 undefined](./2026-09/代码质量/058-代码质量-RAG检索摘要undefined.md) | minor | p2 | code-quality | src/chat/stores/chat.ts | resolved | 2026-09-23 |
| 2026-09 | 65 | [promptHistory 存储键名不一致与双重序列化](./2026-09/代码质量/059-代码质量-promptHistory存储键名不一致.md) | medium | p1 | code-quality | src/chat/stores/chat.ts | resolved | 2026-09-23 |
| 2026-09 | 66 | [_persistSetting 与 _loadPersistedState 6键前缀不一致](./2026-09/代码质量/060-代码质量-存储键名前缀不一致.md) | high | p1 | code-quality | src/chat/stores/chat.ts | resolved | 2026-09-23 |
| 2026-09 | 67 | [Mermaid 安全级别设为 loose](./2026-09/代码质量/061-代码质量-Mermaid安全级别loose.md) | medium | p1 | security | src/chat/utils.ts | resolved | 2026-09-23 |
| 2026-09 | 68 | [decodeHTMLEntities 使用 innerHTML XSS 风险](./2026-09/代码质量/062-代码质量-decodeHTMLEntities-XSS风险.md) | minor | p2 | security | src/shared/utility-tools.ts | resolved | 2026-09-23 |
| 2026-09 | 69 | [CDN loadCSS 重复标记 + onload 死代码](./2026-09/代码质量/063-代码质量-CDN-loadCSS重复标记.md) | minor | p2 | code-quality | src/content/cdn/injector.ts | resolved | 2026-09-23 |
| 2026-09 | 70 | [relay.ts apiBase 硬编码错误端口](./2026-09/代码质量/064-代码质量-relay-apiBase硬编码错误端口.md) | medium | p1 | api | src/content/ipc/relay.ts | resolved | 2026-09-23 |
| 2026-09 | 71 | [bootstrap.ts 3处双分号笔误](./2026-09/代码质量/065-代码质量-bootstrap双分号笔误.md) | trivial | p3 | code-quality | src/content/bootstrap.ts | resolved | 2026-09-23 |
| 2026-09 | 72 | [会话压缩绕过 ApiClient 直接 fetch](./2026-09/代码质量/066-代码质量-compaction绕过ApiClient.md) | critical | p0 | api | src/chat/composables/useConversationCompact.ts | resolved | 2026-09-23 |
| 2026-09 | 73 | [死代码扫描 — enums/createPopupConfig/TodoItem](./2026-09/代码质量/067-代码质量-死代码扫描.md) | trivial | p3 | code-quality | src/enums/ src/popup/data.ts | resolved | 2026-09-23 |
| 2026-09 | 74 | [MessageKey 类型中 aboutFeatureI18n 重复定义](./2026-09/代码质量/068-代码质量-MessageKey重复定义.md) | trivial | p3 | code-quality | src/shared/i18n/index.ts | resolved | 2026-09-23 |
| 2026-09 | 75 | [requestIdleCallback 未设置 timeout](./2026-09/代码质量/069-代码质量-requestIdleCallback无超时.md) | minor | p2 | code-quality | src/content/bootstrap.ts | resolved | 2026-09-23 |
| 2026-09 | 76 | [更新横幅 innerHTML + onclick CSP 违规](./2026-09/代码质量/070-代码质量-更新横幅innerHTML内联onclick.md) | minor | p2 | code-quality | src/content/rendering/overlay.ts | resolved | 2026-09-23 |

## 分类目录

| 分类 | 路径示例 | 说明 |
|------|------|------|
| Content Script | `2026-09/内容脚本/` | 注入失败、SPA 路由切换、DOM 操作 |
| Service Worker | `2026-09/Service-Worker/` | 生命周期、IPC 消息丢失、心跳保活 |
| Chat Window | `2026-09/聊天/` | SSE 流式断连、消息渲染、重连策略 |
| API 通信 | `2026-09/接口/` | ApiClient 绕过、RPC 参数名、重试策略 |
| 状态管理 | `2026-09/状态/` | 标签页恢复、多标签页冲突、状态过期 |
| 构建部署 | `2026-09/构建/` | CDN 资源加载、扩展更新、manifest 配置 |
| 安全 | `2026-09/安全/` | IPC 通信安全、Token 存储、CSP |
| 代码质量 | `2026-09/代码质量/` | 死代码、弃用 API、类型安全、存储配额 |
| 模板 | `{月份}/模板/` | 缺陷记录模板（每月一份） |

> 新缺陷按 `{月份}/{分类}/` 归类，分类目录不存在时创建。

## 缺陷模板

使用 [缺陷记录模板](./2026-09/模板/00-模板-扩展bug模板.md) 参考创建新缺陷记录。

### 命名规范

```
{月份}/{分类}/{序号}-{分类}-{描述}.md
```

### 必要字段

每个缺陷文件必须包含：现象、复现步骤、环境信息、根因分析、修复方案、验证方法、预防措施。

## 分类统计

| 严重度 | 数量 | 缺陷 |
|--------|------|------|
| critical | 2 | #7, #72 |
| major | 5 | #1, #2, #3, #5, #6 |
| medium | 3 | #65, #67, #70 |
| minor | 8 | #4, #8, #11, #12, #13, #16, #64, #68, #69 |
| trivial | 9 | #9, #10, #14, #15, #17, #18, #29, #63, #71, #73, #74 |

| 分类 | 数量 | 缺陷 |
|------|------|------|
| content | 1 | #1 |
| worker | 1 | #2 |
| chat | 1 | #3 |
| api | 3 | #4, #8, #70, #72 |
| state | 1 | #5 |
| build | 1 | #6 |
| security | 3 | #7, #67, #68 |
| code-quality | 18 | #9–#19, #29, #63–#66, #69, #71, #73, #74 |

## 常见缺陷模式

### Content Script（内容脚本/）

- **SPA 路由切换**：`history.pushState` / `popstate` 事件未监听，宠物在 SPA 页面切换后消失。使用 MutationObserver 或路由事件监听页面变化重新注入。
- **DOM 操作时机**：在 `document.readyState === 'loading'` 时操作 DOM 导致元素未找到。始终等待 `DOMContentLoaded` 或检查 readyState。

### Service Worker（Service-Worker/）

- **空闲终止**：SW 被 Chrome 自动终止后，`chrome.runtime.onMessage` 监听器丢失。使用 `chrome.runtime.connect` 长连接保持心跳。
- **IPC 消息丢失**：`chrome.tabs.sendMessage` 在 SW 空闲终止后无响应。使用 `sendMessage` 的 callback 参数检测超时。

### Chat Window（聊天/）

- **SSE 断连**：弱网环境下 SSE `reader.read()` Promise 被浏览器挂起，无自动重连。实现指数退避重连策略。
- **消息不完整**：SSE 流中断时已接收的部分内容未标记为截断。在 `done` 帧未到达时标记消息为 incomplete。

### API 通信（接口/）

- **RPC 参数名**：`data_service.query_documents` 使用 `query` 而非 `filter`，后端静默忽略。始终使用 `filter` 参数名。
- **ApiClient 绕过**：直接使用 `fetch` 而非 `ApiClient`，跳过重试和错误处理。所有 API 调用必须通过 `ApiClient`。

### 安全（安全/）

- **IPC 消息广播**：`window.postMessage` 使用 `'*'` 作为 targetOrigin，页面脚本可窃听。始终指定明确的 targetOrigin 并使用 IPC_SECRET 校验。
- **Token 存储**：Token 存储在 `localStorage` 可能被页面脚本读取。使用 `chrome.storage.local` 隔离存储。

### 排查流程

1. 确认问题复现环境（Chrome 版本、OS、MV3 状态）
2. 检查 Chrome DevTools Console 中 YiPet 相关日志
3. 检查 Service Worker 状态（chrome://serviceworker-internals/）
4. 检查 chrome.storage.local 中的数据状态
5. 使用 `window.YiPet.help()` 验证 CDN 资源加载状态
6. 对比预期行为与实际行为，定位根因层级（Content Script / Service Worker / Chat Window）
7. 根据根因归入对应分类目录

## 相关资源

- [YiVad 缺陷索引](../yivad/bugs/README.md)
- [YiAi 缺陷索引](../yiai/bugs/README.md)
- [架构设计](../workflows/架构设计/)
- [API 层架构](../workflows/开发规范/02-规范-API层架构.md)
- [IPC 通信架构](../workflows/架构设计/006-架构-IPC跨世界通信.md)