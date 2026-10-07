---
doc_type: prd
prd_id: "PO-09-70"
title: "YiPot History 页面 CSV 导出 — 需求规格"
tags: [需求文档, YiPot, CSV导出, History, 数据导出]
category: projects/yipot/prds
created: 2026-09-23
updated: 2026-09-23
source: internal
type: 需求
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Chengliang.Yi
prd_month: "202609"
estimate_frontend: 0.1
review_status: 已评审
issue_type: 功能增强
roles: [engineer]
acceptance_criteria:
  - History 工具栏显示 CSV 按钮
  - 导出 6 列完整数据
  - UTF-8 BOM 中文兼容
  - 空数据按钮禁用
  - 搜索过滤后仅导出可见记录
related_modules: ["PO-09-70"]
related_tests: ["PO-09-70"]
---

# YiPot History 页面 CSV 导出 — 需求规格

> 编号: PO-09-70 · 优先级: P2 · 工时: ~0.1d · 状态: 已完成

> **文档职责**: 定义 YiPot 设置页 History Tab 的 CSV 数据导出功能需求。

---

## 一、背景

YiPot 在设置页 History Tab 展示翻译历史记录（`translation_records`），用户可搜索和浏览。此前缺少数据导出能力，用户无法将翻译记录导出到 Excel/Google Sheets 等外部工具进行分析或存档。

## 二、功能需求

### FR-1: CSV 导出按钮

**文件**: `YiPot/src/window/Config/pages/History/index.jsx`

工具栏刷新按钮旁新增 CSV 导出按钮:
- `isIconOnly size='sm' variant='light'`
- 无数据时 `isDisabled={!items.length}`

### FR-2: 导出格式

| 列 | 字段 | 示例 |
|----|------|------|
| Date | `item.timestamp` | 2026-09-23T10:30:00.000Z |
| Source | `item.source` | en |
| Target | `item.target` | zh |
| Service | `item.service` | openai |
| Text | `item.text` | Hello world |
| Result | `item.result` | 你好世界 |

### FR-3: 技术规范

- `\uFEFF` BOM 前缀确保 Excel 正确识别 UTF-8
- Text/Result 字段双引号转义 (`""`)
- 文件名: `yipot-history-YYYY-MM-DD.csv`
- 搜索过滤后仅导出当前可见记录

---

## 三、验收标准

- [x] 有数据时按钮可点击，下载正确格式 CSV
- [x] 空数据时按钮 disabled
- [x] 中文正确显示（UTF-8 BOM + Excel 验证）
- [x] 搜索过滤后仅导出过滤结果
- [x] 文件名含当前日期

---

## 四、关联文档

| 类型 | 文件 |
|------|------|
| 开发方案 | `devs/2026-09/70-prd-task-CSV导出.md` |
| 测试方案 | `tests/2026-09/70-prd-test-CSV导出.md` |