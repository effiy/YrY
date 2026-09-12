---
doc_type: test
title: "YV-09-229: 项目拆分 — 单项目拆分为多项目、Issue 选择、成员分配与配置复制 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-229"
source_prds: ["83-prd-项目拆分"]
source_modules: []
---
# YV-09-229: 项目拆分 — 单项目拆分为多项目、Issue 选择、成员分配与配置复制 — 测试规格

> 来源 PRD：[83-prd-项目拆分.md](../../prds/2026-09/83-prd-项目拆分.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：SplitConfigPanel

#### Scenario: 添加和删除子项目
- **GIVEN** 拆分配置面板渲染
- **WHEN** 点击"添加子项目"，输入名称"前端模块"
- **THEN** 子项目列表新增一项"前端模块"
- **WHEN** 点击删除该子项目
- **THEN** 子项目从列表中移除

#### Scenario: 自动分配规则配置
- **GIVEN** 子项目列表中有 2 个子项目
- **WHEN** 为子项目"A"配置标签过滤"前端"，为子项目"B"配置标签过滤"后端"
- **THEN** 自动分配规则正确保存

### 组件测试：IssueAllocator

#### Scenario: 按标签自动分配
- **GIVEN** 源项目有 10 个 Issue，5 个标签为"前端"，5 个标签为"后端"
- **WHEN** 点击"自动分配"
- **THEN** 5 个"前端" Issue 分配到子项目"A"，5 个"后端" Issue 分配到子项目"B"

#### Scenario: 手动拖拽分配
- **GIVEN** Issue 列表中有未分配的 Issue
- **WHEN** 拖拽 Issue 到子项目"B"
- **THEN** Issue 分配到子项目"B"，子项目 Issue 计数 +1

### 组件测试：SplitTargetConfig

#### Scenario: 成员分配推荐
- **GIVEN** 子项目"A"分配了 5 个 Issue，成员"张三"参与了其中 4 个
- **WHEN** 渲染子项目配置面板
- **THEN** 成员"张三"排在推荐列表第一位，参与度 4

#### Scenario: 配置复制选择
- **GIVEN** 配置复制清单
- **WHEN** 勾选"标签"和"自定义字段"，取消勾选"自动化规则"
- **THEN** 仅标签和自定义字段配置被复制到子项目

### 集成测试：ProjectSplit

#### Scenario: 完整拆分流程
- **GIVEN** 源项目"全栈平台"有 50 个 Issue
- **WHEN** 创建 2 个子项目，自动分配 Issue，预览拆分结果，确认拆分
- **THEN** 2 个子项目创建成功，Issue 正确分配
- **THEN** 源项目 Issue 标记为"已迁移至 [子项目]"
- **THEN** 成员按参与度正确分配到子项目

---

