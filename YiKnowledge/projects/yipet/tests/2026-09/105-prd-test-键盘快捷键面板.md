---

doc_type: test
prd_test_id: "YP-09-105"
title: "YP-09-105: 键盘快捷键面板 — 测试方案"
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

# YP-09-105: 键盘快捷键面板 — 测试方案

| 场景 | 期望 |
|------|------|
| 按 ? 键 | 面板打开 |
| 按 Escape | 面板关闭 |
| 点击遮罩 | 面板关闭 |
| 搜索 "chat" | 仅显示匹配快捷键 |
| macOS 平台 | 显示 ⌘ Cmd |
| Windows/Linux | 显示 Ctrl |
| 有高严重性冲突 | 红色警报条显示 |
| 无冲突 | 无警报 |
| 自定义快捷键 | 特殊样式区分 |