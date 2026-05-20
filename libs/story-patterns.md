# 故事模式

> 需求→文档阶段核心参考。pm 拆分故事、coder 架构设计时查阅。

```mermaid
flowchart LR
    subgraph 外部["外部资源"]
        SP["superpowers<br/>行为纪律"]:::src
        GSD["get-shit-done<br/>上下文工程"]:::src
        MP["mattpocock-skills<br/>工程纪律"]:::src
        UI["ui-ux-pro-max<br/>UI推理规则"]:::src
        AK["karpathy-skills<br/>LLM陷阱"]:::src
    end
    subgraph YrY["YrY 内化"]
        Y1["Red Flags + 验证门禁"]:::yry
        Y2["惜注意 + 退化对策"]:::yry
        Y3["CONTEXT-FORMAT + 文档写作"]:::yry
        Y4["UI ≥3状态覆盖"]:::yry
        Y5["故事拆分陷阱 + Agent 纪律"]:::yry
    end
    SP --> Y1
    GSD --> Y2
    MP --> Y3
    UI --> Y4
    AK --> Y5
    classDef src fill:#f3e5f5,stroke:#6a1b9a;
    classDef yry fill:#e8f5e9,stroke:#2e7d32;
```

| 来源 | 汲取 | 本地副本 |
|------|------|---------|
| [obra/superpowers](https://github.com/obra/superpowers) | Red Flags · 验证门禁五步法 | [repos/superpowers/](./repos/superpowers/) |
| [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) | 惜注意原则 · 退化三因对策 · 上下文工程四原则 | [repos/get-shit-done/](./repos/get-shit-done/) |
| [mattpocock/skills](https://github.com/mattpocock/skills) | CONTEXT-FORMAT 参照 · 工程纪律 | [repos/mattpocock-skills/](./repos/mattpocock-skills/) |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UI ≥3 交互状态覆盖 · pm 前端约束 | [repos/ui-ux-pro-max-skill/](./repos/ui-ux-pro-max-skill/) |
| [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | 故事拆分陷阱规避 · Agent 纪律参考 | [repos/andrej-karpathy-skills/](./repos/andrej-karpathy-skills/) |
