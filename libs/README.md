# 外部参考 — 知识库

> pm 拆故事、架构设计、自改进时，应主动查阅以下资源汲取模式与理念。
>
> **融合原则**：从不凭感觉执行——每阶段有对应参考，每参考有明确应用场景。外链失效时，技能规约仍独立可执行（自包含原则）。

## 外部参考 → 管线阶段 映射

```mermaid
flowchart LR
    subgraph 参考["外部参考资源"]
        R1["故事描述<br/>superpowers<br/>get-shit-done<br/>ui-ux-pro-max<br/>karpathy-skills<br/>mattpocock-skills"]:::ref
        R2["实现与架构<br/>everything-claude-code<br/>system-design-primer<br/>ruflo<br/>hermes-agent<br/>claude-mem<br/>agentmemory"]:::ref
        R3["工具与平台<br/>Claude Code 官方文档"]:::ref
        R4["趋势与发现<br/>GitHub Trending<br/>OSS Insight<br/>TrendShift<br/>Top-Starred"]:::ref
    end

    subgraph 管线["管线阶段"]
        S1["① 需求→文档<br/>pm 拆分 + coder 设计"]:::phase
        S2["② 预检→实现<br/>Gate A + P0 清零"]:::phase
        S3["③ 验证→自改进<br/>Gate B + D0-D7"]:::phase
        S4["④ 交付<br/>三步收口"]:::phase
    end

    R1 --> S1
    R2 --> S2 & S3
    R3 --> S2 & S3
    R4 --> S4

    classDef ref fill:#f3e5f5,stroke:#6a1b9a;
    classDef phase fill:#e3f2fd,stroke:#1565c0;
```

| 管线阶段 | 查阅的外部参考 | 汲取什么 |
|---------|--------------|---------|
| 需求→文档 | superpowers · get-shit-done · ui-ux-pro-max · karpathy-skills · mattpocock-skills | 故事拆分模式 · AC 设计方法 · UI 交互状态覆盖 · LLM 编码陷阱规避 · 真实工程纪律 |
| 预检→实现 | everything-claude-code · system-design-primer · ruflo · Claude Code 文档 | 上下文质量优先 · 深模块设计 · 多 Agent 协作模式 · harness 能力边界 |
| 验证→自改进 | claude-mem · agentmemory · hermes-agent · superpowers | 记忆压缩注入 · 基准评估 · 经验技能化 · 验证门禁 |
| 交付 | GitHub Trending · OSS Insight · TrendShift · Top-Starred | 技术趋势验证 · 架构健康度 · 新兴工具 · 社区验证参照 |

## 目录

| 分类 | 文件 |
|------|------|
| 故事描述 — 模式与方法论 | [story-patterns.md](./story-patterns.md) |
| 实现与架构 — 执行模式 | [architecture-patterns.md](./architecture-patterns.md) |
| 工具与平台 | [tools.md](./tools.md) |
| 趋势与发现 | [trends.md](./trends.md) |
| 自改进生态系统 | [ecosystem.md](./ecosystem.md) |

## 自改进生态系统

> YrY 从外部参考汲取模式，通过自改进管线沉淀为自身规则。

```mermaid
flowchart TB
    subgraph 外部["外部生态"]
        E1["superpowers<br/>行为纪律"]:::ext
        E2["claude-mem<br/>记忆引擎"]:::ext
        E3["hermes-agent<br/>经验技能化"]:::ext
        E4["ruflo<br/>多Agent编排"]:::ext
        E5["everything-claude-code<br/>研究优先"]:::ext
        E6["ui-ux-pro-max<br/>UI推理规则"]:::ext
    end

    subgraph YrY["YrY 内化"]
        Y1["agents/AGENT.md<br/>Red Flags + 验证门禁"]:::yry
        Y2["rules/self-improve.md<br/>记忆压缩 + 基准评估"]:::yry
        Y3["agents/self-improve.md<br/>提案升级规则"]:::yry
        Y4["agents/AGENT.md<br/>三种协作模式"]:::yry
        Y5["CLAUDE.md<br/>执行模式: 研究优先"]:::yry
        Y6["agents/pm.md<br/>UI ≥3状态覆盖"]:::yry
    end

    外部 -->|"汲取模式"| YrY
    YrY -->|"提案验证"| 外部

    classDef ext fill:#f3e5f5,stroke:#6a1b9a;
    classDef yry fill:#e8f5e9,stroke:#2e7d32;
```
