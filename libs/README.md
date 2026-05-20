# 外部参考

> pm/coder/security 在各管线阶段查阅。外链失效时规约仍可独立执行。

```mermaid
flowchart LR
    subgraph 参考["外部参考"]
        R1["故事模式<br/>superpowers<br/>get-shit-done<br/>mattpocock-skills<br/>ui-ux-pro-max<br/>karpathy-skills"]:::ref
        R2["架构模式<br/>claude-mem · agentmemory<br/>hermes-agent · ruflo<br/>everything-claude-code<br/>system-design-primer"]:::ref
        R3["工具<br/>Claude Code 文档"]:::ref
        R4["趋势<br/>GitHub Trending<br/>OSS Insight<br/>TrendShift<br/>Top-Starred"]:::ref
    end
    subgraph 管线["管线阶段 → YrY 内化"]
        S1["① 需求→文档<br/>Red Flags · 惜注意<br/>UI ≥3状态 · AC设计"]:::phase
        S2["② 预检→实现<br/>研究优先 · 深模块<br/>harness 能力边界"]:::phase
        S3["③ 验证→自改进<br/>记忆压缩 · 基准评估<br/>经验技能化 · E1-E4"]:::phase
        S4["④ 交付<br/>趋势验证<br/>/trends-discovery"]:::phase
    end
    R1 --> S1
    R2 --> S2 & S3
    R3 --> S2 & S3
    R4 --> S4
    classDef ref fill:#f3e5f5,stroke:#6a1b9a;
    classDef phase fill:#e3f2fd,stroke:#1565c0;
```

| 阶段 | 文件 | 汲取 |
|------|------|------|
| ① 需求→文档 | [story-patterns.md](./story-patterns.md) | 故事拆分 · AC 设计 · UI ≥3 状态 |
| ② 预检→实现 | [architecture-patterns.md](./architecture-patterns.md) + [tools.md](./tools.md) | 研究优先 · 深模块 · harness 边界 |
| ③ 验证→自改进 | [architecture-patterns.md](./architecture-patterns.md) | 记忆注入 · 基准 · 经验技能化 |
| ④ 交付 | [trends.md](./trends.md) | 趋势验证 · 社区参照 |

## 本地副本

> commit 哈希见 `_sources.json`。趋势为动态数据，`/trends-discovery` 查询。

| 来源 | 本地 |
|------|------|
| obra/superpowers | [repos/superpowers/](./repos/superpowers/) |
| gsd-build/get-shit-done | [repos/get-shit-done/](./repos/get-shit-done/) |
| mattpocock/skills | [repos/mattpocock-skills/](./repos/mattpocock-skills/) |
| nextlevelbuilder/ui-ux-pro-max-skill | [repos/ui-ux-pro-max-skill/](./repos/ui-ux-pro-max-skill/) |
| multica-ai/andrej-karpathy-skills | [repos/andrej-karpathy-skills/](./repos/andrej-karpathy-skills/) |
| thedotmack/claude-mem | [repos/claude-mem/](./repos/claude-mem/) |
| affaan-m/everything-claude-code ⚠已迁移 | [repos/everything-claude-code/](./repos/everything-claude-code/) |
| rohitg00/agentmemory | [repos/agentmemory/](./repos/agentmemory/) |
| NousResearch/hermes-agent | [repos/hermes-agent/](./repos/hermes-agent/) |
| ruvnet/ruflo | [repos/ruflo/](./repos/ruflo/) |
| donnemartin/system-design-primer | [repos/system-design-primer/](./repos/system-design-primer/) |
| Claude Code 文档 | [docs/claude-code/](./docs/claude-code/) |
