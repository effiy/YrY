---
doc_type: test
title: "环境标识与切换器 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-49"
source_prds: ["23-prd-环境标识与切换器"]
source_modules: []
---
# 环境标识与切换器 — 测试规格

> 来源 PRD：[23-prd-环境标识与切换器.md](../../prds/2026-09/23-prd-环境标识与切换器.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：EnvironmentBadge

#### Scenario: 开发环境显示横幅
- **GIVEN** 当前环境为 `dev`
- **WHEN** 挂载 EnvironmentBadge 组件
- **THEN** 渲染绿色横幅，显示"开发环境"和"当前非生产环境，数据可能被重置"

#### Scenario: 生产环境不显示横幅
- **GIVEN** 当前环境为 `prod`
- **WHEN** 挂载 EnvironmentBadge 组件
- **THEN** 组件不渲染任何内容

### 组件测试：EnvironmentSwitcher

#### Scenario: 管理员切换环境
- **GIVEN** 当前用户为管理员，当前环境为 `dev`
- **WHEN** 点击环境切换器，选择 `staging`
- **THEN** localStorage 存储 "staging"，页面刷新

#### Scenario: 普通用户不可切换环境
- **GIVEN** 当前用户为普通用户
- **WHEN** 查看环境切换器
- **THEN** 仅显示当前环境，无下拉选项

### 组件测试：ProdWarningDialog

#### Scenario: 生产环境操作确认
- **GIVEN** 当前环境为 `prod`，操作为"删除项目"
- **WHEN** 调用 `open()` 并输入 "CONFIRM" 点击确认
- **THEN** Promise resolve 为 `true`

#### Scenario: 输入错误取消操作
- **GIVEN** 当前环境为 `prod`，操作为"删除项目"
- **WHEN** 调用 `open()` 并输入 "confirm"（小写）点击确认
- **THEN** 确认按钮仍为禁用状态

### Composable 测试：useEnvironment

#### Scenario: 页面标题更新
- **GIVEN** 当前环境为 `dev`
- **WHEN** 调用 `useEnvironment()`
- **THEN** `document.title` 以 `[DEV]` 开头

---

