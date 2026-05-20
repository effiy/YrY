---
name: rui
description: Story-driven SDLC orchestrator: story → document → code → delivery. Command: /rui.
user_invocable: true
lifecycle: default-pipeline
agents:
  required: [pm, coder, tester, reporter, security, self-improve]
---

# rui

> 故事驱动 SDLC 编排器：拆故事 → 文档基线 → 测试先行 → 实现 → 验证 → 复盘 → 交付。
>
> **--help / -h**：执行 `node skills/rui/help.mjs` 输出完整帮助（含场景示例）。用户输入 `/rui --help` 或 `/rui -h` 或 `/rui help` 时，跳过管线逻辑，直接运行脚本并将输出展示给用户。
>
> 哲学源自 [CLAUDE.md](../../CLAUDE.md)。本文件定义命令面与编排骨架，细节分散在：[rules/](../../rules/) · [agents/](../../agents/) · [formulas.md](./formulas.md) · [coder.md](./coder.md)。

## 选哪条命令

```mermaid
flowchart TD
    Q1{"业务故事<br/>还是 .claude/ 配置?"}
    Q1 -->|".claude/ 配置"| RC["/rui-claude"]
    Q1 -->|"业务故事"| Q2{"已有故事吗?"}
    Q2 -->|"新仓库"| INIT["/rui init"]
    Q2 -->|"有需求"| E2E["/rui <需求>"]
    Q2 -->|"有源码缺文档"| FC["/rui doc --from-code"]
    Q2 -->|"已拆缺文档"| DOC["/rui doc <需求>"]
    Q2 -->|"文档齐缺实现"| CODE["/rui code <name>"]
    Q2 -->|"代码改完补文档"| FD["/rui code --from-doc"]
    Q2 -->|"小修小补"| UPD["/rui update"]
    Q2 -->|"看进度"| LIST["/rui-story list 或 /rui-story"]
```

`需求` 支持文本 / `@` 引用本地文件 / URL。`--name` 用 kebab-case 的 `<name>` 格式（如 `user-login`）。

### 写入命令（末端自动交付三步）

- `/rui init` — 建立项目基线：detect → explore → generate → setup → verify → trigger
- `/rui <需求>` — 端到端：doc + code 自动串联，逐故事串行
- `/rui doc <需求>` — 拆需求为故事 + 生成文档基线（故事任务/使用场景/技术评审/测试设计/安全审计），禁止改源码
- `/rui code <name>` — 实现故事：Gate A → 逐模块 → Gate B → 自改进 → 交付
- `/rui update <name> [ctx] [--no-code]` — 增量更新：T1/T2/T3 自动裁剪
- `/rui code --from-doc <name>` — 从文档反推：只读源码补全缺失文档（实施报告/测试报告/自改进复盘），不覆盖已有
- `/rui doc --from-code 需求` — 从源码反推：req 空时 pm 扫描推荐列表；req 有值时直接反推生成完整文档基线

### 只读命令（不触发 hook）

- `/rui` — 任务推荐：5 层链式管线评分排序

> 进度查询已迁移至 `/rui-story list` 和 `/rui-story`，详见 [rui-story SKILL.md](../rui-story/SKILL.md)。

## 管线一览

```mermaid
flowchart LR
    A[需求解析] --> B[自适应规划] --> C[影响分析] --> D[架构设计] --> E[文档生成]
    E --> F[预检<br/>分支隔离] --> G[Gate A<br/>测试先行] --> H[实现] --> I[Gate B<br/>验证] --> J[自改进] --> K[交付]
    K --> K1[追加日志] --> K2[文档同步] --> K3[发送通知]
```

- 影响分析 / 证据等级 → [agents/AGENT.md](../../agents/AGENT.md)
- 分支隔离 / Gate A/B / P0 审查 → [rules/code-pipeline.md](../../rules/code-pipeline.md)
- 交付三步 / 文档同步 → [rules/delivery-gate.md](../../rules/delivery-gate.md)
- 诊断 D0–D7 / 评估 E1–E4 → [rules/self-improve.md](../../rules/self-improve.md)
- 文档生成约束 → [rules/doc-generation.md](../../rules/doc-generation.md)
- Agent 交接 → [agents/](../../agents/) 各角色

## 阻断标识

阻断后写 `.memory/rui-state.json`（`blocked=true` + `block_reason=<标识>`），重跑同命令从 `current_stage` 续。

**需求→文档阶段**
- `no-parse` — 需求无法解析
- `no-source` — P0 章节缺上游来源
- `chain-broken` — 影响链未闭合
- `doc-p0` — 文档 P0 不通过且无法自修复

**需求→文档阶段**
- `no-doc-isolation` — doc/update 阶段在非 `feat/<name>` 分支写入故事文档
- `bad-branch` — 分支未从 main 创建或混入非本故事代码
- `no-checkout` — 未切换故事分支即写入/改码

**预检→实现阶段**
- `no-branch-isolation` — `git branch --show-current` 非 `feat/<name>` 时执行 Edit/Write
- `skip-gate-a` — Gate A 未通过即编码

**实现→验证阶段**
- `code-p0` — 代码 P0 无法修复
- `gate-b-limit` — Gate B >2 轮

**交付阶段**
- `auto-merge` — 功能分支被自动合并到 main
- `no-token`（降级）— `API_X_TOKEN` 缺失
- `no-metrics`（降级）— self-improve 数据采集失败

## 核心约束

1. **逐故事串行** — 多故事按拆分顺序处理，互不交叉
2. **分支隔离（强制）** — 任何 Edit/Write 前必须验证当前分支为 `feat/<name>`：doc 写文档、code 改源码、update 增删文件，均需分支隔离。禁止在 main 上写文档或改码、禁止派生、禁止自动合并。唯一例外：`/rui init`（写 CLAUDE.md/README.md 等项目级基线，不走故事分支）
3. **源码唯一入口** — 只能走 `/rui code` 改源码
4. **测试先行** — Gate A 阻断实现；Gate B >2 轮阻断交付
5. **逐模块 P0 清零** — 每模块审查后 P0 清零再前进
6. **只读反推** — `--from-code` / `--from-doc` 禁止改源码
7. **产出内聚** — 关键产出限定在 `docs/故事任务面板/<name>/`
8. **公式驱动** — 文档由 [formulas.md](./formulas.md) 规约，故事任务+使用场景为问题/用户空间基线，技术评审/测试设计/安全审计为解决方案空间，实施报告/测试报告/自改进复盘为验证与改进空间
9. **知识沉淀** — 写入 `{project}-10-交互日志.md` + `.memory/execution-memory.jsonl` + `.memory/rui-state.json`；提案写入 `.improvement/proposals.jsonl`
10. **交付强制** — 三步按序触发（hook-log → import-docs → wework-bot），详见 [强制集成](#强制集成)
11. **表达优先** — 文档内容必须 图 → 结构化文本 → 表，架构/流程/关系优先 mermaid，不可降级

## 故事文档

> 标准基线 10 文档，无编号前缀，无前后端拆分。文档按管线阶段生成，公式见 [formulas.md](./formulas.md)。

| 文件 | 阶段 | 基线 | 必选 |
|------|------|:---:|:---:|
| {project}-消息通知列表.md | 交付 | — | 自动 |
| {project}-故事任务.md | 文档生成 | 问题空间 | ✓ |
| {project}-使用场景.md | 文档生成 | 用户空间 | ✓ |
| {project}-技术评审.md | 文档生成 | — | ✓ |
| {project}-测试设计.md | 文档生成 | — | ✓ |
| {project}-安全审计.md | 文档生成 | — | ✓ |
| {project}-实施报告.md | 验证 | — | ✓ |
| {project}-测试报告.md | 验证 | — | ✓ |
| {project}-自改进复盘.md | 自改进 | — | ✓ |
| {project}-交互日志.md | 全阶段 | — | ✓ |

## init

> 五步：探 → 察 → 生 → 搭 → 验 → 触。可重复运行，每次全量重生。CLAUDE.md 的 `<!-- rui:project-start -->` / `<!-- rui:project-end -->` 标记段每次覆盖，段外保留。

```mermaid
flowchart LR
    P1[detect]:::s --> P2[explore]:::llm --> P3[generate]:::llm --> P4[setup]:::s --> P5[verify]:::s --> P6[trigger]:::s --> P7[.init-memory]
    P5 -.失败.-> Fix[终止·修复重跑]
    classDef s fill:#e3f2fd,stroke:#1565c0;
    classDef llm fill:#fff3e0,stroke:#e65100;
```

### 1. detect — 探测信号

抽取 profile 为后续阶段提供事实基线：

- **项目身份** — 仓库目录名 → 分支前缀 / 文档文件名前缀（`{project}`）；故事目录名纯语义 kebab-case，不加项目前缀
- **项目类型** — 关键目录与配置文件 → frontend / backend / fullstack / meta / unknown（判定见下图）
- **项目清单** — 按生态文件抽取依赖 + 构建/测试命令 + 框架版本
- **安全面** — 源码关键词扫描：用户输入 / API / 存储 / 认证 / 第三方
- **测试框架** — 依赖 + 配置文件 → vitest / jest / pytest / go-test / cargo-test
- **架构模式** — 项目结构 → single / monorepo / microservice / plugin

```mermaid
flowchart TD
    A[package.json?] -->|含 react/vue/svelte/next/nuxt| F[frontend]
    A -->|含 express/koa/fastify/nest| B[backend]
    A -->|前端依赖 + server/api 目录| FS[fullstack]
    A -->|.claude-plugin/plugin.json 或仅 skills/| M[meta]
    A -->|均不命中| U[unknown]
    A -->|无 package.json| NE[非 Node 生态]
    NE -->|pyproject.toml / go.mod / Cargo.toml 等| NE2[按生态清单文件判定]
```

### 2. explore — 深度探索

阅读核心源码，理解架构模式、代码规范、安全面。验证并补充 profile 判断。

### 3. generate — 生成内容

基于 profile + 探索发现直接编写文件：

- `CLAUDE.md` — 项目画像 + 执行准则 + 退化对策 + 项目约束（含 `rui:project-start/end` 标记）+ 自约束
- `README.md` — 系统视图 + 命令流 + 快速开始 + 项目结构 + [领域语言段](../../README.md#领域语言)（术语定义 + 关系 + 示例对话 + 歧义标记，格式参照 [CONTEXT-FORMAT](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/CONTEXT-FORMAT.md)）

### 4. setup — 机械搭建

- 创建 `docs/故事任务面板/`
- 生成 `.claude/skills/wework-bot/config.json`（schema 见 [wework-bot SKILL.md](../wework-bot/SKILL.md#内置配置)）
- 写入 `docs/故事任务面板/.init-memory.json`

### 5. verify — 5 项就绪检查

任一失败即终止：

- CLAUDE.md 含 `rui:project-start` 标记 + 项目名
- README.md 含项目名
- README.md 含 `## 领域语言` 标题 + ≥3 个术语定义
- `docs/故事任务面板/` 目录存在
- `.claude/skills/wework-bot/config.json` 存在

### 6. trigger

验证通过后触发 import-docs（workspace 全量）+ wework-bot 通知。缺 token 跳过，网络失败告警不阻断。

### 产物

- `CLAUDE.md` — `rui:project-*` 标记内全量重生，段外保留
- `README.md` — 全量重生，领域语言段重复运行时增量补充
- `.claude/skills/wework-bot/config.json` — 每次覆盖
- `docs/故事任务面板/.init-memory.json` — 每次覆盖

## doc

> 需求到文档基线的完整管线。pm 拆需求为故事 → coder 补齐设计文档。全程只读源码，多故事串行。pm 应用烧烤纪律：挑战模糊术语、走完决策树、用领域语言命名、不确定 > 2 项不推进。
>
> **写故事文档也走分支隔离。** doc 阶段写入 `docs/故事任务面板/<name>/` 下的文档，这些写入操作必须在 `feat/<name>` 分支上执行，与 code 阶段同门禁。

### 效果示意

```mermaid
flowchart TD
    NOW["当前状态<br/>需求模糊·无文档基线<br/>无法进入实现"]:::pain
    NOW --> M1["里程碑 1<br/>pm 拆分故事<br/>影响分析·优先级排序"]:::milestone
    M1 --> M2["里程碑 2<br/>分支隔离门禁<br/>feat/&lt;name&gt; 从 main 拉出"]:::milestone
    M2 --> M3["里程碑 3<br/>coder 补齐设计文档<br/>使用场景·技术评审·测试设计·安全审计"]:::milestone
    M3 --> GOAL["目标状态<br/>文档基线完整<br/>故事任务+使用场景+技术评审<br/>+测试设计+安全审计 全部齐备<br/>可直接进入 code 阶段"]:::goal

    classDef pain fill:#ffebee,stroke:#c62828;
    classDef milestone fill:#fff3e0,stroke:#e65100;
    classDef goal fill:#e8f5e9,stroke:#2e7d32;
```

### §1 Story

#### Story 1: 需求拆分为故事任务

| 字段 | 内容 |
|------|------|
| 作为 | 需求提出者 |
| 我想要 | 将自然语言需求拆分为结构化的故事任务文档 |
| 以便 | 每个故事有独立的文档目录、清晰的优先级和明确的验收标准 |
| 优先级 | P0 |
| 范围边界 | 只读源码，不修改任何文件 |
| 依赖 | 源码可访问，pm agent 可用 |

##### 范围外

- 不涉及源码修改或 git 分支操作（分支操作由后续步骤处理）
- 不生成技术设计文档（由 coder 在 Story 2 补齐）

##### §1.1 User Operations

| # | 操作 | 触发条件 | 操作步骤 | 预期结果 |
|---|------|---------|---------|---------|
| 1 | 从需求生成故事 | 用户执行 `/rui doc <需求>` | pm 解析需求 → 拆分为故事 → 影响分析 → 优先级排序 → 逐故事写入故事任务 | 每个故事目录下生成 {project}-故事任务.md |
| 2 | 引用本地文件 | 用户执行 `/rui doc @file` | pm 读取文件内容 → 解析为需求 → 拆分故事 | 同上，需求来源含文件路径引用 |
| 3 | 引用外部 URL | 用户执行 `/rui doc <URL>` | pm 抓取 URL 内容 → 解析为需求 → 拆分故事 | 同上，需求来源含 URL 引用 |

---

#### Story 2: 补齐设计文档

| 字段 | 内容 |
|------|------|
| 作为 | coder |
| 我想要 | 基于故事任务生成完整的技术设计文档基线 |
| 以便 | 实现阶段有完整的技术方案依循，安全面有独立审计 |
| 优先级 | P0 |
| 范围边界 | 只读源码 + 故事任务文档，写入使用场景/技术评审/测试设计/安全审计 |
| 依赖 | Story 1 完成，故事任务文档存在 |

##### 范围外

- 不涉及源码修改
- 不覆盖实施报告/测试报告/自改进复盘（由 code 阶段产出）

##### §1.1 User Operations

| # | 操作 | 触发条件 | 操作步骤 | 预期结果 |
|---|------|---------|---------|---------|
| 1 | 补齐使用场景 | pm 完成故事任务后自动触发 | coder 读取故事任务 → 按 F.story.scenarios 公式生成 → 校验用户空间语言边界（禁止技术术语/组件名/API 端点） | 生成 {project}-使用场景.md |
| 2 | 补齐技术评审 | 使用场景完成后自动触发 | coder 只读源码 → 按 F.story.technical-review 公式生成（含架构/API/数据/组件/状态/交互，按项目类型裁剪章节） | 生成 {project}-技术评审.md |
| 3 | 补齐测试设计 | 技术评审完成后自动触发 | tester 基于故事任务+使用场景双基线 → 按 F.story.test-design 公式生成 | 生成 {project}-测试设计.md |
| 4 | 补齐安全审计 | 技术评审完成后自动触发 | security 基于技术评审 → 按 F.story.security-audit 公式独立审计 | 生成 {project}-安全审计.md |

---

#### Story 3: 分支隔离门禁

| 字段 | 内容 |
|------|------|
| 作为 | 管线 |
| 我想要 | 确保文档写入操作在隔离分支上进行 |
| 以便 | 防止未经验证的文档变更污染 main 分支 |
| 优先级 | P0 |
| 范围边界 | 仅检查分支状态，不自动创建或切换分支 |
| 依赖 | git 仓库可操作 |

##### §1.1 User Operations

| # | 操作 | 触发条件 | 操作步骤 | 预期结果 |
|---|------|---------|---------|---------|
| 1 | 分支检查通过 | `git branch --show-current` 为 `feat/<name>` | 直接继续文档写入 | 门禁通过 |
| 2 | 分支不匹配 | 当前分支非 `feat/<name>` | 提示用户创建或切换到 `feat/<name>`（从 main 拉出）→ 重新检查 | 门禁通过后继续 |

---

### §2 Requirements

#### 功能点

| FP# | 描述 | 输入 | 输出 | 错误行为 | 优先级 |
|-----|------|------|------|---------|--------|
| FP1 | 需求解析 — 将自然语言/文件/URL 需求拆分为故事列表 | 需求文本或引用 | 故事列表（含优先级、依赖、范围边界） | 需求无法解析时阻断 `no-parse` | P0 |
| FP2 | 影响分析 — 分析每个故事对现有系统的影响链 | 源码 + 故事需求 | 影响点列表 + 影响级别 | 影响链未闭合时阻断 `chain-broken` | P0 |
| FP3 | 故事任务生成 — 按 F.story.task 公式生成 | 解析结果 + 影响分析 | {project}-故事任务.md | 占位符未替换或 P0 检查项缺失时阻断 | P0 |
| FP4 | 使用场景生成 — 按 F.story.scenarios 公式生成 | 故事任务文档 | {project}-使用场景.md | 场景覆盖不全（<2 场景）或语言污染时阻断 | P0 |
| FP5 | 技术评审生成 — 按 F.story.technical-review 公式生成（含架构/API/数据/组件/状态/交互/性能，按项目类型裁剪章节） | 故事任务+使用场景 + 源码 | {project}-技术评审.md | P0 检查项未通过时阻断 | P0 |
| FP6 | 测试设计生成 — 按 F.story.test-design 公式生成 | 故事任务+使用场景+技术评审 | {project}-测试设计.md | AC 覆盖不全或 Gate A 交接信号缺失时阻断 | P0 |
| FP7 | 安全审计生成 — 按 F.story.security-audit 公式生成 | 技术评审文档 | {project}-安全审计.md | 威胁未覆盖或缓解措施缺失时阻断 | P0 |
| FP8 | 分支隔离验证 — 写入前检查 `feat/<name>` 分支 | 故事名称 | 通过/阻断 | 非 `feat/<name>` 分支上写入时阻断 `no-doc-isolation` | P0 |
| FP9 | 多故事串行 — 按拆分顺序逐故事处理 | 故事列表 | 每故事完整文档基线 | 前一故事未完成时不得进入下一故事 | P0 |
| FP10 | 项目类型裁剪 — 技术评审按项目类型跳过不适用章节 | 项目类型 | 裁剪后的技术评审文档（纯前端跳过 API/数据/后端性能章节，纯后端跳过组件/状态/交互/样式章节） | 类型判定失败时默认全量生成 | P1 |

#### 业务规则

| R# | 描述 | 校验方式 | 证据级别 |
|----|------|---------|---------|
| R1 | pm 拆分前必须查阅外部参考（superpowers · get-shit-done 等） | 检查 agents/pm.md 执行步骤 | B |
| R2 | 故事任务文档禁止包含技术术语（代码路径/API 路由/组件名/技术栈名） | 扫描 `/api/`、`/src/`、`<.*>` 等模式 | B |
| R3 | 使用场景文档禁止包含技术术语和组件名 | 扫描技术名词模式 | B |
| R4 | 所有文档必须含 `### 主要价值` 节，≥ 4 条 emoji 前缀行 | grep 计数 | B |
| R5 | 每文档必须含回溯链（来源引用 + 变更记录） | grep 表头与链接格式 | B |
| R6 | 多故事时按优先级顺序串行处理，前一故事 doc 完成后再进下一故事 | 逐故事检查产出完整性 | B |
| R7 | 分支必须从 main 拉出，禁止在已有功能分支上创建新故事分支 | `git log main..HEAD` 检查提交历史 | B |
| R8 | 安全审计由 security agent 独立执行，不依赖 coder 自评 | 检查 agents/security.md 执行记录 | B |

#### 数据约束

| 约束 | 类型 | 范围/格式 | 来源 |
|------|------|----------|------|
| 故事名称 | string | `^[a-z0-9]+(-[a-z0-9]+)*$` (kebab-case) | 命名规范约定 |
| 项目类型 | enum | `frontend` / `backend` / `fullstack` / `meta` / `unknown` | init detect 阶段判定 |
| 故事优先级 | enum | P0 / P1 / P2 | pm 影响分析 |
| 文档集 | 10 文档固定集 | 见 [故事文档](#故事文档) | formulas.md |
| 分支名 | string | `feat/<name>` | 分支隔离约束 |

---

### §3 成功标准

| SC# | 描述 | 度量方式 | 目标值 | 优先级 | 关联 FP# |
|-----|------|---------|--------|--------|---------|
| SC1 | 用户可用一行命令从需求生成完整文档基线 | `/rui doc <需求>` 执行到全部文档产出 | 5 文档全部生成 | P0 | FP1–FP7 |
| SC2 | 文档基线通过全部 P0 检查 | [P0 检查清单](./formulas.md#p0-检查清单) | 全部通过 | P0 | FP3–FP7 |
| SC3 | 多故事按优先级串行且互不交叉 | 逐故事产出目录时间戳检查 | 顺序一致 | P0 | FP9 |
| SC4 | 文档写入仅在隔离分支进行 | `git branch --show-current` 验证 | 100% 匹配 `feat/<name>` | P0 | FP8 |
| SC5 | 故事任务和使用场景通过语言边界扫描 | 技术术语正则扫描 | 0 命中 | P0 | R2, R3 |
| SC6 | 技术评审按项目类型正确裁剪章节 | 按项目类型检查产出章节清单 | 与裁剪规则一致 | P1 | FP10 |

---

### §4 范围边界

#### 范围内

| # | 条目 | 关联 FP# | 边界说明 |
|---|------|---------|---------|
| 1 | 需求解析与故事拆分 | FP1, FP2 | pm 负责，含影响分析和优先级排序 |
| 2 | 双基线文档生成（故事任务 + 使用场景） | FP3, FP4 | 问题空间 + 用户空间基线，所有下游溯源目标 |
| 3 | 技术设计文档生成（技术评审） | FP5 | coder 负责，按项目类型裁剪章节 |
| 4 | 测试设计文档生成 | FP6 | tester 负责，Gate A 交接信令 |
| 5 | 安全审计文档生成 | FP7 | security 负责，独立审计 |
| 6 | 分支隔离门禁 | FP8 | 与 code 阶段同门禁 |
| 7 | 末端交付三步 | — | hook-log → import-docs → wework-bot |

#### 范围外

| # | 条目 | 排除原因 | 替代方案 |
|---|------|---------|---------|
| 1 | 源码修改 | 源码变更是 code 阶段的职责 | 使用 `/rui code <name>` |
| 2 | 实施报告/测试报告/自改进复盘 | 属于 code 阶段产出 | 使用 `/rui code <name>` |
| 3 | git 分支创建与切换 | 由用户或管线在执行写入前操作 | `git checkout -b feat/<name>` |
| 4 | 文档同步到远端 | 属于交付三步中的 import-docs | 末端自动触发 |
| 5 | 已有文档的增量更新 | doc 是新建基线，增量用 update | 使用 `/rui update <name>` |
| 6 | 故事进度查询 | 属于 rui-story 面板管理 | 使用 `/rui-story` 或 `/rui-story list` |

---

### §5 AC

| AC# | Given | When | Then | 门禁 |
|-----|-------|------|------|------|
| AC1 | 用户提供清晰的自然语言需求 | 用户执行 `/rui doc <需求>` | pm 完成拆分，生成 ≥1 个故事的故事任务文档 | Gate A |
| AC2 | pm 完成故事任务文档 | coder 补齐使用场景 | 生成使用场景文档，通过语言边界扫描（无技术术语污染） | Gate A |
| AC3 | 使用场景完成 | coder 补齐技术评审 | 生成技术评审文档，效果示意 + 全部必填章节完整，按项目类型正确裁剪 | Gate A |
| AC4 | 技术评审完成 | tester 生成测试设计 | 生成测试设计文档，AC 覆盖全部故事任务 §5 的 AC#，Gate A 交接信号完整 | Gate A |
| AC5 | 技术评审完成 | security 执行安全审计 | 生成安全审计文档，威胁建模覆盖全部信任边界 | Gate A |
| AC6 | 当前分支非 `feat/<name>` | 管线检查分支隔离 | 阻断写入，提示用户创建 `feat/<name>` 从 main 拉出 | Gate A |
| AC7 | 当前分支为 `feat/<name>` | 管线写入文档 | 直接写入全部文档到 `docs/故事任务面板/<name>/` | Gate A |
| AC8 | 文档基线全部生成完成 | 管线触发末端交付 | hook-log → import-docs → wework-bot 三步按序执行 | Gate B |
| AC9 | 需求包含多个故事（故事列表 ≥ 2） | pm 拆分后按优先级排序 | 逐故事串行：故事 1 全部文档完成 → 故事 2 全部文档完成 → ... | Gate A |
| AC10 | 需求无法解析（模糊、矛盾、信息不足） | pm 尝试解析 | 阻断 `no-parse`，提示用户补充信息，不生成空文档 | Gate A |

---

### §6 风险与假设

| # | 风险/假设 | 类型 | 可能性 | 影响 | 缓解/验证策略 | 关联 FP# |
|---|----------|------|--------|------|-------------|---------|
| 1 | 需求描述过于模糊导致 pm 无法拆分 | 风险 | H | H | pm 应用烧烤纪律，不确定 > 2 项不推进，阻断并提示补充 | FP1 |
| 2 | P0 检查项中缺来源导致文档基线不完整 | 风险 | M | H | 每个断言必须有来源引用或证据路径；不可达来源标 C 级 | FP3–FP7 |
| 3 | 分支名冲突（feat/<name> 已存在） | 风险 | M | M | 检测到冲突时提示用户处理已有分支 | FP8 |
| 4 | 多故事拆分时下游故事依赖上游但上游未完成 | 风险 | M | M | 串行约束强制前一故事完成再进入下一故事 | FP9 |
| 5 | 故事任务/使用场景混入技术术语导致下游设计偏离基线 | 风险 | M | H | P0 检查清单正则扫描；下游文档审查时反向溯源 | FP3, FP4 |
| 6 | 项目类型误判导致技术评审章节裁剪错误 | 风险 | L | M | 类型判定失败时默认全量生成 | FP10 |
| 7 | 外部参考 URL 不可达导致 pm 查阅失败 | 风险 | L | L | formulas.md 内联关键模式摘要，不依赖外链可达性 | FP1 |
| 8 | security agent 与 coder 为同一实例导致审计不独立 | 风险 | M | H | 安全审计由独立 security agent 执行 | FP7 |
| 9 | pm 能正确理解需求并拆分为合理粒度的故事 | 假设 | — | — | pm agent 规约约束拆分行为；拆分结果可通过故事任务文档验证 | FP1 |
| 10 | 源码结构反映了实际架构使得 coder 能准确提取技术方案 | 假设 | — | — | 源码不可读或结构混乱时阻断，要求用户先梳理源码 | FP5 |

**约束**：只读源码 · 分支隔离（强制，同 code 阶段门禁） · 逐故事串行 · 在 `feat/<name>` 分支上写入文档

**产出**：{project}-故事任务.md（问题空间基线）· {project}-使用场景.md（用户空间基线）· {project}-技术评审.md（按项目类型裁剪章节）· {project}-测试设计.md（Gate A 交接）· {project}-安全审计.md（独立审计）

**末端触发** [强制集成](#强制集成)。

## code

> 源码改动唯一入口。分支隔离强制门禁 → Gate A 测试先行 → 逐模块 P0 清零 → Gate B ≤2 轮 → 自改进 D0–D7 → 交付。

```mermaid
flowchart LR
    BR{"① 分支隔离门禁<br/>git branch --show-current<br/>== feat/&lt;name&gt;?"}:::gate -->|"❌ 否"| BLOCK["no-branch-isolation 🚫<br/>阻断：禁止 Edit/Write"]:::bad
    BR -->|"✅ 是"| A[Gate A<br/>测试先行]:::s
    A --> B[逐模块实现<br/>P0 清零再前进]:::s
    B --> C[Gate B<br/>验证 ≤2 轮]:::s
    C --> D[自改进<br/>D0–D7]:::s
    D --> E[交付]:::s
    B -.P0 未清.-> B
    C -.>2 轮.-> X[gate-b-limit]:::bad
    classDef s fill:#e3f2fd,stroke:#1565c0;
    classDef gate fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef bad fill:#ffebee,stroke:#c62828;
```

**产出**：{project}-实施报告.md · {project}-测试报告.md · {project}-自改进复盘.md

**约束**：源码唯一入口 · Gate A `{project}-测试设计.md` 不存在即阻断 · Gate B >2 轮阻断 · P0 不清零不进下一模块

**末端触发** [强制集成](#强制集成)。

## 端到端

> `/rui 需求` = `/rui doc 需求` → `/rui code <name>`，无中断一气呵成。

```mermaid
flowchart LR
    R[需求]:::s --> D[doc<br/>拆故事+文档]:::s --> C[code<br/>实现+验证]:::s --> F[交付]:::s
    classDef s fill:#e3f2fd,stroke:#1565c0;
```

**末端触发** [强制集成](#强制集成)。

## update

> 增量更新，按变更范围 T1/T2/T3 自动裁剪管线。`--no-code` 仅文档不改源码。
>
> **写入前先验证分支隔离。** 无论 T1/T2/T3，只要涉及 Edit/Write 就必须先在 `feat/<name>` 分支上。

```mermaid
flowchart LR
    BR{"分支隔离门禁<br/>git branch --show-current<br/>== feat/&lt;name&gt;?"}:::gate -->|"❌ 否"| BLOCK["创建/切换到 feat/&lt;name&gt;"]:::block
    BR -->|"✅ 是"| I[变更输入]:::s
    I --> T{范围判定}:::s
    T -->|T1 措辞/格式| U1[跳过分析+设计<br/>仅刷新变更章节]:::s
    T -->|T2 增删/接口变更| U2[裁剪分析+设计<br/>刷新目标+下游]:::s
    T -->|T3 边界/重构| U3[完整重跑<br/>全级联刷新]:::s
    classDef s fill:#e3f2fd,stroke:#1565c0;
    classDef gate fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef block fill:#ffebee,stroke:#c62828;
```

| 级别 | 范围 | 影响分析 | 架构设计 | 文档刷新 |
|------|------|---------|---------|---------|
| T1 | 措辞 / 格式 | 跳过 | 跳过 | 仅变更章节 |
| T2 | 增删故事 / 接口变更 | 裁剪 | 裁剪 | 目标 + 下游 |
| T3 | 边界变化 / 跨故事重构 | 完整重跑 | 完整重跑 | 全级联刷新 |

**末端触发** [强制集成](#强制集成)。

## code --from-doc

> 从已有文档反推，只读源码补全缺失文档，不覆盖已有。

```mermaid
flowchart LR
    A[读取已有文档]:::s --> B[只读源码分析]:::s
    B --> C[补全缺失文档]:::s
    C --> D[trigger]:::s
    classDef s fill:#e3f2fd,stroke:#1565c0;
```

**约束**：只读 · 不覆盖已有 · 分支隔离

**末端触发** [强制集成](#强制集成)。

## doc --from-code

> 存量代码库的文档生成入口。req 空时 pm 扫描推荐列表；req 有值时从源码反推完整故事文档。全程只读，证据 Level B + 源码路径。

```mermaid
flowchart LR
    E0["detect<br/>项目类型判定"]:::tool --> E1["node skills/rui/recommend.mjs<br/>数据采集"]:::tool
    E1 --> E2["PM 5层评分<br/>见 ranking.md"]:::llm
    E2 --> E3["故事任务推荐输出<br/>象限图 + 排序表 + 详述卡"]:::llm
    E3 --> E4["用户选择"]:::user
    E4 --> G["generate<br/>反推故事文档"]:::s
    R["req 有值<br/>直接反推"]:::s --> C["冲突检测"]:::s --> G
    G --> T["trigger"]:::s

    classDef tool fill:#e8f5e9,stroke:#2e7d32;
    classDef llm fill:#fff3e0,stroke:#e65100;
    classDef user fill:#f3e5f5,stroke:#6a1b9a;
    classDef s fill:#e3f2fd,stroke:#1565c0;
```

### req 为空 — 推荐引路

5 步推荐管线，数据驱动 + 框架评分：

1. **detect** — 判定项目类型（frontend / backend / fullstack / unknown）
2. **scan** — `node skills/rui/recommend.mjs --root . --type <detected> --format json`
3. **evaluate** — PM 按 [ranking.md](./ranking.md) 的 5 层框架评分排序，输出 P0→P3
4. **present** — 输出故事任务推荐：象限图 → 排序表 → 每故事任务详述卡（覆盖范围·源码证据·预计产出·可执行命令）
5. **wait** — 等待用户选择后进入生成阶段

> 不可跳过第 2 步凭感觉推荐。详细评分框架见 [ranking.md](./ranking.md)。

### req 有值 — 直接生成全文档基线

> 从源码反推完整 5 文档基线到 `docs/故事任务面板/<name>/`。全程只读源码，证据 Level B + 源码路径，缺口标「待补充」。
> 多故事时按 `recommend.mjs` 输出的 storyName 顺序串行，互不交叉。

```mermaid
flowchart TD
    PARSE["§1.1 解析<br/>name→目标目录"]:::s --> CONFLICT{"§1.2 冲突检测<br/>目标目录已存在?"}:::gate
    CONFLICT -->|"是"| REJECT["拒绝覆盖<br/>引导 /rui update"]:::bad
    CONFLICT -->|"否"| BRANCH{"§1.3 分支隔离<br/>git branch == feat/&lt;name&gt;?"}:::gate
    BRANCH -->|"否"| SWITCH["创建/切换到 feat/&lt;name&gt;<br/>从 main 拉出"]:::block
    BRANCH -->|"是"| SCAN["§1.4 源码定位<br/>按 name 匹配源文件集"]:::s
    SWITCH --> SCAN
    SCAN --> EXTRACT["§1.5 只读提取<br/>结构·接口·依赖·状态·安全"]:::s
    EXTRACT --> GEN["§2 逐文档生成<br/>5 文档基线"]:::s

    subgraph GENSUB["逐文档生成 — 5 文档基线"]
        direction LR
        D1["§2.1 pm<br/>{project}-故事任务<br/>F.story.task"]:::agent
        D2["§2.2 pm<br/>{project}-使用场景<br/>F.story.scenarios"]:::agent
        D3["§2.3 coder<br/>{project}-技术评审<br/>F.story.technical-review"]:::agent
        D4["§2.4 tester<br/>{project}-测试设计<br/>F.story.test-design"]:::agent
        D5["§2.5 security<br/>{project}-安全审计<br/>F.story.security-audit"]:::agent
        D1 --> D2 --> D3 --> D4
        D3 --> D5
    end

    GENSUB --> DELIVER["§3 交付三步<br/>hook-log→import-docs→wework-bot"]:::s

    classDef s fill:#e3f2fd,stroke:#1565c0;
    classDef gate fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef bad fill:#ffebee,stroke:#c62828;
    classDef block fill:#ffebee,stroke:#c62828;
    classDef agent fill:#f3e5f5,stroke:#6a1b9a;
```

#### §1 前置步骤

| 步骤 | 操作 | 负责人 | 输入 | 输出 | 阻断 |
|------|------|--------|------|------|------|
| §1.1 解析 | 解析 `<name>` 为 kebab-case 故事名，目标目录 `docs/故事任务面板/<name>/` | — | 用户输入 | 故事名 + 目标路径 | `no-parse` |
| §1.2 冲突检测 | 检查目标目录是否已存在 | — | 目标路径 | 通过/拒绝 | 已存在则拒绝覆盖，引导 `/rui update` |
| §1.3 分支隔离 | 验证当前分支为 `feat/<name>`，否则从 main 创建 | — | 故事名 | 分支就绪 | `no-doc-isolation` |
| §1.4 源码定位 | 按 name 匹配源文件：`grep -r` 搜索关键字 + `recommend.mjs` 数据交叉验证 | — | 故事名 + 项目类型 | 源文件清单 + 依赖图 | `no-source` |
| §1.5 只读提取 | 读取全部匹配源文件，提取：结构概览 · 接口/组件签名 · 依赖链 · 状态管理 · 安全信号 | — | 源文件清单 | 结构化代码事实集（供下游 Agent 消费） | `chain-broken` |

**§1.4 源码定位策略**：

| 项目类型 | 搜索范围 | 匹配依据 |
|---------|---------|---------|
| 前端 | `.vue` `.jsx` `.tsx` `.svelte` | 组件名 → 路由注册 → 状态文件 → 样式文件 |
| 后端 | `.ts` `.js` `.py` `.go` 等 | 路由路径 → 控制器/服务 → 数据模型 → 中间件 |
| 全栈 | 两端各自搜索 | 前端组件 + 后端接口，交叉验证契约一致性 |

**§1.5 提取清单**（所有项目类型必提取）：

| 维度 | 提取内容 | 证据格式 |
|------|---------|---------|
| 结构概览 | 目录树 + 文件职责摘要 | `> 证据: <file>:<line>` |
| 接口/组件签名 | 函数签名 · Props/Events · API 路由+方法+请求/响应 | `> 证据: <file>:<line>` 代码片段 |
| 依赖链 | import 图（谁依赖谁） + 外部依赖清单 | `> 证据: import 语句位置` |
| 状态管理 | store/state/context 定义 + 流向 | `> 证据: <file>:<line>` |
| 安全考量 | 用户输入点 · 认证链路 · API 调用 · 敏感数据 | `> 证据: <file>:<line>` |

#### §2 逐文档生成

> 5 文档按序生成。前文档产出为后文档输入。每文档生成后立即通过 P0 检查清单校验。

```mermaid
flowchart LR
    FACTS["代码事实集<br/>来自 §1.5"]:::input --> D1["§2.1 故事任务<br/>pm · F.story.task"]:::doc
    D1 --> D2["§2.2 使用场景<br/>pm · F.story.scenarios"]:::doc
    D2 --> D3["§2.3 技术评审<br/>coder · F.story.technical-review"]:::doc
    D3 --> D4["§2.4 测试设计<br/>tester · F.story.test-design"]:::doc
    D3 --> D5["§2.5 安全审计<br/>security · F.story.security-audit"]:::doc
    D4 --> CHECK["P0 检查清单<br/>5 文档全部通过"]:::gate
    D5 --> CHECK

    classDef input fill:#e8f5e9,stroke:#2e7d32;
    classDef doc fill:#e3f2fd,stroke:#1565c0;
    classDef gate fill:#fff3e0,stroke:#e65100,stroke-width:2px;
```

| # | 文档 | Agent | 公式 | 反推策略 | 关键约束 |
|---|------|-------|------|---------|---------|
| §2.1 | `{project}-故事任务.md` | pm | [F.story.task](./formulas.md#fstorytask--project-故事任务-meta--storyn) | 从代码事实集反推业务意图：接口/组件 → 用户能做什么；状态管理 → 数据流；依赖链 → 模块边界 | 语言边界：禁止代码路径/API路由/组件名/技术栈名。证据 Level B + 源码路径 |
| §2.2 | `{project}-使用场景.md` | pm | [F.story.scenarios](./formulas.md#fstoryscenarios--project-使用场景) | 从组件交互 + API 调用链反推用户旅程：正常路径 + ≥1 空状态 + ≥1 错误恢复。每场景必含 mermaid flowchart | 语言边界：禁止技术术语/组件名/API端点/文件路径。≥ 2 场景。场景覆盖矩阵对齐故事任务 FP# |
| §2.3 | `{project}-技术评审.md` | coder | [F.story.technical-review](./formulas.md#fstorytechnical-review--project-技术评审) | 源码直接映射到技术章节：接口签名→§2 API；数据模型→§3；组件定义→§4；状态管理→§4.2；安全信号→§7。**含效果示意 mermaid 图**（全链路请求流/组件交互） | 按项目类型裁剪章节（纯前端跳过 API/数据/后端性能，纯后端跳过组件/状态/交互/样式/DOM）。§0 基线溯源至少映射故事任务 FP# + 使用场景 |
| §2.4 | `{project}-测试设计.md` | tester | [F.story.test-design](./formulas.md#fstorytest-design--project-测试设计) | 基于故事任务 AC + 使用场景 + 技术评审接口/组件签名生成四类用例（正常/边界/异常/回归）。每用例 Given/When/Then 可执行 | §0 基线溯源覆盖全部 AC# 和场景。Gate A 交接信号完整（P0 用例 ID + 验证命令） |
| §2.5 | `{project}-安全审计.md` | security | [F.story.security-audit](./formulas.md#fstorysecurity-audit--project-安全审计) | 基于技术评审 §7 安全信号 + 源码安全扫描独立审计：资产识别 → STRIDE 威胁建模 → 信任边界 → 缓解措施 → 合规检查 | 独立执行，不依赖 coder 自评。STRIDE 六类全覆盖。合规 6 项全查 |

**反推证据等级**：

| 能确定的 | 不能确定的 |
|---------|-----------|
| 接口契约、组件签名、依赖关系、状态定义 → Level A（附源码路径） | 业务意图、设计决策理由、未来规划 → Level C（标注「待补充」） |
| 安全信号（用户输入点/认证链路） → Level B（附代码模式） | 性能目标、容量规划 → Level C |

**每文档生成后校验（P0 阻断）**：

| # | 检查项 | 适用文档 |
|---|--------|---------|
| 1 | `### 主要价值` 存在且 ≥ 4 条 emoji 前缀行 | 全部 5 文档 |
| 2 | F.meta 无 `{...}` 占位符 | 全部 5 文档 |
| 3 | 回溯链完整（来源引用 + 变更记录） | 全部 5 文档 |
| 4 | 故事任务 + 使用场景通过语言边界扫描（无技术术语污染） | §2.1, §2.2 |
| 5 | 技术评审含效果示意 mermaid 图 + 基线溯源表 | §2.3 |
| 6 | 测试设计 Gate A 交接信号完整 | §2.4 |
| 7 | 安全审计 STRIDE 六类全覆盖 + 独立审计标记 | §2.5 |

#### §3 项目类型裁剪

| 类型 | 故事任务 | 使用场景 | 技术评审章节 | 测试设计 | 安全审计 |
|------|---------|---------|-------------|---------|---------|
| 前端 | 全量 | 全量（侧重 UI 交互） | 跳过 §2 API / §3 数据 / §8 后端性能 | 侧重 UI 状态 + 交互用例 | 侧重输入校验 + XSS/CSRF |
| 后端 | 全量 | 全量（侧重 API 使用者旅程） | 跳过 §4 组件 / §5 交互 / §6 DOM·事件·依赖 | 侧重接口 + 数据 + 性能用例 | 侧重认证 + 注入 + 权限 |
| 全栈 | 全量 | 全量（覆盖两端用户） | 全章节，两端契约对齐 | 两端覆盖 + 集成用例 | 全威胁面 |

#### §4 约束

| 约束 | 规则 | 违反 |
|------|------|------|
| 只读 | 全程不修改源码，仅读取分析 | P0 |
| 分支隔离 | 文档写入必须在 `feat/<name>` 分支 | `no-doc-isolation` |
| 证据 Level B | 每个断言附源码路径或标注「待补充」。无来源 = C 级 | `doc-p0` |
| 冲突保护 | 目标目录已存在时拒绝覆盖 | 引导 `/rui update` |
| 反推诚实 | 能从代码确定的写 Level A/B，不能确定的标「待补充」，不编造 | `chain-broken` |
| 表达优先 | 每文档必须含 mermaid 图（效果示意/操作流/架构图至少其一），不可纯文本 | `doc-p0` |
| 逐故事串行 | 多故事时按 recommend.mjs 输出顺序串行，前故事 5 文档全部完成再进下一故事 | `chain-broken` |

**末端触发** [强制集成](#强制集成)。

## 推荐

只读，不触发 import-docs / wework-bot。

- **推荐** — 5 层链式管线评分（L0 时间 / L1 依赖 / L2 风险 / L3 覆盖 / L4 质量），加权排序推荐下一步任务

> 进度全景查询（list）已迁移至 `/rui-story list`，详见 [rui-story SKILL.md](../rui-story/SKILL.md)。

## 强制集成

> import-docs + wework-bot 三步收口。每次写入命令末端必须按序触发。

### 触发时机

**触发**：`init` / `doc` / `code` / `需求` / `update` / `code --from-doc` / `doc --from-code`  
**不触发**：`/rui`（推荐）

### 执行顺序（不可跳序）

```
管线完成/阻断 → 1. hook-log（追加日志）→ 2. `node skills/import-docs/sync.mjs`（文档同步）→ 3. wework-bot（发送通知）
```

| # | 步骤 | 规约出处 | 标记字段 |
|---|------|---------|---------|
| 1 | hook-log | [wework-bot — hook-log](../wework-bot/SKILL.md#①-hook-log追加日志不发送) | `delivery_pipeline.log_appended` |
| 2 | `node skills/import-docs/sync.mjs` | [import-docs — hook 触发器](../import-docs/SKILL.md#hook-触发器) | `delivery_pipeline.docs_synced` |
| 3 | wework-bot | [wework-bot — hook-notify](../wework-bot/SKILL.md#③-hook-notify实际发送) | `delivery_pipeline.notification_sent` |

### 降级

- `no-token`：`API_X_TOKEN` 缺失时跳过推送，仍写 `delivery_pipeline` 标记
- 网络失败：告警不阻断，标记仍写

## 诊断纪律

> 结构化调试纪律。难 bug 不靠猜——靠反馈回路。

### Phase 1 — 构建反馈回路

**这就是方法本身。** 有快速、确定、可自运行的通过/失败信号，二分和假设测试才有效。

构建方式（按优先级）：
1. **失败测试** — 在触及 bug 的接缝写
2. **curl / HTTP 脚本** — 对运行中的 dev server 发请求
3. **CLI + fixture** — fixture 输入，diff stdout 与正确快照
4. **Headless 浏览器** — Playwright/Puppeteer 驱动 UI
5. **回放 trace** — 保存真实网络请求/payload 到磁盘
6. **One-off harness** — 启动系统最小子集，一个函数调用触发 bug
7. **Property / fuzz** — 1000 次随机输入找失败模式
8. **二分 harness** — 自动化「在状态 X 启动、检查」让 `git bisect run` 可用
9. **差分循环** — 同一输入 old vs new，diff 输出
10. **HITL bash 脚本** — 最后手段

**迭代回路**：更快？信号更清晰？更确定？2 秒确定回路是调试超能力。30 秒抖动回路等于没有。

**非确定 bug**：目标不是干净复现而是更高复现率。循环触发 100 次、并行化、加压力、注入 sleep。

**无回路不进入 Phase 2。**

### Phase 2–6

- **复现** — 确认失败模式是用户描述的，可多轮复现，精确症状已捕获
- **假设** — 生成 3–5 个排好序的可证伪假设。写不出预测 = 直觉——丢弃
- **Instrument** — 一次改一个变量。debugger/REPL > 目标日志 > 标签日志 > 性能分支
- **修复 + 回归** — 先写回归测试 → 看它失败 → 应用修复 → 看它通过 → 重跑 Phase 1 回路
- **清理 + 复盘** — 原始复现不再复现 · 回归测试通过 · `[DEBUG-...]` 已删除 · One-off 原型已移除

### Red Flags

以下任一出现 = 停止，回到 [铁律](../../CLAUDE.md#铁律)：
- "这个 bug 很简单，直接修就行"
- "修复超过 3 次了但这次肯定对"
- "多个修复一起上省时间"
- "不需要最小复现，我理解根源了"
- "先修 bug 再写测试"

## 架构深化

> 发现架构摩擦，把浅模块转为深模块。

- **模块** — 有接口与实现的任何东西（函数 / class / 包 / 切片）
- **接口** — 调用者需知的一切：类型、不变式、错误模式、顺序。不止类型签名
- **深度** — 接口后的行为量 / 接口复杂度。深 = 高杠杆。浅 = 接口≈实现
- **接缝** — 接口所在之处；不改原地就能改行为的地方
- **删除测试** — 想象删除它：复杂度消失 = 透传；回到 N 个调用方 = 它在赚位置

**流程**：探索（读 ADR，注意摩擦）→ 呈现候选（涉及文件 + 方案 + 收益）→ 用户选定后走设计树。

**Red Flags**："加个抽象层就行"（无第二调用方 = 浅模块）· "同时重构几个模块"（一次一个）

## 交接纪律

> 会话上下文压缩为交接文档，供 Agent 间继续。

```markdown
# Handoff: {简短描述}

## Goal
{≤ 3 句：做什么、为谁、为什么}

## Done
- [x] `path/file.ts:42` — {做了什么} ({验证结果})

## Now
{当前状态：进行中/卡住/等待}

## Key findings
- {非显而易见的约束/决定/冲突}

## Next
- [ ] {具体下一步}

## Context
- 分支: `{branch}`
- Commit: `{hash}`
- 相关文件: `path/a`, `path/b`
```

- **≤ 1 页**（约 60 行）
- **具体到文件/行号** — 不说 "改过 auth 模块"，说 "`src/auth/login.ts:42` 添加了 rate-limit 中间件"
- **不含 spec** — 描述实际状态，不是理想状态
- **可验证** — 每个声称附验证命令或文件路径

## 集成

| 类别 | 内容 |
|------|------|
| 数据契约 | `{project}-10-交互日志.md`（追加）· `.memory/rui-state.json`（覆盖写）· `.memory/execution-memory.jsonl`（追加）· `.improvement/proposals.jsonl`（追加）— 字段见 [coder.md §数据契约](./coder.md) |
| Hooks | Stop hooks 调用：hook-log → import-docs → hook-notify → delivery-gate |
| 规则 | [code-pipeline](../../rules/code-pipeline.md) · [delivery-gate](../../rules/delivery-gate.md) · [doc-generation](../../rules/doc-generation.md) · [self-improve](../../rules/self-improve.md) · [rui-claude](../../rules/rui-claude.md) |
| 角色 | [pm](../../agents/pm.md) · [coder](../../agents/coder.md) · [tester](../../agents/tester.md) · [reporter](../../agents/reporter.md) · [security](../../agents/security.md) · [self-improve](../../agents/self-improve.md) |
| 文档 | [formulas.md](./formulas.md) · [coder.md](./coder.md) · [import-docs SKILL](../import-docs/SKILL.md) · [wework-bot SKILL](../wework-bot/SKILL.md) |
| 推荐 | [ranking.md](./ranking.md) · [recommend.mjs](./recommend.mjs) |

## 外部参考融合

> 管线的每个阶段均有对应的外部参考资源（详见 [外部参考知识库](../../libs/) 与 [formulas.md §外部参考应用指南](./formulas.md#外部参考应用指南)）。各 Agent 在执行前必须查阅对应参考，不可凭感觉执行。

```mermaid
flowchart TB
    subgraph 阶段["管线阶段"]
        S1["需求→文档<br/>pm 拆分 + coder 设计"]:::phase
        S2["预检<br/>分支隔离 + Gate A"]:::phase
        S3["实现<br/>逐模块编码 + P0 清零"]:::phase
        S4["验证<br/>Gate B + 三报告"]:::phase
        S5["自改进<br/>D0-D7 诊断"]:::phase
        S6["交付<br/>三步收口"]:::phase
    end

    subgraph 参考["外部参考融合矩阵"]
        R1["故事描述<br/>superpowers · get-shit-done<br/>ui-ux-pro-max<br/>karpathy-skills"]:::ref
        R2["工程纪律<br/>mattpocock-skills<br/>everything-claude-code"]:::ref
        R3["架构与执行<br/>system-design-primer<br/>ruflo · hermes-agent"]:::ref
        R4["记忆与改进<br/>claude-mem · agentmemory<br/>superpowers"]:::ref
        R5["趋势与发现<br/>GitHub Trending · OSS Insight<br/>TrendShift · Top-Starred"]:::ref
    end

    S1 --> R1
    S2 & S3 --> R2
    S3 --> R3
    S4 & S5 --> R4
    S6 --> R5

    classDef phase fill:#e3f2fd,stroke:#1565c0;
    classDef ref fill:#fff3e0,stroke:#e65100;
```

| 阶段 | 核心参考 | 具体应用 | 谁查阅 |
|------|---------|---------|--------|
| 需求→文档 | superpowers · get-shit-done · ui-ux-pro-max · karpathy-skills | 故事拆分粒度 · AC 设计 · UI 交互状态覆盖（≥3 状态）· LLM 编码陷阱规避 | pm |
| 预检 | mattpocock-skills · everything-claude-code | 工程纪律 · 测试先行门禁 · 上下文质量优先 | tester · coder |
| 实现 | system-design-primer · ruflo · hermes-agent · everything-claude-code | 深模块设计 · 多 Agent 协作 · 研究优先开发 · 纵深防御 | coder · security |
| 验证 | claude-mem · agentmemory · superpowers | 执行记忆沉淀 · 基准评估 · 验证门禁五步法 | tester · reporter |
| 自改进 | claude-mem · agentmemory · hermes-agent | 记忆压缩注入 · 经验技能化 · 跨会话相似检索 | self-improve |
| 交付 | GitHub Trending · OSS Insight · TrendShift · Top-Starred | 技术趋势验证 · 架构健康度 · 新兴工具发现 · 社区验证的高质量项目参照 | reporter |
