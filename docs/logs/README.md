# 编排会话日志（Markdown）

本目录存放 **`generate-document`** / **`implement-code`** 执行过程中，与 `.claude` 内 skill、agent、MCP、memory、shared 交互的 **可追溯记录**，并可沉淀为 **good case / bad case** 供后续改进编排。

## 标准文档（必读）

- **[CASE-STANDARD.md](./CASE-STANDARD.md)**：good / bad / neutral 判定、`--case` / `--tags` / `--lesson` 用法，以及与 eval、skills 改进的衔接方式。

## 文件命名

- `YYYY-MM-DD_generate-document.md`
- `YYYY-MM-DD_implement-code.md`

由 `node .claude/scripts/log-orchestration.js` 写入；单日同技能共用一个文件，按时间追加条目。

## 内容形态

每条记录为 Markdown 小节，包含：

1. **操作场景**：本步在对话编排中的角色（建议对照 [`eval/skills/generate-document.md`](../../eval/skills/generate-document.md) / [`implement-code.md`](../../eval/skills/implement-code.md) 中的用户故事来表述）。
2. **对话与交互摘要**：可核对的要点（派发指令、结论、采纳项）。
3. **评测标注**（可选）：传入 `--case`、`--tags` 或 `--lesson` 时追加——**分级**（good / bad / neutral）、**标签**（检索用）、**后续改进**（bad 时强烈推荐）。

标题行可对 **good case** / **bad case** 显示标记（`\`--case good|bad\``），便于 `rg 'good case|bad case' docs/logs` 筛选。

历史遗留的 **`.log`** 单行格式若仍存在可保留归档；新记录一律使用 **`.md`**。
