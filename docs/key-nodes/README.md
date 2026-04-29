# 关键节点记录（Markdown）

本目录存放编排流程中的 **里程碑、门禁结果、对外通知结果** 等短记录，全部为 **`.md`** 文件，按自然日聚合：

- `YYYY-MM-DD.md`：当日关键节点按时间追加。

## 如何写入

推荐使用脚本（与 [`docs/logs/`](../logs/README.md) 中的编排会话日志互补）：

```bash
node .claude/scripts/log-key-node.js --title "阶段 3 架构冻结" \
  --category stage --skill generate-document \
  --text "architect：方案已定稿，进入文档产出。"
```

长说明可从标准输入传入：

```bash
echo $'门禁：pnpm test 全部通过\n证据：CI job #123' | \
  node .claude/scripts/log-key-node.js --title "冒烟门禁通过" --category gate --skill implement-code
```

企业微信 **`send-message.js`** 在推送成功时会自动追加一条节点（可通过环境变量 `WEWORK_BOT_SKIP_KEY_NODE_LOG` 关闭）；正文全文归档仍见 [`docs/messages/`](../messages/)。

## 与其它 docs 目录的分工

| 目录 | 内容侧重 |
|------|-----------|
| [`docs/logs/`](../logs/) | 编排会话明细（skill/agent/MCP 交互摘要，可含评测标注） |
| [`docs/key-nodes/`](./) | 关键节点一览（里程碑 / 门禁 / 通知结果，宜短） |
| [`docs/messages/`](../messages/) | 企业微信推送正文快照 |
