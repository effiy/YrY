---

doc_type: module
prd_id: "PO-09-70"
title: "PO-09-70-test: CSV 导出 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-70-test: CSV 导出 — 测试方案

## 测试用例

### TC-01: 有数据时导出

```
Given: History 有 10 条记录
When: 点击 CSV 按钮
Then: 下载 yipot-history-2026-09-23.csv
      文件包含 header + 10 行数据
      中文正确显示（UTF-8 BOM）
```

### TC-02: 空数据时禁用

```
Given: History 无记录
When: 渲染页面
Then: CSV 按钮 disabled
```

### TC-03: 搜索过滤后导出

```
Given: 搜索 "hello" 过滤出 2 条
When: 点击 CSV
Then: 仅导出 2 条过滤结果