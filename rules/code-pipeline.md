---
paths:
  - "**/*.{js,ts,jsx,tsx,vue,py,go,rs,java,rb,php}"
---

# code-pipeline

> 源码改动只走 `/rui code`，分支独立、测试在前、逐模块清零、Gate B 收口。
>
> **Iron Law — 违反字母即是违反精神：**
> - P0 不清零不进下一模块
> - Gate A 未通过不编码
> - Gate B 修复 ≤ 2 轮。3+ 轮 = 架构问题，质疑模式

[管线全景](#管线全景) · [① 分支隔离](#①-分支隔离--强制门禁) · [② Gate A](#②-gate-a--测先行) · [③ 逐模块清零](#③-逐模块清零) · [④ Gate B](#④-gate-b--闭环验证) · [产出收口](#产出收口) · [例外](#例外) · [阻断标识汇总](#阻断标识汇总) · [生效标志](#生效标志) · [支撑技术](#支撑技术)

## Red Flags — 暂停并回到 Iron Law

- "这个模块改动太小，跳过自审查"
- "影响链看起来闭合了，不用 grep 了"
- "修复 3 轮了但这次肯定对"
- "单行 CSS/文案也算 Gate A 例外吧"
- "分支创建应该是自动的，我手动改就行"
- "测试设计文档是空的但参考设计文档就够了"
- "实现完成再补分支隔离"
- "这次改动很小，直接在 main 改就行"
- "先改代码再切分支，反正还没 commit"
- "当前在 main 上，但只改一行不需要切分支"
- "doc 阶段只写文档不改源码，不需要切分支"
- "文档写入不是'源码改动'，分支隔离管不着文档"
- "先写文档再切分支，doc 不涉及编译不会出错"
- "用本地缓存/记忆文件存状态，跨分支共享绕过隔离"

**以上任何一个 = 停止。** 对于 3+ 修复失败的，见下方 [支撑技术](#根因追溯) 根因追溯模式。

## 管线全景

```mermaid
flowchart TB
    REQ["需求故事"]:::src --> BR{"① 分支隔离<br/>当前在 feat/&lt;name&gt;?"}
    BR -->|"❌ 在 main 或非法分支"| X0["no-branch-isolation 🚫"]:::block
    BR -->|"✅ 已切 feat 分支"| GA{"② Gate A<br/>测试先行"}
    GA -->|"❌ 04 缺失"| X1["skip-gate-a 🚫"]:::block
    GA -->|"✅ 通过"| MOD["③ 逐模块清零<br/>每模块 P0 → 下一模块"]:::phase
    MOD --> GB{"④ Gate B<br/>闭环验证"}
    GB -->|"❌ > 2 轮"| X2["gate-b-limit 🚫"]:::block
    GB -->|"✅ 通过"| SI["⑤ 自改进<br/>自改进复盘"]:::phase
    SI --> DONE["交付"]:::done

```

| 阶段 | 核心动作 | 阻断标识 | 例外 |
|------|---------|---------|------|
| ① 分支隔离 | **强制门禁**：改码前必须已切到 `feat/<name>`，否则阻断 | `bad-branch` / `no-checkout` / `auto-merge` / `no-branch-isolation` | 反推命令只读不写 |
| ② Gate A | 测试设计.md 存在且就绪 | `skip-gate-a` | 单行 CSS/文案 |
| ③ 逐模块清零 | 每模块 P0 清零后进下一模块 | `chain-broken` | — |
| ④ Gate B | 5 步验证 + 三报告闭合，修复 ≤ 2 轮 | `gate-b-limit` | — |
| ⑤ 自改进 | 产出 自改进复盘 | `no-metrics`（降级不阻断） | 数据采集失败时降级 |

## ① 分支隔离 — 强制门禁

> **任何 rui 管线写入操作（doc 写文档、code 改源码、update 增删文件），必须先验证当前分支为 `feat/<name>`。未通过此门禁，禁止任何 Edit/Write 操作。**
>
> 唯一例外：`/rui init` 写入 CLAUDE.md / README.md 等项目级基线文件，不走故事分支。
>
> **确定性执行**: `node skills/rui/branch-check.mjs --story=<name> --mode=write` — feat 分支不存在则从 main 创建，不在则切换，祖先校验。Agent 手动检查为兜底。

```mermaid
flowchart TB
    START["准备改源码"]:::src --> CHECK{"git branch<br/>--show-current"}
    CHECK -->|"feat/&lt;name&gt;"| PASS["✅ 放行<br/>可执行 Edit/Write"]:::pass
    CHECK -->|"main 或其他"| BLOCK["🚫 no-branch-isolation<br/>阻断：禁止改码"]:::block
    BLOCK --> FIX["切到 feat/&lt;name&gt;<br/>或从 main 创建新分支"]:::fix
    FIX --> CHECK

```

```mermaid
flowchart LR
    MAIN["main"]:::base --> FB["feat/&lt;name&gt;"]:::feat
    FB --> CODE["编码"]:::work
    CODE --> MR["开发者手动合并"]:::manual
    FB -.->|"禁止"| X1["自动合并 auto-merge"]:::block
    MAIN -.->|"禁止"| X2["直接在 main 改码 no-checkout"]:::block
    FB -.->|"禁止"| X3["派生分支 bad-branch"]:::block
    MAIN -.->|"禁止"| X4["未切分支即改码<br/>no-branch-isolation"]:::block

```

| # | 规则 | 违反标识 |
|---|------|---------|
| 1 | 功能分支必须从 `main` 创建，命名 `feat/<name>` | `bad-branch` |
| 2 | 改动源码前必须已切到该分支 | `no-checkout` |
| 3 | 功能分支禁止自动合并到主干，git 操作由开发者手动执行 | `auto-merge` |
| 4 | 源码修改唯一入口是 `/rui code` 管线，反推命令只读不写 | — |
| 5 | **任何 Edit/Write 操作源码前，必须先验证 `git branch --show-current` 输出为 `feat/<name>`** | `no-branch-isolation` |
| 6 | 在 `main` 或非 `feat/` 前缀分支上执行 Edit/Write → 立即阻断 | `no-branch-isolation` |
| 7 | 记忆/缓存系统（`.memory/`、本地状态文件等）禁止跨分支共享管线状态，不得用于绕过或削弱分支隔离 | `cache-leak` |

**门禁执行者**：coder Agent、任何执行源码修改的 Agent。  
**验证命令**：`git branch --show-current`  
**阻断恢复**：创建/切换到 `feat/<name>` 分支后重新执行。

## ② Gate A — 测先行

```mermaid
flowchart TD
    ENTER["准备编码"] --> Q1{"测试设计.md<br/>存在?"}
    Q1 -->|"否"| BLOCK["skip-gate-a 🚫"]:::block
    Q1 -->|"是"| Q2{"测试方案与原型<br/>已就绪?"}
    Q2 -->|"否"| BLOCK
    Q2 -->|"是"| Q3{"变更类型?"}
    Q3 -->|"单行 CSS/文案"| BYPASS["跳过 Gate A<br/>仍走分支隔离"]:::bypass
    Q3 -->|"普通代码"| PASS["Gate A ✅<br/>进入编码"]:::pass

```

| # | 规则 | 说明 |
|---|------|------|
| 5 | `测试设计.md` 不存在，不得编码 | 阻断标识 `skip-gate-a` |
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

```

```mermaid
flowchart LR
    subgraph 优先级["优先级"]
        P0["P0<br/>阻塞发布必修"]:::p0
        P1["P1<br/>当轮修复"]:::p1
        P2["P2<br/>记录不阻断"]:::p2
    end

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
    S4 --> S5["⑤ 三报告<br/>测试设计/实施报告/测试报告 交叉引用闭合"]:::step
    S5 --> CHK{"评审清单<br/>全 ✅?"}
    CHK -->|"否 🔄"| FIX["修复（≤2 轮）"]:::fix
    FIX --> S4
    CHK -->|"是 ✅"| PASS["Gate B 通过"]:::pass

```

| # | 规则 | 违反标识 |
|---|------|---------|
| 12 | 五步验证：环境快照 → 静态预检 → 设计对齐 → 单次执行 → 三报告 | — |
| 13 | 三报告交叉引用闭合，评审清单全 ✅ 方过 | — |
| 14 | 修复 ≤ 2 轮，超过阻断 | `gate-b-limit` |
| 15 | 自改进必须产出 自改进复盘 | `no-metrics`（降级） |

## 产出收口

```
故事任务面板/<Story>/
├── 故事任务.md
├── 使用场景.md
├── 技术评审.md
├── 测试设计.md
├── 实施报告.md                 ← coder 产出
├── 测试报告.md                 ← reporter 产出
├── 安全审计.md                 ← security 产出
├── 自改进复盘.md               ← self-improve 产出
├── 消息通知列表.md
└── 交互日志.md
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
    subgraph init["/rui init"]
        E6["无分支隔离"]:::ex
        E7["写项目级基线文件"]:::ex
    end

```

| 场景 | 跳过 | 保留 |
|------|------|------|
| 单行 CSS/文案变更 | Gate A | 分支隔离 |
| 反推命令（`--from-code` / `--from-doc`） | Gate A / Gate B | 分支隔离 + 只读 |
| `/rui init` | 分支隔离 | 验证 + 触发 |

## 阻断标识汇总

```mermaid
flowchart LR
    B1["bad-branch<br/>分支非法"]:::block
    B2["no-checkout<br/>未切换分支"]:::block
    B3["auto-merge<br/>自动合并"]:::block
    B0["no-branch-isolation<br/>未切 feat 分支即改码"]:::block
    B8["no-doc-isolation<br/>未切 feat 分支即写文档"]:::block
    B4["skip-gate-a<br/>Gate A 未过"]:::block
    B5["chain-broken<br/>影响链断裂"]:::block
    B6["gate-b-limit<br/>修复超限"]:::block
    B7["no-metrics<br/>数据缺失"]:::warn

```

| 标识 | 触发条件 | 阻断? |
|------|---------|-------|
| `bad-branch` | 分支非从 main 创建或混入非本故事代码 | ✅ 阻断 |
| `no-checkout` | 未切换故事分支即写入/改码 | ✅ 阻断 |
| `auto-merge` | 功能分支被自动合并到 main | ✅ 阻断 |
| `no-branch-isolation` | `git branch --show-current` 非 `feat/<name>` 时执行 Edit/Write | ✅ 阻断 |
| `no-doc-isolation` | doc/update 阶段在非 `feat/<name>` 分支写入故事文档 | ✅ 阻断 |
| `skip-gate-a` | Gate A 未通过即编码 | ✅ 阻断 |
| `chain-broken` | 影响链未闭合 | ✅ 阻断 |
| `gate-b-limit` | Gate B 修复 > 2 轮 | ✅ 阻断 |
| `no-metrics` | self-improve 数据采集失败 | ⚠️ 降级不阻断 |

## 生效标志

```mermaid
flowchart LR
    S0["分支隔离通过<br/>当前为 feat/&lt;name&gt;"]:::sig --> S1["分支命名合规<br/>feat/&lt;name&gt;"]:::sig
    S1 --> S2["Gate A 通过<br/>测试设计 存在且就绪"]:::sig
    S2 --> S3["P0 全模块清零<br/>无 chain-broken"]:::sig
    S3 --> S4["Gate B 五步全 ✅<br/>修复 ≤ 2 轮"]:::sig
    S4 --> S5["三报告闭合<br/>无矛盾"]:::sig

```

| 标志 | 未达标的处置 |
|------|------------|
| 当前分支为 `feat/<name>`（`no-branch-isolation`） | 创建/切换到 `feat/<name>` 分支，禁止在 main 上改码 |
| 分支命名合规 | 重建分支，从 main 重新拉出 |
| Gate A 通过（测试设计 存在且就绪） | 退回 tester 补充测试设计 |
| P0 全模块清零，无 `chain-broken` | 退回 coder 修复 P0 |
| Gate B 五步全 ✅，修复 ≤ 2 轮 | 退回 coder 修复，超 2 轮阻断 |
| 三报告闭合无矛盾 | 以测试报告为仲裁修正 |

## 支撑技术

> 贯穿管线各阶段的实战技术模式。每项对应一条 Iron Law。

### ① 根因追溯

**Iron Law: NO FIX WITHOUT ROOT CAUSE FIRST**

Bug 常深埋在调用栈中。修复错误出现的位置是治症状。必须向后追溯调用链直到找到原始触发点，然后在源头修复。

| 步骤 | 动作 |
|------|------|
| 1. 观察症状 | 记录错误信息、堆栈、行号 |
| 2. 找直接原因 | 精确定位哪行代码直接导致错误 |
| 3. 追溯调用链 | 逐层问"谁调用了这个？传了什么值？" |
| 4. 找到源头 | 确认原始触发点 |
| 5. 源头修复 | 在源头修，再往下每层加防御 |

### ② 纵深防御

**Iron Law: VALIDATE AT EVERY LAYER, NOT JUST ONE**

修复了由无效数据导致的 bug 后，单处校验不够——那层可被不同代码路径、mock 或重构绕过。在数据通过的每一层都加校验，让 bug 在结构上不可能复现。

| 层 | 用途 | 示例 |
|----|------|------|
| L1 入口校验 | API 边界拒绝明显无效输入 | 空值/类型校验 |
| L2 业务逻辑 | 确保数据对操作有意义 | 格式合法、范围有效 |
| L3 环境守卫 | 阻止特定上下文的危险操作 | 测试环境禁止在非 temp 目录操作 |
| L4 诊断检测 | 捕获上下文用于取证 | 堆栈日志、参数快照 |

全部四层都必要。不在一层校验后停止。

### ③ 条件等待

**Iron Law: WAIT FOR CONDITIONS, NOT FOR GUESSES**

用 `waitFor(() => condition)` 替代 `setTimeout(50)`。等待真正关心的条件，而非猜测需要多久。Flaky 测试常用任意延时猜测时机——这在快机器通过，CI 或负载下失败。

| 场景 | 模式 |
|------|------|
| 等待事件 | `waitFor(() => events.find(e => e.type === 'DONE'))` |
| 等待状态 | `waitFor(() => machine.state === 'ready')` |
| 等待计数 | `waitFor(() => items.length >= 5)` |
| 等待文件 | `waitFor(() => fs.existsSync(path))` |

### ④ 验证门禁

**Iron Law: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**

声称完成前：IDENTIFY（什么命令证明）→ RUN（执行完整命令）→ READ（读完整输出）→ VERIFY（输出确认声称？）→ ONLY THEN 声称。跳过任一步 = 不是验证。

| 声称 | 需要 | 不充分 |
|------|------|--------|
| 测试通过 | 测试命令输出：0 失败 | "上次运行"、"应该通过" |
| Bug 修复 | 测原始症状：通过 | 代码改了、假定修好了 |
| 回归测试有效 | Red-Green 周期验证 | 测试通过一次 |

### ⑤ 反馈回路

**Iron Law: NO DIAGNOSIS WITHOUT A FEEDBACK LOOP FIRST**

修复 bug 前先构建快速、确定、可自动运行的通过/失败信号。有回路 = bug 90% 已定位。无回路 = 猜。

构建顺序：失败测试 → curl/HTTP → CLI+fixture → headless 浏览器 → 回放 trace → harness → fuzz → 二分 → 差分 → HITL。迭代回路：更快？信号更清晰？更确定？2 秒回路是调试超能力。

### ⑥ 深度模块

**Iron Law: NO ABSTRACTION WITHOUT A SECOND CALLER**

> 好模块 = 接口小 + 实现深 = 高杠杆。

| 概念 | 定义 | 信号 |
|------|------|------|
| **模块** | 有接口与实现的任何东西（函数/类/包/切片） | — |
| **接口** | 调用者需知的一切：签名、类型、不变式、错误模式、顺序 | 不止类型签名 |
| **深度** | 接口后面的行为量 / 接口复杂度 | 杠杆 |
| **浅模块** | 接口几乎和实现一样复杂 | 透传、多余的 getter、拆分太细的纯函数 |
| **删除测试** | 删除模块——复杂度消失（透传）还是回到 N 个调用方（值这个价） | 透传 = 该删 |
| **接缝** | 不改原地就能改行为的地方 | 测试的天然切入点 |

优先做深模块。加一个抽象却没有第二个调用方，是浅模块。提取纯函数只为测试，但真正的 bug 在调用方式里——也是浅模块。

### ⑦ 垂直切片

**Iron Law: ONE TEST → ONE IMPLEMENTATION PER CYCLE**

```
❌ 水平：RED(test1,test2,test3) → GREEN(impl1,impl2,impl3)
✅ 垂直：RED(test1) → GREEN(impl1), RED(test2) → GREEN(impl2), ...
```

一次一个测试 → 一次一个实现。每个 cycle 利用上一个 cycle 学到的东西。刚写完代码，清楚什么行为重要。

### 技术集成

| 技术 | 适用阶段 |
|------|---------|
| 根因追溯 | P0 修复 · Gate B 验证 |
| 纵深防御 | P0 修复 · 安全约束 |
| 条件等待 | 测试编写 · Gate A |
| 验证门禁 | Gate A · Gate B · 交付 |
| 反馈回路 | 诊断 · 调试 |
| 深度模块 | 架构设计 · 逐模块实现 |
| 垂直切片 | Gate A · TDD |
| 研究优先 | 影响分析 · 架构设计 |
| 记忆注入 | P0 修复 · 自改进 |

### ⑧ 研究优先开发

**Iron Law: NO ACTION WITHOUT FACTS FIRST**

> 涉及不熟悉模块、外部依赖、或 API 变更时：先 Read/Grep/Glob 建立事实基线，再行动。猜 = 浪费上下文。

| 步骤 | 动作 | 工具 |
|------|------|------|
| 1. 定位 | 确定需要理解的范围 | 项目结构 + 模块边界 |
| 2. 阅读 | 通读相关源码/配置/规约 | Read |
| 3. 搜索 | 全项目搜索关键符号/引用 | Grep |
| 4. 映射 | 画出模块关系图 | mermaid |
| 5. 行动 | 基于事实基线执行变更 | — |

适用触发：影响分析 · 架构设计 · 不熟悉模块的 P0 修复 · 第三方 API 集成。
