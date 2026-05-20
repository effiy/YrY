---
name: trends-discovery
description: |
  Query GitHub Trending, OSS Insight, TrendShift, and Top-Starred repositories to
  discover technology trends. User-invocable or auto-invoked during the self-improve
  phase for technology selection, architecture validation, and dependency health checks.
user_invocable: true
lifecycle: default-pipeline
---

# trends-discovery

> **--help / -h**：执行 `node skills/trends-discovery/help.mjs` 输出完整帮助（含场景示例）。用户输入 `/trends-discovery --help` 或 `/trends-discovery -h` 或 `/trends-discovery help` 时，跳过查询逻辑，直接运行脚本并将输出展示给用户。

技术趋势发现。查询 GitHub Trending、OSS Insight、TrendShift、Top-Starred 四个数据源，输出结构化趋势报告。本技能为规约驱动（specification-only），由 implementing agent 执行 WebFetch + 结构化提取 + 格式化输出。

## 数据源全景

```mermaid
flowchart LR
    subgraph 数据源["动态数据源"]
        GT["GitHub Trending<br/>github.com/trending"]:::src
        OI["OSS Insight<br/>ossinsight.io"]:::src
        TS["TrendShift<br/>trendshift.io"]:::src
        TSR["Top-Starred<br/>GitHub Search"]:::src
    end

    subgraph 管线["YrY 管线"]
        SELF["自改进阶段<br/>D5 依赖退化诊断"]:::phase
        DELIVERY["交付阶段<br/>技术选型验证"]:::phase
    end

    数据源 -->|"/trends-discovery &lt;sub&gt;"| 管线

    classDef src fill:#f3e5f5,stroke:#6a1b9a;
    classDef phase fill:#e3f2fd,stroke:#1565c0;
```

## 调用形态

| 输入 | 行为 | 场景 |
|------|------|------|
| `/trends-discovery` 或 `/trends-discovery status` | 状态检查：各数据源可达性 + 最近查询时间 | 探活 |
| `/trends-discovery github-trending [--lang <L>] [--since daily\|weekly]` | 查询 GitHub Trending 当前榜单 | D5 诊断 · 新兴工具发现 |
| `/trends-discovery oss-insight [--metric stars\|forks\|contributors] [--limit N]` | 查询 OSS Insight 仓库排名 | 技术选型数据支撑 |
| `/trends-discovery trendshift [--range 7\|30\|90]` | 查询 TrendShift 趋势变化 | 识别快速上升项目 |
| `/trends-discovery top-starred [--min-stars N]` | 查询 GitHub 高星项目 | 社区验证参照 |
| `/trends-discovery all` | 依次查询全部四个数据源 | 全面趋势扫描 |

## 各子命令工作流

### github-trending

```
步骤 1: WebFetch https://github.com/trending(?since=daily|weekly&language=<L>)
步骤 2: 提取仓库名、描述、语言、今日/本周 star 数、总 star 数
步骤 3: 格式化为表格输出，标注趋势方向（↑ 上升 / ↓ 下降 / → 持平）
步骤 4: 附带来源 URL 和时间戳
```

### oss-insight

```
步骤 1: WebFetch https://ossinsight.io/ + 具体集合页面
步骤 2: 提取仓库排名、指标数据
步骤 3: 格式化为表格输出
步骤 4: 若页面为 JS 渲染无法提取，降级为引导用户直接访问
```

### trendshift

```
步骤 1: WebFetch https://trendshift.io/github-trending-repositories?trending-range=<N>
步骤 2: 提取趋势变化数据（star 增长量/率、排名变化）
步骤 3: 格式化为表格输出，标注快速上升/下降项目
步骤 4: 附带来源 URL
```

### top-starred

```
步骤 1: WebFetch https://github.com/search?q=stars:><N>&type=repositories&s=stars&o=desc
步骤 2: 提取仓库名、描述、语言、star 数
步骤 3: 格式化为表格输出
步骤 4: 附带来源 URL
```

## 输出格式规约

```markdown
## trends-discovery 报告 — {YYYY-MM-DD HH:MM}

> 数据源：{source_name} | URL：{url} | 查询时间：{timestamp}

| 排名 | 仓库 | Stars | 语言 | 趋势 | 描述 |
|------|------|-------|------|------|------|
| 1 | owner/repo | ⭐ N.Nk | TypeScript | ↑ +500/d | Short description |

### 关键发现
- {finding 1}
- {finding 2}

### 与 YrY 的关联
- {relevance point}
```

## 自改进集成

> 本技能是自改进管线 D5 诊断的核心数据源，同时跨 D0/D3/D6 提供外部参照基线。趋势数据为实时快照，不替代基线文件判断——仅作为外部信号辅助诊断假设的证伪或支撑。
>
> 集成锚点：[rules/self-improve.md](../../rules/self-improve.md)（诊断规则 D0–D7 · 提案路由 · E1–E4）· [agents/self-improve.md](../../agents/self-improve.md)（数据源表 · 操作流程）· [libs/trends.md](../../libs/trends.md)（外部参考索引）

### 诊断覆盖全景

```mermaid
flowchart TB
    subgraph 触发["自改进阶段入口"]
        SELF["self-improve Agent<br/>加载基线 + 采集执行数据"]:::phase
    end

    subgraph 诊断["D0–D7 诊断矩阵"]
        D0["D0 基线偏离<br/>技术选型与社区方向背离"]:::diag
        D3["D3 复杂度增长<br/>新兴工具可简化架构?"]:::diag
        D5["D5 依赖退化<br/>外部参考新鲜度验证"]:::diag
        D6["D6 文档过时<br/>libs/ 参考 URL 可达性"]:::diag
    end

    subgraph 查询["趋势查询"]
        GT["github-trending<br/>当前社区热点"]:::action
        OI["oss-insight<br/>仓库排名对比"]:::action
        TS["trendshift<br/>star 增长趋势"]:::action
        TSR["top-starred<br/>顶级项目验证"]:::action
    end

    subgraph 输出["自改进复盘"]
        R21["§2.1 诊断决策表<br/>D0/D3/D5/D6 趋势列"]:::out
        R22["§2.2 六维评估<br/>依赖方向 · 稳定性"]:::out
        R33["§3.3 提案同步<br/>趋势发现 → 提案"]:::out
    end

    subgraph 评估["效果评估"]
        E3["E3 外部参考时效性<br/>关联 bad_case 消失?"]:::eval
    end

    SELF --> D0 & D3 & D5 & D6
    D0 --> GT & TS
    D3 --> GT & OI
    D5 -->|"主触发"| GT & OI & TS & TSR
    D6 --> GT & TS
    GT & OI & TS & TSR --> R21
    R21 --> R22
    R22 --> R33
    R33 --> E3
    E3 -.->|"下次循环"| SELF

    classDef phase fill:#e8f5e9,stroke:#2e7d32;
    classDef diag fill:#fff3e0,stroke:#e65100;
    classDef action fill:#e3f2fd,stroke:#1565c0;
    classDef out fill:#f3e5f5,stroke:#6a1b9a;
    classDef eval fill:#fce4ec,stroke:#c62828;
```

### 诊断 × 子命令映射

| 诊断 | 趋势信号 | 推荐子命令 | 假设示例 | 基线依据 |
|------|---------|-----------|---------|---------|
| **D0** 基线偏离 | 项目依赖的技术栈在社区趋势中持续下降 | `github-trending --lang <L>` + `trendshift --range 90` | "当前技术栈与社区方向背离，可能增加长期维护成本" | CLAUDE.md 技术选型约束 |
| **D3** 复杂度增长 | 存在更简洁的替代方案在快速崛起 | `github-trending` + `oss-insight` | "某新兴工具可替代当前 3 个依赖，降低架构复杂度" | agents/AGENT.md 深度模块原则 |
| **D5** 依赖退化 | libs/ 外部参考 URL 失效或信息过时 | `all`（四源全查） | "libs/trends.md 引用的数据源有 2 个已变更域名" | rules/self-improve.md D5 规则 |
| **D6** 文档过时 | 连续窗口外部参考陈旧未更新 | `github-trending --since weekly` | "技术趋势参考连续 3 故事未刷新，可能遗漏关键变更" | CLAUDE.md 退化对策 L2 |

### 提案路由

> 趋势发现不直接生成提案——先写入诊断假设，由 self-improve Agent 综合其他数据源（执行记忆、Git diff、基线）判定是否触发提案。同一趋势信号连续 ≥2 故事触发 → 升级为规则。

```mermaid
flowchart LR
    subgraph 发现["趋势发现"]
        F1["技术栈下降趋势"]:::find
        F2["新兴替代方案"]:::find
        F3["依赖 URL 失效"]:::find
        F4["libs/ 陈旧未更新"]:::find
    end

    subgraph 路由["提案路由"]
        F1 -->|"D0 基线偏离"| PRC["process<br/>技术选型评审流程调整"]:::prop
        F2 -->|"D3 复杂度"| REF["refactor<br/>依赖替换可行性评估"]:::prop
        F3 -->|"D5 依赖退化"| REF2["refactor<br/>更新 libs/ 外部参考"]:::prop
        F4 -->|"D6 文档过时"| PRC2["process<br/>文档刷新周期调整"]:::prop
    end

    subgraph 升级["经验技能化"]
        PRC & REF & PRC2 -->|"同发现 ≥2 故事"| UP["升级为 libs/trends.md<br/>新鲜度检查规则"]:::up
    end

    classDef find fill:#e3f2fd,stroke:#1565c0;
    classDef prop fill:#f3e5f5,stroke:#6a1b9a;
    classDef up fill:#fff3e0,stroke:#e65100;
```

| 趋势发现 | 诊断归属 | 提案类型 | 提案示例 | 升级条件 | 升级目标 |
|---------|---------|---------|---------|---------|---------|
| 核心技术栈在社区趋势下降 | D0 | `process` | "建议启动技术选型复审，评估替代方案" | 连续 2 故事触发 | `rules/code-pipeline.md` §技术选型 |
| 新兴工具可简化架构 | D3 | `refactor` | "评估 {tool} 替代 {current} 的可行性与风险" | 连续 2 故事触发 | `libs/trends.md` 新增对比条目 |
| libs/ 外部参考 URL 失效 | D5 | `refactor` | "更新 libs/ 失效链接，补充替代数据源" | 当前故事即修 | — |
| libs/ 趋势参考陈旧 | D6 | `process` | "建议每 N 故事自动刷新 libs/ 趋势参考" | 连续 2 故事触发 | `agents/self-improve.md` 数据源表 |

### §2.1 输出模板

> 以下模板由 trends-discovery 查询结果填充，写入 `{project}-自改进复盘.md` §2.1 技术趋势验证。格式遵循 [F.story.retrospective](../../skills/rui/formulas.md) 的 §2 诊断章节约束。

```markdown
### §2.1 技术趋势验证

> 数据采集时间：{YYYY-MM-DD HH:MM} | 数据源：github-trending / oss-insight / trendshift / top-starred
> 查询命令：/trends-discovery {sub} [{options}]

| 数据源 | 可达? | 关键发现 | 与当前技术栈关联 | 诊断触发 |
|--------|-------|---------|----------------|---------|
| GitHub Trending | ✅/❌ | {top 3 趋势关键词} | {关联分析} | D0/D3/D5/D6 / 无 |
| OSS Insight | ✅/❌ | {排名变化} | {关联分析} | D0/D3/D5/D6 / 无 |
| TrendShift | ✅/❌ | {上升最快项目} | {关联分析} | D0/D3/D5/D6 / 无 |
| Top-Starred | ✅/❌ | {高星项目概览} | {关联分析} | D0/D3/D5/D6 / 无 |

**诊断假设**：
- D5 依赖退化：{假设 + 置信度 + 基线依据}
- （若有 D0/D3/D6 触发，追加对应假设行）

**数据源原始报告**：
<details><summary>展开完整趋势报告</summary>

{trends-discovery 原始输出}

</details>
```

### 触发条件全集

| 触发场景 | 触发方 | 子命令 | 数据用途 | 阻断? |
|---------|--------|--------|---------|-------|
| 自改进阶段 — D5 诊断 | self-improve Agent | `all` 或按诊断信号选择 | 填入 §2.1 诊断决策表 | 否（降级 `no-metrics`） |
| 自改进阶段 — D0 诊断 | self-improve Agent | `github-trending --lang <L>` + `trendshift --range 90` | 验证技术栈社区方向 | 否 |
| 自改进阶段 — D3 诊断 | self-improve Agent | `github-trending` + `oss-insight` | 评估架构简化机会 | 否 |
| 自改进阶段 — D6 诊断 | self-improve Agent | `github-trending --since weekly` | 验证 libs/ 参考新鲜度 | 否 |
| 交付阶段 — 技术选型验证 | pm / coder | `oss-insight` + `top-starred` | 选型依据附加到实施报告 | 否 |
| 按需 — 独立趋势探查 | 用户手动 | 任意子命令 | 探索性查询，不入自改进复盘 | 否 |
| 经验技能化 — libs/ 刷新 | self-improve Agent | `all` | 连续 ≥2 故事触发后自动刷新 libs/ 参考 | 否 |

### 记忆压缩与注入

> 趋势快照不缓存到本地文件（数据新鲜度约束），但**诊断结论**通过 self-improve 的记忆压缩管线持久化。

```mermaid
flowchart LR
    subgraph 采集["趋势查询"]
        RAW["实时趋势数据<br/>（不落盘）"]:::data
    end
    subgraph 提取["诊断提取"]
        DIAG["诊断假设 + 置信度<br/>写入 §2.1"]:::diag
    end
    subgraph 压缩["AI 压缩"]
        COMP["趋势摘要<br/>关键发现 ≤3 条"]:::comp
    end
    subgraph 注入["下次注入"]
        INJ["相似技术选型时<br/>注入历史趋势摘要"]:::inj
    end

    采集 --> 提取 --> 压缩 --> 注入

    classDef data fill:#e3f2fd,stroke:#1565c0;
    classDef diag fill:#fff3e0,stroke:#e65100;
    classDef comp fill:#f3e5f5,stroke:#6a1b9a;
    classDef inj fill:#e8f5e9,stroke:#2e7d32;
```

| 数据类型 | 压缩策略 | 保留窗口 | 注入触发 |
|---------|---------|---------|---------|
| 趋势原始数据 | **不落盘**，仅实时查询 | 0（会话级） | — |
| 诊断假设（§2.1） | 写入自改进复盘，跟随故事文档生命周期 | 故事文档保留期 | 同一技术栈再次出现在诊断中 |
| 趋势摘要 | AI 压缩为 ≤3 条关键发现 | 滚动 6 故事 | 技术选型或依赖替换决策时 |
| libs/ 新鲜度标记 | `libs/trends.md` 追加「最后验证」时间戳 | 每次 D5 诊断更新 | D5 诊断时检查距今是否 > 30 天 |

### 降级策略（自改进上下文）

> 在通用降级策略基础上，自改进阶段特有的降级处理。

| 情况 | 降级行为 | 对自改进的影响 |
|------|---------|--------------|
| 所有数据源不可达 | 输出 `> 待补充：趋势数据不可达`，标注 `no-metrics` | D5 诊断跳过，不计入退化窗口 |
| 部分数据源不可达 | 可用源正常输出，不可达源标注 `⚠️ 不可达` | D5 置信度降级，假设标记为 `低置信度` |
| 数据不足（仅 1 源可用） | 输出可用数据，标注 `数据不足，建议手动验证` | 跳过 E3 评估，仅生成观察记录 |
| 自改进阶段未触发 trends-discovery | 不强制查询 | D5 诊断栏标注 `未查询趋势数据`，不视为偏差 |

## 降级策略

| 情况 | 降级行为 |
|------|---------|
| WebFetch 不可用（网络限制） | 输出 URL 引导用户手动访问，标注 `无网络访问` |
| 页面 JS 渲染无法提取 | 输出页面 title + meta description，标注 `内容为 JS 渲染，需手动访问` |
| API 限速 | 间隔 5s 重试，最多 2 次；仍失败则输出上次缓存 |
| 数据源完全不可达 | 输出 `数据源不可达，参见 libs/trends.md 手动查阅` |

## 数据新鲜度

趋势数据为实时动态内容，**不缓存到本地文件**。每次查询实时获取。如需持久化趋势快照，由调用方（自改进 Agent）决定是否写入 `{project}-自改进复盘.md`。
