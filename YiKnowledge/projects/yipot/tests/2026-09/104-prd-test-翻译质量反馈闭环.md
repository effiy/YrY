---

doc_type: test
prd_test_id: "PO-09-104"
title: "PO-09-104: 翻译质量反馈闭环 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-104: 质量反馈闭环 — 测试方案

| 场景 | 期望 |
|------|------|
| 翻译后点击 👍 | Toast 确认 + MongoDB 写入 |
| 翻译后点击 👎 | Toast 确认 + MongoDB 写入 |
| 结果为空 | 按钮 disabled |
| YiAi 不可达 | 静默失败，不阻断 UI |
| YiVad Dashboard | feedback.good/bad 数值正确 |

## 测试命令

```bash
cd YiPot && pnpm tauri dev  # 翻译 → 点击 👍 → 检查 YiVad Dashboard
```