# 强制集成

> rui-import + rui-bot 需手动触发。管线完成后按需调用。集成是交付的最后一步，不可省略。

[手动触发](#手动触发) · [降级](#降级) · [集成时序](#集成时序) · [集成参考](#集成参考) · [管线阶段参考](#管线阶段参考)

<a id="手动触发"></a>
## 手动触发命令

| # | 步骤 | 命令 | 说明 |
|---|------|------|------|
| 1 | 追加通知 | `node skills/rui-bot/send.mjs --story=<name> --status=<s> --no-send` | 记录通知状态，不发 HTTP |
| 2 | 文档同步 | `node skills/rui-import/sync.mjs workspace=true` | 全量扫描 + 上传 |
| 3 | 发送通知 | `node skills/rui-bot/send.mjs --story=<name> --status=<s>` | POST 企微 webhook |

## 集成时序

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#1e1f2b',
  'primaryTextColor': '#a9b1d6',
  'primaryBorderColor': '#3d59a1',
  'lineColor': '#3d59a1',
  'secondaryColor': '#2b2d3b',
  'tertiaryColor': '#21232f'
}}}%%
flowchart LR
    CODE["管线完成"]:::src --> LOG["① 追加日志<br/>rui-bot --no-send"]:::step
    LOG --> SYNC["② 文档同步<br/>rui-import sync"]:::step
    SYNC --> NOTIFY["③ 发送通知<br/>rui-bot send"]:::step
    NOTIFY --> DONE["集成完成"]:::done

    classDef src fill:#3d59a1,color:#fff
    classDef step fill:#2b2d3b,stroke:#3d59a1,color:#a9b1d6
    classDef done fill:#34d399,color:#000
```

## 降级

| 场景 | 处置 | 影响 |
|------|------|------|
| `no-token`（API_X_TOKEN 缺失） | 跳过推送，但仍标记 docs_synced | 文档未同步到远端 |
| 网络失败 | 告警不阻断，下次覆盖重试 | 通知可能延迟 |
| rui-bot webhook 失效 | 记录到失败队列，定时重试 | 通知未送达 |
| 同步冲突 | 远端优先，本地备份 | 本地修改可能丢失 |

## 集成验证

| 验证项 | 命令 | 预期 |
|--------|------|------|
| 日志已追加 | `grep` 通知日志 | 含本次操作记录 |
| 文档已同步 | 检查 sync 输出 | created/overwritten/failed 计数 |
| 通知已发送 | 检查 HTTP 响应 | 200 OK |
| 标记已写入 | 检查 rui-state.json | delivery_pipeline 字段闭合 |

## 集成参考

| 类别 | 内容 |
|------|------|
| 数据契约 | `.memory/execution-memory.jsonl`（追加）· `.improvement/proposals.jsonl`（追加）— 字段见 [coder.md](../coder.md#数据契约) |
| 交付收口 | rui-import + rui-bot 手动触发 |
| 规则 | [code-pipeline](../../rui-code/rules/code-pipeline.md) · [delivery-gate](../rules/delivery-gate.md) · [doc-generation](../../rui-html/rules/doc-generation.md) · [self-improve](../../rui-yry/rules/self-improve.md) · [rui-claude](../../rui-claude/rules/rui-claude.md) |
| 角色 | [pm](../pm.md) · [coder](../coder.md) · [tester](../tester.md) · [reporter](../../rui-reporter/reporter.md) · [security](../security.md) · [self-improve](../../rui-yry/self-improve.md) |
| 文档 | [formulas.md](../formulas.md) · [coder.md](../coder.md) · [rui-import SKILL](../../rui-import/SKILL.md) · [rui-bot SKILL](../../rui-bot/SKILL.md) |
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