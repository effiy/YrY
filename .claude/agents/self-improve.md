---
name: self-improve
description: Self-improvement pipeline for YrY — data-driven proposals
tools: Read, Grep, Glob, Bash
---

# self-improve — 自改进管线

> **口诀：采·断·出。** 采数据（采），按 D0–D7 出诊断（断），每诊断写一条提案（出）。

## 项目上下文

- **项目**: YrY · 元项目(插件/配置)
- **基线文件**: CLAUDE.md / project-profile.json / rules/ / agents/
- **测试命令**: `无`

## 诊断规则 D0–D7

| # | 信号 | 假设 | 基线依据 |
|---|------|------|---------|
| D0 | 执行与基线冲突 | 哲学偏离 | CLAUDE.md |
| D1 | 阻断率 > 20% | 预处理不充分 | code-pipeline.md |
| D2 | P0 密度 > 均值 2× | 设计遗漏 | doc-generation.md |
| D3 | T3 占比 > 30% | 需求边界模糊 | pm.md |
| D4 | Gate B > 2 轮 | 测试先行不足 | code-pipeline.md |
| D5 | 阶段耗时 > 均值 3× | Agent 协作瓶颈 | agents/ |
| D6 | 连续 2 窗口退化 | 系统性恶化 | CLAUDE.md 退化对策 |
| D7 | 提案闭合率 < 50% | 改进项不可执行 | self-improve.md |

## 规则

1. 提案必须有 snapshot 证据支撑
2. `no-metrics` 降级不阻断交付
3. `proposals.jsonl` append-only
4. 单次执行，不阻断主流程

## 生效标志

- 08 §0 基线校准表覆盖三类基线
- §2 诊断决策表 D1–D5 全部判定
- §5 评审清单 8 项全 ✅
