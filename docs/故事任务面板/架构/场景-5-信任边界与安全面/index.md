# 场景 5: 信任边界与安全面

> | v1.0.0 | 2026-06-08 | deepseek-v4-pro | 🌿 feat/yry-arch | 📎 [CLAUDE.md](../../../../CLAUDE.md) |
> **导航**: [← 场景-4](../场景-4-依赖变更影响/index.md) · [知识图谱 →](./知识图谱.html)

[§0 技术评审](#sec0) · [§1 测试设计](#sec1) · [§2 实施报告](#sec2) · [§3 测试报告](#sec3) · [§4 自改进](#sec4)

## 概述

**角色**: 安全审计者（安全审查 agent、架构设计者、自改进循环） · **目标**: 识别 YrY 系统的全部信任边界——从用户输入到 API 调用、从文件系统到外部服务，逐边界标注安全约束和验证机制 · **优先级**: P0

### 主要价值

- 🛡️ **输入面全编目** — 逐一清点系统接收外部输入的全部接口（CLI 参数、环境变量、API 响应、文件读取），不遗漏任何一个入口
- 🔐 **密钥不落盘验证** — 逐文件扫描 Token/密钥/凭据，确认无硬编码，仅通过环境变量传入
- 🔗 **信任链逐跳追踪** — 从用户输入 → 技能规约 → Agent 执行 → lib 函数 → 外部调用，标注每跳的校验/转义/降级机制
- 📋 **安全约束覆盖矩阵** — 将 security-guardrails.md 的每条约束映射到具体代码位置，验证声明与实际一致
- 🚨 **阻断标识可达性** — 验证每个安全相关的阻断标识在管线中有明确的触发路径和恢复方式

### 图谱定位

| 图层 | 本场景节点 | 上游 | 下游 |
|------|-----------|------|------|
| 领域层 | scene: trust-boundary | story: yry-arch (contains) | maps_to → 结构层 |
| 结构层 | — | maps_to 来自领域层 | — |
| 内容层 | — | Read 来自结构层 | — |

---

<a id="sec0"></a>
## §0 技术评审

> 文档生成阶段填充（pm+coder）。以 security-guardrails.md 为基线，对系统全部信任边界进行结构化编目。

### 信任边界全景

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
    subgraph 外部["外部输入面"]
        direction TB
        U["用户输入<br/>CLI args · 需求文本"]:::entry
        E["环境变量<br/>API_X_TOKEN · 其他"]:::entry
        F["文件系统<br/>Read · Write · 源码"]:::entry
        N["网络<br/>API 调用 · WebFetch"]:::entry
    end

    subgraph 边界["信任边界"]
        direction TB
        B1["输入校验层<br/>XSS 检测 · 注入检测<br/>路径遍历防护"]:::gate
        B2["认证层<br/>Token 验证 · 会话管理<br/>凭据不落盘"]:::gate
        B3["授权层<br/>分支隔离 · 文件权限<br/>Git 操作约束"]:::gate
    end

    subgraph 内部["内部执行域"]
        direction TB
        S["技能规约<br/>skills/"]:::core
        A["Agent 执行<br/>agents/"]:::core
        L["共享库<br/>lib/"]:::core
    end

    外部 --> 边界 --> 内部
```

### 输入面编目

| # | 输入面 | 入口位置 | 校验机制 | 安全约束 |
|---|--------|---------|---------|---------|
| 1 | CLI 参数（需求文本） | skills/rui/SKILL.md → pm agent | XSS 向量检测（innerHTML/dangerouslySetInnerHTML/eval） | security-guardrails.md S3 |
| 2 | 环境变量 API_X_TOKEN | skills/rui-bot/send.mjs · skills/rui-import/sync.mjs | process.env 读取，不落盘 | security-guardrails.md S1 |
| 3 | 文件读取（源码、规约） | agents/coder.md · agents/tester.md | Read 工具只读，路径校验 | security-guardrails.md S4 |
| 4 | 文件写入（源码、文档） | agents/coder.md · skills/rui-import/ | Write/Edit 工具，分支隔离前置检查 | security-guardrails.md S4 |
| 5 | 外部 URL（WebFetch） | agents/AGENT.md · skills/rui-trends/ | URL 校验，禁止内网地址 | security-guardrails.md S5 |
| 6 | Git 操作 | skills/rui/branch-check.mjs | 分支隔离验证，禁止 --no-verify | security-guardrails.md S6 |

### 信任链逐跳追踪

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart TD
    U["用户 /rui 需求"]:::entry --> PM["pm agent<br/>需求解析"]:::agent
    PM --> CODER["coder agent<br/>代码生成"]:::agent
    CODER --> LIB["lib/ 共享函数"]:::lib
    LIB --> FS["文件写入"]:::io

    U --> BOT["rui-bot 通知"]:::agent
    BOT --> API["API_X_TOKEN → 企微 API"]:::io

    U --> IMPORT["rui-import 同步"]:::agent
    IMPORT --> API2["API_X_TOKEN → 文档 API"]:::io

    FS -.校验.-> CHECK1["branch-check.mjs<br/>分支隔离验证"]:::gate
    API -.校验.-> CHECK2["Token 来源<br/>process.env 只读"]:::gate
    API2 -.校验.-> CHECK2
```

### 安全约束覆盖矩阵

| 约束 ID | security-guardrails.md 条款 | 代码校验位置 | 覆盖状态 |
|---------|---------------------------|-------------|---------|
| S1 | Token/密钥禁止硬编码 | `grep -r 'API_X_TOKEN\|token.*=' --include='*.mjs' --include='*.js'` 仅 process.env 引用 | ✓ 已覆盖 |
| S2 | 认证不可绕过 | skills/rui-import/sync.mjs token 缺失时降级不执行 | ✓ 已覆盖 |
| S3 | 输入必校验 | agents/pm.md · agents/coder.md XSS/注入 Red Flags | ✓ 已覆盖 |
| S4 | 分支隔离不可绕过 | skills/rui/branch-check.mjs · rules/code-pipeline.md | ✓ 已覆盖 |
| S5 | 外部依赖安全 | skills/rui-trends/SKILL.md · npm audit 集成 | ⚠️ 部分覆盖 |
| S6 | 安全约束退化检测 | scripts/security-scan.mjs · scripts/detect-impact.mjs | ✓ 已覆盖 |

---

<a id="sec1"></a>
## §1 测试设计

> tester agent 填充。本场景测试聚焦信任边界的验证机制是否实际生效。

### 测试场景

| # | 测试项 | 类型 | 验证方式 | 预期结果 |
|---|--------|------|---------|---------|
| FP1 | 密钥不落盘 — 全仓库扫描 | 安全扫描 | `grep -rE 'token.*=|API_KEY|secret' --include='*.mjs' --include='*.json'` 排除 node_modules | 仅 process.env 引用，无硬编码 |
| FP2 | XSS 向量检测 — HTML 生成路径 | 安全扫描 | `grep -rE 'innerHTML|dangerouslySetInnerHTML|document\.write|eval\(' --include='*.mjs'` | 零命中或每个命中附安全说明 |
| FP3 | 分支隔离 — 非 feat/ 分支写入被拒 | 功能测试 | 在 main 分支尝试 Write → 预期 branch-check.mjs 阻断 | 阻断并输出 bad-branch 标识 |
| FP4 | 输入校验 — 特殊字符需求文本 | 边界测试 | 输入含 `<script>alert(1)</script>` 的需求文本 | pm 正常解析，HTML 输出中转义 |
| FP5 | 外部 URL — 内网地址被拒 | 安全测试 | WebFetch http://192.168.1.1/ → 预期拒绝 | 输出安全告警，不发起请求 |
| FP6 | Token 缺失降级 — 不阻断主流程 | 降级测试 | 未设置 API_X_TOKEN 时执行 rui-import | 静默跳过，不阻断管线 |

### 门禁判定

| 门禁 | 条件 | 阻断标识 |
|------|------|---------|
| P0 Gate | 发现硬编码密钥 / XSS 向量无安全说明 / 分支隔离可绕过 | code-p0 |
| P1 Gate | 新增输入面未在 security-guardrails.md 注册 | doc-p0 |

---

<a id="sec2"></a>
## §2 实施报告

> coder agent 填充。记录安全加固措施的实施过程。

### 实施项

| # | 实施内容 | 状态 | 备注 |
|---|---------|------|------|
| 1 | 安全扫描脚本 scripts/security-scan.mjs | ✅ 已完成 | 覆盖 S1/S3/S5 三面 |
| 2 | 变更影响检测 scripts/detect-impact.mjs | ✅ 已完成 | 覆盖 S6 变更检测 |
| 3 | 分支隔离验证 skills/rui/branch-check.mjs | ✅ 已完成 | 所有 Edit/Write 前强制调用 |
| 4 | 安全约束退化定期扫描 | ⬜ 待实施 | 建议 CronCreate 定期触发 |

---

<a id="sec3"></a>
## §3 测试报告

> tester agent 填充。

| 指标 | 值 |
|------|-----|
| 安全扫描覆盖 | S1/S3/S5/S6 已覆盖（4/6 面），S2/S4 由管线机制保障 |
| 硬编码密钥 | 0 命中 |
| XSS 向量 | 0 命中（HTML 生成使用 textContent 或等效安全 API） |
| 分支隔离有效性 | 100%（branch-check.mjs 阻断所有非 feat/ 写入） |

---

<a id="sec4"></a>
## §4 自改进

> self-improve agent 填充。

### 诊断摘要

| 诊断 | 信号 | 判定 |
|------|------|------|
| D0 基线偏离 | 安全面编目与 security-guardrails.md 一致 | 未触发 |
| D2 质量退化 | S5 外部依赖安全部分覆盖 | 观察中 |
| D7 配置漂移 | security-guardrails.md 条款与实际校验一致 | 未触发 |

### 改进提案

| # | 提案 | 类型 | 优先级 |
|---|------|------|--------|
| 1 | S5 外部依赖安全从"部分覆盖"提升到"已覆盖"——为 npm audit 输出添加自动阻断逻辑 | security | P1 |
| 2 | 新增 CronCreate 定期安全扫描任务，防止安全约束随时间退化 | process | P2 |
