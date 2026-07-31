# YiAi

 AI + BRD 智能体。

## 项目卡片

| 字段 | 值 |
|---|---|
| 定位 | 业务 AI 助理 + BRD 自动化智能体 |
| 主要技术栈 | 详见 `engineering/claude.md` |
| 当前主负责人 | 详见 Story `assignee` 字段 |
| 业务域 | 海外服务域、售后业务、BRD 审批流 |

## 子目录

- [stories/](./stories/) — 业务需求内容（Story/Scene + BRD 章节）
  - [ai-chat-function/](./stories/ai-chat-function/) — AI 聊天功能
    - [user-send-message/](./stories/ai-chat-function/user-send-message/) — 用户发送消息
    - [conversation-history-management/](./stories/ai-chat-function/conversation-history-management/) — 会话历史管理
  - [overseas-after-sales-ai-brd-agent/](./stories/overseas-after-sales-ai-brd-agent/) —  AI BRD 智能体
    - [brd-draft-generation/](./stories/overseas-after-sales-ai-brd-agent/brd-draft-generation/) — BRD 草稿生成
    - [multilingual-brd/](./stories/overseas-after-sales-ai-brd-agent/multilingual-brd/) — 多语言 BRD
    - [brd-approval-flow/](./stories/overseas-after-sales-ai-brd-agent/brd-approval-flow/) — BRD 审批流
- [engineering/](./engineering/) — 项目工程文档镜像
  - `claude.md` — 项目 CLAUDE.md 镜像
  - `readme.md` — 项目 README.md 镜像
