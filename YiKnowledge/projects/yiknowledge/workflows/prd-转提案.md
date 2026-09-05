# PRD → Proposal 流程

> 从需求到 OpenSpec proposal 的结构化提炼流程。
>
> ⚠️ **本流程已内嵌到 `/opsx:propose` skill 中作为强制步骤**，不需要手动执行。

## 流程

```
需求输入（PRD/Jira/口述）
  │
  ▼  第一层：结构化提取 → 用户确认
提炼后的需求摘要
  │
  ▼  第二层：代码库碰撞（并行子代理）
影响分析 + 现有能力匹配
  │
  ▼  第三层：组装 proposal
proposal.md
```

## 第一层：需求结构化提取

```markdown
## 需求摘要

### 业务背景
[一段话：为什么做这件事]

### 核心功能点
1. [功能1]: [简要描述]
2. [功能2]: [简要描述]

### 约束条件
- [约束1]
- [约束2]

### 待确认项
- [ ] [待确认1]
- [ ] [待确认2]
```

**确认卡点**: 提炼完成后暂停，让用户确认/补充。
**待确认项未全部解决前，不进入 design 阶段。**

## 第二层：代码库碰撞

并行启动子代理搜索四个维度：

| 子代理 | 搜索目标 | 输出到 proposal 的哪部分 |
|--------|----------|--------------------------|
| 搜现有内容 | 知识库中是否已有类似内容 | Modified Capabilities |
| 搜目录结构 | 角色目录/领域分类 | Dependencies |
| 搜 frontmatter | 已有标签和分类 | 依赖模块 |
| 搜 spec | openspec/specs/ 中的已有能力 | Modified Capabilities |

## 第三层：组装 proposal

将前两层输出组装为标准 proposal.md 格式。

## 使用方式

使用 `/opsx:propose <change-name>` 命令，内部按此流程执行。

## 与 OpenSpec 状态的关系

- 需求提取完成后，change 状态设为 `proposed`
- 待确认项全部解决后才推进到 `designing`