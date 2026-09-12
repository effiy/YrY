---
title: 知识库导航索引
aliases: [知识库目录, kb-toc, 导航索引]
tags: [index, navigation, toc, role-tree]
category: root
created: 2026-01-01
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: 按角色目录和流水线阶段快速定位知识内容
acceptance_criteria:
  - 7 个角色目录均已列出，含描述和链接
  - 每个角色均链接到其 README（概览）和 INDEX（详细导航）
  - 跨领域索引和资源目录均可访问
related:
  - ./README.md
  - ./MEMORY.md
  - ./projects/INDEX.md
  - ./curator/governance/04-治理-就绪检查清单.md
---

# YiKnowledge 导航索引

> 7 个角色目录、5 个流水线阶段、3 个贯穿层。每个角色目录包含 README（概览）和 INDEX（详细导航）。

## 角色目录 —— 按流水线阶段

| 角色 | 流水线阶段 | 核心问题 | 概览 | 详细索引 |
|---|---|---|---|---|
| [producter/](./producter/) | 阶段 1：需求 | 构建什么产品？ | [README](./producter/README.md) | [INDEX](./producter/INDEX.md) |
| [leader/](./leader/) | 阶段 2：决策 | 走哪条技术路线？ | [README](./leader/README.md) | [INDEX](./leader/INDEX.md) |
| [engineer/](./engineer/) | 阶段 3：设计 + 构建 | 如何实现？ | [README](./engineer/README.md) | [INDEX](./engineer/INDEX.md) |
| [srer/](./srer/) | 阶段 4-5：交付 + 运营 | 如何保障稳定性？ | [README](./srer/README.md) | [INDEX](./srer/INDEX.md) |

## 贯穿层 —— 跨流水线角色

| 角色 | 层 | 核心问题 | 概览 | 详细索引 |
|---|---|---|---|---|
| [executiver/](./executiver/) | 业务战略层 | 为何做这个业务？ | [README](./executiver/README.md) | [INDEX](./executiver/INDEX.md) |
| [aier/](./aier/) | AI 赋能层 | AI 如何加速每个阶段？ | [README](./aier/README.md) | [INDEX](./aier/INDEX.md) |
| [curator/](./curator/) | 知识治理层 | 知识库自身如何维护？ | [README](./curator/README.md) | [INDEX](./curator/INDEX.md) |

## 项目知识中心

| 项目 | 定位 | 概览 | 详细索引 |
|---|---|---|---|
| [projects/](./projects/) | 4 个项目的统一知识中心 | [README](./projects/README.md) | [INDEX](./projects/INDEX.md) |

## 跨领域索引

跨角色聚合内容，按主题而非角色定位知识：

| 领域索引 | 聚合内容 | 回答的核心问题 |
|---|---|---|
| [SECURITY.md](./engineer/SECURITY.md) | 供应链安全、应用安全、风险评估、事件响应、合规审计 | 所有安全相关内容在哪里？ |
| [COLLABORATION.md](./curator/COLLABORATION.md) | 团队流程、会议规范、知识共享、入职引导、项目管理 | 所有协作相关内容在哪里？ |
| [ENGINEERING.md](./engineer/ENGINEERING.md) | 架构模式、质量保障、数据工程、开发工具、经验教训 | 所有工程相关内容在哪里？ |
| [curator/okr/](./curator/okr/) | 7 角色 OKR +「AI 全流程自闭环」流程记录（[loop 索引](./curator/okr/2026-Q3/loop/INDEX.md)） | 目标对齐和进度追踪在哪里？ |

## 资源目录

| 目录 | 用途 |
|---|---|
| [projects/](./projects/) | 项目知识中心 — 4 个项目的缺陷/需求/规范/工作流（[README](./projects/README.md) \| [INDEX](./projects/INDEX.md)） |
| [curator/templates/](./curator/templates/) | 文档模板（PRD、ADR、复盘、知识叶子、技术设计等 10 类模板，详见 [模板索引](./curator/templates/00-INDEX.md)） |
| [curator/governance/](./curator/governance/) | 知识治理规范（[知识健康看板](./curator/governance/01-治理-知识健康看板.md)、[治理规范](./curator/governance/02-治理-治理规范.md)、[就绪检查清单](./curator/governance/04-治理-就绪检查清单.md) 等 7 篇） |
| [curator/diagrams/](./curator/diagrams/) | 知识架构图（[看板索引](./curator/diagrams/01-图表-看板索引.md)、[目录蓝图](./curator/diagrams/02-图表-目录蓝图.md)、[知识地图](./curator/diagrams/03-图表-知识地图.md)、[用户旅程](./curator/diagrams/04-图表-用户旅程.md)） |
| [skills/](./skills/) | Claude Code 自定义技能（详见 [README](./skills/README.md)） |
| [engineer/learn/projects/](./engineer/learn/projects/) | 跨项目工程文档（架构、开发规范、功能模块、Story，按 yivad/yiai/yipet 子目录组织） |
| [leader/decisions/](./leader/decisions/) | 架构决策记录（ADR），按项目子目录组织 |

## 检索策略

1. **按流水线阶段检索**（推荐）—— 从你所在的阶段出发，前往对应的角色目录。
   - 需求阶段 → producter/
   - 技术决策 → leader/
   - 编码实现 → engineer/
   - 发布运维 → srer/
   - 不确定阶段 → 使用 [README.md](./README.md) 中的角色决策树

2. **按角色目录检索** —— 进入对应角色的 INDEX.md，查看子目录导航和文件列表。

3. **按领域索引检索** —— 跨阶段主题（安全、协作、工程、OKR）从对应的领域索引开始。

4. **按项目检索** —— 从 [projects/](./projects/) 进入，按项目 × 分类矩阵定位具体文件。

5. **按标签检索** —— 使用 frontmatter 中的 `tags` 字段进行快速过滤：
   ```bash
   rg "^tags:.*keyword" YiKnowledge -l        # 按标签过滤
   rg "^roles:.*engineer" YiKnowledge -l      # 按角色过滤
   rg "^lifecycle: active" YiKnowledge -l     # 仅活跃内容
   ```

6. **按 frontmatter 扫描** —— 使用 `head -15 file.md` 读取 YAML 元数据，在阅读完整文件之前判断内容相关性。