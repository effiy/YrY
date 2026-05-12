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

> **角色公式**:
> - **PM**: 作为 [角色] 我想要 [动作] 以便 [价值] — 故事 = 场景 + 边界
> - **Tester**: Given [前置] When [操作] Then [预期] — 验收标准可独立验证
> - **Coder**: 模块 → 接口 → 数据流 — 先拆模块再定契约，追踪数据流向
> - **Security**: 威胁 → 信任边界 → 缓解 — 每个威胁有明确对策
> - **Reporter**: 事实 → 偏差 → 影响 — 做了什么、差了什么、意味着什么
> - **Self-Improve**: 观察 → 诊断 → 改进 — 数据采集 → 根因分析 → 可执行行动

## 命令概览

| 命令 | 流程 |
|------|------|
| `/rui init` | 基线 → 基线注入 → Agent&Rule&Template&MCP → 就绪检查(8项) → 交付 |
| `/rui doc <requirement>` | 需求拆分 → 逐故事: 自适应规划→影响分析→架构设计→文档生成 → 交付 |
| `/rui code <name>` | 预检(分支隔离+文档补齐)→Gate A(测试先行)→实现(逐模块P0审查)→Gate B(验证,>2轮H7)→自改进→交付 |
| `/rui <requirement>` | doc + code 全自动串联，逐故事端到端 |
| `/rui update <name> [context]` | 存在性检查→版本/结构检测→结构补齐→变更分级(T1/T2/T3)→增量更新→预检→code管线 |
| `/rui code --from-doc <name>` | 从已有01补齐缺失02-08（只读，禁止改源码） |
| `/rui doc --from-code <requirement>` | 从源码反推故事→生成01-08全文档基线（只读，禁止改源码） |
| `/rui list` | 扫描故事任务面板 → 输出进度表 |
| `/rui` (空输入) | 扫描项目+故事状态 → 推荐 5~10 条任务 |

`<requirement>` 支持：文本描述 / `@` 引用本地文件 / URL。故事目录名使用 kebab-case（如 `user-login`），便于 git 分支命名。

## 阻断规则

| # | 场景 | 降级 | 阶段 |
|---|------|------|------|
| H1 | 需求无法解析 | 否 | 需求解析 |
| H2 | P0 章节缺少上游来源 | 否 | 文档生成, 预检 |
| H3 | 影响链无法闭合 | 否 | 影响分析, 预检 |
| H4 | 文档 P0 不通过且无法自修复 | 否 | 文档生成 |
| H5 | 代码审查 P0 无法修复 | 否 | 实现 |
| H6 | Gate A 未完成但已编码 | 否 | 测试先行→实现 |
| H7 | Gate B >2 轮修复未通过 | 否 | 验证 |
| H9 | `API_X_TOKEN` 缺失 | 是 | 交付 |
| H10 | 功能分支未从 main 创建或派生或混入非本故事代码 | 否 | 预检 |
| H11 | self-improve-loop 数据采集失败 | 是 | 自改进 |
| H12 | 功能分支被自动合并到 main | 否 | 预检→交付 |
| H13 | 未切换到故事分支即改动源代码 | 否 | 预检→实现 |

阻断后: `rui-state.js save --blocked` → `next-step` → 持久化 → 同步(H9/H11跳过)→ 通知。

## 核心规则

1. **逐故事串行** — 需求拆分可创建多个故事目录，每个独立走完管线后再处理下一个
2. **增量更新** — 已有文档按 T1(措辞/格式)/T2(增删故事/接口变更)/T3(边界变化/跨故事重构) 裁剪
3. **测试先行** — Gate A 阻断实现；Gate B >2 轮修复阻断交付(H7)
4. **逐模块审查** — 每模块后审查，P0 清零前进
5. **分支隔离** — 预检阶段必须从 main 创建 `feat/<name>` 分支并 checkout；各分支独立禁止派生；禁止在非故事分支上改动源码(H13)
6. **禁止自动合并** — 任何阶段不得将功能分支合并到 main，合并由开发者手动执行(H12)
7. **源码修改唯一入口** — 对源代码的任何修改必须通过 `/rui code` 管线，禁止通过 doc、直接编辑等其他方式(H13)
8. **只读代码** — `/rui doc --from-code` 和 `/rui code --from-doc` 仅生成文档，禁止改源码
9. **产出内聚** — 关键产出仅限于故事目录 `docs/故事任务面板/<name>/` 内
10. **import-docs 强制同步** — 三个检查点独立调用 `Skill(import-docs, --workspace)`：CP1 文档生成后 / CP2 验证后 / CP3 交付阶段。H9 仅 API_X_TOKEN 缺失时跳过
11. **知识沉淀** — 执行记忆写 execution-memory.jsonl + rui-state.json

## 交付流程

所有命令末端自动触发，不等待用户指令：

| Step | 操作 | 失败处理 |
|------|------|---------|
| 1 | `Skill(wework-bot, --no-send --name <name>)` 追加日志 | 不可跳过 |
| 2 | `Skill(import-docs, --workspace)` CP3 最终全量同步 | H9 降级 |
| 3 | `Skill(wework-bot, --name <name>)` 发送通知 | 不可跳过 |

## 命令详解

### init
基线 → 基线注入(从CLAUDE.md+README.md提取项目约定注入agents/rules/templates/MCP) → 就绪检查(8项) → 交付。

### doc
需求解析(pm)→故事拆分(pm, kebab-case命名)→逐故事: 自适应规划(T1/T2/T3, pm)→影响分析(coder+reporter, 影响链闭合)→架构设计(coder+security+tester)→文档生成(pm§1§2§4+coder§3+tester§1.1§5+reporter§4依赖+security安全面判定)→CP1同步→CP3交付。

### code
预检(双边影响分析+从main创建feat分支checkout+文档补齐)→Gate A(测试方案+原型, 单行CSS可跳过)→实现(逐模块编码+P0审查, P0未清零不进下一模块)→验证(环境快照→静态预检→对齐→单次执行→三报告05/06/07产出, 交叉引用闭合, >2轮H7)→CP2同步→自改进(08-自改进复盘.md, H11降级)→CP3交付。

最终产出保证: 01-08全文档 + `.improvement/proposals.jsonl` + `.memory/`(execution-memory.jsonl + rui-state.json)。

### update
存在性检查→版本/结构检测(12项: 目录结构/文档完整性/版本头/证据标准/交叉引用/§1.1/§6§7/§L/data约束/扩展影响/rui-state/交叉引用)→结构补齐(只补不漏, 标注"由rui update结构补齐")→上下文解析→变更分级→增量更新→预检→code管线。

### end-to-end
等同于 `/rui doc <requirement>` + 每个故事 `/rui code <name>` 全自动串联。

### code --from-doc
存在性检查→缺口检测→读取01+探索源码(只读)→自适应规划→影响分析→架构设计→文档生成(仅缺失02-08)→CP1同步→CP3交付。已有文档不覆盖，全部存在则退出。

### doc --from-code
代码分析(源码路径/片段/描述, 只读)→需求推导→故事创建→自适应规划→影响分析→架构设计→文档生成(01-08全文档)→CP1同步→CP3交付。

### list
扫描 `docs/故事任务面板/` 下所有故事目录，按文件完整性判定: 未开始/文档进行中/文档完成/代码进行中/代码完成/阻断。

### 空输入
扫描故事面板+CLAUDE.md+git log+.memory+§6§7§L → 推荐5-10条任务(代码文档化/文档补齐/代码实现/优化改进/端到端/架构演进)。

## 集成点

- **脚本**: `self-improve.js` / `loop.js run` / `execution-memory.js` / `rui-state.js` / `list.js` — 位于 `skills/rui/scripts/`
- **Skill**: `import-docs --workspace` (CP1/CP2/CP3) / `wework-bot --name <name>` (交付)
- **数据**: `docs/故事任务面板/<name>/.improvement/proposals.jsonl` + `.memory/`(execution-memory.jsonl + rui-state.json) — 详见 [data.md](data.md)
- **文档**: 01-08 模板基线 + 补充文档(10+) — 详见 [docs.md](docs.md)
- **规则**: [rules/](../../rules/) — code-pipeline / doc-generation / gate-rules / import-docs / self-improve
- **Agent**: [agents/](../../agents/) — pm / coder / tester / reporter / security / self-improve
