# 📋 Project Docs Bootstrap — 项目文档启动

```mermaid
graph TD
    S1["§1 Feature Overview"] --> S2["§2 User Stories"]
    S2 --> S4["§4 Project Report"]
    S4 --> PS["Postscript"]
```

> | v1.0 | 2026-05-05 | deepseek-v4-pro | 🌿 main | 📎 来源: [周报 2026-05-04~2026-05-10](weekly/2026-05-04~2026-05-10/weekly-report.md) |

[📖 §1](#1-feature-overview) | [📋 §2](#2-user-stories) | [📈 §4](#4-project-report) | [🔄 后记](#post-mortem)

---

## 📖 1. Feature Overview

| Aspect | Detail |
|--------|--------|
| Problem | YrY 项目定义了完整的文档生成流水线，但自身 `docs/` 目录为空——吃自己的狗粮失败 |
| Who | YrY 新成员、维护者 |
| Scope | `docs/yry-overview.md`（项目全景）+ `docs/weekly/` 周报体系启动 |
| Out-of-Scope | 具体业务功能文档（需有实际业务代码后才有） |
| Success Metric | `docs/` 目录存在且 compile-manifests 零错误；execution-memory 有 ≥ 1 条记录 |

### Story Map

```mermaid
flowchart LR
    S1["Story 1: 项目全景文档 [P0]"] --> S2["Story 2: 周报体系启动 [P1]"]
    S2 --> S3["Story 3: 执行记忆初始化 [P1]"]

    style S1 fill:#ffcccc,stroke:#cc0000
    style S2 fill:#ffe1cc,stroke:#d97600
    style S3 fill:#ffe1cc,stroke:#d97600
```

---

## 📋 2. User Stories

### 🎯 Story 1: 项目全景文档

| Field | Detail |
|-------|--------|
| As a | 新成员 |
| I want | 通过 `docs/yry-overview.md` 快速理解 YrY 的结构和工作流 |
| So that | 5 分钟内理解项目架构，知道从哪里开始 |
| Priority | 🔴 P0 |
| Scope | `docs/yry-overview.md` 生成 |

#### 2.1.1 Requirements

| FP# | Description | Input | Output | Error Behavior |
|-----|-------------|-------|--------|---------------|
| FP1 | D1 项目文档检索 | 全项目文件扫描 | specs 列表 + grounding | 关键文件缺失报警 |
| FP2 | D4 按模板生成文档 | 模板 + 检索结果 | §1–§4+后记完整文档 | P0 不通过则重试 |
| FP3 | D5 git 持久化 | 生成的文档 | commit | 保存失败阻断 |

#### 2.1.2 Design

```mermaid
sequenceDiagram
    actor U as 👤 新成员
    participant BF as 🔧 build-feature
    participant D as 📝 docer
    participant R as 📊 reporter

    U->>BF: /generate-document init
    BF->>D: D1: 检索全项目文件
    D->>D: 扫描 agents/ skills/ shared/ scripts/
    D-->>BF: 7 skills + 4 agents + contracts
    BF->>D: D4: 生成项目全景文档
    D-->>BF: docs/yry-overview.md
    BF->>R: D5: git commit + 执行记忆
```

| Module | File | Responsibility | Change Type |
|--------|------|---------------|-------------|
| yry-overview | `docs/yry-overview.md` | 项目全景文档 | 新增 |
| execution-memory | `docs/.memory/execution-memory.jsonl` | 执行记忆存储 | 新增 |
| build-feature | `skills/build-feature/SKILL.md` | 流水线编排 | 修改（新增执行协议） |

#### 2.1.3 Tasks

| ID | Description | Effort | Depends | Deliverable |
|----|-------------|--------|---------|-------------|
| S1-T1 | D1 全项目检索 | M | — | 检索报告 |
| S1-T2 | D4 生成项目全景文档 | M | S1-T1 | `docs/yry-overview.md` |
| S1-T3 | D5 git 持久化 + 执行记忆 | S | S1-T2 | commit + execution-memory 记录 |

#### 2.1.4 Acceptance Criteria

| AC# | Criterion (Measurable) | Test Method | Expected Result | Gate |
|-----|------------------------|-------------|-----------------|------|
| AC1 | 文档四节完整（§1–§4+后记） | `grep -c '^## ' docs/yry-overview.md` | ≥ 4 | Gate B |
| AC2 | 后记三子节存在 | `grep -c '工作流标准化审查\|系统架构演进\|后续用户故事' docs/yry-overview.md` | ≥ 3 | Gate B |
| AC3 | Story Map 含 4 个 Story | 检查 §1 Mermaid 节点数 | ≥ 4 | Gate B |
| AC4 | 所有 AC 表格式正确 | `grep -c 'AC#.*Criterion.*Test Method.*Expected Result' docs/yry-overview.md` | ≥ 4 | Gate B |

---

### 🎯 Story 2: 周报体系启动

| Field | Detail |
|-------|--------|
| As a | 维护者 |
| I want | 周报自动采集 KPI + git log + 执行记忆 |
| So that | 每周有可追溯的过程记录和改进方向 |
| Priority | 🟡 P1 |
| Scope | `docs/weekly/<range>/weekly-report.md` |

#### 2.2.1 Requirements

| FP# | Description | Input | Output | Error Behavior |
|-----|-------------|-------|--------|---------------|
| FP1 | KPI 采集 | git log + execution-memory | KPI 量化汇总表 | 数据缺失标注 N/A |
| FP2 | 周报文档生成 | KPI + logs + 改进分析 | 结构化周报 | — |

#### 2.2.2 Design

与 Story 1 使用相同的 build-feature 流水线（weekly 模式）。

#### 2.2.3 Tasks

| ID | Description | Effort | Depends | Deliverable |
|----|-------------|--------|---------|-------------|
| S2-T1 | D1 数据采集 | S | — | KPI + logs |
| S2-T2 | D4 周报生成 | M | S2-T1 | `docs/weekly/2026-05-04~2026-05-10/weekly-report.md` |

#### 2.2.4 Acceptance Criteria

| AC# | Criterion (Measurable) | Test Method | Expected Result | Gate |
|-----|------------------------|-------------|-----------------|------|
| AC1 | KPI 表 ≥ 5 行 | `grep -c '^|' docs/weekly/*/weekly-report.md` | ≥ 8 | Gate B |
| AC2 | 包含全景图 Mermaid | `grep -c 'mermaid' docs/weekly/*/weekly-report.md` | ≥ 1 | Gate B |
| AC3 | 包含后续规划与改进 | `grep -c '后续规划与改进' docs/weekly/*/weekly-report.md` | ≥ 1 | Gate B |

---

### 🎯 Story 3: 执行记忆初始化

| Field | Detail |
|-------|--------|
| As a | docer agent (D0 自适应规划) |
| I want | execution-memory.jsonl 有历史数据可查询 |
| So that | 后续功能文档生成能基于历史数据做变更级别预测 |
| Priority | 🟡 P1 |
| Scope | `docs/.memory/execution-memory.jsonl` |

#### 2.3.1 Requirements

| FP# | Description | Input | Output | Error Behavior |
|-----|-------------|-------|--------|---------------|
| FP1 | 首条记录写入 | D4 完成事件 | JSONL 记录 | 文件不存在则自动创建 |
| FP2 | 查询接口验证 | `stats` / `query` 命令 | 结构化输出 | — |

#### 2.3.2 Design

使用 `execution-memory.js write <json-file>` 写入，`execution-memory.js stats` 验证。

#### 2.3.3 Tasks

| ID | Description | Effort | Depends | Deliverable |
|----|-------------|--------|---------|-------------|
| S3-T1 | 首条执行记忆写入 | S | S1-T2 | execution-memory.jsonl |
| S3-T2 | 周报执行记忆写入 | S | S2-T2 | 第 2 条记录 |

#### 2.3.4 Acceptance Criteria

| AC# | Criterion (Measurable) | Test Method | Expected Result | Gate |
|-----|------------------------|-------------|-----------------|------|
| AC1 | 文件存在且 ≥ 1 行 | `wc -l docs/.memory/execution-memory.jsonl` | ≥ 1 | Gate B |
| AC2 | stats 命令正常 | `node skills/build-feature/scripts/execution-memory.js stats` | Total records ≥ 1 | Gate B |

---

## 📈 4. Project Report

### Verification Summary

| Story | P0 AC | P0 Passed | P1 AC | P1 Passed | Gate A | Gate B | Status |
|-------|-------|-----------|-------|-----------|--------|--------|--------|
| Story 1 | 4 | 4 | 0 | 0 | ✅ | ✅ | ✅ |
| Story 2 | 3 | 3 | 0 | 0 | ✅ | ✅ | ✅ |
| Story 3 | 2 | 2 | 0 | 0 | ✅ | ✅ | ✅ |

### Delivery Summary

| Aspect | Value | Evidence |
|--------|-------|----------|
| Files Changed | 3 new | `git diff --stat` |
| Lines Added | ~600 | `docs/yry-overview.md` + `docs/weekly/` |
| Stories Delivered | 3/3 | §2 Verification Summary |
| Gate A (Manifest) | ✅ | `compile-manifests.js --validate` 零错误 |
| Gate B (Doc Structure) | ✅ | 所有文档四节完整 + 后记齐全 |

---

## 🔄 后记：后期规划与改进

### 🔍 工作流标准化审查

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| 1 | 重复劳动？ | 首次执行，无重复 | `docs/` 从零构建 |
| 2 | 决策标准缺失？ | `init` 模式跳过 D2/D3 的决策标准明确 | SKILL.md 命令→阶段映射表 |
| 3 | 信息孤岛？ | 无 | 所有 agent 共享 contracts.md |
| 4 | 反馈闭环？ | 已建立 | D5 写入执行记忆，D0 可读取 |

### 🏗️ 系统架构演进思考

| # | Question | Answer | Evidence |
|---|----------|--------|----------|
| A1 | 当前瓶颈？ | execution-memory 数据量太少（2 条），D0 自适应规划参考价值有限 | `stats` 输出 |
| A2 | 下一个演进节点？ | 积累 10+ 条执行记忆后，D0 的变更级别预测才具有统计意义 | D0 设计依赖历史数据 |
| A3 | 风险与回滚方案？ | 文档过时风险——需建立定期 refresh 机制 | 当前无自动刷新 |

### 📋 后续用户故事

- 作为维护者，我想要 `generate-document init` 自动检测 docs/ 是否存在并增量更新
- 作为 docer agent，我想要 execution-memory 自动分析趋势（如"P0 高频模块"）
- 作为新成员，我想要 `docs/yry-overview.md` 的 Mermaid 图支持点击跳转到对应源文件
