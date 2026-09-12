---
doc_type: test
title: "YiVad 九月迭代 — Project 页面功能模块重构 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-01"
source_prds: ["00-prd-需求总览"]
source_modules: []
---
# YiVad 九月迭代 — Project 页面功能模块重构 — 测试规格

> 来源 PRD：[00-prd-需求总览.md](../../prds/2026-09/00-prd-需求总览.md)
> 提取日期：2026-09-11

---

## 9. 测试策略

### 9.1 测试分层

```mermaid
graph TD
  subgraph "L4: 手动回归 — 本次必须 100% 通过"
    MR[列表页 20 用例 + 详情页 12 用例<br/>dev server 手动验证]
  end

  subgraph "L3: 集成测试 — 本次不强制"
    IT[detail.vue 框架 + 组件通信<br/>Vitest 自动]
  end

  subgraph "L2: 组件测试 — 本次不强制"
    CT[4 个新 Tab 组件<br/>Vitest + @vue/test-utils 自动]
  end

  subgraph "L1: 单元测试 — 本次不强制"
    UT[composable 纯函数: stats, risk, filter<br/>Vitest 自动]
  end

  UT --> CT --> IT --> MR

  style MR fill:#d4edda,stroke:#28a745
  style IT fill:#fff3cd,stroke:#ffc107
  style CT fill:#fff3cd,stroke:#ffc107
  style UT fill:#fff3cd,stroke:#ffc107
```

> L1-L3 计划在十月迭代补充，本次迭代仅要求 L4 手动回归 100% 通过。

### 9.2 手动回归测试用例

#### 列表页（20 个用例）

| # | 用例 | 操作 | 预期结果 |
|----|------|------|----------|
| 1 | 页面加载 | 访问 `/project` | 项目卡片正确渲染，统计卡片显示正确数据 |
| 2 | 日期过滤 | 点击日期导航前后箭头 | 项目列表和数据按日期过滤 |
| 3 | 日期清除 | 点击 "Clear date filter" | 恢复显示所有项目 |
| 4 | 统计卡片点击 | 点击 "At risk" 卡片 | 应用 `flagged=1` 过滤 |
| 5 | 搜索 | 输入项目名称/标识符关键字 | 项目列表按关键字过滤 |
| 6 | 排序 | 切换排序方式 | 项目列表按所选方式排序 |
| 7 | 升序/降序 | 点击排序方向按钮 | 切换升序/降序 |
| 8 | 状态过滤 | 选择 Active/Archived | 显示对应状态的项目 |
| 9 | Starred 过滤 | 点击 Starred 按钮 | 仅显示 starred 项目 |
| 10 | 图表过滤 | 点击图表中的状态/优先级/类型条 | 应用对应维度过滤 |
| 11 | 风险过滤 | 点击 ProjectAttention 中的风险标签 | 应用对应风险过滤 |
| 12 | 过滤 pill 操作 | 点击 pill 的 × 按钮 | 移除该过滤条件 |
| 13 | Undo 过滤 | 点击 undo 按钮 | 恢复上一个过滤状态 |
| 14 | 视图切换 | 切换到 List 视图 | 显示列表视图 |
| 15 | CSV 导出 | 点击 Export 按钮 | 下载 CSV 文件 |
| 16 | 新建项目 | 点击 New Project，填写表单 | 项目创建成功 |
| 17 | 编辑项目 | 点击项目卡的编辑按钮 | 编辑弹窗打开，修改后保存成功 |
| 18 | 归档/恢复 | 选择项目，点击 Archive/Restore | 项目状态变更 |
| 19 | 批量操作 | 多选项目，点击 Archive | 批量归档成功 |
| 20 | 点击项目卡 | 点击项目卡主体 | 导航到 `/project/{key}` |

#### 详情页（12 个用例）

| # | 用例 | 操作 | 预期结果 |
|----|------|------|----------|
| 1 | 页面加载 | 访问 `/project/{key}` | 项目详情正确渲染 |
| 2 | Overview Tab | 默认显示 | README.md 预览、统计侧边栏、模块列表、活动动态正确渲染 |
| 3 | Requirements Tab | 切换到 Requirements | 需求列表正确渲染，过滤和搜索正常 |
| 4 | Issues Tab | 切换到 Issues | IssueList 组件正确渲染 |
| 5 | Modules Tab | 切换到 Modules | ModuleList 组件正确渲染 |
| 6 | Docs Tab | 切换到 Docs | 文档列表正确渲染，点击可预览 |
| 7 | Bugs Tab | 切换到 Bugs | BugList 组件正确渲染 |
| 8 | Members Tab | 切换到 Members | 成员列表正确渲染，添加/删除成员正常 |
| 9 | URL Tab 参数 | 访问 `/project/{key}?tab=members` | 自动切换到 Members Tab |
| 10 | 日期过滤 | 切换日期导航 | Overview 和 Requirements 数据按日期过滤 |
| 11 | 返回列表 | 点击 "Projects" 返回按钮 | 导航回 `/project` |
| 12 | 404 处理 | 访问不存在的 `/project/{invalid}` | 显示 "Project not found" 错误状态 |

### 9.3 回归测试环境

| 环境要求 | 说明 |
|----------|------|
| YiAi 后端 | 必须运行，提供数据接口 |
| 浏览器 | Chrome 最新版 |
| 测试数据 | 使用现有项目数据（PLANE 等），无需准备测试数据 |
| 网络条件 | 正常网络 + Chrome DevTools 慢网络模拟（Fast 3G） |

---

