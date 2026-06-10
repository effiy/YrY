---
name: rui-skills
description: Discover and install Claude/Agent skill packages from the open ecosystem. Command: /rui-skills.
user_invocable: true
lifecycle: default-pipeline
---

# rui-skills

> Agent 技能生态发现：搜索开放生态中的 Agent 技能包，验证质量，协助安装。
>
> 本技能从 [rui-trends](../rui-trends/SKILL.md) 提取，原 `find-skills` 子命令与「技术趋势发现」职责正交。

[命令](#命令) · [工作流](#工作流) · [核心规则](#核心规则)

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
    FIND["/rui-skills find [query]"]:::entry --> SEARCH["搜索开放生态<br/>发现匹配的技能包"]:::op
    SEARCH --> REVIEW["质量验证<br/>检查元数据 · 依赖 · 兼容性"]:::op
    REVIEW --> LIST["展示候选列表<br/>含评分和建议"]:::out
    LIST --> ADD["/rui-skills add &lt;package&gt;"]:::entry
    ADD --> INSTALL["安装技能包<br/>配置到 .claude/ 目录"]:::op
    INSTALL --> DONE["Agent 能力扩展完成"]:::done

    classDef entry fill:#3d59a1,color:#fff
    classDef op fill:#2b2d3b,stroke:#3d59a1,color:#a9b1d6
    classDef out fill:#34d399,color:#000
    classDef done fill:#34d399,color:#000
```

## 命令

| 输入 | 行为 | 场景 |
|------|------|------|
| `/rui-skills find [query]` | 搜索开放生态中的 Agent 技能 | 发现可安装的技能扩展 |
| `/rui-skills add <package>` | 安装指定的技能包 | 扩展 Agent 能力 |
| `/rui-skills --help` | 显示完整帮助 | — |

## 工作流

### find — 技能发现

> 搜索开放 Agent 技能生态，发现可安装的技能包。适用场景：用户询问"有没有 X 技能"、希望扩展 Agent 能力。

```
步骤 1: 理解需求 — 识别领域、任务类型
步骤 2: 查阅 https://skills.sh/ 确认知名技能
步骤 3: 运行 npx skills find <query> 搜索（无匹配则告知用户）
步骤 4: 质量验证 — 安装量（≥1K 为佳）、来源信誉、GitHub stars（<100 需怀疑）
步骤 5: 呈现选项 — 技能名称、功能、安装量、来源、安装命令
步骤 6: 协助安装 — npx skills add <owner/repo@skill> -g -y
```

**关键命令**：

| 命令 | 用途 |
|------|------|
| `npx skills find [query]` | 交互式或关键词搜索 |
| `npx skills add <package>` | 从 GitHub 或其他源安装 |
| `npx skills check` | 检查技能更新 |
| `npx skills update` | 更新所有已安装技能 |

**搜索技巧**：使用具体关键词（"react testing" 优于 "testing"）；无结果时尝试替代术语（"deploy" → "deployment" / "ci-cd"）；关注热门来源 `vercel-labs/agent-skills`、`ComposioHQ/awesome-claude-skills`。

**未找到时**：明确告知 → 提供直接协助 → 建议 `npx skills init` 自建技能。

### add — 技能安装

```
步骤 1: 验证包名格式（owner/repo@skill 或 package-name）
步骤 2: npx skills add <package> -g -y
步骤 3: 验证安装成功（npx skills list 确认）
步骤 4: 输出安装确认和使用说明
```

## 核心规则

| # | 规则 |
|---|------|
| 1 | 安装前验证来源信誉（GitHub stars ≥ 100，安装量 ≥ 1K） |
| 2 | 低信誉来源需明确警告用户 |
| 3 | 安装失败时提供诊断信息和手动安装路径 |
| 4 | 不自动安装未经用户确认的技能包 |

## 与 rui 的关系

本技能是独立工具技能，不属于 rui 编排管线（init → doc → plan → code → update → yry）。用户按需手动调用，用于扩展 Agent 能力。

## 生效标志

| 标志 | 验证方式 |
|------|---------|
| find 返回结构化结果 | 表格含技能名、功能、安装量、来源 |
| add 安装后技能可用 | `npx skills list` 含新技能 |
| 质量验证不绕过 | 低信誉来源有明确警告 |
