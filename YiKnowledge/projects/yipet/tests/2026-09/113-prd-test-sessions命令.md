---

doc_type: module
prd_id: "PE-09-113"
title: "PE-09-113-test: /sessions 命令 — 测试方案"
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

# PE-09-113-test: /sessions 命令 — 测试方案

## 测试用例

### TC-01: 显示最近会话

```
Given: 有 12 个会话，按更新时间排序
When: 输入 "/sessions"
Then: 显示最近 10 个会话的表格
      当前活跃会话标记 "**active**"
```

### TC-02: 项目标签显示

```
Given: 会话有 project:YiVad 标签
When: /sessions 输出
Then: Project 列显示 "YiVad"
```

### TC-03: 无标签显示 -

```
Given: 会话无 project: 标签
When: /sessions 输出
Then: Project 列显示 "-"
```

### TC-04: /help 包含

```
Given: 输入 "/help"
Then: 命令列表包含 "/sessions"
```