---
title: Pretty Mermaid 技能说明
updated: 2026-09-10
---

## 图表渲染工具

### 快速开始

```
你：画一个 YiVad 和 YiAi 的数据流架构图

助手：[Pretty Mermaid]
  生成 flowchart LR 展示数据流向...
  
  [渲染 SVG]
  → 输出：data-flow.svg（tokyo-night 主题）
```

### 支持的类型

| 需求 | 图表类型 |
|------|---------|
| 架构/流程/决策树 | Flowchart |
| API 调用/消息交互 | Sequence |
| 生命周期/状态机 | State |
| 类/模块关系 | Class |
| 数据库实体 | ER |
| 数据趋势对比 | XY Chart |

### 输出格式

- **SVG** — 文档、README、幻灯片（可缩放、支持主题）
- **PNG** — 聊天、预览、不支持 SVG 的平台
- **Unicode/ASCII** — 终端和纯文本环境

### 架构

```
pretty-mermaid/
├── SKILL.md                  # 技能本身
├── references/
│   ├── DIAGRAM_TYPES.md      # 图表语法参考
│   ├── THEMES.md             # 15 个内置主题
│   └── api_reference.md      # API 参考
└── scripts/                  # Node.js CLI（render/batch/themes/png）
```