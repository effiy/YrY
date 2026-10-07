---
doc_type: module
prd_id: "XS-09-002"
title: "XS-09-002: 跨项目 PRD 索引 — 22 轮迭代全部需求文档目录"
status: stable
priority: P0
owner: Claude
roles: [engineer, leader, product]
created: 2026-09-23
updated: 2026-09-23
category: projects/yiai/workflows
source: internal
type: index
review_cycle: monthly
lifecycle: active
tags: [cross-project, prd-index, documentation, all-projects]
---

# XS-09-002: 跨项目 PRD 索引

> 22 轮迭代 · 21 个 PRD · 10 条数据闭环 · 27 个代码文件

## YiPot PRDs（10 个）

| # | PRD | 状态 | 核心功能 |
|---|-----|------|---------|
| 59 | 翻译分析数据完善 | ✓ | hourly_trend / provider_breakdown / top_language_pairs RPC |
| 60 | RAG 上下文展示 | ✓ | YiKnowledge → YiAi RAG → 翻译结果来源芯片 |
| 61 | 智能引擎推荐 | ✓ | provider_recommend → 健康点 + Best 徽章 |
| 62 | SSE 流式翻译 | ✓ | translate_stream → 逐字实时显示 |
| 63 | 缓存指示器 | ✓ | ⚡ Cached 紫色徽章 |
| 64 | 历史页 YiAi 分析 | ✓ | 7d 翻译量 + 语种对 + 记忆缓存统计 |
| 65 | 翻译质量统计 | ✓ | 85% 👍 好评率（绿/黄/红） |
| 66 | 分析刷新按钮 | ✓ | 🔄 手动刷新 YiAi 统计 |
| 67 | 刷新时间戳 | ✓ | "just now / 2m ago" |
| 68 | 供应商健康摘要 | ✓ | 5/5 healthy（绿/黄） |
| 69 | 语种分布摘要 | ✓ | zh en ja Top 3 目标语言 |

## YiPet PRDs（11 个）

| # | PRD | 状态 | 核心功能 |
|---|-----|------|---------|
| 101 | 个人活动统计 | ✓ | StatsBar: 会话/知识/Bug/今日 |
| 102 | 提示词模板 | ✓ | TemplatePicker: 8 模板 + 4 分类 |
| 103 | 数据新鲜度 | ✓ | 绿点脉冲 + age + 刷新按钮 |
| 104 | 翻译质量反馈 | ✓ | ChatInput 👍👎 → YiAi → YiVad Dashboard |
| 105 | 项目健康摘要 | ✓ | ProjectHealthCard: Issues/Bugs/Done/Overdue |
| 106 | 翻译快捷键 | ✓ | Ctrl+Shift+Y → translateSelection |
| 107 | 服务器状态 | ✓ | StatsBar 绿/红圆点 + uptime |
| 108 | 阅读时间估算 | ✓ | "~30s read" in MessageBubble |
| 109 | 总消息计数 | ✓ | Sidebar footer: "142 msgs" |
| 110 | 会话陈旧标记 | ✓ | "stale" 黄色徽章（7+ 天） |
| 111 | /stats 命令 | ✓ | 聊天中显示个人统计表格 |
| 112 | 项目自动标记 | ✓ | detectProject → project:YiVad 标签 |
| 113 | /sessions 命令 | ✓ | 聊天中显示最近会话列表 |

## 跨项目文档（2 个）

| # | 文档 | 内容 |
|---|------|------|
| 001 | 跨项目数据流全景 | 10 条数据闭环详细描述 |
| 002 | 跨项目 PRD 索引 | 本文档 |

## YiAi 后端变更

| 文件 | 变更 |
|------|------|
| `services/translation/context_service.py` | 新增 translate_with_context_detailed + _fetch_rag_sources |
| `services/translation/translate_service.py` | 注册 translate_with_context_detailed RPC |

## 代码文件变更

| 项目 | 文件数 | 关键模块 |
|------|--------|---------|
| YiPot | 4 | translation.ts API, TargetArea, History, yiaiAdapter |
| YiPet | 20 | StatsBar, TemplatePicker, ProjectHealthCard, ChatInput, ChatSidebar, ChatWindow, ChatToolbar, SessionListItem, MessageBubble, chat store, types, services, index, shortcuts, bubble.scss |
| YiAi | 2 | context_service, translate_service |
| YiKnowledge | 1 | 跨项目数据流全景 |

## Slash 命令（10 个）

/clear /stop /retry /export /new /compact /stats /sessions /help /name

## 10 条数据闭环

1. 翻译分析: YiPot+YiPet → YiAi MongoDB → YiVad Dashboard + YiPot History
2. 翻译反馈: YiPot+YiPet 👍👎 → YiAi → YiVad + YiPot 统计
3. 智能推荐: YiPot → provider_recommend → 健康排名
4. SSE 流式: YiPot → translate_stream → 逐字显示
5. RAG 上下文: YiKnowledge → YiAi RAG → YiPot 来源芯片
6. 项目健康: YiPet → /dashboard/summary → 健康卡片
7. 记忆缓存: YiPot → memory_service → ⚡ Cached
8. 个人活动: YiPet → sessions/bugs/knowledge → StatsBar
9. 提示词模板: YiPet TemplatePicker → chat_service
10. 服务器状态: YiPet → /dashboard/live-snapshot → 绿/红点