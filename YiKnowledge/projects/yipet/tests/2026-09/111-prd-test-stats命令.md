---

doc_type: module
prd_id: "PE-09-111"
title: "PE-09-111-test: /stats 命令 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-111-test: /stats 命令 — 测试方案

## 测试用例

### TC-01: /stats 显示统计

```
Given: store 有 12 sessions, 142 messages, 230 knowledge files
When: 输入 "/stats" 并发送
Then: chat 中显示 markdown 表格，包含上述统计
```

### TC-02: /stats 出现在 /help 中

```
Given: 输入 "/help"
When: 显示帮助信息
Then: 命令列表包含 "| /stats | Show personal usage stats |"
```

### TC-03: /stats 不影响会话

```
Given: 当前会话有 5 条消息
When: 输入 "/stats"
Then: 消息列表增加 1 条（stats 表格）
      不发送到 LLM（return 提前退出）