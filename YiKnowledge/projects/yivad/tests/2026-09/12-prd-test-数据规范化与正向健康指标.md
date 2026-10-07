---

title: "12-prd-test-数据规范化与正向健康指标"
tags: ["test", "data-normalization", "health-metrics"]
category: "test"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: test
status: 已完成
owner: "Chengliang Yi"
source_prds: ["12-prd-数据规范化与正向健康指标"]

---

## 测试用例

### TC-01: Status 值已统一

- **操作**：查询 issues 集合 status 分布
- **预期**：所有 status 值为 snake_case（无 "To Do"/"Done" 等）

### TC-02: 首页 Issue 类型缺失告警

- **操作**：访问首页
- **预期**：侧边栏显示「N 个 Issue 缺少类型」告警（noTypeCount > 20 时）

### TC-03: 项目详情 Bug 解决率

- **操作**：进入有 Bug 的项目 Overview Tab
- **预期**：Bugs 卡片 sub 文字显示「XX% resolved · resolved/total」
- **预期**：解决率 >80% 时卡片左边框为绿色

### TC-04: 项目详情 Docs 卡片

- **操作**：进入有 YiKnowledge 文档的项目
- **预期**：Stats Strip 显示 Docs 卡片（数值 + "总计" sub）

### TC-05: 数据质量含 Issue 类型

- **操作**：进入有开放 Issue 的项目
- **预期**：数据质量卡片包含「缺少类型」指标（Collection 图标）

### TC-06: 类型检查

- **操作**：运行 `vue-tsc --noEmit`
- **预期**：无类型错误