---
title: SSE onDone Guard — Prevent Side Effects on Aborted Streams
tags: [gotcha, sse, streaming, side-effects, chat]
category: engineer/learn/lessons/gotchas
created: 2026-08-21
updated: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers avoid auto-forwarding partial or aborted chat content to external channels"
acceptance_criteria:
  - "Bug scenario described with root cause"
  - "Fix pattern documented with code example"
  - "Applicable to all SSE handlers with external side effects"
related:
  - ./README.md
  - ../../../../YiVad/CLAUDE.md
---

# SSE onDone 守卫 —— 防止中止流触发副作用

> **每个带有外部副作用的 SSE `onDone` 处理器必须在执行前检查 `!aborted && !error`。**

## Bug 描述（2026-07-28）

YiVad 的 `aiChat.ts` Store 中有一个 `onDone` 回调，用于在 AI 回复完成后自动将聊天内容转发到企业微信机器人（`autoForwardToRobots(streamed)`）。当用户在中途中止 SSE 流时（点击停止按钮），`onDone` 回调仍然触发，不完整的聊天内容被自动转发到企业微信群。

### 影响范围

- **受影响项目**：YiVad（aiChat 模块）
- **用户可感知症状**：用户中止 AI 回复后，企业微信群中出现不完整的、可能误导性的片段内容
- **严重程度**：中等——没有数据丢失，但对外部渠道发送了错误信息，可能引发不必要的注意和追问

### 根因分析

`onDone` 回调将所有"流结束"的情况等同对待，但实际上 SSE 流可能因不同原因结束：

| 结束原因 | `onDone` 是否触发 | 是否应执行副作用 |
|---|---|---|
| 自然完成（AI 回复结束） | 是 | 是 |
| 用户主动中止 | 是 | **否** ← Bug |
| 网络错误 | 是 | **否** |
| 服务器错误 | 是 | **否** |
| 超时 | 是 | **否** |

只有自然完成的情况才应该触发外部副作用。当前代码没有区分这五种情况。

## 修复方案

```typescript
// 修复前（有 Bug）
onDone: () => {
  autoForwardToRobots(streamed);  // 无论流为何结束，都转发
}

// 修复后（正确）
onDone: () => {
  if (!lastPet?.aborted && !lastPet?.error) {
    autoForwardToRobots(streamed);  // 仅在自然完成时转发
  }
}
```

守卫检查两个条件：
- `!aborted`：用户没有取消流（user initiated abort）
- `!error`：没有发生网络或服务器错误

只有两个条件都通过时，才执行外部副作用。

## 守卫决策矩阵

并非所有 SSE 流的 `onDone` 处理器都需要这个守卫。判断标准是：**副作用是否影响当前用户会话之外的系统或用户？**

| 副作用类型 | 示例 | 需要守卫？ | 原因 |
|---|---|---|---|
| 转发到外部渠道 | 企业微信、Slack、邮件 | **是** | 外部渠道看到不完整内容可能误导他人 |
| 持久化到数据库 | 保存聊天记录 | **否** | 不完整的内容也应该保存，用于后续调试验证 |
| 发送推送通知 | Push 通知、Toast | **是** | 用户中止后不应再收到通知 |
| 更新 UI 状态 | 设置 "已完成" 标记 | **否** | UI 应反映实际状态（无论是否中止） |
| 触发下游工作流 | 启动流水线下一步 | **是** | 不完整的输入触发下游工作流可能产生垃圾数据 |

**核心规则**：如果副作用在当前用户的会话之外可见，就需要守卫。

## 适用场景

这个模式适用于 YrY 中所有三个项目的 SSE 处理器：

### YiVad
- `aiChat.ts` Store 的 SSE 处理器（已在 2026-07-28 修复）
- `ragService.ts` 的 RAG 流式聊天处理器
- `agentService.ts` 的 Agent 流式处理器

### YiPet
- `ChatController` 的 SSE 处理器（继承了相同的模式，通过 `ApiClient`）
- Bug 报告自动保存（如果实现为 onDone 回调）

### YiAi
- Agent SSE 流式输出中的 `_watch_disconnect` 模式是服务端等效实现——确保客户端断开连接时循环停止
- 任何向外部系统发送消息的 SSE 流回调

## 代码审查检查清单

审查任何包含 SSE 流处理的 PR 时：

- [ ] 是否存在 `onDone` 回调？
- [ ] 回调是否有外部副作用（转发、通知、触发工作流）？
- [ ] 如果有外部副作用，是否包含 `!aborted && !error` 守卫？
- [ ] 是否在 `onError` 回调中正确设置了 `error` 标记？

## 检测方法

| 症状 | 检测方式 |
|---|---|
| 外部渠道收到不完整内容 | 在企业微信/Slack 等外部渠道中查找被截断的 AI 回复 |
| 用户中止后仍有后续操作 | 检查应用日志中 `onDone` 的时间戳是否早于预期 |
| 代码层面检测 | `grep -r "onDone" --include="*.ts" --include="*.vue"` 检查所有 onDone 处理器 |

### 预防性检查

在项目中运行：
```bash
# YiVad
grep -r "onDone" YiVad/src/ --include="*.ts" --include="*.vue"

# YiPet
grep -r "onDone" YiPet/src/ --include="*.ts" --include="*.tsx"
```

对每个匹配到的 `onDone`，手动检查是否包含守卫逻辑。

## 跨项目影响

- **YiVad**：`aiChat.ts` Store 的 SSE 处理器（已修复）
- **YiPet**：Chat Controller 的 SSE 处理器（通过 `ApiClient` 模式继承，需验证）
- **YiAi**：Agent 流式输出（`_watch_disconnect` 作为后端等效守卫）