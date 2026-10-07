---

doc_type: task
prd_task_id: "YP-09-105"
title: "YP-09-105: 键盘快捷键面板 — 技术设计"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "105-基础设施-键盘快捷键面板.md"

type: task
---

# YP-09-105: 键盘快捷键面板 — 技术设计

## 实现

**文件**：`src/chat/components/CheatSheetOverlay.vue` + `src/shared/shortcuts/keyboardRegistry.ts`

**触发**：`?` 键 → KeyboardRegistry → CustomEvent bridge → `visible = true`

**4 类分组**：Pet Controls 🐾 / Chat 💬 / Navigation 🧭 / Utilities ⚙

**平台感知**：macOS 显示 ⌘ Cmd，其他显示 Ctrl

**冲突检测**：`knownConflicts` — high severity（与浏览器冲突）、low severity（与页面快捷键冲突）

**搜索**：`searchQuery` → `filteredShortcuts` — 匹配 id/description/keys/category

## 非功能需求

| 维度 | 实现 |
|------|------|
| 关闭 | Escape / 点击遮罩 |
| 性能 | computed 缓存过滤 |