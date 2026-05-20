# 工具与平台

> 预检→实现 + 验证→自改进阶段参考。技能设计、hook 配置时查阅。

```mermaid
flowchart LR
    CC["Claude Code 官方文档<br/>CLI · hooks · MCP<br/>skills · IDE · 权限"]:::src
    Y1["技能设计<br/>确认 harness 能力边界"]:::yry
    Y2["Hook 配置<br/>事件触发链"]:::yry
    Y3["MCP 集成<br/>外部工具接入"]:::yry
    CC --> Y1 & Y2 & Y3
    classDef src fill:#f3e5f5,stroke:#6a1b9a;
    classDef yry fill:#e8f5e9,stroke:#2e7d32;
```

| 来源 | 汲取 | 本地副本 |
|------|------|---------|
| [Claude Code 官方文档](https://code.claude.com/docs/en/overview) | CLI 功能参考：hooks、MCP、skills、IDE 集成、权限系统 | [docs/claude-code/](./docs/claude-code/) |
