---

title: "14-prd-test-流程健康与数据修复"
tags: ["test", "process-health"]
category: "test"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: test
status: 已完成
owner: "Chengliang Yi"
source_prds: ["14-prd-流程健康与数据修复"]

---

## 测试用例

### TC-01: 今日摘要显示评审数

- **操作**：访问首页
- **预期**：今日摘要栏显示「近期: 完成 X · 新建 Y · 缺陷修复 Z · 待评审 N」

### TC-02: 评审阻塞告警

- **前置**：inReviewCount > 10
- **操作**：访问首页
- **预期**：建议区域显示蓝色告警「N 个 Issue 待评审阻塞」

### TC-03: 孤儿模块已修复

- **操作**：查询 modules 集合
- **预期**：无 project_key 为空的模块

### TC-04: 类型检查

- **操作**：运行 `vue-tsc --noEmit`
- **预期**：无类型错误