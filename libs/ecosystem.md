# 自改进生态系统

> YrY 从外部参考汲取模式，通过自改进管线沉淀为自身规则。生态系统闭环如下：

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

## 映射关系

| 外部资源 | 汲取的模式 | YrY 内化位置 |
|---------|-----------|------------|
| superpowers | 行为纪律 | agents/AGENT.md — Red Flags + 验证门禁 |
| claude-mem | 记忆引擎 | rules/self-improve.md — 记忆压缩 + 基准评估 |
| hermes-agent | 经验技能化 | agents/self-improve.md — 提案升级规则 |
| ruflo | 多 Agent 编排 | agents/AGENT.md — 三种协作模式 |
| everything-claude-code | 研究优先 | CLAUDE.md — 执行模式: 研究优先开发 |
| ui-ux-pro-max | UI 推理规则 | agents/pm.md — UI ≥3 状态覆盖 |
