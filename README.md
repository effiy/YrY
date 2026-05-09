# YrY

故事驱动的 SDLC 项目。通过 `/rui` 编排器实现从需求到交付的完整管线。

## 目录

```
YrY/
├── CLAUDE.md              # 项目 AI 上下文（入口指引）
├── README.md              # 本文件
├── agents/                # Agent 身份与决策边界
│   ├── AGENT.md
│   ├── pm.md
│   ├── coder.md
│   ├── tester.md
│   ├── reporter.md
│   ├── security.md
│   └── self-improve.md
├── rules/                 # 规则库
│   ├── code-pipeline.md
│   ├── doc-generation.md
│   ├── gate-rules.md
│   └── self-improve.md
├── skills/                # 技能定义与脚本
│   ├── rui/               # SDLC 编排器
│   ├── wework-bot/        # 企业微信通知
│   └── import-docs/       # 文档同步
└── docs/
    ├── shared/            # 共享文档（架构、契约）
    └── 故事任务面板/       # 故事目录
```

## 核心工作流

```
/rui init          → 建立项目基线
/rui doc <name>    → 文档管线（规划 → 设计 → 策展）
/rui code <name>   → 代码管线（预检 → 测试先行 → 实现 → 验证）
/rui <name>        → 端到端（文档管线 + 代码管线）
```

## 开始

```bash
# 初始化项目基线
/rui init

# 创建第一个故事
/rui doc <story-name>

# 实现故事
/rui code <story-name>
```
