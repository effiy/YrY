---
title: 元数据规范与检索增强生成优化
tags: [功能, 元数据, 检索增强生成, 元数据, 标准]
category: 问题/功能
created: 2026-08-05
updated: 2026-08-12
source: 内部
type: 问题
status: 已完成
priority: 高
问题type: 功能
project: YiKnowledge
project_id: yiknowledge
owner: 陈铭
estimate_points: 3
评审status: 已通过
prd_month: 202608
prd_task_id: 2
roles: [engineer]
---

# YAML Frontmatter Specification and RAG Optimization

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 2 |
| 项目 | YiKnowledge (知识库) |
| 代码仓库 | `YrY/YiKnowledge` |
| 功能模块 | 元数据标准 |
| 优先级 | 高 |
| 人天 | 3.0d |
| 状态 | 已完成 |

### 功能概述

制定统一的 YAML Frontmatter 规范，作为知识库检索的核心信号。优化字段设计以提升 RAG 检索质量，确保 YiAi 的 knowledge watcher 能正确解析和索引。

### 技术实现

#### Frontmatter 字段规范

```yaml
---
title: 文件标题                      # 必填 — RAG 检索主信号
aliases: [别名1, 别名2]              # 推荐 — 同义词扩展检索
tags: [标签1, 标签2, 标签3]           # 必填 — 3-5 个精准标签
category: 根目录 — 知识分类路径
created: YYYY-MM-DD                  # 必填 — 创建时间
updated: YYYY-MM-DD                  # 必填 — 最后更新时间
source: internal | url               # 必填 — 内容来源
type: summary | original | template | prompt  # 必填 — 内容类型
status: draft | stable | deprecated  # 必填 — 内容状态
生命周期: inbox | triage | active | reference | archive  # 生命周期
评审周期: weekly | monthly | quarterly | yearly  # 外部内容审查周期
最后验证: YYYY-MM-DD            # 最后验证日期
角色: [role1, role2]                # 目标角色
收益: "简短描述"                   # 对读者的价值
验收标准:                 # 可验证的验收条款
  - "条款1"
相关:                             # 关联文件（相对路径）
  - relative/path/to/file.md
---
```

#### RAG 检索优化

- **title**：作为检索主信号，权重最高
- **tags**：3-5 个精准标签（非泛化标签），提升关键词匹配
- **aliases**：同义词/别名，扩展检索覆盖面
- **benefit**：简短价值描述，用于检索结果摘要
- **roles**：角色过滤，支持按角色范围检索
- **category**：知识分类路径，支持目录范围检索

#### Knowledge Watcher 解析

- YiAi 的 `knowledge_watcher` 通过 `apscheduler` 每 60s 轮询 `YiKnowledge/` 目录树
- 解析 `---` 分隔的 YAML frontmatter 块
- 同步到 MongoDB `knowledge_files` 集合
- llama_index 构建 Vector Index 用于混合检索

#### 文件命名规范

- 格式：kebab-case（小写 + 连字符）
- 禁止：下划线 `_`、数字
- 中文语义保留在 frontmatter `title` 和 `aliases` 中
- 正文结构：Summary → Core viewpoints → Key information → Action recommendations

### 关联模块

- 规范文档：`docs/规范/知识管理规范.md`
- YiAi 配置：`docs/参考/YiAi_配置.md`
- 治理流程：`docs/治理/知识治理.md`

### 验收标准

1. 所有知识文件包含完整必填 frontmatter 字段
2. `tags` 字段 3-5 个精准标签
3. frontmatter 可被 YiAi knowledge watcher 正确解析
4. RAG 检索结果准确性和相关性达标
5. 文件命名符合 kebab-case 规范

---

*source: `projects/yiknowledge/requires/2026-08/frontmatter-spec-rag-optimization.md`*