---
name: rui
description: Story-driven SDLC orchestrator: story → document → code → delivery. Command: /rui.
user_invocable: true
lifecycle: default-pipeline
agents:
  required: [pm, coder, tester, reporter, security, self-improve]
---

# rui

故事驱动 SDLC 编排器。需求拆分产生多个故事时逐故事串行处理，每个故事独立走完管线。

| 角色 | 公式 | 一句话 |
|------|------|--------|
| PM | 作为 [角色] 我想要 [动作] 以便 [价值] | 故事 = 场景 + 边界 |
| Tester | Given [前置] When [操作] Then [预期] | 验收标准可独立验证 |
| Coder | 模块 → 接口 → 数据流 | 先拆模块再定契约 |
| Security | 威胁 → 信任边界 → 缓解 | 每个威胁有明确对策 |
| Reporter | 事实 → 偏差 → 影响 | 做了什么、差了什么、意味着什么 |
| Self-Improve | 观察 → 诊断 → 改进 | 数据采集 → 根因分析 → 可执行行动 |

## 命令

| 命令 | 流程 | 行为细节 |
|------|------|---------|
| `/rui init` | 基线 → 基线注入 → 就绪检查(8项) → 交付 | 从 CLAUDE.md+README.md 提取项目约定注入 agents/rules/templates/MCP |
| `/rui doc <req>` | 必须使用分支隔离；需求拆分 → 逐故事: 自适应规划→影响分析→架构设计→文档生成 | 文档生成后同步；故事目录 kebab-case；禁止改源码 |
| `/rui code <name>` | 必须使用分支隔离；预检→Gate A(测试先行)→逐模块实现→Gate B(验证)→自改进→交付 | 单行 CSS 可跳过 Gate A；>2轮修复 `gate-b-limit` 阻断；验证后同步 |
| `/rui <req>` | 必须使用分支隔离；doc + code 全自动串联，逐故事端到端 | — |
| `/rui update <name> [ctx]` | 必须使用分支隔离；结构检测(12项)→结构补齐→变更分级(T1/T2/T3)→增量更新→预检→code | 补齐标注"由 rui update 结构补齐"；已有文档按级别裁剪 |
| `/rui code --from-doc <name>` | 必须使用分支隔离；读取故事任务文档+探索源码(只读)→生成缺失的技术评审与报告文档 | 已有文档不覆盖，全部存在则退出；禁止改源码 |
| `/rui doc --from-code [req]` | 从源码反推故事→生成全文档基线(只读)；req 为空时 pm 自主探索源码推荐可生成故事 | 禁止改源码 |
| `/rui list` | 扫描故事面板 → 进度表; 调用 `node skills/rui/scripts/list.js` | 按文件完整性判定: 未开始/文档中/代码中/完成/阻断 |
| `/rui` | 调用 `node skills/rui/scripts/recommend.js --json` → 推荐 5~10 条任务 | 综合故事状态+健康度+提案+Git+同步状态，按 P0→P3 排序 |

`<requirement>` 支持：文本 / `@` 引用本地文件 / URL。`--from-code` 时 req 可选，为空时 pm 自主扫描源码识别可文档化模块并输出推荐列表。故事目录使用 kebab-case（如 `user-login`）。

## 阻断规则

| 标识 | 场景 | 降级 | 阶段 |
|------|------|------|------|
| `no-parse` | 需求无法解析 | 否 | 需求解析 |
| `no-source` | P0 章节缺少上游来源 | 否 | 文档生成, 预检 |
| `chain-broken` | 影响链无法闭合 | 否 | 影响分析, 预检 |
| `doc-p0` | 文档 P0 不通过且无法自修复 | 否 | 文档生成 |
| `code-p0` | 代码审查 P0 无法修复 | 否 | 实现 |
| `skip-gate-a` | Gate A 未完成但已编码 | 否 | 测试先行→实现 |
| `gate-b-limit` | Gate B >2 轮修复未通过 | 否 | 验证 |
| `no-token` | `API_X_TOKEN` 缺失 | 是 | 交付 |
| `bad-branch` | 功能分支未从 main 创建或混入非本故事代码 | 否 | 预检 |
| `no-metrics` | self-improve 数据采集失败 | 是 | 自改进 |
| `auto-merge` | 功能分支被自动合并到 main | 否 | 预检→交付 |
| `no-checkout` | 未切换到故事分支即改动源码 | 否 | 预检→实现 |

阻断后: `rui-state.js save --blocked` → `next-step` → 持久化 → 通知(`no-token`/`no-metrics` 跳过)。

详见 [rules/gate-rules.md](../../rules/gate-rules.md) · [rules/code-pipeline.md](../../rules/code-pipeline.md)。

## 核心规则

1. **逐故事串行** — 需求拆分可创建多个故事目录，每个独立走完管线后再处理下一个
2. **增量更新** — 已有文档按 T1(措辞/格式)/T2(增删故事/接口变更)/T3(边界变化/跨故事重构) 裁剪
3. **测试先行** — Gate A 阻断实现；Gate B >2 轮修复阻断交付(`gate-b-limit`)
4. **逐模块审查** — 每模块后审查，P0 清零前进
5. **分支隔离** — 预检阶段必须从 main 创建 `feat/<project>-<name>` 分支并 checkout；各分支独立禁止派生(`bad-branch` / `no-checkout`)
6. **禁止自动合并** — 任何阶段不得将功能分支合并到 main(`auto-merge`)
7. **源码修改唯一入口** — 对源代码的任何修改必须通过 `/rui code` 管线(`no-checkout`)
8. **只读代码** — `/rui doc --from-code` 和 `/rui code --from-doc` 仅生成文档，禁止改源码
9. **产出内聚** — 关键产出仅限于故事目录 `docs/故事任务面板/<project>-<name>/` 内
10. **import-docs 三检查点** — 文档生成后 / 验证后 / 交付时。`no-token` 仅 API_X_TOKEN 缺失时跳过
11. **知识沉淀** — 执行记忆写 execution-memory.jsonl + rui-state.json

## 交付流程

所有命令末端自动触发：

| Step | 操作 | 失败处理 |
|------|------|---------|
| 1 | `Skill(wework-bot, --no-send --name <name>)` 追加日志 | 不可跳过 |
| 2 | `Skill(import-docs, --workspace)` 交付时最终全量同步 | `no-token` 降级 |
| 3 | `Skill(wework-bot, --name <name>)` 发送通知 | 不可跳过 |

## 集成

- **脚本**: `skills/rui/scripts/` — rui-state.js / execution-memory.js / self-improve.js / list.js / loop.js / natural-week.js
- **Skill**: `import-docs --workspace` (三检查点同步) / `wework-bot --name <name>` (交付)
- **数据**: `docs/故事任务面板/<project>-<name>/.improvement/proposals.jsonl` + `.memory/`(execution-memory.jsonl + rui-state.json) — 详见 [data.md](data.md)
- **文档**: 全文档基线 + 补充文档 — 详见 [docs.md](docs.md)
- **规则**: [rules/](../../rules/) — code-pipeline / gate-rules / doc-generation / import-docs / self-improve
- **Agent**: [agents/](../../agents/) — pm / coder / tester / reporter / security / self-improve
