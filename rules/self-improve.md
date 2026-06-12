---
paths:
  - "docs/故事任务面板/**/.improvement/**"
  - "docs/故事任务面板/**/.memory/**"
---

# self-improve

> 无 snapshot 不出提案，诊断以基线为锚，单次执行不阻断主流程。

[闭环全景](#闭环全景) · [适用](#适用) · [数据要求](#数据要求) · [诊断基准](#诊断基准) · [诊断规则 D0–D8](#诊断规则-d0d8) · [效果评估 E1–E4](#效果评估-e1e4) · [降级处理](#降级处理) · [经验技能化](#经验技能化) · [记忆压缩与注入](#记忆压缩与注入) · [例外](#例外) · [生效标志](#生效标志)

## 闭环全景

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TB
    subgraph 观察["① 观察：采数据"]
        direction TB
        EXEC[".memory/<br/>execution-memory.jsonl<br/>rui-state.json"]:::data
        SNAP["snapshot 数据<br/>Git diff · 代码快照"]:::data
        PROP[".improvement/<br/>proposals.jsonl"]:::data
    end

    subgraph 诊断["② 诊断：D0–D7"]
        direction TB
    end

    subgraph 改进["③ 改进：提案"]
        direction TB
    end

    subgraph 评估["④ 评估：E1–E4"]
        direction TB
    end

    观察 --> 诊断
    诊断 -->|"每诊断 → 一条提案"| 改进
    改进 --> 评估
    评估 -.->|"下次循环"| 观察


```

| 阶段 | 输入 | 输出 | 阻断? |
|------|------|------|-------|
| ① 观察 | 基线 + 执行记忆 + Git diff + proposals | 偏差信号 | 否 |
| ② 诊断 | 偏差信号 × 基线文件 | D0–D7 判定表 | 否 |
| ③ 改进 | 诊断结论 | proposals.jsonl（append-only） | 否 |
| ④ 评估 | proposals.jsonl + 前后记忆 | E1–E4 闭合/退化 | 否（单次不阻断） |

**可执行工具**: `node lib/proposals.mjs` — D0-D7 诊断引擎 + 提案生成 + E1-E4 评估。`node skills/rui-story/collect.mjs` — 指标采集 + 异常检测。

## 适用

每个故事走完管线后产出自改进复盘文档，并向 `proposals.jsonl` 追加诊断结果。

## 数据要求

```mermaid
flowchart TD
    Q{"提案要写入?"} -->|"是"| SNAP["必须有 snapshot 证据"]:::must
    SNAP --> Q2{"证据充分?"}
    Q2 -->|"否"| BLOCK["不产出提案 🚫"]:::block
    Q2 -->|"是"| APPEND["append → proposals.jsonl"]:::ok


```

```mermaid
flowchart LR
    subgraph 约束["proposals.jsonl 约束"]
        direction TB
        C2["状态变更<br/>通过新增条目"]:::rule
        C3["效果评估<br/>前后各 ≥3 条记忆"]:::rule
    end


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


```

| # | 规则 | 反例 |
|---|------|------|
| 6 | 诊断以基线文件为判定基准（CLAUDE.md / `rules/` / `agents/`） | 凭经验判断"复杂度太高" |
| 7 | 每条假设必须引用基线文件作为依据 | "推测是测试覆盖不足" — 未引用 code-pipeline.md |

## 诊断规则 D0–D8

```mermaid
flowchart LR
    subgraph 结构["结构诊断"]
        direction TB
        D3["D3 复杂度增长<br/>T3 占比 > 30%"]:::diag
        D5["D5 依赖退化<br/>阶段耗时异常"]:::diag
    end
    subgraph 过程["过程诊断"]
        direction TB
        D2["D2 质量退化<br/>P0 密度 > 均值 2×"]:::diag
        D4["D4 流程退化<br/>Gate B > 2 轮"]:::diag
    end
    subgraph 边界["边界诊断"]
        direction TB
        D7["D7 配置漂移<br/>提案闭合率 < 50%"]:::diag
        D8["D8 架构退化<br/>范式/耦合/SRP/内核"]:::diag
    end


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
| **D8** | 架构合规检查未通过 | 架构退化（范式违规/耦合/SRP/内核膨胀） | ≥1 条记忆 | architecture-principles.md · design-principles.md |

### 诊断 → 提案路由

```mermaid
flowchart LR
    D0 & D6 & D7 -->|"基线/配置/文档偏离"| PRC["process<br/>流程调整"]:::prop
    D1 & D5 & D8 -->|"效率/协作/架构异常"| REF["refactor<br/>模块拆分"]:::prop
    D2 & D4 -->|"质量/流程异常"| QLT["quality<br/>审查强化"]:::prop
    D3 -->|"边界/复杂度异常"| SEC["security<br/>边界加固"]:::prop


```

| 诊断组 | 触发信号 | 提案类型 | 示例 |
|--------|---------|---------|------|
| D0 / D6 / D7 | 基线偏离 / 文档过时 / 配置漂移 | `process` | "Gate A 阶段耗时 3x 基线，建议增加预检脚本" |
| D1 / D5 / D8 | 阻断率上升 / 阶段耗时异常 / 架构退化 | `refactor` | "架构合规 B 级，存在范式违规，重构为纯函数 + 具名导出" |
| D2 / D4 | P0 密度上升 / Gate B 多轮 | `quality` | "P0 密度连续 3 故事上升，建议 coder 自审查加 SQL 注入项" |
| D3 | T3 占比高 / 需求边界模糊 | `security` | "第三方脚本无 SRI，建议添加 integrity 校验" |

## 效果评估 E1–E4

```mermaid
flowchart LR
    subgraph 改善["改善信号"]
        direction TB
        UP2["P0 密度 ↓"]:::good
        UP3["关联 bad_case 消失"]:::good
    end
    subgraph 退化["退化信号"]
        direction TB
        DN2["P0 密度 ↑"]:::bad
        DN3["关联 bad_case 仍出现"]:::bad
    end
    改善 --> JUDGE{"综合判定"}
    退化 --> JUDGE
    JUDGE -->|"改善 > 退化"| CLOSE["闭合 ✅"]:::ok
    JUDGE -->|"退化 > 改善"| ROLL["回退或重提案"]:::warn


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


```

## 经验技能化

> 从执行经验中创建 skill，使用中自我优化。当同一改进模式反复触发 → 从一次性提案升级为持久规则。

```mermaid
flowchart TD
    PROP["proposals.jsonl<br/>某类型提案"] --> Q1{"同类型提案<br/>连续 ≥3 故事触发?"}
    Q1 -->|"否"| TRACK["继续跟踪<br/>下次评估再检"]:::wait
    Q1 -->|"是"| Q2{"可泛化为<br/>通用规则?"}
    Q2 -->|"是"| UPGRADE["写入对应 rules/ 或 agents/<br/>标记来源提案 ID"]:::up
    Q2 -->|"否"| KEEP["保留为故事级提案<br/>标注不可泛化原因"]:::keep


```

| 提案类型 | 升级条件 | 升级目标 | 示例 |
|---------|---------|---------|------|
| `process` | 连续 3 故事触发 | `rules/code-pipeline.md` | "Gate A 阻断原因 80% 是影响链断裂 → 升级为 P0 必检项" |
| `quality` | 连续 3 故事触发 | `agents/tester.md` 或 `agents/coder.md` | "P0 密度上升根因是 SQL 注入 → 升级为 coder 自审查清单" |
| `refactor` | 连续 3 故事触发 | `rules/code-pipeline.md` §深度模块 | "某文件 3 次膨胀 → 升级为模块行数上限规则" |
| `security` | 当前故事即修 | `agents/security.md` | "新类型注入 → 升级为威胁建模新增检查项" |
| `skill` | 连续 2 故事触发 | `skills/` 或 `rules/` 新条目 | "Agent 反复犯同类错误 → 创建专项 Red Flag 或检查规则" |

## 记忆压缩与注入

> AI 压缩 + 相似检索模式，结合基准评估方法。

```mermaid
flowchart LR
    subgraph 源["记忆源"]
        direction TB
        M2["rui-state.json"]:::data
        M3["proposals.jsonl"]:::data
    end
    subgraph 压缩["AI 压缩"]
        direction TB
        C2["P0 模式摘要<br/>完整模式 + 修复 diff"]:::comp
        C3["统计聚合<br/>阻断率 · P0 密度 · 闭合率"]:::comp
    end
    subgraph 注入["上下文注入"]
        direction TB
        I2["相似代码变更 → 注入历史 P0"]:::inj
        I3["新提案起草 → 注入历史效果评估"]:::inj
    end
    源 --> 压缩 --> 注入


```

| 记忆类型 | 压缩方式 | 保留窗口 | 注入触发 |
|---------|---------|---------|---------|
| 阻断事件 | 根因 + 解决方式摘要 | 12 故事 | 同类型阻断复现 |
| P0 记录 | 完整模式 + 修复 diff | 6 故事（修复后） | 相似模块变更 |
| 提案效果 | 效果评估 + 关联 bad_case | 3 故事（闭合后归档） | 新提案起草 |
| 阶段耗时 | 均值/方差/趋势 | 滚动 12 窗口 | 自改进阶段 |

## 例外

| 场景 | 处理 |
|------|------|
| 数据采集失败 | `no-metrics` 标识，写降级版自改进复盘（标注无数据），不计入退化窗口 |
| 单故事数据不足 3 条 | 跳过 E1–E4，仅生成观察记录 |
| 经验技能化触发但目标文件已含类似规则 | 更新现有规则（标注来源提案），不重复创建 |

## 生效标志

```mermaid
flowchart LR
    S1["snapshot 证据<br/>每条提案有数据支撑"]:::sig --> S2["基线锚定<br/>D0–D7 引用基线文件"]:::sig
    S2 --> S3["append-only<br/>proposals.jsonl 无覆盖"]:::sig
    S3 --> S4["E1–E4 闭合<br/>或标注退化/降级"]:::sig


```

| 标志 | 未达标的处置 |
|------|------------|
| 每条提案有 snapshot 证据支撑 | 补数据或删无证据提案 |
| D0–D7 诊断引用基线文件 | 补基线引用，空缺标 `> 待补充` |
| proposals.jsonl append-only | 恢复被覆盖条目，以 jsonl 为准 |
| E1–E4 闭合或标注退化/降级 | 补评估结论，不得留空 |
