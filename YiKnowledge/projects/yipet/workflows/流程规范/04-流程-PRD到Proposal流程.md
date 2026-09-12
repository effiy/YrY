---
title: PRD 到 Proposal 流程
tags: [yipet, workflow, prd, proposal, openspec]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-10
source: YiPet
type: workflow
status: active
---

# PRD 到 Proposal 流程

> 从需求到 Proposal 的结构化提炼流程，减少理解偏差，加速代码库碰撞。
>
> 本流程定义如何将产品需求（PRD、Jira、口述）转化为可执行的开发提案（Proposal）。

## 流程

```
需求输入（PRD/Jira/口述）
  │
  ▼  第一层：结构化提取 → 用户确认
提炼后的需求摘要
  │
  ▼  第二层：代码库碰撞（并行子代理）
影响分析 + 现有能力匹配
  │
  ▼  第三层：组装 Proposal
proposal.md
```

## 第一层：需求结构化提取

不管需求来源，先提炼为以下统一格式：

```markdown
## 需求摘要

### 业务背景
[一段话：为什么做这件事，解决了什么问题]

### 核心功能点
1. [功能1]: [简要描述 + 类型标注（Content Script/Service Worker/Popup/组件）]
2. [功能2]: [简要描述]
...

### 约束条件
- [约束1: 如"使用 ApiClient 四层封装调用 API"]
- [约束2: 如"区分 ISOLATED 和 MAIN world 执行边界"]
- [约束3: 如"支持中英文国际化"]
...

### 待确认项
- [ ] [待确认1: 如"Chrome API 权限待确认"]
- [ ] [待确认2: 如"接口字段兼容需后端确认"]
...
```

**确认卡点**：提炼完成后暂停，让用户确认/补充后再进入第二层。
**待确认项未全部解决前，不进入 design 阶段。**

## 第二层：代码库碰撞

并行启动子代理搜索四个维度：

| 子代理 | 搜索目标 | 输出到 Proposal 的哪部分 |
|--------|----------|--------------------------|
| 搜现有模块 | 代码中是否已有类似功能/组件（`src/`） | 影响范围 |
| 搜 API | 是否已有可复用 ApiClient 方法 | 依赖 + API 变更 |
| 搜 i18n/Chrome API | 已有语言 key 和 Chrome API 权限 | 依赖模块 |
| 搜 spec | `YiKnowledge/projects/yipet/specs/` 中的已有规范 | 规范引用 |

### 搜索清单

- **组件**：`src/components/` 中是否有可复用组件
- **ApiClient**：`src/api/` 中是否有可复用 API 方法
- **Chat Store**：`src/chat/stores/` 中是否有相关状态管理
- **IPC Relay**：`src/content/ipc/` 中是否有相关消息类型
- **Store**：`src/stores/` 中是否有相关状态
- **国际化**：`src/locales/` 中是否有已有 key
- **Chrome API**：`manifest.json` 中已有权限声明
- **规范**：`YiKnowledge/projects/yipet/specs/` 中相关规范

## 第三层：组装 Proposal

将前两层输出组装为标准 Proposal 格式：

```markdown
# Proposal: [需求名称]

## Why
[业务背景：为什么做这件事]

## What Changes
[核心变更列表]

### 组件变更
- [组件]: [新增/修改/复用]（Content Script | Service Worker | Popup）

### API 变更
- [ApiClient 方法]: [新增/修改/复用]

### IPC 变更
- [消息类型]: [新增/修改]

### Chrome API 变更
- [权限]: [新增/修改]

## Capabilities
[新增或修改的能力]

## Dependencies
[依赖的现有模块、API、组件、Chrome API]

## Impact
[影响范围：哪些文件需要修改，双世界执行边界是否变化]
```

## 使用方式

在 Claude Code 中：

```
你: 从这份需求生成 Proposal [粘贴/描述需求]
我:
  1. 做需求结构化提取，输出给你确认
  2. 你确认后，并行搜索代码库
  3. 组装 proposal.md
  4. 你审阅
```

## YiPet 特定注意事项

### 模块类型与规范映射

| 模块类型 | 遵循规范 | 核心模式 |
|----------|----------|----------|
| Content Script | `specs/architecture/extension-arch/规范.md` | MAIN world + DOM 操作 |
| Service Worker | `specs/architecture/extension-arch/规范.md` | ISOLATED world + chrome.* API |
| API 调用 | `specs/architecture/api/规范.md` | ApiClient 四层封装 |
| 聊天组件 | `specs/patterns/chat-controller/规范.md` | Chat Store（Pinia）状态管理 |
| IPC 通信 | `specs/architecture/extension-arch/规范.md` | IPC Relay（action-based + dispatchSecureEvent + IPC_SECRET） |
| 国际化 | `specs/architecture/i18n/规范.md` | Vue-i18n + chrome.i18n |

### 强制约束检查

- API 调用必须通过 ApiClient 四层封装，不直接使用 fetch
- Chrome API 调用区分 ISOLATED 和 MAIN world 执行边界
- Content Script 和 Service Worker 不共享状态
- IPC Relay 消息必须通过 IPC_SECRET + 时间戳验证（3 层：来源标记、签名匹配、5 秒过期）
- 所有文本必须使用国际化（Vue-i18n）
- 参数名遵守跨项目 RPC 契约（`filter` 而非 `query`，`target_file` 而非 `path`）
- SSE 流式响应有断连检测和 token 缓冲

### 双世界执行边界

```
Service Worker                         ISOLATED World（Content Script）     MAIN World（页面注入）
├── chrome.runtime.* API              ├── chrome.runtime.* API            ├── DOM 操作
├── chrome.storage.* API              ├── chrome.storage.* API            ├── window.* API
├── chrome.tabs.* API                 ├── chrome.tabs.* API（通过 SW）     ├── 页面注入
├── fetch（ApiClient）                ├── fetch（ApiClient）              ├── 事件监听
└── 不能访问页面 DOM                    └── 不能直接操作页面 DOM              └── 不能访问 chrome.* API

通信方式：
  Popup → Content Script:  chrome.tabs.sendMessage({ action: 'setRole', ... })
  Content Script → MAIN:   dispatchSecureEvent（CustomEvent + IPC_SECRET）
  Content Script → SW:     chrome.runtime.sendMessage({ action: ... })
```

## 与需求状态的关系

- 需求提取完成后，状态设为 `proposed`
- 待确认项全部解决后才推进到 `designing`
- Proposal 完成后进入 `implementing`
- 实现完成并验证后进入 `done`