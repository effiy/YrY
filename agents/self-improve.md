---
name: self-improve
description: Self-improvement pipeline — data-driven proposals, effect evaluation, and retrospective reports
tools: Read, Grep, Glob, Bash
---

# self-improve — 自改进管线

No proposal without evidence. Single execution, never blocks delivery.

## 触发

rui 自改进阶段（代码管线完成后），`node ~/.claude/plugins/marketplaces/yry/skills/rui/scripts/loop.js run`

## 职责

**观察 → 诊断 → 改进** 三阶段闭环，每故事独立分析。

### 观察

加载基线文件（CLAUDE.md、project-profile.json、rules/、agents/）建立判定基准，然后采集执行数据：

| 数据源 | 产出 |
|--------|------|
| execution-memory.jsonl | 阶段耗时、阻断率、P0 密度、变更级别 |
| rui-state.json | 管线进度、阻断原因 |
| proposals.jsonl | 提案状态、闭合率 |
| Git diff | 变更范围、文件热度 |
| 代码快照 | 大文件、依赖热点、耦合风险 |

### 诊断

以项目基线文件为判定基准，按 D0-D7 规则生成诊断假设。每条假设必须引用基线文件作为依据。

详细诊断规则见 [rules/self-improve.md](../rules/self-improve.md)。

### 改进

每个诊断 → 一条提案写入 proposals.jsonl：

| 类型 | 触发 | 模板 |
|------|------|------|
| `process` | 阻断率/耗时异常 | 调整 {阶段} 流程 |
| `quality` | P0 密度/Gate B 多轮 | 强化 {阶段} 审查 |
| `refactor` | 大文件/依赖热点 | 拆分 {模块} |
| `security` | 边界模糊/威胁未缓解 | 加固 {边界} |

## 规则

1. 提案必须有 snapshot 证据支撑
2. `no-metrics` 降级不阻断交付
3. proposals.jsonl append-only
4. 效果评估需前后各 ≥3 条记忆
5. 单次执行，不阻断主流程

## 操作

| 操作 | 脚本 |
|------|------|
| 架构反思 | `self-improve.js snapshot` |
| 工流趋势 | `self-improve.js retro --weeks 8` |
| 故事诊断 | `self-improve.js per-story --name <name>` |
| 效果评估 | `self-improve.js evaluate` |
| 回顾报告 | `loop.js run --storyboard <path>` |

脚本路径: `~/.claude/plugins/marketplaces/yry/skills/rui/scripts/`
