---
doc_type: test
title: "YV-09-98: 事件管理与值班 — 事件分级、值班日历、升级策略与事件指标 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-98"
source_prds: ["46-prd-事件管理与值班"]
source_modules: []
---
# YV-09-98: 事件管理与值班 — 事件分级、值班日历、升级策略与事件指标 — 测试规格

> 来源 PRD：[46-prd-事件管理与值班.md](../../prds/2026-09/46-prd-事件管理与值班.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：IncidentCard

#### Scenario: P0 事件卡片渲染
- **GIVEN** 事件 severity=P0，status=investigating，已超 SLA
- **WHEN** 渲染 IncidentCard
- **THEN** 显示红色 P0 标签、SLA 倒计时为负数（红色高亮）、当前状态"调查中"

#### Scenario: 已解决事件卡片
- **GIVEN** 事件 status=resolved，severity=P2
- **WHEN** 渲染 IncidentCard
- **THEN** 显示绿色已解决标签、解决时间

### 组件测试：IncidentTimeline

#### Scenario: 完整事件时间线
- **GIVEN** 事件有 5 个事件点（detected → acknowledged → investigating → mitigated → resolved）
- **WHEN** 渲染 IncidentTimeline
- **THEN** 5 个节点按时间顺序垂直排列，当前状态高亮，已完成状态标记为绿色

#### Scenario: 含升级记录的时间线
- **GIVEN** 事件在 investigating 阶段被升级到 L2
- **WHEN** 渲染 IncidentTimeline
- **THEN** 时间线中显示升级节点（黄色警告图标），升级记录面板可展开

### 组件测试：OnCallCalendar

#### Scenario: 值班日历渲染当前月份
- **GIVEN** 当前月有 4 周排班（A/B 组轮周，每周一确认）
- **WHEN** 渲染 OnCallCalendar
- **THEN** 每个日期显示值班人姓名，今天日期高亮，非工作日有不同的背景色

#### Scenario: 值班日历切换月份
- **GIVEN** 当前显示 9 月
- **WHEN** 点击右箭头切换到 10 月
- **THEN** 日历刷新显示 10 月的排班数据

### 集成测试：IncidentBoard

#### Scenario: 事件看板完整加载
- **GIVEN** 项目有 3 个活跃事件 + 5 个已解决事件 + 当月值班日历
- **WHEN** 加载 IncidentBoard
- **THEN** 活跃事件列表、事件统计图表、值班日历全部正确渲染

#### Scenario: 创建新事件
- **GIVEN** 点击"创建事件"按钮
- **WHEN** 填写表单（P1、标题、描述），提交
- **THEN** 事件创建成功，活跃列表刷新，通知发送给当前值班人

---

