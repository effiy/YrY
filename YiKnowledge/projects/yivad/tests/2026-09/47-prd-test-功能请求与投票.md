---
doc_type: test
title: "YV-09-100: 功能请求与投票 — 用户投票、权重体系、功能排名与全生命周期状态追踪 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-100"
source_prds: ["47-prd-功能请求与投票"]
source_modules: []
---
# YV-09-100: 功能请求与投票 — 用户投票、权重体系、功能排名与全生命周期状态追踪 — 测试规格

> 来源 PRD：[47-prd-功能请求与投票.md](../../prds/2026-09/47-prd-功能请求与投票.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：VoteButton

#### Scenario: 未投票时显示投票按钮
- **GIVEN** 用户未对该功能投票，且还有剩余票数
- **WHEN** 渲染 VoteButton
- **THEN** 显示空心投票图标、文字"投票"、按钮可点击

#### Scenario: 已投票时显示已投票状态
- **GIVEN** 用户已对该功能投票
- **WHEN** 渲染 VoteButton
- **THEN** 显示实心投票图标、文字"已投票"、悬停显示"点击撤回"

### 组件测试：FRequestCard

#### Scenario: 高票数功能卡片
- **GIVEN** 功能请求 vote_count=25，status=under_review
- **WHEN** 渲染 FRequestCard
- **THEN** 显示"25 票"、橙色"评审中"标签、投票按钮

#### Scenario: 已发布功能卡片
- **GIVEN** 功能请求 status=released，linked_release="v1.2.0"
- **WHEN** 渲染 FRequestCard
- **THEN** 显示绿色"已发布"标签、关联版本号、投票按钮禁用（不可撤回）

### 组件测试：MyVotes

#### Scenario: 用户的投票列表
- **GIVEN** 用户已投票 3 个功能，还剩 7 票
- **WHEN** 渲染 MyVotes
- **THEN** 显示"3/10 票已使用"，列出 3 个已投票功能，每个可撤回

#### Scenario: 票数用完
- **GIVEN** 用户已投票 10 个功能，剩余 0 票
- **WHEN** 渲染 MyVotes
- **THEN** 显示"10/10 票已用完"，提示"请先撤回其他投票"

### 集成测试：FeatureRequest

#### Scenario: 功能请求完整流程
- **GIVEN** 用户提交功能请求"支持深色模式"
- **WHEN** PM 审核通过（status→planned），开发者完成开发（status→in_progress），发布上线（status→released）
- **THEN** 状态时间线完整记录 4 次变更，所有投票用户收到上线通知

#### Scenario: 热度排名变化
- **GIVEN** 10 个功能请求按票数排名
- **WHEN** 用户给排名第 8 的功能投票
- **THEN** 排名实时更新，该功能可能上升到第 7 位（如果票数超过前一名）

---

