---
name: rui
description: Story-driven SDLC orchestrator: story → document → code → delivery. Command: /rui.
user_invocable: true
lifecycle: default-pipeline
agents:
  required: [pm, coder, docer, tester, reporter, security]
---

# rui

故事驱动 SDLC 编排器。每个需求提炼为故事，拆解为子项目任务调度执行。

```mermaid
flowchart TD
    USER["/rui &lt;command&gt; &lt;name&gt;"] --> ROUTE{command}
    ROUTE -->|init| INIT["自改进 → 发现→生成→策展→基线 → 就绪检查"]
    ROUTE -->|doc &lt;name&gt;| DOC["自适应规划→策展 文档管线"]
    ROUTE -->|code &lt;name&gt;| CODE["预检→验证 代码管线"]
    ROUTE -->|&lt;name&gt;| FULL["文档管线 → 代码管线 端到端"]

    INIT --> DELIVER["交付: self-improve-loop → import-docs → wework-bot"]
    DOC --> DELIVER
    CODE --> DELIVER
    FULL --> DELIVER
```

---

## 命令概览

| 命令 | 流程 |
|------|------|
| `/rui init` | 自改进 → 发现→生成→策展（逐故事循环）→ 基线 → 就绪检查 → 交付 |
| `/rui doc <name>` | 自适应规划→策展 → 交付 |
| `/rui code <name>` | 预检→验证 → 交付（需已存在 `docs/故事任务面板/<name>/故事任务.md`） |
| `/rui <name>` | 自适应规划→策展 → 预检→验证 → 交付 |

---

## /rui init

以故事为原子单位驱动，发现→策展逐故事循环。

```mermaid
flowchart TD
    INIT["/rui init"] --> SELF["自改进<br/>健康评分 + 快照 + 趋势 + 提案"]
    INIT --> DISCOVER["发现<br/>检索规范 + 提炼故事列表"]
    DISCOVER --> STORIES{故事列表}
    STORIES -->|逐故事| GENERATE["生成<br/>7 agent 协作 → 故事板"]
    GENERATE --> CURATE["策展<br/>git commit + 执行记忆回写"]
    CURATE -->|下一故事| GENERATE
    CURATE -->|全部完成| BASELINE["项目基线<br/>CLAUDE.md + README.md"]
    BASELINE --> CHECK{"就绪检查"}
    CHECK -->|PASS| DELIVER["交付"]
    CHECK -->|FAIL| FIX["修复缺失项"]
    FIX --> CHECK
    SELF -.->|静默运行| GENERATE
    SELF -.->|静默运行| CURATE
    SELF -.->|静默运行| DELIVER
```

| 阶段 | 做什么 | 关键产出 |
|------|--------|---------|
| 自改进 | 健康评分 + 快照 + 趋势 + 提案 | `docs/.improvement/proposals.jsonl` |
| 发现 | 检索规范 + 提炼故事列表 | `docs/故事任务面板/<name>`（故事目录列表） |
| 生成 | 逐故事 7 agent 协作，写入故事目录 | `docs/故事任务面板/<name>/`（故事板文件） |
| 策展 | git commit + 执行记忆回写 | `docs/.memory/execution-memory.jsonl` |
| 项目基线 | 生成 CLAUDE.md + README.md | `CLAUDE.md` + `README.md` |
| 就绪检查 | 5 项检查，失败则修复重检 | 就绪状态 |
| 交付 | self-improve-loop → import-docs → wework-bot | wework-bot 通知 |

### 自改进管线

静默运行，不阻断主流程。脚本位于 `skills/rui/scripts/`。

| rui 阶段 | 触发 | 操作 |
|---------|------|------|
| init | 全量运行 | 健康评分 + 快照 + 趋势 + 提案 |
| 影响分析 / 预检 | 架构反思 | 六维推演，产出架构指标 |
| 策展 / 验证 | 工流诊断 | 趋势分析，产出工流指标 |
| 交付 | self-improve-loop | 效果评估 + 回顾 → `loop.js run --all` |

数据存储: `docs/.improvement/proposals.jsonl` + `docs/.memory/`，append-only。

**项目基线：** 生成 `CLAUDE.md` + `README.md`（双文件 × N 子项目）。

### 就绪检查

| # | 检查项 | 验证 |
|---|-------|------|
| 1 | proposals.jsonl 存在 | `test -f` |
| 2 | docs/故事任务面板/ 目录存在 | `test -d` |
| 3 | 项目 CLAUDE.md 存在且非空 | `wc -l` |
| 4 | 项目 README.md 存在且非空 | `wc -l` |
| 5 | proposals.jsonl 无已解决但仍 open 的提案 | grep |

---

## /rui doc \<name\>

自适应规划→策展 → 交付

以故事为原子单位驱动，发现→策展逐故事循环。

```mermaid
flowchart TD
    PLAN[自适应规划] --> DISCOVER[发现]
    DISCOVER --> STORIES{故事列表}
    STORIES -->|逐故事| LOOP["故事循环"]
    LOOP --> IMPACT[影响分析]
    IMPACT --> ARCH[架构设计]
    ARCH --> DOCGEN[文档生成]
    DOCGEN --> CURATE[策展]
    CURATE -->|下一故事| LOOP
    CURATE -->|全部完成| BASELINE[项目基线]
```

| 阶段 | 做什么 | 关键产出 |
|------|--------|---------|
| 自适应规划 | 读取执行记忆，判定 T1/T2/T3 变更级别 | 执行计划 |
| 发现 | 检索规范与已有文档，提炼故事列表 | 规范列表 + 故事列表 |
| 影响分析 | 逐故事全项目影响链分析，闭合所有依赖 | 闭合影响链 |
| 架构设计 | 逐故事模块划分、接口规范、数据流设计 | 架构设计 |
| 文档生成 | 逐故事 7 agent 协作编写 | 故事板文档 × N |
| 策展 | git commit + 执行记忆回写 + 后记（§6 §7） | 已保存文档 |
| 项目基线 | 仅 init：生成 CLAUDE.md + README.md | 双文件 × N |

### Agent 分工

| Agent | 负责章节 | 注入条件 |
|-------|---------|---------|
| pm | §1 Story + §4 Tasks | 始终 |
| docer | §2 Requirements | 始终 |
| coder | §3 Design + §4 实现任务 | 始终 |
| tester | §1.1 用户操作 + §5 AC | 始终 |
| reporter | §4 依赖映射 + 交付物细化 | 始终 |
| security | §3 安全约束 + §4 安全任务 | 涉及用户输入/外部API/认证/持久化 |

### 增量裁剪

| 级别 | 触发条件 | 影响分析 | 架构设计 | 文档生成 |
|------|---------|---------|---------|---------|
| T1 微观 | 措辞、格式修正 | 跳过 | 跳过 | 仅变更章节 |
| T2 局部 | 增删故事/接口变更 | 裁剪 | 裁剪 | 重写目标+下游 |
| T3 范围 | 范围边界变化、跨故事重构 | 完整重跑 | 完整重跑 | 全级联刷新 |

---

## /rui code \<name\>

预检→验证 → 交付（需已存在 `docs/故事任务面板/<name>/故事任务.md`）

```mermaid
flowchart TD
    PRECHECK["预检<br/>影响分析 + 分支隔离"] --> TESTFIRST["测试先行<br/>测试方案 + 原型"]
    TESTFIRST --> GA{Gate A}
    GA -->|PASS| IMPL["实现<br/>逐模块编码 + P0 审查"]
    GA -->|FAIL| FIX1[修复]
    FIX1 --> GA
    IMPL --> VERIFY["验证<br/>冒烟 + 影响链回归"]
    VERIFY --> GB{Gate B}
    GB -->|PASS| DELIVER[交付]
    GB -->|FAIL ≤2 轮| FIX2[修复]
    FIX2 --> GB
    GB -->|>2 轮| BLOCK[阻断: H7]
```

| 阶段 | 做什么 | 规则 |
|------|--------|------|
| 预检 | 双边影响分析 + 分支隔离（从 main/master 拉取 `feat/<name>` / `docs/<name>`） | H10: 必须从主分支创建 |
| 测试先行 | Gate A：测试方案+原型，单行 CSS 可跳过 | H6: Gate A 未过不得编码 |
| 实现 | 逐模块编码，每模块后审查：P0 必须修 / P1 建议修 / P2 可选 | P0 未清零不进下一模块 |
| 验证 | Gate B：环境快照 → 静态预检 → 对齐 → 单次执行 | H7: >2 轮修复阻断交付 |

---

## /rui \<name\>（端到端）

自适应规划→策展 → 预检→验证 → 交付

组合执行文档管线（见 [/rui doc](#rui-doc-name)）和代码管线（见 [/rui code](#rui-code-name)），中间不中断，完成或阻断后输出下一步提示。

---

## 交付

所有命令的末端，按序执行：

| Step | 操作 | 失败处理 |
|------|------|---------|
| 1 | `self-improve.js evaluate` → `loop.js run --all` | 不阻断（H11 降级） |
| 2 | `import-docs.js --workspace` | H9: token 缺失时跳过 |
| 3 | wework-bot 通知 | 不可跳过 |

消息格式（纯文本，emoji 前缀，`———` 分隔）：

```
🎯 结论: 完成 user-login 文档管线
📝 描述: 为登录模块生成故事板，覆盖密码登录、短信验证码、OAuth 三种场景
📌 范围: auth/
👉 下一步: 运行 /rui code user-login 开始编码实现
🌐 影响: docs/故事任务面板/user-login/故事任务.md
📎 证据: git log --oneline -1
⏱️ 会话: 自适应规划→策展 全流程 3.2min | 3 agents 参与

———
变更文件: docs/故事任务面板/user-login/故事任务.md (新增, 285行)
```

完成或阻断后同时向用户输出下一步提示。字段要求见 wework-bot SKILL.md。

---

## 文档规范

```
<workspace-root>/
└── docs/
    ├── .improvement/proposals.jsonl
    ├── .memory/
    │   ├── execution-memory.jsonl
    │   └── rui-state.json
    ├── shared/
    │   ├── architecture.md
    │   └── contracts.md
    └── 故事任务面板/
        └── <name>/              ← 故事目录（简写，便于分支管理）
            └── 故事任务.md      ← 唯一真相源
```

### 故事板章节

| 章节 | 负责人 | 内容 |
|------|--------|------|
| §1 Story | pm | 角色场景、价值、范围边界、依赖 |
| §1.1 User Operations | tester | 用户操作 + UI交互流程 |
| §2 Requirements | docer | 功能点、输入输出、错误行为、业务规则 |
| §3 Design | coder + security | 技术设计 + 安全约束 |
| §4 Tasks | pm + all | 任务拆解、依赖、交付物 |
| §5 Acceptance Criteria | tester | 验收标准、测试方法、预期结果 |
| §6 .claude 改进清单 | pm | skill/agent/rule/script/config 改进（文档生成/策展阶段静态分析） |
| §7 系统架构演进任务 | pm | 近期/中期/远期演进（架构设计/策展阶段结构规划） |
| §L 自我改进循环 | self-improve-loop | 数据驱动改进清单 + 架构演进（每次 rui 完成追加） |

> §6 §7 由 pm 在文档生成阶段写入（结构性）。§L 由 self-improve-loop 在每次 rui 完成时自动追加（数据驱动）。两者互补。

≤10 故事/板，依赖用 `[story-name](./story-name.md)` 声明，超出拆分 `<name>-2.md`。

---

## 核心规则

1. **增量更新**: 已有文档按 T1/T2/T3 裁剪
2. **测试先行**: Gate A 阻断实现；Gate B >2 轮修复阻断交付
3. **逐模块审查**: 实现阶段每模块后审查，P0 清零前进
4. **双边影响**: 预检阶段同时分析代码和文档影响
5. **分支隔离**: 预检阶段从 main/master 拉取功能分支
6. **知识沉淀**: 策展阶段写执行记忆 + rui-state.json
7. **交付必触发**: self-improve-loop → import-docs → wework-bot

---

## 阻断

| # | 场景 | 降级 | 阶段 |
|---|------|------|------|
| H1 | 功能名称无法解析 | 否 | 自适应规划 |
| H2 | P0 章节缺少上游来源 | 否 | 文档生成, 预检 |
| H3 | 影响链无法闭合 | 否 | 影响分析, 预检 |
| H4 | 文档 P0 不通过且无法自修复 | 否 | 文档生成 |
| H5 | 代码审查 P0 无法修复 | 否 | 实现 |
| H6 | Gate A 未完成但已编码 | 否 | 测试先行→实现 |
| H7 | Gate B >2 轮修复未通过 | 否 | 验证→交付 |
| H8 | 所有模块被阻断 | 否 | 实现 |
| H9 | `API_X_TOKEN` 缺失 | 是 | 交付 |
| H10 | 功能分支未从 main/master 创建 | 否 | 预检 |
| H11 | self-improve-loop 数据采集失败 | 是 | self-improve-loop |

阻断后: `rui-state.js save --blocked` → `next-step` → 持久化 → 同步（H9/H11 跳过）→ 通知。

---

## 集成点

- **自改进**: `node skills/rui/scripts/self-improve.js <cmd>`
- **自改进循环**: `node skills/rui/scripts/loop.js run --all`
- **执行记忆**: `node skills/rui/scripts/execution-memory.js`
- **断点**: `node skills/rui/scripts/rui-state.js <save|load|clear>`
- **文档同步**: `node skills/import-docs/scripts/import-docs.js --workspace`
- **通知**: `wework-bot`
- **Agent**: [`.claude/agents/AGENT.md`](../../agents/AGENT.md)
- **模板**: [`templates/故事任务模板.md`](templates/故事任务模板.md)
