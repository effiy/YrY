---

doc_type: module
prd_id: "PE-09-111"
title: "PE-09-111: /stats 命令 — 聊天中显示个人使用统计摘要"
status: 已完成
priority: P2
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: 需求
---

# PE-09-111: /stats 斜杠命令

> 个人数据洞察：输入 `/stats` 在聊天中直接显示个人使用统计（会话/消息/知识/Bug），无需切换到其他视图。

## 范围

- `/stats` 命令：显示 Sessions / Favorites / Total Messages / Knowledge Files / Bugs / RAG / Model
- 数据来自已有 Pinia store，无需 API 调用
- 添加到 `/help` 命令列表

## 示例输出

```
## Personal Stats
| Metric | Value |
|--------|-------|
| Sessions | 12 (3 today) |
| Favorites | 2 |
| Total Messages | 142 |
| Knowledge Files | 230 |
| Recent Bugs | 5 |
| RAG Enabled | Yes |
| Model | qwen3.5 |
```