---
doc_type: test
title: "YV-09-102: 状态页面 — 服务健康指标、事件历史、维护公告与订阅通知 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-102"
source_prds: ["49-prd-状态页面"]
source_modules: []
---
# YV-09-102: 状态页面 — 服务健康指标、事件历史、维护公告与订阅通知 — 测试规格

> 来源 PRD：[49-prd-状态页面.md](../../prds/2026-09/49-prd-状态页面.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：ServiceStatusBar

#### Scenario: 全部服务正常
- **GIVEN** 3 个服务状态均为 operational
- **WHEN** 渲染 ServiceStatusBar
- **THEN** 3 个服务显示绿色勾号，顶部横幅显示"所有服务正常运行"

#### Scenario: 某服务中断
- **GIVEN** 服务 A 状态为 major_outage，服务 B/C 正常
- **WHEN** 渲染 ServiceStatusBar
- **THEN** 顶部横幅显示红色"部分服务中断"，服务 A 显示红色叉号

### 组件测试：UptimeChart

#### Scenario: 90 天正常运行时间时间线
- **GIVEN** 90 天中 3 天有降级事件
- **WHEN** 渲染 UptimeChart
- **THEN** 90 个格子大部分为绿色，3 个黄色格子对应事件日期，正常运行时间显示 96.7%

#### Scenario: 无历史数据
- **GIVEN** 新服务无历史正常运行时间数据
- **WHEN** 渲染 UptimeChart
- **THEN** 显示"数据收集中"提示，不显示错误

### 组件测试：IncidentList

#### Scenario: 活跃事件列表
- **GIVEN** 2 个活跃事件（1 个 investigating，1 个 monitoring）
- **WHEN** 渲染 IncidentList
- **THEN** 2 个事件卡片，不同状态颜色正确，显示最后更新时间

#### Scenario: 事件展开查看时间线
- **GIVEN** 事件有 4 条更新记录
- **WHEN** 点击事件卡片展开
- **THEN** 显示 4 条更新时间线，按时间倒序排列

### 集成测试：StatusPage

#### Scenario: 公开访问
- **GIVEN** 用户在未登录状态
- **WHEN** 访问 `/status`
- **THEN** 页面正常加载，显示服务状态，无需跳转登录页

#### Scenario: 订阅 Email 通知
- **GIVEN** 用户在订阅面板输入 Email
- **WHEN** 点击"订阅"
- **THEN** 显示"验证邮件已发送"，订阅状态为 pending_verification

---

