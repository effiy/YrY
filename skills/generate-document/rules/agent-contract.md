---
paths:
  - "skills/generate-document/rules/agent-contract.md"
---

# Agent 调用契约

> 核心原则见 `../SKILL.md` #3/#4；阶段绑定见 `orchestration.md §6`；输出 JSON 格式见 `../../shared/agent-output-contract.md`。

## 1. 命令适用矩阵

| Agent | 功能文档 | init | weekly | from-weekly |
|-------|---------|------|--------|-------------|
| `doc-planner` | ✅步骤0 | — | — | ✅步骤0 |
| `docs-retriever` | ✅步骤1 | ✅步骤1 | — | ✅步骤1 |
| `doc-impact-analyzer` | ✅步骤2 | — | — | ✅步骤2 |
| `codes-builder` | ✅步骤3 | ✅步骤3 | — | ✅步骤3 |
| `doc-architect` | ✅步骤3 | ✅步骤3 | — | ✅步骤3 |
| `doc-mermaid-expert` | ✅步骤4 | ✅步骤4 | ✅步骤4 | ✅步骤4 |
| `doc-reviewer` | ✅步骤4 | ✅步骤4 | ✅步骤4 | ✅步骤4 |
| `doc-markdown-tester` | ✅步骤4 | ✅步骤4 | ✅步骤4 | ✅步骤4 |
| `doc-quality-tracker` | ✅步骤4 | ✅步骤4 | ✅步骤4 | ✅步骤4 |
| `docs-builder` | ✅步骤5 | ✅步骤5 | ✅步骤5 | ✅步骤5 |
| `execution-memory`* | ✅阶段5后 | ✅阶段5后 | — | ✅阶段5后 |

> `execution-memory` 为"伪 agent"（脚本调用），无 JSON 契约要求，但须按规范写入结构化数据。

## 2. 逐 Agent 契约

| Agent | 阶段 | 职责 | 采纳规则 | 跳过条件 |
|-------|------|------|----------|----------|
| `doc-planner` | 0 | 基于 execution memory 生成自适应执行计划 | 建议变更级别和 agent 策略须作为后续步骤参考输入 | execution memory 不存在或为空时可跳过（须标注） |
| `docs-retriever` | 1 | 检索 rules/shared/checklists 规范 | 返回列表必须用于后续加载 | 空列表可继续（标注"未返回"），但不得跳过调用 |
| `doc-impact-analyzer` | 2(仅02/03) | 全项目影响链闭合 | 结果写入02第6章/03第5章 | 不闭合时写「未覆盖风险」标注"待人工确认" |
| `codes-builder` | 3(仅03) | 架构设计与代码结构分析 | 结论须采纳到设计文档 | **不得跳过**；失败走阻断流程 |
| `doc-architect` | 3(仅03) | 5必答问题(Q1模块Q2接口Q3数据流Q4架构图Q5约定兼容) | 模块划分/接口规范须采纳 | **不得跳过**；失败走阻断流程 |
| `doc-mermaid-expert` | 4(含Mermaid文档定稿前) | Mermaid语法审查修复 | 修复后写回同一文件 | 无Mermaid块可跳过 |
| `doc-reviewer` | 4(所有文档类型后) | 结构与表达质量审查+跨文档一致性检查 | P0必须修复后才可保存 | **不得跳过** |
| `doc-markdown-tester` | 4 | Markdown质量测试 | — | **不得跳过** |
| `doc-quality-tracker` | 4 | P0/P1/P2统计 | — | **不得跳过** |
| `docs-builder` | 5 | 知识策展 | — | **不得跳过** |

## 3. 调用顺序约束

1. `doc-planner` 必在 `docs-retriever` 之前（步骤 0 在步骤 1 前）
2. `doc-mermaid-expert` 必在 `doc-reviewer` 前
3. `doc-impact-analyzer` 必在 `codes-builder`/`doc-architect` 前
4. `codes-builder` 和 `doc-architect` 可并行
5. `execution-memory` 写入必在 `docs-builder` 之后、`import-docs` 之前
6. 阶段绑定严格执行

## 4. 门禁校验

> SKILL.md 原则 #4 定义统一要求。

- Agent 输出末尾须附加 JSON 契约附录块（见 `../../shared/agent-output-contract.md`）
- 采纳前校验（至少必答覆盖+产物存在性）
- 脚本：`node skills/implement-code/scripts/validate-agent-output.js --agent <名> --text "<输出>"`
- 失败处理：第1次补齐重试；第2次视为调用失败走阻断/降级

## 5. 真源索引

| 主题 | 真源 |
|------|------|
| 影响分析维度 | `../../shared/impact-analysis-contract.md` |
| Agent 输出 JSON 格式 | `../../shared/agent-output-contract.md` |
| Skill/Agent 边界 | `../../shared/agent-skill-boundaries.md` |
| 阶段绑定与门禁 | `rules/orchestration.md §6` |
| 各 Agent 必答问题 | `../../agents/<name>.md` |
| 执行记忆格式 | `scripts/execution-memory.js` 数据结构注释 |
| 自我改进输出 | `scripts/self-improve.js` 提案格式 |