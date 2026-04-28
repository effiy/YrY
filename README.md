# `.claude` 目录说明

`.claude` 是 YiWeb 项目的 Claude / Cursor 协作层，承载技能定义、专家代理和共享规范。

## 目录职责

| 目录 | 作用 | 是否为稳定入口 |
|------|------|---------------|
| `skills/` | 可被直接调用的技能定义，`SKILL.md` 是技能真源 | 是 |
| `agents/` | 专家代理定义，负责角色、输入输出和必答问题 | 是 |
| `shared/` | 共享解释性文档，统一约定、契约和边界说明 | 否 |

## 真源规则

1. `skills/<name>/SKILL.md` 是该 skill 的行为真源。
2. `skills/<name>/README.md` 仅用于快速开始、导航和索引，不重复完整规则。
3. `skills/<name>/rules/*.md` 定义结构契约。
4. `skills/<name>/templates/*.md` 只提供可选骨架，不得覆盖 `rules/`。
5. `skills/<name>/checklists/*.md` 定义验收项，`checklist.md` 仅作为入口索引。
6. `agents/*.md` 只描述代理角色，不复制 skill 的完整流程。

## 共享规范

| 文件 | 内容 |
|------|------|
| `shared/behavioral-guidelines.md` | 行为准则（先思考再编码、简单优先、精准修改） |
| `shared/evidence-and-uncertainty.md` | 反幻觉与证据层级（A/B/C/D） |
| `shared/document-contracts.md` | 文档类型矩阵 + 影响分析契约 + 路径约定 + Skill-Agent 边界 + MCP 降级 + 真源优先级 |

## 推荐阅读顺序

1. `shared/behavioral-guidelines.md` — 行为准则
2. `shared/document-contracts.md` — 所有文档与影响分析契约
3. `shared/evidence-and-uncertainty.md` — 反幻觉
4. `skills/generate-document/SKILL.md` — 文档生成主流程
5. `skills/implement-code/SKILL.md` — 代码实施主流程

完成阶段固定顺序：先调用 `skills/import-docs/SKILL.md` 同步 `docs`，再调用 `skills/wework-bot/SKILL.md` 发送完成通知。

## 维护约定

- 不要改动 `.claude/skills/`、`.claude/agents/` 的顶层命名约定。
- 若新增共享规范，优先放在 `shared/`，避免把说明性内容散落到多个 skill/agent。
- 若更新路径约定，必须同步检查 `README.md`、`rules/`、`templates/`、`checklists/` 中的链接。