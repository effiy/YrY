---
type: okr-action
id: flow-t-007
title: RSS 内容采集与自动分类接入 YiKnowledge
role: curator
listType: weekly
goal: cur-001
owner: Curator
deadline: '2026-08-21'
status: In Progress
priority: P2
progress: 60
skill: import
agent: Curator Agent
mcp: yiai
subtaskCount: 3
---

# RSS 内容采集与自动分类接入 YiKnowledge

RSS 正文卸载到 YiKnowledge markdown，MongoDB 只存元数据，减小主库体积并把长文本纳入知识库检索。

## 可执行任务分解（3 项）

### 1. 内容脚本注入采集

- 做法：YiPet 注入 10+ 内网平台，采集文章正文。
- 完成标准：目标平台文章被稳定采集。

### 2. markdown 落盘

- 做法：正文写入 YiKnowledge 对应目录。
- 完成标准：文件落盘可读，无乱码。

### 3. 自动分类

- 做法：文章按角色 / 主题自动归类到目录。
- 完成标准：分类准确率达标，可人工纠正。

| Field | Value |
|---|---|
| Role | 📦 Curator |
| Goal | cur-001 |
| Owner | Curator |
| Deadline | 2026-08-21 |
| Priority | P2 |
| Status | In Progress |
| Progress | 60% |
| Skill | import |
| Agent | Curator Agent |
| MCP | yiai |
