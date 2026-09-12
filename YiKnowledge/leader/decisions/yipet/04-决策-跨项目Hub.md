---
title: "ADR: YiPet Cross-Project Hub — Bug Reporting, Bridges, Navigation"
tags: [adr, yipet, cross-project, bug-reporting, bridge, navigation]
category: leader/decisions/yipet
created: 2026-08-24
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解跨项目 Hub 设计——通过缺陷报告、会话桥接和上下文感知导航将 YiPet 定位为 Yi 家族生态的浏览器入口"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ./chrome-mv3-dual-world.md
---

# ADR: YiPet 跨项目 Hub — 缺陷报告、桥接与导航

> **状态**：已接受 (2026-08-05) — 已实施

## 上下文

YiPet 作为浏览器扩展运行在任意网页上，但 Yi 家族还有两个其他界面：YiVad（管理后台）和 YiKnowledge（markdown 知识库）。用户需要在三个界面之间无缝切换——在任意网页上报告缺陷、从聊天窗口打开 YiVad 会话、导航到项目仪表盘。

**核心问题**：YiPet 应该是一个独立的聊天工具，还是整个 Yi 家族生态的浏览器入口？

两种方案的差异：
- **独立聊天工具**：YiPet 仅提供聊天功能，与 YiVad 和 YiKnowledge 无直接交互
- **生态入口**：YiPet 成为连接任意网页与 Yi 家族服务的桥梁，用户在任何浏览器页面上都能接入 Yi 生态

## 决策

**将 YiPet 定位为跨项目 Hub——浏览器扩展作为 Yi 家族生态的入口，通过缺陷报告、会话种子和上下文感知导航连接 YiVad 和 YiKnowledge。**

### 架构设计

```
YiPet（浏览器扩展，运行在任意网页上）
  │
  ├── 缺陷报告
  │   ├── BugReportDialog → 表单（严重程度/优先级/状态/类型/...）
  │   ├── 元数据 → MongoDB bugs 集合
  │   └── 长文描述 → YiKnowledge/lessons/failures/bugs/<key>.md
  │
  ├── 跨项目桥接
  │   ├── YiVad aiChat 桥接 → 生成会话 → window.open YiVad/#/aiChat?session=<key>
  │   ├── 逐消息导出 → "在 YiVad aiChat 中打开"按钮
  │   └── 页面感知上下文 → 检测 YiVad 详情页，提供上下文提示词
  │
  └── 导航
      ├── 跨项目下拉菜单 → YiAi、YiVad、aiChat 等链接
      └── 最近缺陷侧边栏标签 → 列出最近 30 条，点击 → YiVad 详情页
```

### 关键设计决策

1. **双写缺陷报告**：元数据（严重程度、优先级、指派人、标签）写入 MongoDB `bugs` 集合以支持结构化查询。长文描述（问题描述、复现步骤、预期行为、实际行为）写入 `YiKnowledge/lessons/failures/bugs/<key>.md` 以支持 RAG 索引。这种分离既保留了结构化数据的高效查询能力，又让叙述性内容可通过 RAG 搜索。
   - MongoDB 侧：可按严重程度、状态、指派人等维度查询和排序
   - YiKnowledge 侧：缺陷描述可被 RAG 引擎索引，未来的相似缺陷可通过语义搜索找到
   - 双写风险：两个写入点（MongoDB + 文件系统）意味着存在部分失败的可能——需要处理不一致的情况

2. **会话种子桥接到 YiVad**：不在扩展中构建完整的 aiChat UI，而是通过 `SessionService.create` 生成带页面上下文（URL、标题、内容）的会话，然后通过 `window.open` 打开 YiVad 的 aiChat 页面并传入会话 key。YiVad 负责完整的 agent 模式 UI；YiPet 是入口。
   - 避免了在扩展中重复 YiVad 的 agent UI
   - 保持 agent 模式的权威实现在 YiVad 中

3. **页面感知上下文检测**：`detectProjectFromUrl` 检查当前页面 URL 判断是否为 YiVad 详情页（缺陷、需求等）。如果是，则提供上下文感知的一键提示词："讨论缺陷 <key>"、"总结 <key>"、"带我浏览 <key>"。

4. **页面感知会话过滤**：`EnvironmentOutlined` 按钮过滤会话列表，仅显示当前页面（hostname + pathname + hash-path）的会话。让用户看到限定于当前页面的对话历史。

5. **最近缺陷侧边栏标签**：第四个侧边栏标签，列出 MongoDB 中最近 30 条缺陷。点击打开 YiVad 详情页；"讨论"按钮从缺陷的 `contentPath` 填充聊天输入和 RAG 范围。

## 后果

### 正面影响
- YiPet 成为生态入口——用户无需离开当前页面即可接入 Yi 家族服务
- 缺陷报告在任意网页上可用——不再局限于开发者工具
- 上下文感知提示词降低了常见操作的摩擦

### 负面影响
- YiPet 现在依赖 YiVad 可用来显示详情视图——如果 YiVad 不可用，缺陷详情和 aiChat 桥接将失效
- 双写缺陷报告有两个故障点（MongoDB + 文件系统）——需要处理部分写入失败的场景
- 代码路径更复杂——YiPet 的功能边界从"聊天"扩展到了"导航 + 缺陷报告 + 桥接"

### 风险
- `window.open` 到 YiVad 可能被弹窗拦截器阻止
- `localhost:8848` URL 硬编码——如果 YiVad 端口变更，桥接将失效（需要环境变量配置化）
- 跨项目依赖增加了测试复杂度（需要 YiVad 运行才能验证桥接）

## 替代方案

1. **在 YiPet 中构建完整的 aiChat UI** — 拒绝。理由：这会重复 YiVad 的 agent 模式 UI；会话种子桥接更轻量，且将权威 UI 保持在一个地方
2. **缺陷报告仅写入 MongoDB** — 拒绝。理由：叙述性的缺陷描述对 RAG 索引有价值——未来的相似缺陷可通过语义搜索在 YiKnowledge 中找到
3. **无跨项目桥接（独立模式）** — 拒绝。理由：这使 YiPet 成为孤岛；生态系统的价值在于桥接

## 适用场景

- Chrome 扩展作为更大生态系统入口的架构设计参考
- 跨项目数据流设计——结构化数据与叙述性内容的分离存储
- 上下文感知功能设计——基于页面 URL 提供定制化交互

## 反模式

- **在扩展中重复已有的界面。** YiVad 的 agent 模式 UI 已经很成熟——在 YiPet 中重建它是维护噩梦。桥接模式尊重了"谁更擅长什么就让谁做"的原则
- **忽视跨项目依赖的故障模式。** YiPet 依赖 YiVad 可用——如果这一依赖在将来成为问题，需要考虑降级方案（如在 YiPet 中提供基础的只读缺陷视图）