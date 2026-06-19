---
name: rui-trends
description: |
  Query GitHub Trending, OSS Insight, TrendShift, and Top-Starred repositories to
  discover technology trends. User-invocable or auto-invoked during the self-improve
  phase for technology selection, architecture validation, and dependency health checks.
  Agent skill discovery delegated to rui-skills; find-skills sub-command retained as
  convenience bridge. Executable: node skills/rui-trends/rui-trends.mjs [command] [options].
  Help: node skills/rui-trends/help.mjs.
user_invocable: true
lifecycle: default-pipeline
---

# rui-trends

> **--help / -h**：执行 `node skills/rui-trends/help.mjs` 输出完整帮助（含数据源全景 + 场景示例）。用户输入 `/rui-trends --help` 或 `/rui-trends -h` 或 `/rui-trends help` 时，直接运行脚本。

技术趋势发现。查询 GitHub Trending、OSS Insight、TrendShift、Top-Starred 四个数据源，输出结构化趋势报告。可执行脚本：`node skills/rui-trends/rui-trends.mjs <command>`；Claude 上下文中由 implementing agent 执行 WebFetch + 结构化提取 + 格式化输出。

[数据源全景](#数据源全景) · [命令](#命令) · [工作流](#工作流) · [输出格式](#输出格式) · [自改进集成](#自改进集成) · [计划集成](#计划集成) · [降级策略](#降级策略) · [数据新鲜度](#数据新鲜度) · [通知面板集成](#通知面板集成)

## 数据源全景

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
    subgraph 数据源["动态数据源"]
        direction TB
        GT["GitHub Trending<br/>github.com/trending"]
        OI["OSS Insight<br/>ossinsight.io"]
        TS["TrendShift<br/>trendshift.io"]
        TSR["Top-Starred<br/>GitHub Search"]
    end

    subgraph 管线["YrY 管线入口"]
        direction TB
        SELF["自改进阶段<br/>D0 · D3 · D5 · D6 诊断"]
        PLAN["计划阶段<br/>技术选型验证"]
        ADHOC["按需查询<br/>独立趋势探查"]
    end

    数据源 -->|"/rui-trends &lt;sub&gt;"| 管线
```

| # | 数据源 | URL | 提供信号 | 主要消费方 |
|---|--------|-----|---------|----------|
| 1 | GitHub Trending | `github.com/trending` | 当前热门仓库 · 语言趋势 | D0 基线偏离 · D3 复杂度 · D6 文档过时 |
| 2 | OSS Insight | `ossinsight.io` | 仓库排名 · 指标对比 | D5 依赖退化 · 计划选型验证 |
| 3 | TrendShift | `trendshift.io` | star 增长量/率 · 排名变化 · 快速上升/下降 | D3 架构简化 · D5 依赖健康 |
| 4 | Top-Starred | `github.com/search` | 社区验证的高星项目 | D5 选型参照 · 计划参考实现 |

## 命令

| 输入 | 行为 | 场景 |
|------|------|------|
| `/rui-trends` 或 `/rui-trends status` | 状态检查：各数据源可达性 + 最近查询时间 | 探活 |
| `/rui-trends github-trending [--lang <L>] [--since daily\|weekly]` | 查询 GitHub Trending 当前榜单 | D0 诊断 · 新兴工具发现 |
| `/rui-trends oss-insight [--metric stars\|forks\|contributors] [--limit N]` | 查询 OSS Insight 仓库排名 | 技术选型数据支撑 |
| `/rui-trends trendshift [--range 7\|30\|90]` | 查询 TrendShift 趋势变化 | 识别快速上升项目 |
| `/rui-trends top-starred [--min-stars N]` | 查询 GitHub 高星项目 | 社区验证参照 |
| `/rui-trends find-skills [--lang <L>]` | 从 GitHub Trending 发现可能的 Agent/技能仓库（桥接至 rui-skills） | 技能发现 · 自改进 D6 |
| `/rui-trends all` | 依次查询全部四个数据源 | 全面趋势扫描 |

## 工作流

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

### find-skills

> Agent 技能发现已委托给 rui-skills 技能。此子命令作为桥接，从 GitHub Trending 中发现可能相关的 Agent/技能仓库，并引导用户使用 `/rui-skills` 进行安装。

```
步骤 1: WebFetch https://github.com/trending(?lang=<L>)
步骤 2: 按关键词过滤（agent, skill, plugin, tool, cli, sdk, framework, ai, llm, claude, assistant）
步骤 3: 输出匹配仓库列表，标注语言和描述
步骤 4: 提示使用 /rui-skills 进行技能发现和安装
```

## 故障排查

| 现象 | 可能原因 | 处理方案 |
|------|---------|---------|
| `github-trending` 无数据 | GitHub 限速（未认证请求 60 req/h） | 等待后重试；或使用 `GITHUB_TOKEN` 环境变量 |
| `oss-insight` 无数据 | 页面为 JS 渲染，HTML 提取不到内容 | 降级为引导用户直接访问 ossinsight.io |
| `trendshift` 无数据 | TrendShift CDN 变更或反爬保护 | 降级输出 URL，标注需手动访问 |
| `top-starred` 无数据 | GitHub Search 需要登录 | 设置 `GITHUB_TOKEN` 环境变量，或降级输出 URL |
| 所有数据源不可达 | 网络限制 / 防火墙 | 标注 `no-metrics`，D5 诊断跳过 |
| `rui-trends.mjs` 执行报错 | Node.js < 18（无全局 fetch） | 升级至 Node 18+，或使用 Claude WebFetch 工具替代 |
| 脚本超时 | 网络延迟高 | 增大 `HTTP_TIMEOUT_MS`（默认 30s），或逐个数据源查询 |

## 输出格式

```markdown
## rui-trends 报告 — {YYYY-MM-DD HH:MM}

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
> 集成锚点：[skills/rui-yry/rules/self-improve.md](../rui-yry/rules/self-improve.md)（诊断规则 D0–D7 · 提案路由 · E1–E4）· [skills/rui-yry/self-improve.md](../rui-yry/self-improve.md)（数据源表 · 操作流程）

### 诊断 × 子命令映射

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
    subgraph 诊断["D0–D7 诊断"]
        D0["D0 基线偏离<br/>技术栈社区趋势下降"]
        D3["D3 复杂度增长<br/>新兴工具可简化架构"]
        D5["D5 依赖退化<br/>外部参考新鲜度验证"]
        D6["D6 文档过时<br/>趋势参考陈旧未更新"]
    end

    subgraph 查询["rui-trends 子命令"]
        GT["github-trending"]
        OI["oss-insight"]
        TS["trendshift"]
        TSR["top-starred"]
    end

    D0 --> GT & TS
    D3 --> GT & OI
    D5 --> GT & OI & TS & TSR
    D6 --> GT & TS
```

| 诊断 | 趋势信号 | 推荐子命令 | 假设示例 | 基线依据 |
|------|---------|-----------|---------|---------|
| **D0** 基线偏离 | 项目依赖的技术栈在社区趋势中持续下降 | `github-trending --lang <L>` + `trendshift --range 90` | "当前技术栈与社区方向背离，可能增加长期维护成本" | CLAUDE.md 技术选型约束 |
| **D3** 复杂度增长 | 存在更简洁的替代方案在快速崛起 | `github-trending` + `oss-insight` | "某新兴工具可替代当前 3 个依赖，降低架构复杂度" | skills/rui/AGENT.md 深度模块原则 |
| **D5** 依赖退化 | 外部参考新鲜度验证 | `all`（四源全查） | "外部数据源有 2 个已变更域名" | skills/rui-yry/rules/self-improve.md D5 规则 |
| **D6** 文档过时 | 连续窗口外部参考陈旧未更新 | `github-trending --since weekly` | "技术趋势参考连续 3 故事未刷新，可能遗漏关键变更" | CLAUDE.md 退化对策 L2 |

### 诊断 → 提案路由

> 趋势发现不直接生成提案——先写入诊断假设，由 self-improve Agent 综合其他数据源（执行记忆、Git diff、基线）判定是否触发。同一趋势信号连续 ≥2 故事触发 → 升级为规则。

| 趋势发现 | 诊断归属 | 提案类型 | 提案示例 | 升级条件 | 升级目标 |
|---------|---------|---------|---------|---------|---------|
| 核心技术栈在社区趋势下降 | D0 | `process` | "建议启动技术选型复审，评估替代方案" | 连续 2 故事触发 | `skills/rui-code/rules/code-pipeline.md` §技术选型 |
| 新兴工具可简化架构 | D3 | `refactor` | "评估 {tool} 替代 {current} 的可行性与风险" | 连续 2 故事触发 | 趋势参考新增对比条目 |
| 外部参考 URL 失效 | D5 | `refactor` | "更新失效链接，补充替代数据源" | 当前故事即修 | — |
| 趋势参考陈旧 | D6 | `process` | "建议每 N 故事自动刷新趋势参考" | 连续 2 故事触发 | `skills/rui-yry/self-improve.md` 数据源表 |

### §2.1 输出模板

> 由 rui-trends 查询结果填充，写入 `自改进复盘.md` §2.1 技术趋势验证。格式遵循 F.story.retrospective 公式（见本 skill 自含的趋势数据模板）。

```markdown
### §2.1 技术趋势验证

> 数据采集时间：{YYYY-MM-DD HH:MM} | 数据源：github-trending / oss-insight / trendshift / top-starred
> 查询命令：/rui-trends {sub} [{options}]

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

{rui-trends 原始输出}

</details>
```

### 触发条件

| 触发场景 | 触发方 | 子命令 | 数据用途 | 阻断? |
|---------|--------|--------|---------|-------|
| 自改进 — D5 诊断 | self-improve Agent | `all` 或按诊断信号选择 | 填入 §2.1 诊断决策表 | 否（降级 `no-metrics`） |
| 自改进 — D0 诊断 | self-improve Agent | `github-trending --lang <L>` + `trendshift --range 90` | 验证技术栈社区方向 | 否 |
| 自改进 — D3 诊断 | self-improve Agent | `github-trending` + `oss-insight` | 评估架构简化机会 | 否 |
| 自改进 — D6 诊断 | self-improve Agent | `github-trending --since weekly` | 验证外部参考新鲜度 | 否 |
| 交付阶段 — 技术选型验证 | pm / coder | `oss-insight` + `top-starred` | 选型依据附加到实施报告 | 否 |
| 按需 — 独立趋势探查 | 用户手动 | 任意子命令 | 探索性查询，不入自改进复盘 | 否 |
| 经验技能化 — 趋势刷新 | self-improve Agent | `all` | 连续 ≥2 故事触发后自动刷新趋势参考 | 否 |

## 计划集成

> 计划生成前查询趋势数据，确保实施计划基于最新技术现实。

### 计划 × 趋势路由

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
    PLAN["plan 阶段启动"] --> TREND{"计划涉及<br/>技术选型或<br/>外部依赖?"}
    TREND -->|"是"| QUERY["自动触发 rui-trends<br/>查询相关数据源"]
    TREND -->|"否"| SKIP["跳过趋势查询"]
    QUERY --> VALIDATE["趋势验证<br/>选型合理性 · 依赖健康度<br/>· 替代方案发现"]
    VALIDATE --> INJECT["注入 plan.html<br/>趋势信号 + 风险标注"]
```

| 计划场景 | 诊断触发 | 推荐子命令 | 计划产出影响 |
|---------|---------|-----------|------------|
| 新增第三方依赖 | D5 依赖退化 | `oss-insight` + `top-starred` | 依赖对比表 + 备选方案 |
| 架构重构（T3） | D3 复杂度增长 | `github-trending` + `trendshift` | 新兴架构模式参考 |
| 性能优化 | D3 复杂度增长 | `github-trending --lang <L>` | 高性能替代工具推荐 |
| 安全加固 | D5 依赖退化 | `github-trending --since weekly` | 安全补丁时效性标注 |
| 文档更新（T1/T2） | D6 文档过时 | `github-trending --since weekly` | 外部参考新鲜度标记 |

### 趋势信号注入

| 趋势信号 | 数据源 | 注入位置 | 影响 |
|---------|--------|---------|------|
| 技术栈社区活跃度下降 | `github-trending --lang <L>` + `trendshift --range 90` | plan.html 风险表 | 标注「技术风险：社区趋势下降」 |
| 新兴替代方案快速崛起 | `github-trending` + `oss-insight` | plan.html 任务总览表 | 新增「技术选型评估」任务 |
| 依赖 URL 可达性验证 | `all`（四源全查） | plan.html 文件结构图 | 更新计划中的外部引用 URL |
| 高星项目提供参考实现 | `top-starred --min-stars N` | plan.html 任务总览表 | 补充「参考实现调研」子任务 |
| 趋势数据陈旧（> 30 天未刷新） | 所有数据源 | plan.html 自审查清单 | 新增审查项「趋势参考已刷新」 |

### 下游 Agent 使用

| Agent | 趋势数据用途 |
|-------|------------|
| coder | 实现时参考高星项目的设计模式和 API 设计 |
| tester | 测试框架选择时参考社区趋势 |
| code-reviewer | 审查时检查是否存在社区公认的更优模式 |
| self-improve | 计划复盘时评估趋势信号预测准确性 |

## 降级策略

| 情况 | 降级行为 | 对自改进的影响 |
|------|---------|--------------|
| WebFetch 不可用（网络限制） | 输出 URL 引导用户手动访问，标注 `无网络访问` | D5 诊断跳过，不计入退化窗口 |
| 页面 JS 渲染无法提取 | 输出页面 title + meta description，标注 `内容为 JS 渲染，需手动访问` | D5 置信度降级，假设标记 `低置信度` |
| API 限速 | 间隔 5s 重试，最多 2 次；仍失败则输出上次缓存 | — |
| 所有数据源不可达 | 输出 `> 待补充：趋势数据不可达`，标注 `no-metrics` | D5 诊断跳过，不计入退化窗口 |
| 部分数据源不可达 | 可用源正常输出，不可达源标注 `⚠️ 不可达` | D5 置信度降级 |
| 数据不足（仅 1 源可用） | 输出可用数据，标注 `数据不足，建议手动验证` | 跳过 E3 评估，仅生成观察记录 |
| 自改进阶段未触发 rui-trends | 不强制查询 | D5 诊断栏标注 `未查询趋势数据`，不视为偏差 |

## 数据新鲜度

趋势数据为实时动态内容，**不缓存到本地文件**。每次查询实时获取。

| 数据类型 | 存储策略 | 保留窗口 | 注入触发 |
|---------|---------|---------|---------|
| 趋势原始数据 | **不落盘**，仅实时查询 | 0（会话级） | — |
| 诊断假设（§2.1） | 写入自改进复盘，跟随故事文档生命周期 | 故事文档保留期 | 同一技术栈再次出现在诊断中 |
| 趋势摘要 | AI 压缩为 ≤3 条关键发现 | 滚动 6 故事 | 技术选型或依赖替换决策时 |
| 趋势新鲜度标记 | 追加「最后验证」时间戳 | 每次 D5 诊断更新 | D5 诊断时检查距今是否 > 30 天 |

## 生效标志

```mermaid
flowchart LR
    S1["多源采集通过<br/>≥2 数据源可用"]:::sig --> S2["趋势分析完成<br/>各信号有明确方向"]:::sig
    S2 --> S3["诊断集成闭环<br/>D5 引用趋势数据"]:::sig
    S3 --> S4["不落盘原则遵守<br/>实时查询无缓存"]:::sig
    S4 --> S5["降级策略就绪<br/>单源/不可达有回退"]:::sig

    classDef sig fill:#34d399,color:#000
```

| 标志 | 未达标的处置 |
|------|------------|
| 多源采集：至少 2 个数据源可正常响应 | 标注数据不足，降级输出 |
| 趋势分析：每个信号有方向（↑↓→）和置信度 | 标注 `待补充` |
| 诊断集成：D5 诊断引用趋势发现 | 补趋势快照注入诊断 |
| 不落盘：无本地缓存，无文件写入 | 删除意外生成的文件 |
| 降级策略：单源或不可达时有明确回退行为 | 审查降级日志，确认合乎预期 |

## 通知面板集成

> 趋势数据通过 `reports.json` 清单注入 `docs/index.html` 通知面板。面板第三个 tab「趋势发现」展示趋势快照历史，通知铃铛计入趋势报告总数。

| 集成点 | 位置 | 数据 |
|--------|------|------|
| 通知铃铛 Badge | `docs/index.html` 右上角 🔔 | 健康 + 循环 + 趋势报告总数 |
| 趋势 Tab | 浮动面板第三个 tab | 趋势快照列表（可达/不可达、趋势方向、条目数） |
| Footer 链接 | 面板底部 | `查看全部趋势报告` → `docs/趋势报告/` |
| 摘要栏 | Tab 内容顶部 | 可达数/不可达数 + 上升趋势统计 |
| 报告详情 | 点击列表项 | 打开 `docs/趋势报告/trend-*.html` |

### HTML 报告生成

```
# 单源趋势快照
node skills/rui-trends/rui-trends.mjs github-trending --html
node skills/rui-trends/rui-trends.mjs trendshift --range 90 --html

# 全量综合报告（推荐）
node skills/rui-trends/rui-trends.mjs all --html
```

每次 `--html` 执行：
1. 查询数据源 → 生成 `docs/趋势报告/trend-{source}-{date}-{ts}.html`
2. 追加条目到 `docs/趋势报告/reports.json`（最多 50 条）
3. 前端面板刷新后自动展示最新快照

## 自循环

> 技术趋势持续监控。Agent 可按间隔周期性自主执行，无需人工触发。

| 属性 | 值 |
|------|-----|
| 推荐间隔 | `0 9 * * 1`（每周一早 9 点） |
| 触发条件 | 项目处于活跃开发期（最近 7 天有 commit） |
| 终止条件 | 趋势数据源全部不可达 / 连续 3 次无新发现 |
| 迭代动作 | 查询多源趋势 → 与上次快照对比 → 有变化时生成 D5 诊断注入 |
| 收敛判定 | 无新趋势信号或所有信号已在诊断中覆盖 |

```mermaid
flowchart LR
    LOOP["⏰ 定时触发"]:::entry --> CHECK{"数据源<br/>可达?"}
    CHECK -->|"✅"| FETCH["查询趋势"]:::op
    CHECK -->|"❌"| SKIP["跳过，标注不可达"]:::warn
    FETCH --> DIFF{"与上次快照<br/>有变化?"}
    DIFF -->|"是"| INJECT["生成 D5 诊断注入"]:::op
    DIFF -->|"否"| DONE["无操作"]:::done
    INJECT --> COUNT{"连续无发现<br/>≥3 次?"}
    COUNT -->|"是"| STOP["终止循环"]:::done
    COUNT -->|"否"| LOOP

    classDef entry fill:#3d59a1,color:#fff
    classDef op fill:#2b2d3b,stroke:#3d59a1,color:#a9b1d6
    classDef warn fill:#fbbf24,color:#000
    classDef done fill:#34d399,color:#000
```
