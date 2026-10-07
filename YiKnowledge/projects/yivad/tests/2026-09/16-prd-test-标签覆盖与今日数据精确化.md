---

title: "16-prd-test-标签覆盖与今日数据精确化"
tags: ["test", "labels", "today"]
category: "test"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: test
status: 已完成
owner: "Chengliang Yi"
source_prds: ["16-prd-标签覆盖与今日数据精确化"]

---

## 测试用例

### TC-01: 数据质量含标签覆盖

- **操作**：进入有开放 Issue 的项目 > Overview
- **预期**：数据质量卡片显示「缺少标签」指标（PriceTag 图标）

### TC-02: 今日摘要栏 done 精确化

- **前置**：今日有 Issue 被标记为 done
- **操作**：访问首页
- **预期**：今日摘要栏 done 数 = 今日更新的 done Issue 数量

### TC-03: 类型检查

- **操作**：运行 `vue-tsc --noEmit`
- **预期**：无类型错误