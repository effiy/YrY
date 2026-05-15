---
paths:
  - "docs/故事任务面板/**/.improvement/**"
  - "docs/故事任务面板/**/.memory/**"
---

# self-improve

> 无 snapshot 不出提案，诊断以基线为锚，单次执行不阻断主流程。

## 闭环全景

```mermaid
flowchart TB
    subgraph 观察["① 观察：采数据"]
        BASE["基线<br/>CLAUDE.md / rules / agents"]:::base
        EXEC[".memory/<br/>execution-memory.jsonl<br/>rui-state.json"]:::data
        SNAP["snapshot 数据<br/>Git diff · 代码快照"]:::data
        PROP[".improvement/<br/>proposals.jsonl"]:::data
    end

    subgraph 诊断["② 诊断：D0–D7"]
        D_ALL["以基线为判定基准<br/>每条假设引用基线文件"]:::diag
    end

    subgraph 改进["③ 改进：提案"]
        PRC["process · quality<br/>refactor · security"]:::prop
    end

    subgraph 评估["④ 评估：E1–E4"]
        EVAL["前后对比 ≥3 条记忆<br/>闭合 or 退化判定"]:::eval
    end

    观察 --> 诊断
    诊断 -->|"每诊断 → 一条提案"| 改进
    改进 --> 评估
    评估 -.->|"下次循环"| 观察

    classDef base fill:#e8f5e9,stroke:#2e7d32;
    classDef data fill:#e3f2fd,stroke:#1565c0;
    classDef diag fill:#fff3e0,stroke:#e65100;
    classDef prop fill:#f3e5f5,stroke:#6a1b9a;
    classDef eval fill:#e8f5e9,stroke:#2e7d32;
```

| 阶段 | 输入 | 输出 | 阻断? |
|------|------|------|-------|
| ① 观察 | 基线 + 执行记忆 + Git diff + proposals | 偏差信号 | 否 |
| ② 诊断 | 偏差信号 × 基线文件 | D0–D7 判定表 | 否 |
| ③ 改进 | 诊断结论 | proposals.jsonl（append-only） | 否 |
| ④ 评估 | proposals.jsonl + 前后记忆 | E1–E4 闭合/退化 | 否（单次不阻断） |

## 适用

每个故事走完管线后产出自改进复盘文档，并向 `proposals.jsonl` 追加诊断结果。

## 数据要求

```mermaid
flowchart TD
    Q{"提案要写入?"} -->|"是"| SNAP["必须有 snapshot 证据"]:::must
    SNAP --> Q2{"证据充分?"}
    Q2 -->|"否"| BLOCK["不产出提案 🚫"]:::block
    Q2 -->|"是"| APPEND["append → proposals.jsonl"]:::ok

    classDef must fill:#e3f2fd,stroke:#1565c0;
    classDef block fill:#ffebee,stroke:#c62828;
    classDef ok fill:#e8f5e9,stroke:#2e7d32;
```

```mermaid
flowchart LR
    subgraph 约束["proposals.jsonl 约束"]
        C1["append-only<br/>不覆盖历史条目"]:::rule
        C2["状态变更<br/>通过新增条目"]:::rule
        C3["效果评估<br/>前后各 ≥3 条记忆"]:::rule
    end

    classDef rule fill:#fff3e0,stroke:#e65100;
```

| # | 规则 | 反例 |
|---|------|------|
| 1 | 提案必须有 snapshot 证据支撑，无数据不产出 | "建议优化性能" — 无耗时数据 |
| 2 | `proposals.jsonl` append-only，状态变更通过新增条目而非覆盖 | 修改已闭合提案的历史记录 |
| 3 | 效果评估需前后各 ≥ 3 条记忆 | 仅 1 条记忆就声称"改进有效" |
| 4 | `no-metrics` 降级不阻断交付（写空白 08 占位） | 数据采集失败后跳过整个自改进阶段 |
| 5 | 单次执行，不阻断主流程 | 因诊断耗时过长卡住交付 |

## 诊断基准

```mermaid
flowchart LR
    HYP["诊断假设"]:::src --> Q{"有基线依据?"}
    Q -->|"否"| REJ["不成立 ❌"]:::block
    Q -->|"是"| REF["引用基线文件<br/>CLAUDE.md / rules/ / agents/"]:::ok
    REF --> DIAG["诊断有效 ✅"]:::ok

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef block fill:#ffebee,stroke:#c62828;
    classDef ok fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | 反例 |
|---|------|------|
| 6 | 诊断以基线文件为判定基准（CLAUDE.md / `rules/` / `agents/`） | 凭经验判断"复杂度太高" |
| 7 | 每条假设必须引用基线文件作为依据 | "推测是测试覆盖不足" — 未引用 code-pipeline.md |

## 诊断规则 D0–D7

```mermaid
flowchart LR
    subgraph 结构["结构诊断"]
        D0["D0 基线偏离<br/>执行与基线冲突"]:::diag
        D3["D3 复杂度增长<br/>T3 占比 > 30%"]:::diag
        D5["D5 依赖退化<br/>阶段耗时异常"]:::diag
    end
    subgraph 过程["过程诊断"]
        D1["D1 效率退化<br/>阻断率 > 20%"]:::diag
        D2["D2 质量退化<br/>P0 密度 > 均值 2×"]:::diag
        D4["D4 流程退化<br/>Gate B > 2 轮"]:::diag
    end
    subgraph 边界["边界诊断"]
        D6["D6 文档过时<br/>连续退化"]:::diag
        D7["D7 配置漂移<br/>提案闭合率 < 50%"]:::diag
    end

    classDef diag fill:#fff3e0,stroke:#e65100;
```

| # | 信号 | 假设 | 置信度 | 基线依据 |
|---|------|------|--------|---------|
| **D0** | 执行与基线冲突 | 哲学偏离 | ≥1 条记忆 | CLAUDE.md · agents/ |
| **D1** | 阻断率 > 20% | 预处理不充分 | ≥5 条记忆 | code-pipeline.md |
| **D2** | P0 密度 > 均值 2× | 设计遗漏 | ≥3 条记忆 | doc-generation.md |
| **D3** | T3 占比 > 30% | 需求边界模糊 | ≥3 条记忆 | pm.md（故事拆分） |
| **D4** | Gate B > 2 轮 | 测试先行不足 | Gate B 计数 | code-pipeline.md |
| **D5** | 阶段耗时 > 均值 3× | Agent 协作瓶颈 | ≥3 条记忆 | agents/ |
| **D6** | 连续 2 窗口退化 | 系统性恶化 | retro 分析 | CLAUDE.md |
| **D7** | 提案闭合率 < 50% | 改进项不可执行 | ≥5 个提案 | 本规则 |

### 诊断 → 提案路由

```mermaid
flowchart LR
    D0 & D6 & D7 -->|"基线/配置/文档偏离"| PRC["process<br/>流程调整"]:::prop
    D1 & D5 -->|"效率/协作异常"| REF["refactor<br/>模块拆分"]:::prop
    D2 & D4 -->|"质量/流程异常"| QLT["quality<br/>审查强化"]:::prop
    D3 -->|"边界/复杂度异常"| SEC["security<br/>边界加固"]:::prop

    classDef prop fill:#f3e5f5,stroke:#6a1b9a;
```

| 诊断组 | 触发信号 | 提案类型 | 示例 |
|--------|---------|---------|------|
| D0 / D6 / D7 | 基线偏离 / 文档过时 / 配置漂移 | `process` | "Gate A 阶段耗时 3x 基线，建议增加预检脚本" |
| D1 / D5 | 阻断率上升 / 阶段耗时异常 | `refactor` | "`init.js` 613 行，建议拆为 detect/generate/verify" |
| D2 / D4 | P0 密度上升 / Gate B 多轮 | `quality` | "P0 密度连续 3 故事上升，建议 coder 自审查加 SQL 注入项" |
| D3 | T3 占比高 / 需求边界模糊 | `security` | "第三方脚本无 SRI，建议添加 integrity 校验" |

## 效果评估 E1–E4

```mermaid
flowchart LR
    subgraph 改善["改善信号"]
        UP1["阻断率 ↓"]:::good
        UP2["P0 密度 ↓"]:::good
        UP3["关联 bad_case 消失"]:::good
    end
    subgraph 退化["退化信号"]
        DN1["阻断率 ↑"]:::bad
        DN2["P0 密度 ↑"]:::bad
        DN3["关联 bad_case 仍出现"]:::bad
    end
    改善 --> JUDGE{"综合判定"}
    退化 --> JUDGE
    JUDGE -->|"改善 > 退化"| CLOSE["闭合 ✅"]:::ok
    JUDGE -->|"退化 > 改善"| ROLL["回退或重提案"]:::warn

    classDef good fill:#e8f5e9,stroke:#2e7d32;
    classDef bad fill:#ffebee,stroke:#c62828;
    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef warn fill:#fff3e0,stroke:#e65100;
```

| # | 指标 | 改善 | 退化 |
|---|------|------|------|
| **E1** | 阻断率 | 后 < 前 | 后 > 前 |
| **E2** | P0 密度 | 后 < 前 | 后 > 前 |
| **E3** | 关联 bad_case | 消失 | 仍出现 |
| **E4** | 综合 | 改善 > 退化 | 退化 > 改善 |

## 降级处理

```mermaid
flowchart TD
    Q1{"数据采集状态?"}
    Q1 -->|"成功"| FULL["完整自改进复盘<br/>D0–D7 + E1–E4"]:::ok
    Q1 -->|"失败"| NOOP["no-metrics 降级<br/>写空白 08 占位<br/>不计入退化窗口"]:::warn
    Q1 -->|"不足 3 条"| OBS["跳过 E1–E4<br/>仅生成观察记录"]:::warn

    classDef ok fill:#e8f5e9,stroke:#2e7d32;
    classDef warn fill:#fff3e0,stroke:#e65100;
```

## 例外

| 场景 | 处理 |
|------|------|
| 数据采集失败 | `no-metrics` 标识，写降级版自改进复盘（标注无数据），不计入退化窗口 |
| 单故事数据不足 3 条 | 跳过 E1–E4，仅生成观察记录 |

## 生效标志

```mermaid
flowchart LR
    S1["snapshot 证据<br/>每条提案有数据支撑"]:::sig --> S2["基线锚定<br/>D0–D7 引用基线文件"]:::sig
    S2 --> S3["append-only<br/>proposals.jsonl 无覆盖"]:::sig
    S3 --> S4["E1–E4 闭合<br/>或标注退化/降级"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| 每条提案有 snapshot 证据支撑 | 补数据或删无证据提案 |
| D0–D7 诊断引用基线文件 | 补基线引用，空缺标 `> 待补充` |
| proposals.jsonl append-only | 恢复被覆盖条目，以 jsonl 为准 |
| E1–E4 闭合或标注退化/降级 | 补评估结论，不得留空 |
