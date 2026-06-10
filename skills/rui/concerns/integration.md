# 强制集成

> rui-import + rui-bot 需手动触发。管线完成后按需调用。

## 手动触发命令

| # | 步骤 | 命令 | 说明 |
|---|------|------|------|
| 1 | 追加通知 | `node skills/rui-bot/send.mjs --story=<name> --status=<s> --no-send` | 记录通知状态，不发 HTTP |
| 2 | 文档同步 | `node skills/rui-import/sync.mjs workspace=true` | 全量扫描 + 上传 |
| 3 | 发送通知 | `node skills/rui-bot/send.mjs --story=<name> --status=<s>` | POST 企微 webhook |

## 降级

- `no-token`：`API_X_TOKEN` 缺失时跳过推送
- 网络失败：告警不阻断

## 集成参考

| 类别 | 内容 |
|------|------|
| 数据契约 | `.memory/execution-memory.jsonl`（追加）· `.improvement/proposals.jsonl`（追加）— 字段见 [coder.md](../coder.md#数据契约) |
| 交付收口 | rui-import + rui-bot 手动触发 |
| 规则 | [code-pipeline](../../../rules/code-pipeline.md) · [delivery-gate](../../../rules/delivery-gate.md) · [doc-generation](../../../rules/doc-generation.md) · [self-improve](../../../rules/self-improve.md) · [rui-claude](../../../rules/rui-claude.md) |
| 角色 | [pm](../../../agents/pm.md) · [coder](../../../agents/coder.md) · [tester](../../../agents/tester.md) · [reporter](../../../agents/reporter.md) · [security](../../../agents/security.md) · [self-improve](../../../agents/self-improve.md) |
| 文档 | [formulas.md](../formulas.md) · [coder.md](../coder.md) · [rui-import SKILL](../rui-import/SKILL.md) · [rui-bot SKILL](../rui-bot/SKILL.md) |
| 推荐 | [ranking.md](../ranking.md) · [recommend.mjs](../../../lib/recommend.mjs) |

## 管线阶段参考

| 阶段 | 核心方法 | 谁查阅 |
|------|---------|--------|
| 需求→文档 | 故事拆分粒度 · AC 设计 · UI 交互状态覆盖（≥3 状态） | pm |
| 预检 | 工程纪律 · 测试先行门禁 · 上下文质量优先 | tester · coder |
| 实现 | 深模块设计 · 多 Agent 协作 · 研究优先开发 · 纵深防御 | coder · security |
| 验证 | 执行记忆沉淀 · 基准评估 · 验证门禁五步法 | tester · reporter |
| 自改进 | 记忆压缩注入 · 经验技能化 · 跨会话相似检索 | self-improve |
| 交付 | 技术趋势验证 · 架构健康度 · 新兴工具发现 | reporter |
