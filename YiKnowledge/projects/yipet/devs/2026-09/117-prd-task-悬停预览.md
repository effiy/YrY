---

doc_type: module
prd_id: "PE-09-117"
title: "PE-09-117-dev: 悬停预览 — 开发方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: task
---

# PE-09-117-dev: 悬停预览 — 开发方案

## 改动

### SessionListItem.vue 完整重写

- `previewMessages` computed: `session.messages.slice(-3)` → `{type, preview}` 
- ElPopover hover 600ms → 弹窗显示最近 3 条消息
- 用户消息: 蓝色 "You" 标签, AI消息: 紫色 "AI" 标签
- v-if/v-else: 有消息用 popover, 无消息用纯 div