# docs/logs 编排日志：Good Case / Bad Case 标准

本文档定义 `docs/logs/*.md` 中单条编排记录的 **分级标准**，用于后续改进 `.claude/skills`、`rules`、`agents` 与评测 **eval/**：哪些条目值得沉淀为范例（good），哪些暴露缺口需修契约或流程（bad）。

## 分级字段（脚本参数）

写入脚本：`node .claude/scripts/log-orchestration.js`（见各技能 SKILL「编排会话日志」）。

| 参数 | 含义 |
|------|------|
| `--case good` | 本条可作为 **正面范例**：场景清晰、摘要可核对、符合 eval 阶段契约 |
| `--case bad` | 本条作为 **反面素材**：遗漏必选步骤、证据不足、与 SKILL 冲突等 |
| `--case neutral` | 默认；不写参数等价于 neutral——**常规追溯**，不强制进入案例库 |
| `--tags <a,b,c>` | 短标签，便于检索与聚类（英文 snake_case 或小写短词，逗号分隔） |
| `--lesson "<一句>"` | **后续改进要点**：优先在 **bad** 时填写；good 时可写「可固化为规则的一句」 |

建议在会话收尾或复盘时，对关键交互 **补一条带 `--case good|bad` 的追加**，或在同一轮次当时就标注。

## Good Case（正面范例）判定

满足 **多数** 即可标 `good`（不必追求完美）：

1. **操作场景**能用一句对齐 [`eval/skills/generate-document.md`](../../eval/skills/generate-document.md) / [`implement-code.md`](../../eval/skills/implement-code.md) 中的用户故事语气（谁在什么阶段为了什么）。
2. **对话与交互摘要**可追溯：含派发要点、返回结论或采纳项，且能指向路径、命令或文档之一。
3. **与编排契约一致**：例如 generate-document 链路上 spec-retriever → impact-analyst → … 该出现时摘要里能看出来。
4. **无臆造**：数字、路径未编造；缺失则摘要中写明「未提供」类说明。

**典型 tags**：`evidence-ok`、`stage-contract-met`、`import-docs-aligned`、`clear-scenario`。

## Bad Case（反面素材）判定

出现 **任一条** 即可标 `bad`（并强烈建议写 `--lesson`）：

1. **必选 agent/skill 未调用却宣称完成**，或顺序与 `rules/orchestration.md` / SKILL 明显冲突。
2. **摘要空洞**：仅有占位而无可核对事实，或与其他文档结论矛盾。
3. **阻断 / 门禁场景未记录证据路径**，或 Token/耗时类虚构。
4. **import-docs / wework-bot** 与编排日志不一致且无说明。

**典型 tags**：`skipped-agent`、`missing-evidence`、`contract-violation`、`hallucinated-metric`、`order-wrong`。

**`--lesson` 写法**：一句 actionable——「应在阶段 N 之前调用 X」「应将 Y 写入 memory 再下游」。

## Neutral（默认）

未标注或显式 `neutral`：正常流水账，用于完整追溯；复盘时再决定是否从历史条目中「升格」为 good/bad 标注（可手工编辑该 `.md` 文件补 **评测标注** 小节，标准字段见下）。

## 单条记录中的「评测标注」形态（机器生成）

当传入 `--case good|bad`、`--tags` 或 `--lesson` 至少一项时，脚本会在该小节末尾追加：

```markdown
**评测标注**
- **分级**：good | bad
- **标签**：`tag1` · `tag2`
- **后续改进**：…（可选）
```

便于 grep：`分级**：good`、`分级**：bad`。

## 与后续改进的衔接

- **good**：可摘录进 eval「成功判据」示例或 skills 的「推荐写法」。
- **bad**：应对照 SKILL / orchestration 打开 issue 或改规则；`--lesson` 即候选 AC。
- 定期用 `rg '分级**：bad' docs/logs` 做 bad case 复盘。
