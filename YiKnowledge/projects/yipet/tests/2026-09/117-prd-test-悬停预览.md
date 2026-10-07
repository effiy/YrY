---

doc_type: module
prd_id: "PE-09-117"
title: "PE-09-117-test: 悬停预览 — 测试方案"
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

# PE-09-117-test: 悬停预览 — 测试方案

## 测试用例

### TC-01: 有消息时 hover 弹出
```
Given: 会话有 5 条消息
When: hover 会话项 600ms
Then: 弹出显示最近 3 条 (You/AI 标签 + 80 字符预览)
```

### TC-02: 空消息不弹出
```
Given: 新会话无消息
When: hover 会话项
Then: 不弹出，使用普通 div 渲染
```

### TC-03: typecheck
```
Given: SessionListItem.vue 修改
When: vue-tsc --noEmit
Then: 无类型错误
```