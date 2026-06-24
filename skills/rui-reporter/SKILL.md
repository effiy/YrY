---
name: rui-reporter
description: Process reporting and knowledge curation — produce evidence-based reports, cross-reference story documents, curate knowledge. Command: /rui-reporter.
user_invocable: true
lifecycle: default-pipeline
agents:
  required: [reporter]
---

# rui-reporter

> 过程报告与知识策展：记发生过的事（记），每条结论附引用（引），场景文档各 § 交叉对齐（串）。共性知识 ≥2 来源。
>
> 继承自 [skills/rui-reporter/reporter.md](./reporter.md) 的规约。
>
> **单一职责**：报告生成与知识策展。读取各阶段产出（执行记忆、git diff、测试报告），交叉验证一致性，生成证据驱动的报告。不负责健康评分（那是 [rui-health](../rui-health/) 的职责），不负责消息推送（那是 [rui-bot](../rui-bot/) 的职责）。

[命令](#命令) · [执行流程](#执行流程) · [报告类型](#报告类型) · [审查维度](#审查维度) · [知识策展](#知识策展) · [核心规则](#核心规则) · [降级策略](#降级策略) · [生效标志](#生效标志) · [与 rui 的关系](#与-rui-的关系) · [自循环](#自循环)

## 命令

| 命令 | 说明 | 输出 |
|------|------|------|
| `/rui-reporter` | 项目级进程摘要 | Markdown 报告 |
| `/rui-reporter --story <name>` | 单故事详细报告 | Markdown 报告 |
| `/rui-reporter knowledge-graph` | 知识图谱一致性检查 | 不一致清单 + 修复建议 |
| `/rui-reporter metrics-history` | 跨故事流水线指标趋势 | 趋势表格 + 图表 |
| `/rui-reporter delivery-summary` | 交付摘要报告 | 变更统计 + 测试结果 |
| `/rui-reporter --format json` | JSON 输出（供管线消费） | 结构化 JSON |
| `/rui-reporter --format html` | HTML 报告（自包含） | 可独立查看的 HTML |

## 执行流程

### `/rui-reporter` — 项目级进程摘要

```
步骤 1: 扫描 docs/故事任务面板/ 全部故事目录
步骤 2: 读取每个故事的 .memory/rui-state.json 获取阶段状态
步骤 3: 统计：故事总数 · 完成数 · 进行中数 · 阻断数
步骤 4: 汇总跨故事指标（阻断率、P0 密度、Agent 参与分布）
步骤 5: 格式化输出摘要表格
```

### `/rui-reporter --story <name>` — 单故事详细报告

```
步骤 1: 定位 docs/故事任务面板/<name>/
步骤 2: 读取 execution-memory.jsonl → 管线阶段时间线 + 阻断事件
步骤 3: 读取 delivery-tracking.jsonl → 交付状态
步骤 4: 读取 rui-state.json → 当前阶段与阻塞信息
步骤 5: 交叉验证场景文档各 § 闭合性
步骤 6: 输出：故事进程 · 质量指标 · 知识图谱一致性 · 交付状态
```

### `/rui-reporter knowledge-graph` — 知识图谱一致性检查

```
步骤 1: 读取 知识图谱.json
步骤 2: 交叉验证 故事任务.md §2 的 FP# 覆盖
步骤 3: 检查 implements 边完整性
步骤 4: 检查层次闭合（每个 flow ≥ 3 steps）
步骤 5: 检测悬挂边
步骤 6: 输出不一致清单 + 修复建议
```

### `/rui-reporter metrics-history` — 跨故事指标趋势

```
步骤 1: 扫描全部故事的 execution-memory.jsonl
步骤 2: 按周聚合：故事完成率 · 平均阻断率 · P0 密度
步骤 3: 对比历史窗口（默认 12 周）
步骤 4: 识别趋势方向（↑改善 / ↓退化 / →持平）
步骤 5: 输出趋势表格 + 经验技能化候选
```

### `/rui-reporter delivery-summary` — 交付摘要

```
步骤 1: 读取 git diff --stat 获取变更文件统计
步骤 2: 读取测试报告获取通过率
步骤 3: 读取 P0 审查表确认清零
步骤 4: 读取 Gate B 裁决
步骤 5: 输出交付摘要（可发布/有条件发布/不可发布）
```

## 报告类型

### 1. 故事进程报告

追踪管线阶段、阻断事件汇总、Agent 参与统计、质量指标趋势。

**数据源**：`.memory/execution-memory.jsonl`、`.memory/rui-state.json`、`.memory/delivery-tracking.jsonl`

**输出格式**：

```markdown
## 故事进程报告 — {story_name}

### 管线阶段
| 阶段 | 状态 | 开始时间 | 完成时间 | 耗时 |
|------|------|---------|---------|------|

### 阻断事件
| 事件 | 类型 | 时间 | 处置 | 状态 |
|------|------|------|------|------|

### Agent 参与
| Agent | 参与次数 | 产出 | 质量 |
|-------|---------|------|------|

### 质量指标
| 指标 | 当前值 | 目标 | 状态 |
|------|--------|------|------|
```

### 2. 知识图谱一致性报告

| 检查项 | 验证方式 | 不通过处置 | 严重度 |
|--------|---------|-----------|--------|
| 功能点覆盖 | 故事任务.md §2 每个 FP# 在知识图谱中有对应 node | 退回 pm 补节点 | Critical |
| 实现覆盖 | 每个 file/function 节点有 `implements` 边指向 step | 退回 coder 补边 | Critical |
| 层次完整 | 每个 flow ≥ 3 steps，weight 连续递增 | 补 step 或重新编号 | Warning |
| 无悬挂边 | edges 中 source/target 全部在 nodes 中存在 | 移除悬挂边 | Warning |
| 类型一致 | node 类型与 edge 类型匹配 | 修正类型标注 | Info |

### 3. 交付摘要报告

| 区块 | 内容 | 数据源 |
|------|------|--------|
| 变更统计 | 新增/修改/删除文件数 + 代码行数 | `git diff --stat` |
| 测试结果 | 通过/失败/跳过数 + 覆盖率 | 测试报告 |
| P0 状态 | P0 总数 + 清零确认 | P0 审查表 |
| Gate B 裁决 | 轮次 + 结果 + 备注 | Gate B 报告 |
| 交付建议 | 可发布/有条件发布/不可发布 | 综合判定 |

### 4. 跨故事流水线指标历史

| 指标 | 计算方式 | 趋势 | 阈值 |
|------|---------|------|------|
| 故事完成率 | 已完成 / 总数 | ↑↓→ | > 80% |
| 平均阻断率 | 阻断故事 / 总数 | ↑↓→ | < 20% |
| P0 密度 | P0 数 / 故事数 | ↑↓→ | < 2/故事 |
| 平均周期 | 从 doc 到 delivery 的平均时间 | ↑↓→ | < 7 天 |
| 经验技能化率 | 已技能化 / 可技能化 | ↑↓→ | > 50% |

## 审查维度

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b', 'primaryTextColor': '#a9b1d6', 'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1', 'secondaryColor': '#2b2d3b', 'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    A["Accuracy<br/>数据与 git diff/测试结果一致"]:::dim
    C["Completeness<br/>清单无遗漏"]:::dim
    T["Traceability<br/>结论可追溯"]:::dim
    S["Consistency<br/>场景文档各 § 无矛盾"]:::dim

    classDef dim fill:#2b2d3b,stroke:#3d59a1,color:#a9b1d6
```

| 维度 | 检查点 | 验证方法 | 不通过的处置 |
|------|--------|---------|------------|
| **Accuracy** | 数据与 git diff / 测试结果一致 | 交叉对比 git 数据 | 退回 coder 补实际数据 |
| **Completeness** | 评审清单无遗漏 | 对照报告模板检查 | 补报告缺失章节 |
| **Traceability** | 每条结论可追溯到具体证据 | 检查证据路径 | 补证据引用（文件路径/测试 ID） |
| **Consistency** | 场景文档各 § 无矛盾 | 逐 § 交叉对比 | 以 §3 测试报告为仲裁 |

## 知识策展

### 策展原则

| 原则 | 说明 | 反例 |
|------|------|------|
| **记发生的事** | 记录实际执行路径，不修饰 | "一切顺利"（掩盖了 2 次重试） |
| **引证据** | 每条结论附来源引用 | "性能提升 30%"（无数据支撑） |
| **串文档** | 场景文档各 § 交叉对齐 | §2 说"接口未变"但 §3 报了接口错误 |
| **≥2 来源** | 共性知识需 ≥2 个独立来源 | 仅凭一条 git log 断言"本次改了认证" |

### 策展流程

```
1. 收集 — 从 execution-memory、git log、测试报告收集原始数据
2. 验证 — 交叉验证数据一致性（≥2 来源）
3. 归纳 — 提取共性模式，标注证据等级
4. 记录 — 写入报告，每条结论附引用
5. 提交 — git commit 策展结果
```

### 经验技能化候选

当同一模式在 ≥2 个故事中出现时，标记为经验技能化候选：

| 模式 | 出现次数 | 来源故事 | 建议 |
|------|:---:|---------|------|
| 某类 bug 反复出现 | ≥2 | story-A, story-B | 提取为检查规则 |
| 同类重构重复执行 | ≥2 | story-C, story-D | 提取为自动化脚本 |
| 同类文档缺失 | ≥2 | story-E, story-F | 补充文档模板 |

## 核心规则

| # | 规则 | 反例 | 设计理由 |
|---|------|------|---------|
| 1 | 过程报告不扭曲实际路径 | 跳过失败的测试，只报告通过的 | 报告必须反映真实执行路径 |
| 2 | 不编造失败/建议 | "建议优化性能"——无性能数据支撑 | 每条建议需证据支撑 |
| 3 | 知识策展需 ≥ 2 个独立来源 | 仅凭一条 git log 断言"本次改了认证" | 防止单源偏差 |
| 4 | 写入 docs/ 的陈述必须是 Level A/B 或标 Level C | 无来源断言"系统性能提升 30%" | 证据等级纪律 |
| 5 | 交叉引用闭合：场景文档各 § 互引一致 | §2 说"接口未变"但 §3 报了接口错误 | 文档一致性 |
| 6 | 策展阶段必须 git commit | 故事关闭但变更未提交 | 可追溯性 |

## 证据等级

> 每条写入报告的结论必须标注证据等级。

| 等级 | 定义 | 示例 | 可信度 |
|:---:|------|------|:---:|
| **A** | 可复现的自动化验证结果 | 测试通过率 100% (vitest 输出) | 高 |
| **B** | 可追溯的人工审查结果 | 代码审查通过 (reviewer 确认) | 中高 |
| **C** | 单源推断/经验判断 | "基于经验，此处可能有性能问题" | 低 |
| **D** | 无来源断言 | "系统运行正常" | 不可接受 |

**规则**: 写入 docs/ 的陈述必须是 Level A/B 或明确标注 Level C。Level D 不可写入。


## 测试

> 报告生成的证据等级验证、数据一致性、知识策展规则和跨故事指标计算。

### 运行测试

```bash
npx vitest run skills/rui-reporter/tests/          # 全量运行
npx vitest skills/rui-reporter/tests/              # 监听模式
npx vitest run --coverage skills/rui-reporter/tests/  # 覆盖率报告
```

### 测试文件

| 文件 | 测试范围 | 类型 |
|------|---------|:---:|
| `tests/rui-reporter.test.mjs` | 报告生成、证据等级验证、知识策展规则、一致性检查 | 单元 |

### 测试策略

| 层级 | 范围 | 要求 |
|------|------|------|
| **证据等级测试** | A/B/C/D 四级判定逻辑、D 级拒绝规则 | 每级有正反例测试 |
| **一致性测试** | 场景文档各 § 交叉验证、数据源对比 | 不一致检测逻辑 |
| **策展规则测试** | ≥2 来源原则、经验技能化候选判定 | 边界条件覆盖 |
| **输出格式测试** | Markdown 报告结构、JSON schema、HTML 自包含 | 格式完整性 |

### 覆盖要求

| 维度 | 最低阈值 | 目标 |
|------|:---:|:---:|
| 证据等级判定 | 100% | 四级各有正例和反例测试 |
| 报告类型覆盖 | 100% | 4 种报告类型各有测试 |
| 策展规则 | 100% | 4 条策展原则各有测试 |
| 降级路径 | ≥ 80% | 每种降级情况有测试 |

## 降级策略

| 情况 | 降级行为 | 恢复方式 |
|------|---------|---------|
| execution-memory 为空 | 仅输出 git 数据和静态分析，标注 `no-exec-memory` | 执行至少一个故事后重试 |
| 知识图谱缺失 | 跳过一致性检查，标注 `no-kg` | 先执行 /rui-doc 生成知识图谱 |
| 测试报告缺失 | 标注 `no-test-report`，不影响其他报告 | 运行测试后重跑 |
| 跨故事数据不可比 | 仅输出单故事数据，标注 `incomparable` | 统一数据格式后重试 |
| git 仓库不可用 | 跳过 git 统计，标注 `no-git` | 在 git 仓库中运行 |
## 规则

- [reporting-standards.md](./rules/reporting-standards.md) — 过程报告与知识策展的规则和标准

## 与 rui 的关系

`/rui-reporter` 是管线末端的收口技能。在 `/rui code` 的 Gate B 阶段由 reporter agent 调用，产出交付摘要和知识图谱一致性报告。也可独立调用查看项目级进程摘要和跨故事指标趋势。

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b', 'primaryTextColor': '#a9b1d6', 'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1', 'secondaryColor': '#2b2d3b', 'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    CODE["/rui code<br/>Gate B 验证"]:::phase --> REPORTER["/rui-reporter<br/>报告生成 + 知识策展"]:::phase
    REPORTER --> DELIVER["交付收口<br/>rui-import → rui-bot"]:::phase

    classDef phase fill:#2b2d3b,stroke:#3d59a1,color:#a9b1d6
```

## 自循环

> 报告新鲜度巡检。Agent 可按间隔检测报告是否过期，并自动重新生成。

| 属性 | 值 |
|------|-----|
| 推荐间隔 | `0 8 * * 1,4`（周一/周四早 8 点） |
| 触发条件 | 有活跃故事（状态非"改进"）且报告 mtime 落后于源码变更 |
| 终止条件 | 所有活跃故事报告均为最新 |
| 迭代动作 | ① 扫描活跃故事 → ② 对比报告 mtime vs 源码 commit 时间 → ③ 列出过期报告 → ④ 重新生成 → ⑤ 知识策展（如有新模式） |
| 告警条件 | 报告过期 > 7 天 / 知识图谱不一致 |
| 收敛判定 | 所有报告 mtime ≥ 最后相关 commit 时间 |

> 本技能 `checkMode: "slash"`——无独立 CLI，由 `/rui-reporter` 在 Claude Code 会话内触发。6 字段契约与调度规则详见 [rules/loop-engineering.md](../rui/rules/loop-engineering.md)。

## 生效标志

| 标志 | 验证方式 | 预期行为 |
|------|---------|---------|
| 报告版本行/关联文档/主体/清单齐备 | 逐项检查模板字段 | 无缺失字段 |
| 任一断言可指向 git diff 或测试输出 | 证据追溯 | 每条结论有引用 |
| 场景文档各 § 无矛盾叙述 | 交叉引用闭合 | 各 § 数据一致 |
| 知识图谱功能点全覆盖 | FP# ↔ 节点 ↔ 实现 全对应 | 无遗漏 FP# |
| 策展已 git commit | git log 含策展 commit | 变更已提交 |