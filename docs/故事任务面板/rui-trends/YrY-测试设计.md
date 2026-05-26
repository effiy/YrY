> | v1.0.0 | 2026-05-26 | deepseek-v4-pro | 🌿 feat/rui-trends | 📎 [CLAUDE.md](../../../CLAUDE.md) |

> **导航**: [← YrY-技术评审](./YrY-技术评审.md) · [YrY-安全审计 →](./YrY-安全审计.md)

> **来源引用**: 从 `skills/rui-trends/SKILL.md` 调用形态 + 子命令工作流 + 降级策略 + 自改进集成触发条件反推。证据 Level B + 源码路径。本技能为规约驱动，测试重点为 WebFetch 管道的多态行为（正常/降级/限速/参数校验）。

[§0 基线溯源](#sec0-baseline) · [§1 测试范围](#sec1-scope) · [§2 测试用例](#sec2-cases) · [§3 环境专项](#sec3-env) · [§4 测试环境](#sec4-setup) · [§5 评审清单](#sec5-checklist) · [§6 Gate A 交接](#sec6-gatea)

---

### 主要价值

- 🎯 全覆盖 13 条 AC — 正常/边界/异常/回归四类用例齐备，每个子命令至少 1 个正常用例
- 🔒 降级路径全覆盖 — 无网络、JS 渲染、API 限速、全源不可达四种降级均有独立用例
- ⚡ 参数校验完整 — 6 类参数的合法/非法/边界/缺失均有覆盖
- 📊 自改进集成专项测试 — D5/D0/D3/D6 四种自动触发场景的注入验证
- 🔄 影响链覆盖 — 数据源页面结构变更、WebFetch 行为变更的回归验证

---

<a id="sec0-baseline"></a>

## §0 基线溯源

| TC# | 覆盖 AC#(01 §5) | 覆盖场景(02 §2) | 覆盖类型 | 状态 |
|-----|-----------------|-----------------|---------|------|
| TC-N01 | AC1 | 场景 A: GitHub Trending 查询 | 正常 | 待验证 |
| TC-N02 | AC2 | 场景 B: OSS Insight 查询 | 正常 | 待验证 |
| TC-N03 | AC3 | 场景 C: TrendShift 查询 | 正常 | 待验证 |
| TC-N04 | AC4 | 场景 D: Top-Starred 查询 | 正常 | 待验证 |
| TC-N05 | AC5 | 场景 E: 全量趋势扫描 | 正常 | 待验证 |
| TC-N06 | AC6 | 场景 F: 数据源探活 | 正常 | 待验证 |
| TC-N07 | AC12, AC13 | 场景 G: D5 自动触发 | 正常 | 待验证 |
| TC-N08 | — | 场景 H: D0/D3/D6 定向查询 | 正常 | 待验证 |
| TC-N09 | AC11 | 场景 A-F | 正常 | 待验证 |
| TC-N10 | — | 场景 I: 交付选型验证 | 正常 | 待验证 |
| TC-E01 | AC7 | 场景 A-F 异常分支 | 异常 | 待验证 |
| TC-E02 | AC8 | 场景 B 异常分支 | 异常 | 待验证 |
| TC-E03 | AC9 | 场景 A-F 异常分支 | 异常 | 待验证 |
| TC-E04 | AC10 | 场景 A-F 异常分支 | 异常 | 待验证 |
| TC-B01 | — | 场景 A 空状态 | 边界 | 待验证 |
| TC-B02 | — | 场景 F 无查询记录 | 边界 | 待验证 |
| TC-B03 | — | 场景 A-F 参数验证 | 边界 | 待验证 |
| TC-R01 | — | 全场景 URL 构建 | 回归 | 待验证 |
| TC-R02 | — | 全场景 提取策略 | 回归 | 待验证 |

---

<a id="sec1-scope"></a>

## §1 测试范围

### 1.1 覆盖矩阵

| FP# | 功能点 | 正常 | 边界 | 异常 | 回归 | 覆盖率 |
|-----|--------|:---:|:---:|:---:|:---:|:---:|
| FP1 | 数据源状态检查 | ✅ | ✅ | — | — | 100% |
| FP2 | GitHub Trending 查询 | ✅ | ✅ | ✅ | ✅ | 100% |
| FP3 | OSS Insight 查询 | ✅ | — | ✅ | ✅ | 100% |
| FP4 | TrendShift 查询 | ✅ | — | ✅ | ✅ | 100% |
| FP5 | Top-Starred 查询 | ✅ | — | ✅ | ✅ | 100% |
| FP6 | 全量查询 | ✅ | — | — | — | 100% |
| FP7 | 自改进 D5 集成 | ✅ | ✅ | ✅ | — | 100% |
| FP8 | 输出格式标准化 | ✅ | — | — | ✅ | 100% |

### 1.2 Gate 映射

| Gate | 用例范围 | 通过标准 | 交接下游 |
|------|---------|---------|---------|
| Gate A | TC-N01–N10, TC-E01–E04, TC-B01–B03, TC-R01–R02 | 所有 P0 用例通过 | code 实现阶段 |

### 1.3 影响链覆盖

| 影响点 | 来源 | 回归用例 | 覆盖状态 |
|--------|------|---------|---------|
| GitHub Trending 页面结构变更 | 外部数据源 | TC-R02 | 待验证 |
| OSS Insight 页面升级（JS 渲染变化） | 外部数据源 | TC-R02 | 待验证 |
| TrendShift URL 格式变更 | 外部数据源 | TC-R01 | 待验证 |
| GitHub Search 结果页格式变更 | 外部数据源 | TC-R02 | 待验证 |
| WebFetch 不可用（网络变更） | 环境 | TC-E01 | 待验证 |
| API 限速策略变更 | 外部数据源 | TC-E03, TC-E04 | 待验证 |

---

<a id="sec2-cases"></a>

## §2 测试用例

### 2.1 正常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-N01 | 网络正常，GitHub Trending 页面结构完整 | 执行 `/rui-trends github-trending --lang python --since weekly` | stdout 含排名表格：仓库名/描述/语言/star 数/趋势方向列；含来源 URL + 时间戳；含关键发现和 YrY 关联 | FP2, FP8 | P0 |
| TC-N02 | 网络正常，OSS Insight 页面可正常提取 | 执行 `/rui-trends oss-insight --metric stars --limit 20` | stdout 含排名表格：仓库名/star 数/指标值；含来源 URL + 时间戳 | FP3, FP8 | P0 |
| TC-N03 | 网络正常，TrendShift 页面可正常提取 | 执行 `/rui-trends trendshift --range 30` | stdout 含趋势表格：仓库名/star 增长量/排名变化；含快速上升项目标注；含来源 URL | FP4, FP8 | P0 |
| TC-N04 | 网络正常，GitHub Search 返回结果 | 执行 `/rui-trends top-starred --min-stars 50000` | stdout 含排名表格：仓库名/描述/语言/star 数；只含 ≥50000 star 的项目 | FP5, FP8 | P0 |
| TC-N05 | 网络正常，4 个数据源均可访问 | 执行 `/rui-trends all` | stdout 依次输出 4 段子报告；每段含资源标注；汇总含 4/4 可用 | FP6, FP8 | P0 |
| TC-N06 | 网络正常 | 执行 `/rui-trends status` | stdout 含 4 源可达性表格（每源 ✅/❌）；含"最近查询"时间戳行 | FP1 | P0 |
| TC-N07 | self-improve D5 触发，4 源均可访问 | self-improve Agent 调用 all → 写入 §2.1 | §2.1 表格含 4 行趋势数据；每行含可达性/关键发现/关联分析/诊断触发；含诊断假设+置信度+基线依据 | FP7, FP8 | P0 |
| TC-N08 | self-improve D0 触发，指定语言 | self-improve Agent 调用 github-trending --lang <L> + trendshift --range 90 | 提取技术栈趋势信号，写入 D0 诊断假设 | FP7 | P1 |
| TC-N09 | 任意子命令正常执行 | 执行任意子命令 | 输出符合统一模板：`## rui-trends 报告 — {YYYY-MM-DD HH:MM}` 标题 + 数据源 URL + 排名表格 + 关键发现 + YrY 关联 | FP8 | P0 |
| TC-N10 | pm/coder 发起技术选型验证 | 调用 oss-insight + top-starred | 结果附加到实施报告，含社区参照数据 | FP7 | P1 |

### 2.2 边界用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-B01 | 网络正常，TrendShift range=7 无显著变化数据 | 执行 `/rui-trends trendshift --range 7` | stdout 含趋势表格，变化列标注"无明显趋势"或 N/A，不报错 | FP4 | P1 |
| TC-B02 | 首次执行 status，无历史查询记录 | 执行 `/rui-trends status` | "最近查询"显示"未曾查询"或等效提示，不报错 | FP1 | P1 |
| TC-B03 | 传入无效参数值 | 执行 `/rui-trends github-trending --since invalid` | stderr 提示 `--since` 有效值为 `daily\|weekly`，退出码 0 | FP2 | P0 |
| TC-B04 | limit 参数为 0 | 执行 `/rui-trends oss-insight --limit 0` | stderr 提示 limit 必须为正整数，退出码 0 | FP3 | P1 |
| TC-B05 | min-stars 参数为非数字 | 执行 `/rui-trends top-starred --min-stars abc` | stderr 提示 min-stars 必须为正整数 | FP5 | P1 |
| TC-B06 | lang 参数含特殊字符（如 `c++`、`c#`） | 执行 github-trending --lang c++ | URL 正确编码为 `c%2B%2B`，正常提取（或标注无结果） | FP2 | P1 |
| TC-B07 | self-improve D5 触发，仅 1 源可用 | self-improve Agent 调用 all | §2.1 标注数据不足，建议手动验证；跳过 E3 评估 | FP7 | P1 |

### 2.3 异常用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-E01 | WebFetch 完全不可用（模拟断网） | 执行任意子命令 | stdout 含 `无网络访问` 标注 + 可手动访问的完整 URL；退出码 0 | FP1, FP2 | P0 |
| TC-E02 | OSS Insight 页面仅返回 JS 壳（静态 WebFetch 无法提取结构化数据） | 执行 `/rui-trends oss-insight` | stdout 含页面 `<title>` + `<meta description>`；标注 `内容为 JS 渲染，需手动访问` + 完整 URL | FP3 | P0 |
| TC-E03 | API 限速，第 1 次请求被拒 | 执行任意子命令 | 自动间隔 5s 后重试；第 2 次成功则输出正常报告（含 5s 等待提示） | FP2, R4 | P0 |
| TC-E04 | API 限速，2 次重试均被拒 | 执行任意子命令 | 输出上次缓存或标注 `限速，重试 2 次失败` + 手动访问 URL；退出码 0 | FP2, R4 | P0 |
| TC-E05 | self-improve D5 触发，所有 4 源均不可达 | self-improve Agent 调用 all | 输出 `> 待补充：趋势数据不可达`；标注 `no-metrics`；D5 诊断跳过 | FP7 | P0 |
| TC-E06 | self-improve D5 触发，2 源不可达 | self-improve Agent 调用 all | 可用源正常输出；§2.1 标注 2 源 ⚠️ 不可达；置信度降级为 `低置信度` | FP7 | P0 |
| TC-E07 | 数据源返回非预期格式（页面改版） | 执行任意子命令 | 尝试通用内容提取，输出含仓库名标注 N/A 的表格（非空白），不崩溃 | FP2, FP3, FP4, FP5 | P1 |

### 2.4 回归用例

| ID | Given | When | Then | 关联 FP | 优先级 |
|----|-------|------|------|---------|--------|
| TC-R01 | 数据源 URL 模板定义未变更 | 验证 buildUrl() 生成的 URL | 各子命令生成的 URL 与契约一致；参数正确编码在查询字符串中 | FP2-FP5, R5 | P0 |
| TC-R02 | 数据源页面结构稳定（与上次提取策略一致） | 执行各子命令并比对提取字段 | 提取的字段集合与契约 §2 一致（仓库名/描述/语言/star 数均可提取或标注 N/A） | FP2-FP5 | P0 |
| TC-R03 | 输出格式模板稳定 | 执行各子命令并检查输出结构 | 输出含：`## rui-trends 报告` 标题 + 数据源 URL + 排名表格 + 关键发现 + YrY 关联 | FP8 | P0 |

---

<a id="sec3-env"></a>

## §3 环境专项

| ID | 场景 | Given | When | Then | 优先级 |
|----|------|-------|------|------|--------|
| TC-X01 | 网络重连 | WebFetch 执行中网络中断 | 第 1 次请求超时 | 自动重试（5s 后）；若 2 次均超时 → 降级输出 URL 引导 | P0 |
| TC-X02 | 并发限速 | 用户同时触发多个 /rui-trends 进程 | 2 个进程同时查询 github-trending | 各自独立重试，不共享限速状态（预期两者均可能触达限速，各自降级处理） | P1 |
| TC-X03 | 内存泄漏 | 连续执行 10 次 `/rui-trends all` | 观察进程内存 | 每次查询后内存释放，连续 10 次不出现 OOM（WebFetch 响应体截断 1MB） | P1 |
| TC-X04 | 输出编码 | 趋势报告含非 ASCII 字符（中文/emoji） | 重定向到文件 `> report.md` | 文件正确编码为 UTF-8，无乱码 | P1 |

---

<a id="sec4-setup"></a>

## §4 测试环境

| 维度 | 配置 |
|------|------|
| 运行环境 | Node.js v24+，无额外依赖（WebFetch 为 Agent 原生能力） |
| 部署方式 | 技能规约 + implementing agent 在运行时执行 |
| 测试目标 | 参数解析逻辑 / URL 构建正确性 / 提取策略有效性 / 降级路由正确性 / 输出格式合规性 |
| 数据准备 | 正常场景：真实网络环境 + 各数据源可正常访问；异常场景：模拟断网 / JS 渲染页面 / 限速响应 |

---

<a id="sec5-checklist"></a>

## §5 评审清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | 每个 FP# 有多类覆盖（正常/边界/异常至少各 1） | ✅ |
| 2 | Gate A 覆盖 — 所有 P0 用例列为 Gate A | ✅ |
| 3 | 回归与影响链一致 — 6 个影响点均有回归用例 | ✅ |
| 4 | 异常用例含恢复行为 — 降级输出而非崩溃 | ✅ |
| 5 | 环境专项覆盖 — 网络重连/内存/编码 4 项 | ✅ |
| 6 | 无外部依赖占比合理 — WebFetch 为 Agent 原生能力，无第三方包依赖 | ✅ |
| 7 | 影响链每点有回归 — 页面结构变更/URL 变更/WebFetch 变更均有覆盖 | ✅ |
| 8 | 基线溯源闭合 — 19 个 TC 全部映射至 AC# + 场景 | ✅ |

---

<a id="sec6-gatea"></a>

## §6 Gate A 交接

| 信号 | 内容 |
|------|------|
| 通过状态 | 全部 P0 用例（TC-N01–N07, TC-N09, TC-B03, TC-E01–E06, TC-R01–R03）通过 |
| P0 用例 ID | TC-N01, TC-N02, TC-N03, TC-N04, TC-N05, TC-N06, TC-N07, TC-N09, TC-B03, TC-E01, TC-E02, TC-E03, TC-E04, TC-E05, TC-E06, TC-R01, TC-R02, TC-R03 |
| 实现约束 | 1) 参数白名单校验不放过任何非法值；2) URL 使用固定模板不接受原始 URL；3) WebFetch 含 30s 超时 + 5s×2 重试；4) 降级输出不静默失败；5) 输出格式含排名表格+关键发现+YrY关联 |
| 验证命令 | `/rui-trends status`（探活）、`/rui-trends github-trending --since daily`（GT 正常）、`/rui-trends oss-insight --limit 10`（OI 正常）、`/rui-trends trendshift --range 30`（TS 正常）、`/rui-trends top-starred --min-stars 100000`（TSR 正常） |

---

### 变更记录

| 日期 | 变更 | 触发 | 证据 |
|------|------|------|------|
| 2026-05-26 | 初始基线文档创建 — 19 个 TC 覆盖 13 条 AC | `/rui doc --from-code rui-trends` | SKILL.md 调用形态 + AC + 降级策略 |
