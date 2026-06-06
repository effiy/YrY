# CLAUDE.md

> 基础信念是 why。YrY 是故事驱动的 SDLC 编排系统，用自身管线管理自身演进。
> [领域语言](./README.md#领域语言) · [系统全景](./README.md)

[基础信念](#基础信念) · [铁律](#铁律) · [项目画像](#项目画像) · [项目约束](#项目约束) · [项目不可妥协底线](#项目不可妥协底线) · [退化对策](#退化对策) · [自约束](#自约束) · [引导](#引导)

## 基础信念

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    A[信模型<br/>模型能判断] --> B[惜注意<br/>注意力稀缺]
    B --> C[验现实<br/>运行即证]
    C -.反馈修正.-> A
```

**信模型** — 模型有能力判断。上下文中的模型能做出合理决策。检查清单不能替代思考。

**惜注意** — 上下文有限且退化。不必要的信息挤掉必要的信息。退化三因：外部不可达、渐进漂移、人机偏差。上下文工程四原则：时间决定结构（先发生的先写）、相关先于完整（割舍无关细节）、可验优于可读（Grep/Glob 路径优于自然语言）、行动优于解释（代码优于注释）。

**验现实** — 现实是唯一裁判。没验证等于没做。"应该没问题"不可证伪。

公理冲突时优先级：**验现实 > 信模型 > 惜注意**。先确保事实，再相信判断，最后省注意力。

**执行模式**：研究优先开发（research-first development）— 动手前先探。不确定时不猜，查。涉及外部依赖/API/不熟悉模块时，先 Read/Grep/Glob 建立事实基线，再行动。

## 铁律

> 违反字母即是违反精神。以下四条不可妥协：

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE  ← 验现实
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST           ← 验现实
NO P0 LEFT UNCLEARED BEFORE NEXT MODULE                   ← 信模型
EXPRESSION PRIORITY: DIAGRAM → TEXT → TABLE               ← 惜注意
```

| 铁律 | 源于 | 含义 | 违反信号 |
|------|------|------|---------|
| **验先于称** | 验现实 | 未运行验证命令不得声称完成/通过/修复 | "上次通过了"、"应该没问题" |
| **溯先于修** | 验现实 | 未找到根因不得提出修复方案 | "先试一个修复看看" |
| **清先于进** | 信模型 | 模块 P0 未清零不得进入下一模块 | "P0 太难修，标 P1 吧" |
| **表达优先** | 惜注意 | rui 生成文档必须图 → 结构化文本 → 表，不可降级 | 无图文档、架构用大段文字描述 |

<!-- rui:project-start -->
## 项目画像

| 维度 | 值 |
|------|-----|
| 项目名 | YrY |
| 类型 | **meta** — Claude Code 插件，纯规约驱动 |
| 版本 | 4.4.1 |
| 架构 | plugin — 8 技能 + 9 Agent + 10 规则 + 4 共享库（lib/） |
| 生态 | 无 package.json，markdown 规约 + node 辅助脚本 + 共享 lib/ 消除重复 |
| 自托管 | 是 — YrY 用自身管线管理自身演进 |

## 项目约束

### 项目不可妥协底线

- **认证不可绕过** — 涉及 auth/token/session，任何绕过路径为 P0
- **密钥不落盘** — Token/密钥/凭据禁止出现在源码或配置文件；`API_X_TOKEN` 仅通过环境变量传入
- **输入必校验** — 用户输入必须经过验证/转义，XSS/注入为 P0
- **规约完整性** — 每 skill 必须有完整 SKILL.md；Agent 交接信号必须可被下游验证
- **自托管一致性** — plugin.json 版本号必须与实际 skills/agents/rules 内容一致；自身管线不得降级
- **禁止魔法数字** — 所有数字字面量必须赋予语义化常量名；仅 `0`、`1`、`-1`（循环/索引/初始化惯用值）可豁免。项目共享常量统一定义在 `lib/constants.mjs`，各脚本从该处导入
- **分支隔离不可绕过** — 记忆/缓存/本地状态文件禁止跨分支共享管线状态，不得用于削弱或绕过 `feat/<name>` 分支隔离策略

### 退化对策

```mermaid
flowchart LR
    subgraph 退化["退化三因"]
        direction TB
        D1["外部不可达<br/>URL 失效·API 变更"]:::risk
        D2["渐进漂移<br/>术语膨胀·文档过时"]:::risk
        D3["人机偏差<br/>合理化·跳过流程"]:::risk
    end
    subgraph 对策["四层防御"]
        direction TB
        L1["L1 自包含<br/>规约独立可执行"]:::def
        L2["L2 重生机制<br/>全量覆盖标记段"]:::def
        L3["L3 铁律+Red Flags<br/>识别合理化"]:::def
        L4["L4 上下文工程<br/>时间决定结构"]:::def
    end
    退化 --> 对策

    classDef risk fill:#2a1a1a,stroke:#f87171,color:#f87171
    classDef def fill:#1a2a1a,stroke:#34d399,color:#a9b1d6
```

| 退化因 | 对策 | 具体战术 |
|--------|------|---------|
| 外部不可达 | 外部 URL/资源不可达时，技能规约仍独立可执行 | 规约内联关键模式摘要，不依赖外链可达性 |
| 渐进漂移 | 每轮 init 全量重生 rui 标记段；领域语言 Avoid 列标注禁用别名 | 术语变更同步更新 Avoid 列表，防止旧名复用 |
| 人机偏差 | 铁律 + 行为纪律 Red Flags + 验证门禁五步法 | 合理化的 8 类借口 -> 速查表对照；每个声称 -> 五步验证 |
| 跨会话退化 | `.memory/` 执行记忆 + AI 压缩摘要 | 关键决策写入 `.memory/` 自动注入后续上下文 |

### 自约束

- YrY 自身演进走 `/rui` 管线，不得绕过
- 自身 `.claude/` 配置通过 `/rui-claude` 管理
- 技能规约修改后必须重跑 init 验证
- 跨文件共享代码放 `lib/`，禁止 copy-paste；各脚本从 `lib/` 导入通用函数/常量
<!-- rui:project-end -->

## 引导

| 想了解 | 去 |
|--------|-----|
| 管线全流程（分支隔离 · Gate A/B · 逐模块清零 · 支撑技术 · 研究优先开发） | [rules/code-pipeline.md](./rules/code-pipeline.md) |
| 交付收口（三步 hook） | [rules/delivery-gate.md](./rules/delivery-gate.md) |
| 文档生成约束 · 表达优先 | [rules/doc-generation.md](./rules/doc-generation.md) |
| 角色拓扑 · 行为纪律 · 设计原则 · 执行准则 · ADR · 多 Agent 协作模式 | [agents/AGENT.md](./agents/AGENT.md) |
| 自改进闭环（诊断 D0-D7 · 经验技能化 · 记忆压缩注入 · 效果评估 E1-E4） | [rules/self-improve.md](./rules/self-improve.md) · [agents/self-improve.md](./agents/self-improve.md) |
| 共享库（TTY · FS · 常量 · help 布局） | [lib/](./lib/) |
| 领域语言（术语定义） | [领域语言](./README.md#领域语言) |
| 故事文档公式 | [formulas.md](./skills/rui/formulas.md) |
