---
paths:
  - "**/*.{js,ts,jsx,tsx,vue,py,go,rs,java,rb,php}"
---

# code-pipeline

> 源码改动只走 `/rui code`，分支独立、测试在前、逐模块清零、Gate B 收口。

## 管线全景

```mermaid
flowchart TB
    REQ["需求故事"]:::src --> BR["① 分支隔离<br/>feat/&lt;project&gt;-&lt;name&gt;"]:::phase
    BR --> GA{"② Gate A<br/>测试先行"}
    GA -->|"❌ 04 缺失"| X1["skip-gate-a 🚫"]:::block
    GA -->|"✅ 通过"| MOD["③ 逐模块清零<br/>每模块 P0 → 下一模块"]:::phase
    MOD --> GB{"④ Gate B<br/>闭环验证"}
    GB -->|"❌ > 2 轮"| X2["gate-b-limit 🚫"]:::block
    GB -->|"✅ 通过"| SI["⑤ 自改进<br/>08-自改进复盘"]:::phase
    SI --> DONE["交付"]:::done

    classDef src fill:#e8f5e9,stroke:#2e7d32;
    classDef phase fill:#e3f2fd,stroke:#1565c0;
    classDef block fill:#ffebee,stroke:#c62828;
    classDef done fill:#f3e5f5,stroke:#6a1b9a;
```

| 阶段 | 核心动作 | 阻断标识 | 例外 |
|------|---------|---------|------|
| ① 分支隔离 | 从 main 创建功能分支，切换后改码 | `bad-branch` / `no-checkout` / `auto-merge` | 反推命令只读不写 |
| ② Gate A | 04-测试用例评审.md 存在且就绪 | `skip-gate-a` | 单行 CSS/文案 |
| ③ 逐模块清零 | 每模块 P0 清零后进下一模块 | `chain-broken` | — |
| ④ Gate B | 5 步验证 + 三报告闭合，修复 ≤ 2 轮 | `gate-b-limit` | — |
| ⑤ 自改进 | 产出 08-自改进复盘 | `no-metrics`（降级不阻断） | 数据采集失败时降级 |

## ① 分支隔离

```mermaid
flowchart LR
    MAIN["main"]:::base --> FB["feat/&lt;project&gt;-&lt;name&gt;"]:::feat
    FB --> CODE["编码"]:::work
    CODE --> MR["开发者手动合并"]:::manual
    FB -.->|"禁止"| X1["自动合并 auto-merge"]:::block
    MAIN -.->|"禁止"| X2["直接在 main 改码 no-checkout"]:::block
    FB -.->|"禁止"| X3["派生分支 bad-branch"]:::block

    classDef base fill:#e8f5e9,stroke:#2e7d32;
    classDef feat fill:#e3f2fd,stroke:#1565c0;
    classDef work fill:#fff3e0,stroke:#e65100;
    classDef manual fill:#f3e5f5,stroke:#6a1b9a;
    classDef block fill:#ffebee,stroke:#c62828;
```

| # | 规则 | 违反标识 |
|---|------|---------|
| 1 | 功能分支必须从 `main` 创建，命名 `feat/<project>-<name>` | `bad-branch` |
| 2 | 改动源码前必须已切到该分支 | `no-checkout` |
| 3 | 功能分支禁止自动合并到主干，git 操作由开发者手动执行 | `auto-merge` |
| 4 | 源码修改唯一入口是 `/rui code` 管线，反推命令只读不写 | — |

## ② Gate A — 测先行

```mermaid
flowchart TD
    ENTER["准备编码"] --> Q1{"04-测试用例评审.md<br/>存在?"}
    Q1 -->|"否"| BLOCK["skip-gate-a 🚫"]:::block
    Q1 -->|"是"| Q2{"测试方案与原型<br/>已就绪?"}
    Q2 -->|"否"| BLOCK
    Q2 -->|"是"| Q3{"变更类型?"}
    Q3 -->|"单行 CSS/文案"| BYPASS["跳过 Gate A<br/>仍走分支隔离"]:::bypass
    Q3 -->|"普通代码"| PASS["Gate A ✅<br/>进入编码"]:::pass

    classDef block fill:#ffebee,stroke:#c62828;
    classDef bypass fill:#fff3e0,stroke:#e65100;
    classDef pass fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | 说明 |
|---|------|------|
| 5 | `04-测试用例评审.md` 不存在，不得编码 | 阻断标识 `skip-gate-a` |
| 6 | 单行 CSS/文案变更可跳过 Gate A | 仍走分支隔离 |
| 7 | 测试方案与原型未就绪视为未通过 | tester 补充后方可继续 |

## ③ 逐模块清零

```mermaid
flowchart LR
    M1["模块 1"]:::mod --> C1{"P0 清零?"}
    C1 -->|"否 🔄"| F1["修复 P0"]:::fix
    F1 --> C1
    C1 -->|"是 ✅"| M2["模块 2"]:::mod
    M2 --> C2{"P0 清零?"}
    C2 -->|"否 🔄"| F2["修复 P0"]:::fix
    F2 --> C2
    C2 -->|"是 ✅"| M3["模块 N ..."]:::mod

    classDef mod fill:#e3f2fd,stroke:#1565c0;
    classDef fix fill:#fff3e0,stroke:#e65100;
```

```mermaid
flowchart LR
    subgraph 优先级["优先级"]
        P0["P0<br/>阻塞发布必修"]:::p0
        P1["P1<br/>当轮修复"]:::p1
        P2["P2<br/>记录不阻断"]:::p2
    end

    classDef p0 fill:#ffebee,stroke:#c62828;
    classDef p1 fill:#fff3e0,stroke:#e65100;
    classDef p2 fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | 违反标识 |
|---|------|---------|
| 8 | 逐模块编码：每模块完成后审查，P0 不清零不进下一模块 | — |
| 9 | 影响链未闭合不声称闭合 | `chain-broken` |
| 10 | 不创建设计文档外的文件；fix 模式预检仅查目标文件存在 | — |
| 11 | P0 = 阻塞发布必修；P1 = 当轮修复；P2 = 记录不阻断 | — |

## ④ Gate B — 闭环验证

```mermaid
flowchart LR
    S1["① 环境快照<br/>commit hash + 分支"]:::step --> S2["② 静态预检<br/>lint + typecheck"]:::step
    S2 --> S3["③ 设计对齐<br/>实现 vs 评审"]:::step
    S3 --> S4["④ 单次执行<br/>冒烟 + 回归 + 专项"]:::step
    S4 --> S5["⑤ 三报告<br/>05/06/07 交叉引用闭合"]:::step
    S5 --> CHK{"评审清单<br/>全 ✅?"}
    CHK -->|"否 🔄"| FIX["修复（≤2 轮）"]:::fix
    FIX --> S4
    CHK -->|"是 ✅"| PASS["Gate B 通过"]:::pass

    classDef step fill:#e3f2fd,stroke:#1565c0;
    classDef fix fill:#fff3e0,stroke:#e65100;
    classDef pass fill:#e8f5e9,stroke:#2e7d32;
```

| # | 规则 | 违反标识 |
|---|------|---------|
| 12 | 五步验证：环境快照 → 静态预检 → 设计对齐 → 单次执行 → 三报告 | — |
| 13 | 三报告交叉引用闭合，评审清单全 ✅ 方过 | — |
| 14 | 修复 ≤ 2 轮，超过阻断 | `gate-b-limit` |
| 15 | 自改进必须产出 08-自改进复盘 | `no-metrics`（降级） |

## 产出收口

```
故事任务面板/<Project>/<Story>/
├── 01-需求与故事.md
├── 02-后端技术评审.md          ← 后端故事
├── 03-前端技术评审.md          ← 前端故事
├── 04-测试用例评审.md
├── 05-后端实施报告.md          ← coder 产出
├── 06-前端实施报告.md          ← coder 产出
├── 07-测试报告.md              ← reporter 产出
└── 08-自改进复盘.md           ← self-improve 产出
```

| # | 规则 |
|---|------|
| 16 | 关键产出限定在故事目录或对应参考文档目录，目录命名见 doc-generation.md |

## 例外

```mermaid
flowchart LR
    subgraph 单行["单行 CSS/文案"]
        E1["跳过 Gate A"]:::ex
        E2["仍走分支隔离"]:::ex
    end
    subgraph 反推["反推命令"]
        E3["分支隔离"]:::ex
        E4["只读源码"]:::ex
        E5["不触发 Gate A/B"]:::ex
    end

    classDef ex fill:#fff3e0,stroke:#e65100;
```

| 场景 | 跳过 | 保留 |
|------|------|------|
| 单行 CSS/文案变更 | Gate A | 分支隔离 |
| 反推命令（`--from-code` / `--from-doc`） | Gate A / Gate B | 分支隔离 + 只读 |

## 阻断标识汇总

```mermaid
flowchart LR
    B1["bad-branch<br/>分支非法"]:::block
    B2["no-checkout<br/>未切换分支"]:::block
    B3["auto-merge<br/>自动合并"]:::block
    B4["skip-gate-a<br/>Gate A 未过"]:::block
    B5["chain-broken<br/>影响链断裂"]:::block
    B6["gate-b-limit<br/>修复超限"]:::block
    B7["no-metrics<br/>数据缺失"]:::warn

    classDef block fill:#ffebee,stroke:#c62828;
    classDef warn fill:#fff3e0,stroke:#e65100;
```

| 标识 | 触发条件 | 阻断? |
|------|---------|-------|
| `bad-branch` | 分支非从 main 创建或混入非本故事代码 | ✅ 阻断 |
| `no-checkout` | 未切换故事分支即改源码 | ✅ 阻断 |
| `auto-merge` | 功能分支被自动合并到 main | ✅ 阻断 |
| `skip-gate-a` | Gate A 未通过即编码 | ✅ 阻断 |
| `chain-broken` | 影响链未闭合 | ✅ 阻断 |
| `gate-b-limit` | Gate B 修复 > 2 轮 | ✅ 阻断 |
| `no-metrics` | self-improve 数据采集失败 | ⚠️ 降级不阻断 |

## 生效标志

```mermaid
flowchart LR
    S1["分支命名合规<br/>feat/&lt;project&gt;-&lt;name&gt;"]:::sig --> S2["Gate A 通过<br/>04 存在且就绪"]:::sig
    S2 --> S3["P0 全模块清零<br/>无 chain-broken"]:::sig
    S3 --> S4["Gate B 五步全 ✅<br/>修复 ≤ 2 轮"]:::sig
    S4 --> S5["三报告闭合<br/>无矛盾"]:::sig

    classDef sig fill:#e8f5e9,stroke:#2e7d32;
```

| 标志 | 未达标的处置 |
|------|------------|
| 分支命名合规 | 重建分支，从 main 重新拉出 |
| Gate A 通过（04 存在且就绪） | 退回 tester 补充测试用例评审 |
| P0 全模块清零，无 `chain-broken` | 退回 coder 修复 P0 |
| Gate B 五步全 ✅，修复 ≤ 2 轮 | 退回 coder 修复，超 2 轮阻断 |
| 三报告闭合无矛盾 | 以测试报告为仲裁修正 |
