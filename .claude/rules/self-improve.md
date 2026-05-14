---
paths:
  - "docs/故事任务面板/**/.improvement/**"
  - "docs/故事任务面板/**/.memory/**"
---

# Self-Improve Rules

> **口诀：有据才发、对基线断、单次不阻。** 无 snapshot 不出提案，诊断以基线为锚，单次执行不阻断主流程。

```mermaid
flowchart LR
    Base[基线<br/>CLAUDE.md / project-profile.json / rules / agents] -.判定基准.-> Diag
    Snap[snapshot 数据] --> Diag[诊断 D0–D7] --> Prop[proposals.jsonl]
    Prop --> Eval[效果评估 E1–E4]
```

## 核心规则

1. 提案必须有 snapshot 证据支撑，无数据不产出
2. 诊断以基线文件为判定基准（CLAUDE.md / project-profile.json / rules/ / agents/）
3. `no-metrics` 降级不阻断交付
4. `proposals.jsonl` append-only
5. 效果评估需前后各 ≥3 条记忆
6. 单次执行，不阻断主流程

## 诊断规则（D0–D7）

每条假设必须引用基线文件作为依据。

| # | 信号 | 假设 | 置信度 | 基线依据 |
|---|------|------|--------|---------|
| D0 | 执行与基线冲突 | 哲学偏离 | ≥1 条记忆 | CLAUDE.md · agents/ |
| D1 | 阻断率 > 20% | 预处理不充分 | ≥5 条记忆 | gate-rules.md |
| D2 | P0 密度 > 均值 2× | 设计遗漏 | ≥3 条记忆 | doc-generation.md |
| D3 | T3 占比 > 30% | 需求边界模糊 | ≥3 条记忆 | 故事拆分（pm.md） |
| D4 | Gate B > 2 轮 | 测试先行不足 | Gate B 计数 | gate-rules.md |
| D5 | 阶段耗时 > 均值 3× | Agent 协作瓶颈 | ≥3 条记忆 | agents/ |
| D6 | 连续 2 窗口退化 | 系统性恶化 | retro 分析 | CLAUDE.md 退化对策 |
| D7 | 提案闭合率 < 50% | 改进项不可执行 | ≥5 个提案 | 本规则 |

## 效果评估（E1–E4）

| # | 指标 | 改善 | 退化 |
|---|------|------|------|
| E1 | 阻断率 | 后 < 前 | 后 > 前 |
| E2 | P0 密度 | 后 < 前 | 后 > 前 |
| E3 | 关联 bad_case | 消失 | 仍出现 |
| E4 | 综合 | 改善 > 退化 | 退化 > 改善 |
