---

title: "11-prd-test-数据质量与指标覆盖增强"
tags: ["test", "data-quality", "gap-metrics"]
category: "test"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: test
status: 已完成
owner: "Chengliang Yi"
source_prds: ["11-prd-数据质量与指标覆盖增强"]

---

## 测试用例

### TC-01: 首页优先级缺失告警

- **前置**：数据库存在开放 Issue 无 priority
- **操作**：访问首页
- **预期**：侧边栏显示「N 个 Issue 缺少优先级」黄色警告

### TC-02: 首页截止日期缺失告警

- **前置**：数据库存在开放 Issue 无 due_date
- **操作**：访问首页
- **预期**：侧边栏显示「N 个 Issue 缺少截止日期」黄色警告

### TC-03: 项目详情数据质量卡片

- **操作**：进入任意有开放 Issue 的项目 Overview Tab
- **预期**：
  - 在 Bug 严重度下方显示「数据质量」卡片
  - 显示 3 个指标：缺少优先级/缺少截止日期/未分配负责人
  - 每个指标显示图标、数字、标签
  - >20 缺口使用橙色，否则蓝色
  - 点击跳转 Issue 列表

### TC-04: 空数据状态

- **操作**：访问无开放 Issue 的项目
- **预期**：不显示数据质量卡片（dataQualityIssues 为空）

### TC-05: 项目 Key 已修复

- **操作**：查询 `project_key="YiVad"` 的 Issue
- **预期**：返回 0 结果（已全部迁移为 "yivad"）

### TC-06: 类型检查

- **操作**：运行 `vue-tsc --noEmit`
- **预期**：无类型错误