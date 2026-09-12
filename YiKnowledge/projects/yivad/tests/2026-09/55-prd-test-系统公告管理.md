---
doc_type: test
title: "YV-09-121: 系统公告管理 — 定向公告、定时发布、模板管理、可关闭记忆与分析统计 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-121"
source_prds: ["55-prd-系统公告管理"]
source_modules: []
---
# YV-09-121: 系统公告管理 — 定向公告、定时发布、模板管理、可关闭记忆与分析统计 — 测试规格

> 来源 PRD：[55-prd-系统公告管理.md](../../prds/2026-09/55-prd-系统公告管理.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：GlobalBanner

#### Scenario: 多条公告轮播
- **Given** 3 条 active Banner 公告（非 critical）
- **When** 渲染 GlobalBanner
- **Then** 显示轮播控件（圆点指示器），默认显示第一条
- **And** 每 5 秒自动切换到下一条

#### Scenario: 用户关闭公告
- **Given** 一条可关闭的 info 公告
- **When** 用户点击关闭按钮 (x)
- **Then** 公告消失，出现"公告已关闭"的短暂提示
- **And** 调用 `dismiss` API 记录关闭状态
- **And** 该公告在 7 天内不再显示

#### Scenario: critical 公告强制展示
- **Given** 一条 critical 级别公告（dismissible=false）
- **When** 渲染公告
- **Then** 显示模态框，无关闭按钮
- **And** 只有"我已了解"确认按钮
- **And** 确认后记录已读但不消失（下次访问仍显示直到过期）

### 组件测试：TargetRuleEditor

#### Scenario: 按角色定向
- **Given** TargetRuleEditor 空白状态
- **When** 选择"按角色" → 勾选 "admin" 和 "pm"
- **Then** 生成的规则为 `{type: 'roles', roles: ['admin', 'pm']}`

#### Scenario: 组合规则
- **Given** TargetRuleEditor
- **When** 选择"组合规则" → 添加子规则"角色=pm" AND "项目=proj-001"
- **Then** 生成的规则为 `{type: 'composite', operator: 'and', rules: [...]}`

### 组件测试：AnnounceForm

#### Scenario: 创建定时发布公告
- **Given** 管理员填写标题、内容、选择"定时发布"、设置时间
- **When** 提交表单
- **Then** 公告状态为 scheduled，publish_at 为设置的时间
- **And** 列表显示该公告的定时状态

#### Scenario: 表单校验
- **Given** 管理员未填写标题
- **When** 提交表单
- **Then** 显示"标题为必填项"的错误提示
- **And** 公告未被创建

---

