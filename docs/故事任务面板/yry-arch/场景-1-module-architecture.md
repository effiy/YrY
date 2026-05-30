# 场景-1-module-architecture

> | v1.0.0 | 2026-05-30 | coder + tester | 🌿 main | 📎 [故事任务](./故事任务.md) |
> **导航**: [§0 技术评审](#s0-技术评审) · [§1 测试设计](#s1-测试设计)

---

## §0 技术评审

### 效果示意

```mermaid
flowchart LR
    NOW["当前状态<br/>架构知识隐含在<br/>源码和规约中"]:::pain
    NOW --> M1["里程碑 1<br/>模块地图可视化<br/>16 模块全识别"]:::milestone
    M1 --> M2["里程碑 2<br/>数据流端到端<br/>4 条流可追踪"]:::milestone
    M2 --> GOAL["目标状态<br/>架构基线可查询<br/>可验证·可演进"]:::goal
```

### 模块地图

#### 技能层（6 技能）

| 技能 | 入口 | 核心依赖 | 下游消费者 |
|------|------|---------|-----------|
| rui | SKILL.md (skills/rui/SKILL.md) | pm, coder, tester, reporter, self-improve | 用户命令 /rui |
| rui-story | rui-story.mjs, status.mjs | rui-import (sync API) | 用户命令 /rui-story |
| rui-claude | SKILL.md | .claude/ 文件 | 用户命令 /rui-claude |
| rui-import | sync.mjs, help.mjs | 远端文档 API, API_X_TOKEN | rui (hook), rui-story |
| rui-bot | send.mjs | 企微 Webhook, WW_BOT_KEY | rui (hook) |
| rui-trends | SKILL.md | GitHub API, OSS Insight | 用户命令 /rui-trends |

#### 角色层（5 Agent）

| Agent | 契约文件 | 上游调用者 | 下游依赖 |
|-------|---------|-----------|---------|
| pm | agents/pm.md | rui (doc/code/yry) | coder, tester |
| coder | agents/coder.md | pm, rui (code) | tester |
| tester | agents/tester.md | pm, coder | reporter |
| reporter | agents/reporter.md | rui (交付阶段) | — |
| self-improve | agents/self-improve.md | rui (yry/自改进) | pm |

#### 规则层（5 Rule）

| 规则 | 文件 | 作用域 | 核心约束 |
|------|------|--------|---------|
| code-pipeline | rules/code-pipeline.md | `**/*.{js,ts,...}` | 分支隔离 · Gate A/B · P0 清零 |
| delivery-gate | rules/delivery-gate.md | `docs/故事任务面板/**/*.md` | 交付三步 hook |
| doc-generation | rules/doc-generation.md | `docs/**/*.md` | 表达优先 · 场景文档模型 |
| rui-claude | rules/rui-claude.md | `.claude/**` | .claude/ 配置管理 |
| self-improve | rules/self-improve.md | 全部 | D0-D7 诊断 · E1-E4 评估 |

### 四层拓扑模型

```mermaid
flowchart TB
    subgraph CMD["命令层"]
        RUI["/rui"]:::cmd
        STORY["/rui-story"]:::cmd
        CLAUDE_CMD["/rui-claude"]:::cmd
        TRENDS["/rui-trends"]:::cmd
    end

    subgraph SKILL["技能层"]
        RUI_S[rui]:::skill_node
        RS_S[rui-story]:::skill_node
        RC_S[rui-claude]:::skill_node
        RI_S[rui-import]:::skill_node
        RB_S[rui-bot]:::skill_node
        RT_S[rui-trends]:::skill_node
    end

    subgraph AGENT["角色层"]
        PM_A[pm]:::agent_node
        CODER_A[coder]:::agent_node
        TESTER_A[tester]:::agent_node
        REPORTER_A[reporter]:::agent_node
        SI_A[self-improve]:::agent_node
    end

    subgraph RULE["规则层"]
        CP_R[code-pipeline]:::rule_node
        DG_R[delivery-gate]:::rule_node
        DGEN_R[doc-generation]:::rule_node
        RC_R[rui-claude]:::rule_node
        SI_R[self-improve]:::rule_node
    end

    RUI --> RUI_S
    STORY --> RS_S
    CLAUDE_CMD --> RC_S
    TRENDS --> RT_S

    RUI_S --> PM_A & CODER_A & TESTER_A & REPORTER_A & SI_A
    RS_S --> RI_S

    PM_A --> CODER_A & TESTER_A
    CODER_A --> TESTER_A
    TESTER_A --> REPORTER_A
    SI_A -.提案.-> PM_A

    RUI_S -.受约束.-> CP_R & DG_R & DGEN_R
    RC_S -.受约束.-> RC_R
    SI_A -.受约束.-> SI_R
    RI_S -.hook.-> RB_S
```

### 四条数据流

#### 1. 命令流（/rui → skill → agent）

```mermaid
sequenceDiagram
    participant U as 用户
    participant CLI as Claude Code
    participant SK as rui skill
    participant PM as pm agent
    participant C as coder agent
    participant T as tester agent

    U->>CLI: /rui doc <需求>
    CLI->>SK: 加载 SKILL.md 规约
    SK->>PM: 委派需求解析
    PM->>PM: 研究优先 → 事实基线
    PM->>PM: 拆故事 → 排优先级
    PM-->>SK: 故事任务.md
    SK->>C: 补齐 §0 技术评审
    C-->>SK: 场景文档 §0
    SK->>T: 补齐 §1 测试设计
    T-->>SK: 场景文档 §1
    SK-->>CLI: 文档基线完成
```

#### 2. doc 流（文档生成 → 导入 → 通知）

```mermaid
sequenceDiagram
    participant RUI as rui
    participant GEN as 文档生成
    participant IMP as rui-import
    participant API as 远端文档 API
    participant BOT as rui-bot

    RUI->>GEN: Write 文档到本地
    GEN->>IMP: import-doc.mjs <file>
    IMP->>API: POST 远端导入
    API-->>IMP: ✓ ok / ⚠ failed
    Note over RUI: 所有文档生成完毕
    RUI->>IMP: sync.mjs workspace=true (安全网)
    RUI->>BOT: send.mjs (通知)
    BOT->>BOT: 企微 Webhook 推送
```

#### 3. 交付流（三步 hook）

```mermaid
sequenceDiagram
    participant RUI as rui
    participant LOG as hook-log
    participant IMP as rui-import
    participant BOT as rui-bot

    RUI->>LOG: 追加交付日志
    LOG-->>RUI: ✓
    RUI->>IMP: sync.mjs workspace=true
    IMP->>IMP: 全量文档同步
    IMP-->>RUI: ✓ / ⚠
    RUI->>BOT: send.mjs --stats <详细统计>
    BOT->>BOT: 企微通知
    BOT-->>RUI: ✓ / ⚠
```

#### 4. 自改进流（yry 闭环）

```mermaid
sequenceDiagram
    participant RUI as rui yry
    participant SI as self-improve
    participant PM as pm
    participant CODE as code pipeline

    RUI->>SI: 全量扫描所有故事
    SI->>SI: D0-D7 诊断
    SI->>SI: 可合并/需拆分检测
    SI->>SI: 优先级排序
    SI-->>RUI: 改进提案列表
    RUI->>PM: 选取最优改进项
    PM-->>RUI: 执行方案
    RUI->>CODE: /rui update <name> 或 /rui code <name>
    CODE-->>RUI: 验证通过
    RUI->>RUI: 版本升级 + 交付
    Note over RUI: 循环至无改进空间或达上限
```

### 信任边界

```mermaid
flowchart TB
    subgraph PUBLIC["🌐 公网"]
        USER["用户输入<br/>命令/文件引用/URL"]:::untrusted
    end

    subgraph TRUST["🔒 信任域 — YrY 项目空间"]
        subgraph CLI_SCOPE["CLI 层"]
            SKILLS[技能层]:::trusted
            AGENTS[角色层]:::trusted
        end
        subgraph FS["文件系统"]
            DOCS[docs/]:::trusted
            CODE[agents/ skills/ rules/]:::trusted
        end
    end

    subgraph EXTERNAL["🌐 外部服务"]
        REMOTE_API["远端文档 API<br/>需 API_X_TOKEN"]:::external
        WEWORK["企微 Webhook<br/>需 WW_BOT_KEY"]:::external
        GITHUB["GitHub API<br/>公开只读"]:::external
    end

    USER -->|"输入校验·XSS 过滤"| SKILLS
    SKILLS -->|"凭据不落盘·env var"| REMOTE_API
    SKILLS -->|"凭据不落盘·env var"| WEWORK
    SKILLS -->|"公开查询"| GITHUB
    SKILLS -->|"读写"| FS
```

| 边界 | 防御措施 | 验证方式 |
|------|---------|---------|
| 用户输入 → 技能层 | 输入校验，XSS 过滤 | grep 输入处理点 |
| 技能层 → 远端 API | API_X_TOKEN 环境变量，不落盘 | grep API_X_TOKEN |
| 技能层 → 企微 | WW_BOT_KEY 环境变量，不落盘 | grep WW_BOT_KEY |
| 技能层 → 文件系统 | 分支隔离，feat/<name> 强制 | branch-check.mjs |

### ADR（架构决策记录）

| ADR# | 决策 | 背景 | 后果 |
|------|------|------|------|
| ADR-1 | 故事驱动 SDLC | 传统 issue/PR 流程缺乏结构化故事→文档→代码闭环 | 所有变更走 /rui 管线，学习成本换取可追溯性 |
| ADR-2 | 双图层知识图谱 | 纯文件目录难以表达跨故事关系 | stories-deps.json + knowledge-graph.json 支撑图遍历 |
| ADR-3 | Agent 分工（pm/coder/tester/reporter/si） | 单模型难以覆盖决策+实现+质量+记录全流程 | 五角色协作，各守门禁 |
| ADR-4 | 分支隔离强制 | 多人协作需要隔离变更 | feat/<name> 分支 + branch-check.mjs |
| ADR-5 | 表达优先（图→文→表） | 文本文档信息密度低，难以快速理解架构 | Mermaid 图优先，表结构化数据，文补充说明 |
| ADR-6 | 研究优先开发 | 模型容易基于假设而非事实做决策 | 任何分析前先 Read/Grep/Glob 建立事实基线 |

### 依赖矩阵

| ↓依赖 \ 被依赖→ | rui | rui-story | rui-claude | rui-import | rui-bot | rui-trends | pm | coder | tester | reporter | si |
|-----------------|-----|-----------|------------|------------|---------|------------|----|-------|--------|----------|----|
| rui | — | | | H | H | | I | I | I | I | I |
| rui-story | | — | | I | | | | | | | |
| rui-claude | | | — | | | | | | | | |
| rui-import | | | | — | | | | | | | |
| rui-bot | | | | | — | | | | | | |
| rui-trends | | | | | | — | | | | | |
| pm | I | | | | | | — | I | I | | |
| coder | | | | | | | | — | | | |
| tester | | | | | | | | | — | I | |
| reporter | | | | | | | | | | — | |
| si | | | | | | | I | | | | — |

> I = import/reference, H = hook invocation. 仅标注直接依赖。

### 新人上手路径

| 步骤 | 内容 | 预计时间 |
|------|------|---------|
| 1 | 读 [CLAUDE.md](../../../CLAUDE.md) 基础信念 + 铁律 | 5 min |
| 2 | 读 [README.md](../../../README.md) 系统全景 + 领域语言 | 10 min |
| 3 | 看本场景文档的四层拓扑模型 + 四条数据流 | 10 min |
| 4 | 读关键 Agent 契约（pm → coder → tester） | 15 min |
| 5 | 跑 `/rui` 看任务推荐输出 | 2 min |
| **总计** | | **~42 min** |

---

## §1 测试设计

### 测试策略

架构验证不涉及运行时测试，采用**静态分析**方式验证文档与源码的一致性。

| 测试类别 | 方法 | 工具 |
|---------|------|------|
| 模块存在性 | 逐文件路径验证 | `find` / `ls` |
| 依赖完整性 | import 链可解析 | `grep` + 手动验证 |
| 信任边界 | 密钥相关模式扫描 | `grep` |
| 文档覆盖 | 规约文件存在性 | `find` |

### AC

| AC# | Given | When | Then | 门禁 |
|-----|-------|------|------|------|
| AC1 | 架构文档声明 6 个 skill | 验证 `skills/*/SKILL.md` | 6 个目录均含 SKILL.md | Gate A |
| AC2 | 架构文档声明 5 个 agent | 验证 `agents/*.md` | 5 个 agent 文件均存在 | Gate A |
| AC3 | 架构文档声明 5 个 rule | 验证 `rules/*.md` | 5 个 rule 文件均存在 | Gate A |
| AC4 | 模块地图入口路径 | 逐路径 ls | 全部路径可解析 | Gate A |
| AC5 | 密钥不落盘 | grep -r "API_X_TOKEN\|WW_BOT_KEY" --include="*.{js,mjs,json,md}" | 仅环境变量读取点，无硬编码 | Gate A |
| AC6 | 信任边界图中边界数 | 计数安全边界 | ≥ 3 条边界 | Gate A |

### 测试用例

#### TC1: 模块清单完整性

```bash
# 验证 6 个 skill 目录均存在 SKILL.md
for d in rui rui-story rui-claude rui-import rui-bot rui-trends; do
  test -f "skills/$d/SKILL.md" && echo "✓ $d" || echo "✗ $d MISSING"
done

# 验证 5 个 agent 文件
for f in AGENT pm coder tester reporter self-improve; do
  test -f "agents/${f}.md" && echo "✓ agent/$f" || echo "✗ agent/$f MISSING"
done

# 验证 5 个 rule 文件
for f in code-pipeline delivery-gate doc-generation rui-claude self-improve; do
  test -f "rules/${f}.md" && echo "✓ rule/$f" || echo "✗ rule/$f MISSING"
done
```

#### TC2: 密钥安全扫描

```bash
# 确认无硬编码密钥
grep -rn "API_X_TOKEN\s*=" --include="*.{js,mjs,json}" . && echo "✗ HARDCODED TOKEN FOUND" || echo "✓ No hardcoded token"
grep -rn "WW_BOT_KEY\s*=" --include="*.{js,mjs,json}" . && echo "✗ HARDCODED BOT KEY FOUND" || echo "✓ No hardcoded bot key"
```

#### TC3: 依赖引用可解析

```bash
# 验证 SKILL.md 中引用的规则路径可解析
grep -roh 'rules/[a-z-]*\.md' skills/ agents/ | sort -u | while read p; do
  test -f "$p" && echo "✓ $p" || echo "✗ $p BROKEN"
done
```

#### TC4: 故事目录结构完整性

```bash
# 验证故事面板目录存在
test -d "docs/故事任务面板" && echo "✓ 故事面板目录存在" || echo "✗ 故事面板目录缺失"
test -d "docs/故事任务面板/yry-arch" && echo "✓ yry-arch 存在" || echo "✗ yry-arch 缺失"
test -d "docs/故事任务面板/yry-self-test" && echo "✓ yry-self-test 存在" || echo "✗ yry-self-test 缺失"
```

---

> **回溯链**：[故事任务](./故事任务.md) · [CLAUDE.md](../../../CLAUDE.md) · [AGENT.md](../../../agents/AGENT.md)

### 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-05-30 | 1.0.0 | init 初始化，架构基线场景文档 |
