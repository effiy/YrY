---
doc_type: module
prd_task_id: "YA-09-52"
title: "YA-09-52: AI 代码审查自动化 — LLM PR Review + GitHub 集成 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "165-需求-代码审查自动化.md"
source_okr: [yiai-001]
---

# YA-09-52: AI 代码审查自动化 — LLM PR Review + GitHub 集成 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[165-需求-代码审查自动化.md](../../prds/2026-09/165-需求-代码审查自动化.md)
> 需求编号：YA-09-52 · 优先级：P2 · 人天：2.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

利用 YiAi 自身 LLM 能力实现 PR 代码审查——读取 `git diff`，根据项目规则检查，通过 GitHub API 提交 review comment。

```mermaid
flowchart LR
  PR["GitHub PR Webhook"] --> DIFF["获取 git diff"]
  DIFF --> PROMPT["组装审查 Prompt<br/>+ CLAUDE.md 规则"]
  PROMPT --> LLM["LLM 审查"]
  LLM --> PARSE["解析严重度和建议"]
  PARSE --> COMMENT["POST GitHub review comment"]
```

### 审查维度

| 维度 | 规则来源 | 严重度 |
|------|---------|--------|
| RPC 参数契约 | `filter` != `query`, `target_file` != `path` | error |
| 安全 | 硬编码密钥、SQL 注入风险 | error |
| 代码质量 | 未使用导入、死代码 | warning |
| 规范 | 命名约定、缺少类型注解 | info |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | git diff → LLM 审查 | PR 收到 AI 评论 | 1.0 |
| 2 | GitHub API 集成 + 规则配置 + 测试 | CI 中自动审查 | 1.0 |

**合计：2.0d**。