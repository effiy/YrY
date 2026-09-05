---
title: 产品需求文档 / PRD
tags: [leaf, product, prd]
category: producter/discovery/prd
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter]
benefit: "PM 可以通过清晰的框架、可操作的建议和反模式意识来理解和应用产品需求文档 / PRD"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
  - ../../../curator/templates/prd.md
  - ../../frameworks/README.md
---

# 产品需求文档 / PRD（产品知识库）

> **作为**产品经理，**我想要**发现用户需求并验证产品决策，**以便**我们为正确的理由构建正确的东西。

汇集具体产品 PRD 实例。

> 模板参见 [../../../curator/templates/prd.md](../../../curator/templates/prd.md)；本目录存放实例。

## 收录范围

- 各项目 PRD 实例（按需求命名）
- 跨项目通用需求 PRD

## 文件类型与命名

- `{requirement-name}-prd.md`：单一需求 PRD
- `{year}-{requirement-name}-prd.md`：按年份归档
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: Some Requirement PRD
tags: [PRD, project, requirement]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
review_cycle: quarterly
related: [<related story or process>]
---
```

## 推荐撰写结构

参考 [../../../curator/templates/prd.md](../../../curator/templates/prd.md) 模板：

1. 背景与目标
2. 用户与场景
3. 功能需求
4. 非功能需求
5. 里程碑
6. 度量指标
7. 风险与依赖

## 已收录

| file | content | status |
|---|---|---|
| [brd-agent-prd.md](./brd-agent-prd.md) | BRD Agent PRD — AI 辅助 BRD 生成，支持结构化输出、迭代优化和来源追溯 | active |
| [aichat-port-prd.md](./aichat-port-prd.md) | aiChat Port PRD — YiWeb sessionChat 迁移至 YiVad，实现完整功能对等及 YiVad 原生 agent loop 增强 | active |
| [aicr-file-tree-prd.md](./aicr-file-tree-prd.md) | aicr File Tree PRD — AI 代码评审的分层代码导航，共享 FileTree 基线组件 | active |
| [dashboard-api-portfolio.md](./dashboard-api-portfolio.md) | API 组合仪表盘 — API 生命周期和治理可见性 | active |

## 相关叶子目录

- [../../../curator/templates/prd.md](../../../curator/templates/prd.md) — PRD 模板
- [../../frameworks](../../frameworks) — PM 框架
- [../../projects/](../../projects/) — 项目故事
- [../../../engineer/learn/lessons/learn-pm-frameworks.md](../../../engineer/learn/lessons/learn-pm-frameworks.md) — 场景入口