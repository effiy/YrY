---

doc_type: module
prd_id: "PE-09-114"
title: "PE-09-114-test: 快速命令按钮 — 测试方案"
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

# PE-09-114-test: 快速命令按钮 — 测试方案

## 测试用例

### TC-01: 空状态显示命令按钮

```
Given: 会话无消息 (messages.length === 0)
When: 渲染 QuickButtons
Then: 显示提示词按钮 + 命令按钮行 (/stats /sessions /help)
```

### TC-02: 有消息时隐藏

```
Given: 会话有 3 条消息
When: 渲染 QuickButtons
Then: 两行按钮都不显示
```

### TC-03: 点击执行命令

```
Given: 空聊天，点击 /stats 按钮
When: runCommand('/stats')
Then: store.sendMessage('/stats') 被调用
      聊天显示个人统计表格
```

### TC-04: 处理中禁用

```
Given: s.isProcessing = true
When: 渲染 QuickButtons
Then: 所有按钮 disabled