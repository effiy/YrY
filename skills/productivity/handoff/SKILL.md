---
name: handoff
description: Compact the current conversation into a handoff document so another agent can continue the work. Use when switching models, handing off between agents, or pausing work mid-stream.
---

# Handoff

> 把当前会话的上下文压缩为一个交接文档，供另一个 Agent 继续。

## 何时用

- 切换模型 / Agent / 会话
- 管线上下游交接（pm → coder → tester）
- 工作中途暂停
- 超出上下文窗口前

## 流程

### 1. 提取

从当前对话提取：

- **任务目标** — ≤ 3 句话：要达成什么、为谁、为什么
- **已完成** — 文件/行号 + 做了什么 + 验证结果
- **当前状态** — 正在做的事、卡在哪
- **关键发现** — 挖出来的非显而易见的约束/冲突/决定
- **待办下一步** — 具体、可执行的下一步清单
- **语境指针** — 相关文件路径、分支、commit hash

### 2. 写交接

格式：

```markdown
# Handoff: {简短描述}

## Goal
{≤ 3 句：做什么、为谁、为什么}

## Done
- [x] `path/file.ts:42` — {做了什么} ({验证结果})
- ...

## Now
{当前状态：进行中/卡住/等待}

## Key findings
- {非显而易见的约束/决定/冲突}
- ...

## Next
- [ ] {具体下一步}
- [ ] ...

## Context
- 分支: `{branch}`
- Commit: `{hash}`
- 相关文件: `path/a`, `path/b`
```

### 3. 验证

- [ ] 新 Agent 仅凭这个文档就能理解上下文？
- [ ] Next 列表每个都是可独立执行的？
- [ ] 文件路径都是可 Read / Grep 验证的（证据 A 级）？
- [ ] 没有 "如前所述"、"继续之前的工作" 等依赖前文的内容？

## 约束

- **不超过 1 页**（约 60 行）——这是交接，不是完整文档
- **具体到文件/行号**——不说 "改过 auth 模块"，说 "`src/auth/login.ts:42` 添加了 rate-limit 中间件"
- **不含 spec**——交接描述实际状态，不是理想状态。不要写 "应该做 X"
- **可验证**——每个声称附验证命令或文件路径
