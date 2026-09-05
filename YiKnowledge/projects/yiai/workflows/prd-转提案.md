# PRD → Proposal 流程

> 从需求到 OpenSpec proposal 的结构化提炼流程，减少理解偏差，加速代码库碰撞。
>
> ⚠️ **本流程已内嵌到 `/opsx:propose` skill 中作为强制步骤**，不需要手动执行。
> 当你使用 `/opsx:propose` 时，AI 会自动走完以下三步，并在每步暂停等你确认。

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

不管需求来源，先提炼为以下统一格式：

```markdown
## 需求摘要

### 业务背景
[一段话：为什么做这件事，解决了什么问题]

### 核心功能点
1. [功能1]: [简要描述 + 页面类型标注（列表/表单/详情）]
2. [功能2]: [简要描述]
...

### 约束条件
- [约束1: 如"复用现有接口"]
- [约束2: 如"需兼容现有数据模型"]
...

### 待确认项
- [ ] [待确认1: 如"接口字段兼容需后端确认"]
- [ ] [待确认2: 如"性能指标待确认"]
...
```

**确认卡点**: 提炼完成后暂停，让用户确认/补充后再进入第二层。
**待确认项未全部解决前，不进入 design 阶段。**

## 第二层：代码库碰撞

并行启动子代理搜索四个维度：

| 子代理 | 搜索目标 | 输出到 proposal 的哪部分 |
|--------|----------|--------------------------|
| 搜现有模块 | 代码中是否已有类似功能/模块 | Modified Capabilities |
| 搜 API | 是否已有可复用接口/服务 | Dependencies + API 变更 |
| 搜数据模型 | 已有 MongoDB 集合/字段 | Dependencies |
| 搜 spec | openspec/specs/ 中的已有能力 | Modified Capabilities + spec 引用 |

## 第三层：组装 proposal

将前两层输出组装为标准 proposal.md 格式（Why / What Changes / Capabilities / Dependencies / Impact）。

## 使用方式

在 Claude Code 中：

```
你: 从这份需求生成 proposal [粘贴/描述需求]
我:
  1. 做需求结构化提取，输出给你确认
  2. 你确认后，并行搜索代码库
  3. 组装 proposal.md
  4. 你审阅
```

或使用 `/opsx:propose <change-name>` 命令，内部按此流程执行。

## 与 OpenSpec 状态的关系

- 需求提取完成后，change 状态设为 `proposed`
- 待确认项全部解决后才推进到 `designing`