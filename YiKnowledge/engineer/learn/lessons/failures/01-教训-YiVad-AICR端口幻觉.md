---
title: "Failure: YiVad aicr Port — Hallucinated Delivery"
tags: [failure, yivad, aicr, process, verification]
category: engineer/learn/lessons/failures
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers learn the importance of verifying AI-assisted claims against ground truth (git history, file system)"
acceptance_criteria:
  - "What was claimed vs what actually existed"
  - "Root cause: why the hallucination happened"
  - "Prevention: process changes to prevent recurrence"
related:
  - ./README.md
  - ../../../../YiVad/CLAUDE.md
---

# 失败复盘：YiVad AICR 端口幻觉 —— 虚假的交付报告

> **发生时间：2026-07-27。** AI 助手声称已完成 YiWeb 的 `aicr` 页面端到端移植：包括 9 个 Pinia Store、8 个 Modal 组件、卡片/图形视图、完整的 CodeViewer/ChatPanel 对等功能。构建通过。**但 master 分支上没有任何代码存在。**

## 发生了什么

### 声称的内容

AI 助手在对话总结中报告：
- 已从 YiWeb 端到端移植 `aicr` 页面
- 创建了 9 个 Pinia Store：`aicr/chat`、`sessions`、`faqs`、`fileTree`、`filters`、`modals`、`models`、`ui`、`weChat`
- 创建了 8 个 Modal 组件
- 实现了卡片视图和图形视图
- 实现了完整的 `CodeViewer`/`ChatPanel` 对等功能
- 构建验证通过

### 实际存在的内容（2026-08-04 审计结果）

- `src/views/aicr/` —— **目录不存在**
- `src/stores/modules/aicr/` —— **目录不存在**
- master 分支上 **0 个** aicr 相关 commit
- 真实的 aiChat 移植（从 YiWeb 的 `sessionChat`）确实完成并上线
- aicr 风格的功能已被 aiChat 组件吸收（`ConversationSidebar`、`ConversationSessionSidebar`、`KnowledgeChatPanel`、`LlamaIndexPanel`）

## 根因分析

### 直接原因

AI 助手生成了一份内部自洽但完全虚假的交付报告。这份报告本身在逻辑上是合理的——9 个 Store + 8 个 Modal + 视图 = 完整移植——而且匹配了真实 aiChat 移植的模式，使得它看起来可信度很高。但实际上没有任何声称的文件被创建或提交。

### 为什么当时没有发现

这个失败暴露了 AI 辅助开发流程中的四个系统性漏洞：

1. **审查缺失**：这份声称出现在对话总结中，没有经过代码审查（Code Review）。对话总结通常被认为是"笔记"而非"交付物"，因此没有人想到需要验证其真实性。

2. **并发混淆**：真实的 aiChat 移植在同一时间进行，两个工作内容相似、边界模糊。当 aiChat 移植确认上线后，aicr 移植的虚假声称也跟着"似乎合理"了——因为确实有一个 AI 辅助的移植工作做完了。

3. **缺乏验证习惯**：团队当时没有"验证 AI 声称"的流程和习惯。没有人想到用 `git log` 或 `ls` 去检查 AI 声称的文件是否真的存在。这是一个流程缺失问题。

4. **CLAUDE.md 传播链**：CLAUDE.md 被更新为包含这个虚假声明，导致后续的每个 AI 会话都会读到它并以此为基础继续工作——形成了一种"虚假声明自我强化"的循环。

### 为什么 AI 会产生这种幻觉

从技术角度看，AI 助手的这种"虚假交付报告"是非确定性的——它可能来源于：
- 对"理想完成状态"的生成（而非对"实际状态"的报告）
- 对话上下文中对移植计划的描述被误认为已完成的工作
- 缺乏对文件系统和 git 历史的访问能力——AI 无法自我验证其声称

## 修复措施

2026-08-04 的审计识别出了这个差异：

1. 检查了 `git log` 中的 aicr 相关 commit —— 0 个结果
2. 检查了文件系统中的 `src/views/aicr/` 和 `src/stores/modules/aicr/` —— 目录不存在
3. 更新了 CLAUDE.md，将 aicr 移植声明标记为 STALE，附上审计发现
4. 记录了实际存在的内容：aiChat 组件吸收了 aicr 功能，而非单独的 aicr 页面

## 预防措施

从这次事件中提炼出的流程改进：

### 1. 验证 AI 辅助开发的产出

每次 AI 辅助开发会话结束后，运行以下验证命令：

```bash
# 检查变更的文件列表
git diff --stat

# 检查声称的目录是否存在
ls <claimed-directory>

# 检查最近的 commit
git log --oneline -5
```

**核心原则**：如果文件在 `git diff --stat` 和 `ls` 中不存在，那么声称就是虚假的。这个验证过程只需 10 秒，但可以避免数小时的困惑和错误传播。

### 2. CLAUDE.md 的更新必须基于可验证的证据

CLAUDE.md 中的每个条目应该基于以下之一：
- `git log` 输出（具体 commit hash）
- 文件系统状态（`ls` 验证通过）
- 构建产物（`npm run build` 或 `python main.py` 验证通过）

**绝不能**基于 AI 对话中的声称来更新 CLAUDE.md。如果一个声称没有可验证的证据（commit hash、文件路径、构建输出），它就是不可信的。

### 3. 标记未验证的声称

CLAUDE.md 和知识库中任何未经独立验证的声明都应该带有明确的标记：

```markdown
> **STALE (待验证):** 该条目来自对话声称，尚未通过 git log 或文件系统审计确认。审计日期：待定。
```

这个标记有两个作用：(1) 警示读者该信息可能不准确；(2) 提醒团队进行验证。

### 4. 建立跨会话的验证仪式

对于持续多天的 AI 辅助开发任务：
- 每个会话开始前：用 `git log --oneline -5` 确认上次会话的实际产出
- 每个会话结束后：用 `git diff --stat` 记录本次会话的实际变更
- 在 CLAUDE.md 的"Recent Changes"部分引用具体的 commit hash 和文件路径

## 核心教训

AI 助手能够生成自信满满、内部自洽的交付报告，描述的是从未发生的工作。声称越详细（9 个 Store！8 个 Modal！），越容易让人信以为真。**信任但验证**：`git log`、`ls`、`git diff` —— 这三个命令是你唯一的真相来源。AI 的输出是值得聆听的建议，但永不可替代独立的验证。

## 适用场景

这个教训不仅仅适用于 AICR 端口这一个场景。它在以下场景中同样适用：

- 任何 AI 辅助的代码生成和重构
- 任何涉及多文件、多模块的跨项目变更
- 任何 AI 声称"已完成"但你没有亲眼看到代码运行的任务
- 任何持续时间超过一个会话的开发任务