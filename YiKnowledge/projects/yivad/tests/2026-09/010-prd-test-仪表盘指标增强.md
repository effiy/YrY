---

title: "10-prd-test-仪表盘指标增强"
tags: ["test", "dashboard", "metrics"]
category: "test"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: test
status: 已完成
owner: "Chengliang Yi"
source_prds: ["10-prd-仪表盘指标增强"]

---

## 测试用例

### TC-01: 首页未分配 Issue 警告

- **前置**：数据库存在未分配 Issue
- **操作**：访问首页
- **预期**：
  - 侧边栏显示「N 个未分配任务需要认领」红色警告
  - 点击跳转至 Issue 列表页

### TC-02: 首页严重 Bug 警告

- **前置**：数据库存在 Critical 等级未关闭 Bug
- **操作**：访问首页
- **预期**：
  - 侧边栏显示「N 个严重 Bug 需要修复」红色警告
  - 点击跳转至 Bug 列表页

### TC-03: 首页 Bug 严重度分布卡片

- **操作**：访问首页
- **预期**：
  - 侧边栏显示「Bug 严重度」卡片（当有开放 Bug）
  - 严重度按 Critical > Major > Medium > Minor > Trivial 顺序排列
  - 每行显示名称、条状图、计数
  - 颜色正确：Critical 红色、Major 橙色、Medium 蓝色、Minor 灰色

### TC-04: 项目详情 Bug 严重度分布

- **操作**：进入任意项目详情页 Overview Tab
- **预期**：
  - 在 README 上方显示「Bug 严重度分布」模块（当有未关闭 Bug）
  - 头部显示「未关闭 N 个」
  - 严重度分布条状图与首页样式一致

### TC-05: 空数据状态

- **操作**：访问无 Bug 的页面
- **预期**：
  - 首页不显示 Bug 严重度卡片（无 bugSeverityGroups 数据）
  - 项目详情不显示 Bug 严重度模块（无未关闭 Bug）

### TC-06: 类型检查

- **操作**：运行 `vue-tsc --noEmit`
- **预期**：无类型错误