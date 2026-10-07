---

doc_type: test
prd_test_id: "PO-09-101"
title: "PO-09-101: 历史搜索功能 — 测试方案"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
source_task: "100-prd-task-历史搜索功能.md"

type: test
---

# PO-09-101: 历史搜索 — 测试方案

| 场景 | 期望 |
|------|------|
| 输入 "error" | 仅显示匹配行 |
| 清空搜索 | 恢复全部 |
| 搜索时分页 | total 基于结果重算 |
| 无匹配 | emptyContent |
| SQL 注入 | 参数化查询安全 |

## 测试命令

```bash
cd YiPot && pnpm tauri dev  # Settings → History
```