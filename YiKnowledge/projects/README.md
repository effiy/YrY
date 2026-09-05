---
标题: 项目知识中心
标签: [projects, navigation, hub, yivad, yiai, yipet, yiknowledge]
分类: projects
创建时间: 2026-08-26
更新时间: 2026-09-02
最后验证: 2026-09-02
来源: 内部
类型: 摘要
状态: 稳定
生命周期: 活跃
评审周期: 每季度
角色: [工程师, 负责人, 产品]
收益: "从单一中心导航所有 8 个项目专属知识领域"
验收标准:
  - "所有 8 个项目都有 README 链接"
  - "每个项目的子目录均已列出"
  - "包含到 engineer/learn/projects/ 的交叉引用"
相关:
  - ./INDEX.md
  - ../INDEX.md
  - ../README.md
  - ../engineer/learn/projects/
---

# 项目知识中心

> 8 个项目，各自包含文档和需求。项目专属知识存放于此；跨项目模式存放于 [engineer/](../engineer/)。

## 项目列表

| 项目 | 描述 | 文档 | 需求 | Bugs |
|---|---|---|---|---|---|
| [YiVad](./yivad/) | Vue 3.5 管理后台 | [文档/](./yivad/文档/) | [requires/](./yivad/requires/) | [bugs/](./yivad/bugs/) |
| [YiAi](./yiai/) | FastAPI 后端 | [文档/](./yiai/文档/) | [requires/](./yiai/requires/) | — |
| [YiPet](./yipet/) | Chrome MV3 扩展 | [文档/](./yipet/文档/) | [requires/](./yipet/requires/) | — |
| [YiKnowledge](./yiknowledge/) | 知识库 | [文档/](./yiknowledge/文档/) | [requires/](./yiknowledge/requires/) | — |

## 项目描述

| 项目 | 技术栈 | 角色 |
|---|---|---|
| **YiVad** | Vue 3.5 + Rsbuild + Pinia | 管理后台，ProTable驱动，动态路由，按钮级权限 |
| **YiAi** | FastAPI + MongoDB + Ollama | AI聊天，文件管理，RAG，RSS聚合，Agent循环 |
| **YiPet** | Vue 3.5 + Chrome MV3 + Rsbuild | 浏览器扩展，多角色聊天，知识库关联 |
| **YiKnowledge** | Markdown + Frontmatter | 知识库，RAG数据源，8个角色目录 |

## 与 engineer/learn/projects/ 的关系

[engineer/learn/projects/](../engineer/learn/projects/) 目录包含**工程类**项目文档（架构、开发规范、功能模块、故事）。当前 `projects/` 目录包含**运营类**项目产物（需求、参考文档）。

| 内容类型 | 存放位置 |
|---|---|
| 架构文档、开发规范、故事 | [engineer/learn/projects/](../engineer/learn/projects/) |
| 缺陷报告、问题跟踪、需求、演示、参考文档 | `projects/<project>/` |

## 导航

- [INDEX.md](./INDEX.md) — 所有项目的完整文件列表
- [../INDEX.md](../INDEX.md) — 知识库顶层索引
- [../engineer/learn/projects/](../engineer/learn/projects/) — 工程类项目文档