---
type: okr-goal
id: yipet-002
title: "聊天体验与 AI 能力集成"
status: in_progress
period: "2026 Q3"
owner: 陈铭
project: YiPet
project_id: yipet
progress: 95
updated: 2026-09-14
kr1: "RAG 知识库集成 — 知识树浏览/类别过滤/文件级目录级范围限定/来源预览/子问题分解/RAG 状态监控"
kr1_completion: 100
kr2: "会话管理增强 — 分支/导出 markdown/摘要模态框/自动生成标题/会话内搜索/页面感知过滤"
kr2_completion: 100
kr3: "提示词系统 — ArrowUp/ArrowDown 历史回忆/提示词历史弹出框/@ 提及文件下拉/插入选中文本"
kr3_completion: 100
kr4: "上下文感知 — ContextScopeBar/页面类型检测/页面上下文编辑器/保存到 YiKnowledge"
kr4_completion: 100
kr5: "消息增强 — 每条消息 token 芯片/成本迷你图悬停导航/流式阶段指示器/RAG 来源展示"
kr5_completion: 100
kr6: "多媒体交互 — 文本转语音朗读/语音输入/图片粘贴拖拽上传/截图与标注工具"
kr6_completion: 70
metric1_id: "yipet-m09"
metric1_desc: "RAG 检索延迟"
metric1_current: "<3s"
metric1_target: "<5s"
metric2_id: "yipet-m10"
metric2_desc: "会话管理功能覆盖率"
metric2_current: "6/6 功能"
metric2_target: "6/6 功能"
metric3_id: "yipet-m11"
metric3_desc: "聊天窗口渲染帧率"
metric3_current: "60fps"
metric3_target: "≥30fps"
metric4_id: "yipet-m12"
metric4_desc: "8K 上下文窗口利用率显示"
metric4_current: "实时可见"
metric4_target: "实时可见"
related_prds:
  - projects/yipet/prds/2026-09/29-架构设计-Markdown渲染安全.md
  - projects/yipet/prds/2026-09/30-架构设计-聊天窗口离线模式.md
  - projects/yipet/prds/2026-09/35-架构设计-注入时机优化.md
  - projects/yipet/prds/2026-09/37-架构设计-富文本编辑.md
  - projects/yipet/prds/2026-09/40-架构设计-图片粘贴拖拽上传.md
  - projects/yipet/prds/2026-09/43-架构设计-会话分支管理.md
  - projects/yipet/prds/2026-09/45-架构设计-ShadowDOM样式隔离增强.md
  - projects/yipet/prds/2026-09/47-架构设计-特性开关与AB实验.md
  - projects/yipet/prds/2026-09/50-架构设计-消息搜索与过滤.md
  - projects/yipet/prds/2026-09/51-架构设计-新手引导教程.md
  - projects/yipet/prds/2026-09/52-架构设计-页面截图AI分析.md
  - projects/yipet/prds/2026-09/53-架构设计-WebSocket实时通信.md
  - projects/yipet/prds/2026-09/56-架构设计-性能火焰图诊断.md
  - projects/yipet/prds/2026-09/57-架构设计-内存快照泄漏追踪.md
  - projects/yipet/prds/2026-09/58-架构设计-资源优先级调度.md
  - projects/yipet/prds/2026-09/59-架构设计-E2E自动化测试.md
  - projects/yipet/prds/2026-09/63-架构设计-消息引用与回复线索.md
  - projects/yipet/prds/2026-09/65-架构设计-RTL语言支持.md
  - projects/yipet/prds/2026-09/79-架构设计-长会话性能优化.md
  - projects/yipet/prds/2026-09/83-架构设计-流式渲染优化.md
  - projects/yipet/prds/2026-09/87-架构设计-智能日期格式化.md
  - projects/yipet/prds/2026-09/89-架构设计-动画帧率自适应.md
  - projects/yipet/prds/2026-09/90-架构设计-可访问性增强.md
  - projects/yipet/prds/2026-09/92-架构设计-WebWorker线程池.md
  - projects/yipet/prds/2026-09/93-架构设计-资源加载优先级.md
  - projects/yipet/prds/2026-09/95-架构设计-回复置信度标注.md
  - projects/yipet/prds/2026-09/96-基础设施-测试体系与CI.md
  - projects/yipet/prds/2026-09/105-功能实现-会话导出与迁移.md
  - projects/yipet/prds/2026-09/111-功能实现-语音输入与多媒体交互.md
  - projects/yipet/prds/2026-09/112-功能实现-动画与过渡效果系统.md
  - projects/yipet/prds/2026-09/118-功能实现-多窗口状态同步.md
  - projects/yipet/prds/2026-09/119-功能实现-对话分享与导出图片.md
  - projects/yipet/prds/2026-09/121-功能实现-会话内搜索.md
  - projects/yipet/prds/2026-09/123-功能实现-网站嵌入与集成选项.md
  - projects/yipet/prds/2026-09/124-功能实现-代码执行沙箱.md
  - projects/yipet/prds/2026-09/125-功能实现-定时提醒与日程管理.md
  - projects/yipet/prds/2026-09/128-功能实现-本地模型管理与下载.md
  - projects/yipet/prds/2026-09/134-功能实现-字体与可访问性设置.md
  - projects/yipet/prds/2026-09/155-功能实现-文本差异对比.md
  - projects/yipet/prds/2026-09/156-功能实现-正则表达式测试器.md
  - projects/yipet/prds/2026-09/207-功能实现-文本语音输入.md
---

# 聊天体验与 AI 能力集成

> Q3 最大投入目标。将 YiPet 聊天从基础对话升级为知识库驱动、会话可管理、上下文可感知的 AI 助手体验——RAG 知识库集成、6 大会话管理功能、提示词系统、上下文感知、消息增强、多媒体交互。**6 个 KR 中 5 个已完成，多媒体交互收尾中 (70%)。**

## 背景

2026-07 YiPet 聊天窗口从 YiPett 移植完成时，仅具备基础 SSE 流式对话 + 会话持久化能力。用户在浏览器中遇到问题时，聊天缺乏对页面上下文的理解，知识库完全未接入，会话管理仅有关键词搜索。Q3 重点将聊天从"能对话"升级为"好用、智能、可管理"——对标 YiVad aiChat 的核心体验，但在浮动窗口中实现。

## 关键结果

1. **RAG 知识库集成** — 知识树浏览器（侧边栏 Tree 组件）、8 个角色类别过滤器、文件级/目录级 RAG 范围限定、RAG 来源预览（预检，无 LLM 调用）、子问题分解（decompose → 子问题 + 综合答案）、RAG 状态徽章（已构建/未构建/构建中）+ 一键重建索引。`@` 提及文件下拉菜单实现键盘驱动的范围限定。
2. **会话管理增强** — 从消息分支（branchFromMessage，中途分叉线程）、导出 markdown（含 frontmatter 头部 + 消息时间线）、摘要模态框（5-8 要点流式生成）、自动生成标题（取前 4 条用户消息，LLM 生成 4-6 词标题）、会话内搜索（关键词 + 正则）、页面感知过滤器（按 hostname+pathname 过滤会话，实现跨项目记忆）。
3. **提示词系统** — ArrowUp/ArrowDown 历史回忆（内联导航，持久化 chrome.storage.local）、提示词历史弹出框（Popover 可视化选择 + 清除）、`@` 提及文件下拉菜单（实时匹配，选择自动限定 RAG 范围）、插入选中文本为提示词（任意页面选中文本 → 一键进聊天输入框）。
4. **上下文感知** — ContextScopeBar（RAG 范围芯片 + 页面上下文芯片，一眼可见发送给 LLM 的内容）、页面类型检测（自动识别 YiVad bug/story/aiChat 详情页，提供一键式上下文提示词）、PageContextEditor（编辑/预览页面上下文）、保存宠物回复到 YiKnowledge（从消费者升级为知识生产者）。
5. **消息增强** — 每条消息 token 芯片（输入/输出颜色编码 + 角色分解 tooltip）、成本迷你图（SVG 累积轨迹 + 悬停导航到对应消息）、流式阶段指示器（thinking/retrieving/streaming 3 段迷你时间线）、RAG 来源展示（在最新宠物消息下方显示检索来源 + 相关性分数）。
6. **多媒体交互** — 文本转语音朗读、语音输入、图片粘贴拖拽上传、截图与标注工具。（语音和截图功能收尾中）

## 影响

- YiPet 聊天体验从"基础对话"升级为"知识驱动、上下文感知"的 AI 助手
- 会话管理 6 大功能使 YiPet 成为跨项目对话的知识库——可按页面/项目回溯历史
- RAG 集成使 YiPet 能基于 8 个知识类别回答专业问题，日均 RAG 查询 50+ 次
- 提示词系统将用户输入效率提升 3x（历史回忆 + @ 提及 + 选中插入）