---

title: "13-prd-test-分析仪表盘图表增强"
tags: ["test", "analytics", "charts"]
category: "test"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: test
status: 已完成
owner: "Chengliang Yi"
source_prds: ["13-prd-分析仪表盘图表增强"]

---

## 测试用例

### TC-01: Issue 老化 KPI 显示

- **操作**：进入项目详情 > 分析 Tab
- **预期**：KPI 区域显示 >7d/30d/90d 老化计数和百分比
- **验证**：>90d 卡片使用红色（danger）样式

### TC-02: 优先级健康饼图

- **操作**：进入有开放 Issue 的项目分析 Tab
- **预期**：Issue 分析区域显示优先级分布环形饼图
- **验证**：P0 红色、P1 橙色、P2 黄色、P3 蓝色

### TC-03: 周完成速度柱状图

- **操作**：进入有已关闭 Issue 的项目分析 Tab
- **预期**：显示最近 8 周绿色柱状图，顶部显示总完成数

### TC-04: 空数据状态

- **操作**：进入无 Issue 的项目分析 Tab
- **预期**：图表区域显示空状态提示

### TC-05: 类型检查

- **操作**：运行 `vue-tsc --noEmit`
- **预期**：无类型错误