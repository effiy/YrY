---
doc_type: test
title: "YV-09-226: 项目克隆复制 — 深度克隆项目、克隆选项配置、克隆进度与历史管理 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-226"
source_prds: ["80-prd-项目克隆复制"]
source_modules: []
---
# YV-09-226: 项目克隆复制 — 深度克隆项目、克隆选项配置、克隆进度与历史管理 — 测试规格

> 来源 PRD：[80-prd-项目克隆复制.md](../../prds/2026-09/80-prd-项目克隆复制.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：CloneConfigPanel

#### Scenario: 全选和取消全选
- **GIVEN** 克隆配置面板渲染，6 个分类复选框
- **WHEN** 点击"全选"按钮
- **THEN** 所有 6 个复选框被勾选
- **WHEN** 点击"取消全选"按钮
- **THEN** 所有复选框取消勾选

#### Scenario: 至少选择一项的校验
- **GIVEN** 所有复选框取消勾选
- **WHEN** 点击"开始克隆"按钮
- **THEN** 显示错误提示"请至少选择一项克隆内容"

### 组件测试：CloneProgress

#### Scenario: 多步骤进度展示
- **GIVEN** 克隆正在执行，当前步骤为"克隆 Issue"
- **WHEN** 渲染 CloneProgress
- **THEN** 显示 6 个步骤，第 1 步完成，第 2 步进行中，第 3-6 步待处理
- **THEN** 显示"已处理 45/120 条 Issue"

#### Scenario: 克隆失败状态
- **GIVEN** 克隆在第 3 步（标签）失败
- **WHEN** 渲染 CloneProgress
- **THEN** 第 1-2 步显示完成，第 3 步显示失败并展示错误信息
- **THEN** 显示"重试"和"取消"按钮

### 组件测试：CloneHistory

#### Scenario: 克隆历史列表展示
- **GIVEN** 有 3 条克隆历史记录
- **WHEN** 渲染 CloneHistory
- **THEN** 每条记录显示源项目名称、目标项目名称、克隆时间、内容摘要、状态
- **THEN** 点击目标项目名称可跳转到项目详情页

### 集成测试：ProjectClone

#### Scenario: 完整克隆流程
- **GIVEN** 选择源项目"前端团队"，勾选"基本设置"和"Issue 列表"
- **WHEN** 输入目标项目名称"前端团队 v2"，点击"开始克隆"
- **THEN** 显示进度条，6 个步骤依次完成
- **THEN** 克隆完成后显示成功提示，跳转到新项目详情页

#### Scenario: 克隆预览
- **GIVEN** 选择源项目并勾选克隆内容
- **WHEN** 点击"预览克隆"
- **THEN** 显示将被克隆的数据量统计（Issue 数量、标签数量等）
- **THEN** 显示预估时间

---

