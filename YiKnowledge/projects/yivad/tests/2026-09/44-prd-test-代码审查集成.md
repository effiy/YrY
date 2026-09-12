---
doc_type: test
title: "YV-09-96: 代码审查集成 — GitHub/GitLab PR 集成、审查自动化与审查时间分析 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-96"
source_prds: ["44-prd-代码审查集成"]
source_modules: []
---
# YV-09-96: 代码审查集成 — GitHub/GitLab PR 集成、审查自动化与审查时间分析 — 测试规格

> 来源 PRD：[44-prd-代码审查集成.md](../../prds/2026-09/44-prd-代码审查集成.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：PrCard

#### Scenario: PR 卡片正常渲染
- **GIVEN** PR 状态为 'open'，CI 通过，1 个 Reviewer 待审查
- **WHEN** 渲染 PrCard 组件
- **THEN** 显示 PR 标题、状态标签（绿色 'Open'）、CI 通过图标、Reviewer 头像和状态

#### Scenario: PR 已合并展示
- **GIVEN** PR 状态为 'merged'，merged_at 不为 null
- **WHEN** 渲染 PrCard
- **THEN** 显示紫色 'Merged' 标签和合并时间

### 组件测试：ReviewChecklist

#### Scenario: 检查清单渲染
- **GIVEN** 项目配置了 5 个检查项分属 3 个类别
- **WHEN** 渲染 ReviewChecklist
- **THEN** 按类别分组显示，每项有复选框

#### Scenario: 检查项勾选交互
- **GIVEN** 检查清单中第 1 项未勾选
- **WHEN** 点击该项的复选框
- **THEN** 复选框变为勾选状态，计数更新

### 集成测试：Issue 详情页 PR 集成

#### Scenario: 无关联 PR
- **GIVEN** Issue 无关联 PR
- **WHEN** 查看 Issue 详情
- **THEN** PR 区域显示"暂无关联 PR"空状态 + "创建 PR"提示链接

#### Scenario: 有 3 个关联 PR
- **GIVEN** Issue 关联 3 个 PR（1 open + 1 merged + 1 closed）
- **WHEN** 查看 Issue 详情
- **THEN** 3 张 PR Card 按时间倒序显示，merged 的卡片有合并时间

### 组件测试：ReviewAnalytics

#### Scenario: 审查时间分析图表
- **GIVEN** 过去 30 天有 15 个 PR 的审查数据
- **WHEN** 渲染 ReviewAnalytics
- **THEN** 显示平均首次审查时间、平均合并时间、审批率饼图

---

