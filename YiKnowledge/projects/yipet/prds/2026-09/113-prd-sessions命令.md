---

doc_type: module
prd_id: "PE-09-113"
title: "PE-09-113: /sessions 命令 — 聊天中快速查看最近会话列表"
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

# PE-09-113: /sessions 斜杠命令

> 会话管理增强：输入 `/sessions` 在聊天中显示最近 10 个会话的表格（标题/消息数/项目/时间），支持侧边栏折叠时快速浏览。

## 示例输出

```
## Recent Sessions
| # | Title | Msgs | Project | Age |
|---|-------|------|---------|-----|
| 1 | YiVad bug fix discussion | 12 msg | YiVad | today **active** |
| 2 | Architecture review | 25 msg | YiAi | 2d ago |
| 3 | API design notes | 8 msg | - | 1d ago |
Total: 12 sessions.
```

## 范围

- `/sessions` 命令：显示最近 10 个会话
- 当前活跃会话标记 **active**
- 项目标签使用第 21 轮新增的 `project:` 标签