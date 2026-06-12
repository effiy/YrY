---
name: rui
description: Story-driven SDLC orchestrator — thin router that delegates to sub-skills. Command: /rui.
user_invocable: true
lifecycle: default-pipeline
agents:
  required: [pm, planner, coder, tester, reporter, security, self-improve]
  optional: [code-reviewer, architect]
---

# rui

> 故事驱动 SDLC 编排器：接收用户需求，路由到对应子技能管线。自主识别故事任务 → 委托子技能执行。
>
> 哲学源自 [CLAUDE.md](../../CLAUDE.md)。命令路由表定义 `/rui` 与各子技能的关系。

[命令路由](#命令路由) · [推荐引擎](#推荐引擎) · [管线一览](#管线一览) · [核心规则](#核心规则) · [阻断标识](#阻断标识) · [子技能一览](#子技能一览) · [子技能契约](#子技能契约) · [支撑文件](#支撑文件) · [生效标志](#生效标志)

## 命令路由

| 用户输入 | 路由目标 | 说明 |
|---------|---------|------|
| `/rui init` | → [rui-init](../rui-init/) | 项目基线建立 |
| `/rui doc <需求>` | → [rui-doc](../rui-doc/) | 需求 → 文档基线 |
| `/rui doc --from-code [需求]` | → [rui-doc](../rui-doc/) | 源码反推文档 |
| `/rui doc --from-local <name>` | → [rui-doc](../rui-doc/) | 补全缺失文档 |
| `/rui plan <name>` | → [rui-plan](../rui-plan/) | 实施计划生成 |
| `/rui code <name>` | → [rui-code](../rui-code/) | 源码实现 |
| `/rui code --from-doc <name>` | → [rui-code](../rui-code/) | 文档反推补全 |
| `/rui update <name> [ctx]` | → [rui-update](../rui-update/) | 增量更新 |
| `/rui yry [--depth N]` | → [rui-yry](../rui-yry/) | 自改进闭环 |
| `/rui version --up` | → [rui-version](../rui-version/) | 版本升级 |
| `/rui version --rollback <name>` | → [rui-version](../rui-version/) | 版本回退 |
| `/rui <需求>` | → rui-doc → rui-code | 端到端 |
| `/rui` (无参数) | 推荐引擎 | 任务推荐 |

## 推荐引擎

> 无参数 `/rui` 触发推荐，不执行任何写入操作。

1. **§0 面板同步** — 同步远端 + 扫描本地故事面板，检测冲突
2. **L-1 基建优先** — 7 项基建（错误码/状态管理/日志规范/配置管理等）任一缺位时优先推荐
3. **5 层评分** — 数据采集（`node lib/recommend.mjs`）→ PM 按 [ranking.md](./ranking.md) 评估排序
4. **冲突避免** — FP# 重叠 ≥ 70% 跳过推荐，50–69% 标注警告

## 管线一览

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b', 'primaryTextColor': '#a9b1d6', 'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1', 'secondaryColor': '#2b2d3b', 'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    A[用户输入] --> A1{匹配已有故事?}
    A1 -->|"是"| A2[补充更新已有]
    A1 -->|"否"| A3[新建故事目录]
    A2 --> B[自适应规划] --> C[影响分析] --> D[架构设计] --> E[文档生成]
    A3 --> B
    E --> P[计划门禁] --> F[预检 分支隔离] --> G[Gate A 测试先行] --> H[实现] --> I[Gate B 验证] --> J[自改进] --> K[交付]
    K --> K1[rui-import] --> K2[rui-bot]
```

## 核心规则

| # | 规则 |
|---|------|
| 1 | **逐故事串行** — 多故事按拆分顺序处理，互不交叉 |
| 2 | **分支隔离（强制）** — 任何 Edit/Write 前必须验证当前分支为 `feat/<name>` |
| 3 | **源码唯一入口** — 只能走 `/rui code` 改源码 |
| 4 | **测试先行** — Gate A 阻断实现；Gate B >2 轮阻断交付 |
| 5 | **逐模块 P0 清零** — 每模块审查后 P0 清零再前进 |
| 6 | **只读反推** — `--from-code` / `--from-doc` 禁止改源码 |
| 7 | **产出内聚** — 关键产出限定在 `docs/故事任务面板/<name>/` |
| 8 | **公式驱动** — 文档由 [formulas.md](./formulas.md) 规约 |
| 9 | **知识沉淀** — 提案写入 `.improvement/proposals.jsonl`；执行记忆写入 `.memory/execution-memory.jsonl` |
| 10 | **交付收口** — 手动按需触发 rui-import + rui-bot |
| 11 | **自主测试** — 每次故事任务变更后自动执行自检 |
| 12 | **表达优先** — 文档内容必须 图 → 结构化文本 → 表，架构/流程/关系优先 mermaid，不可降级 |

## 阻断标识

| 标识 | 含义 |
|------|------|
| `no-parse` | 需求无法解析 |
| `no-source` | P0 章节缺上游来源 |
| `chain-broken` | 影响链未闭合 |
| `doc-p0` | 文档 P0 不通过且无法自修复 |
| `no-doc-isolation` | doc/update 阶段在非 `feat/<name>` 分支写入 |
| `bad-branch` | 分支未从 main 创建或混入非本故事代码 |
| `no-checkout` | 未切换故事分支即写入/改码 |
| `no-branch-isolation` | `node lib/branch-check.mjs` 验证失败 |
| `skip-gate-a` | Gate A 未通过即编码 |
| `code-p0` | 代码 P0 无法修复 |
| `gate-b-limit` | Gate B >2 轮 |
| `auto-merge` | 功能分支被自动合并到 main |
| `no-token`（降级） | `API_X_TOKEN` 缺失 |
| `no-metrics`（降级） | self-improve 数据采集失败 |
| `no-plan` | 文档后无计划 |
| `plan-placeholder` | 计划中有 TODO/TBD |

## 子技能一览

| 技能 | 目录 | 职责 |
|------|------|------|
| rui-init | [../rui-init/](../rui-init/) | 项目初始化 |
| rui-doc | [../rui-doc/](../rui-doc/) | Markdown 文档基线生成 |
| rui-plan | [../rui-plan/](../rui-plan/) | 实施计划 |
| rui-code | [../rui-code/](../rui-code/) | 源码实现管线 |
| rui-update | [../rui-update/](../rui-update/) | 增量更新 |
| rui-yry | [../rui-yry/](../rui-yry/) | 自改进闭环 |
| rui-version | [../rui-version/](../rui-version/) | 版本管理 |
| rui-html | [../rui-html/](../rui-html/) | HTML 文档生成 |
| rui-analysis | [../rui-analysis/](../rui-analysis/) | 代码与架构静态分析 |
| rui-reporter | [../rui-reporter/](../rui-reporter/) | 过程报告与知识策展 |
| rui-story | [../rui-story/](../rui-story/) | 故事面板管理 |
| rui-claude | [../rui-claude/](../rui-claude/) | .claude/ 配置管理 |
| rui-import | [../rui-import/](../rui-import/) | 文档远端同步 |
| rui-bot | [../rui-bot/](../rui-bot/) | 企业微信通知 |
| rui-npm | [../rui-npm/](../rui-npm/) | npm 包管理 |
| rui-trends | [../rui-trends/](../rui-trends/) | 技术趋势发现 |
| rui-skills | [../rui-skills/](../rui-skills/) | Agent 技能生态发现与安装 |

## 子技能契约

> 每个子技能的输入/输出/交接信号。rui 编排器据此验证阶段完成状态。

| 阶段 | 技能 | 输入 | 输出 | 交接信号 |
|------|------|------|------|---------|
| 初始化 | rui-init | 项目根目录 | CLAUDE.md · README.md · docs/index.html | 三文件存在且非空 |
| 需求→文档 | rui-doc | 用户需求文本/URL/@文件 | 故事任务.md + 场景-N-<slug>.md (§0+§1) | §0 含效果示意 mermaid · F.meta 完整 |
| 计划 | rui-plan | 故事目录 | plan.html + 计划清单.html | plan.html 存在 · 六项自审查通过 |
| 实现 | rui-code | 故事目录 + 计划 | §2 实施报告 + 源码变更 | P0 全模块清零 · Gate B ≤2 轮 |
| 增量更新 | rui-update | 故事名 + 变更上下文 | 按 T 级刷新的文档/代码 | 版本号 + version_history 已更新 |
| 自改进 | rui-yry | 故事面板全量数据 | D0-D7 诊断 + proposals.jsonl | 提案已写入 · E1-E4 评估完成 |
| 版本管理 | rui-version | 版本号/回退目标 | plugin.json + CLAUDE.md + 文档版本行 | 版本号全局一致 |
| 面板管理 | rui-story | 故事名 (可选) | 状态概览/同步/删除 | 远端查询成功或同步完成 |
| HTML 生成 | rui-html | 故事目录 | 7 类 HTML 文件 | 每场景 HTML 自包含可渲染 |
| 文档同步 | rui-import | 项目根/目录 | 远端 session 更新 | created/overwritten/failed 计数 |
| 通知 | rui-bot | 消息文本 | 企业微信消息 + 通知日志 | HTTP 200 响应 |
| 趋势发现 | rui-trends | 技术栈关键词 | 趋势快照 + D5 诊断注入 | 多源采集 ≥2 可用 |
| 静态分析 | rui-analysis | 项目根/范围路径 | 五维分析报告 | 每条发现附文件路径证据 |
| 配置管理 | rui-claude | .claude/ 目录 | 健康报告/同步 | 版本一致 · 无漂移 |
| 生态发现 | rui-skills | 查询词/包名 | 技能候选列表/安装确认 | 元数据 · 依赖 · 兼容性验证通过 |

## 支撑文件

| 类别 | 内容 |
|------|------|
| 文档公式 | [formulas.md](./formulas.md) — F.meta · F.toc · F.nav · F.story.task · F.story.scene · F.story.knowledge-graph · F.supp.* |
| Coder 工作手册 | [coder.md](./coder.md) — 目录布局 · 生命周期 · 完整度判定 · 数据契约 |
| 推荐评分 | [ranking.md](./ranking.md) — 5 层链式管线评分框架 |
| 关注点 | [concerns/](./concerns/) — 集成 · 诊断 · 架构 · 交接 |
| 共享脚本 | [lib/audit.mjs](../../lib/audit.mjs) · [lib/branch-check.mjs](../../lib/branch-check.mjs) · [lib/recommend.mjs](../../lib/recommend.mjs) · [lib/proposals.mjs](../../lib/proposals.mjs) · [lib/record.mjs](../../lib/record.mjs) |
| 规则 | [code-pipeline](../../rules/code-pipeline.md) · [delivery-gate](../../rules/delivery-gate.md) · [doc-generation](../../rules/doc-generation.md) · [self-improve](../../rules/self-improve.md) · [rui-claude](../../rules/rui-claude.md) |

## 降级策略

| 情况 | 降级行为 |
|------|---------|
| 子技能执行失败 | 记录阻断标识，退回失败阶段 |
| 需求无法解析 | 输出 `no-parse` 阻断，提示重新描述 |
| 文档 P0 不通过且无法自修复 | 输出 `doc-p0` 阻断，人工介入 |
| 分支隔离验证失败 | 输出 `no-branch-isolation` 阻断，引导切分支 |
| Gate B > 2 轮 | 输出 `gate-b-limit` 阻断，质疑架构 |
| self-improve 数据采集失败 | 输出 `no-metrics` 降级，不阻断交付 |
| rui-import 同步失败 | 记录告警，不影响交付状态 |
| rui-bot 通知失败 | 记录告警，不影响交付状态 |

## 生效标志

```mermaid
flowchart LR
    S1["路由正确<br/>子命令委托到对应子技能"]:::sig --> S2["管线闭合<br/>story→doc→code→delivery 全阶段通过"]:::sig
    S2 --> S3["分支隔离<br/>写操作前验证 feat/&lt;name&gt;"]:::sig
    S3 --> S4["文档公式<br/>F.meta · F.toc · F.nav 完整"]:::sig
    S4 --> S5["交付收口<br/>文档同步 · 通知发送"]:::sig

    classDef sig fill:#34d399,color:#000
```

| 标志 | 未达标的处置 |
|------|------------|
| 路由正确：所有 `/rui <sub>` 委托到正确子技能 | 检查命令路由表和子技能 SKILL.md |
| 管线闭合：story → doc → code → delivery 四阶段全部通过 | 退回失败阶段重新执行 |
| 分支隔离：写操作前 `git branch --show-current` 为 `feat/<name>` | 切到 feat 分支后重新执行 |
| 文档公式：所有产出文档符合 F.meta + F.toc + F.nav | 补全缺失的公式元素 |
| 交付收口：文档同步到远端 + 通知已发送 | 手动执行 sync + rui-bot |
