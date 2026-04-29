# Agent 调用运行记录（成功/失败）

本目录用于记录 **agent 调用的成功/失败运行数据**，服务于后续编排与契约优化（例如：失败原因聚类、哪些阶段最容易漂移、重试是否有效）。

> 说明：
> - `agents/memory/` 仍用于“经验/决策记忆”（按 `shared/agent-memory-protocol.md` 的 1-3 条目追加）。
> - `.claude/agents/memory/` **仅**记录“运行记录与统计”，避免污染经验记忆的条目质量。

## 文件约定

- 每个 agent 一个文件：`.claude/agents/memory/<agent>.runs.md`
- 追加写入由脚本完成：`node scripts/log-agent-run.js ...`

## 使用方式

```bash
node scripts/log-agent-run.js --agent spec-retriever --status success \
  --skill generate-document --stage stage-1 --doc_type 需求文档 --feature "Foo-摘要" \
  --notes "门禁通过"
```

失败示例：

```bash
node scripts/log-agent-run.js --agent impact-analyst --status failure \
  --skill generate-document --stage stage-2 --doc_type 设计文档 --feature "Foo-摘要" \
  --error "missing required_answers.Q3" --evidence "scripts/validate-agent-output.js"
```

