---
doc_type: test
title: "YV-09-227: 项目移交转让 — 项目所有权转移、转让流程、转让历史与审计日志 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-227"
source_prds: ["81-prd-项目移交转让"]
source_modules: []
---
# YV-09-227: 项目移交转让 — 项目所有权转移、转让流程、转让历史与审计日志 — 测试规格

> 来源 PRD：[81-prd-项目移交转让.md](../../prds/2026-09/81-prd-项目移交转让.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：TransferPanel

#### Scenario: 正常发起转让
- **GIVEN** 当前用户是项目"A"的 Owner
- **WHEN** 选择项目"A"，选择接收方"李四"，点击"发起转让"
- **THEN** 显示成功提示"转让请求已发送"，接收方"李四"收到通知

#### Scenario: 非 Owner 发起转让被拒绝
- **GIVEN** 当前用户是项目"A"的 Admin（非 Owner）
- **WHEN** 尝试发起转让
- **THEN** 显示错误提示"仅项目所有者可以发起转让"

### 组件测试：TransferRequests

#### Scenario: 接收方接受转让
- **GIVEN** 接收方有一条待处理的转让请求
- **WHEN** 点击"接受"按钮
- **THEN** 项目所有权转移，原 Owner 降级为 Admin，接收方成为 Owner
- **THEN** 转让状态变为"completed"

#### Scenario: 接收方拒绝转让
- **GIVEN** 接收方有一条待处理的转让请求
- **WHEN** 点击"拒绝"，输入拒绝原因"当前工作负载已满"
- **THEN** 转让状态变为"rejected"，发起方收到通知

### 组件测试：BulkTransfer

#### Scenario: 批量转让部分成功
- **GIVEN** 批量转让 3 个项目，其中 1 个项目的接收方不是成员
- **WHEN** 发起批量转让
- **THEN** 2 个项目转让成功，1 个失败并显示错误"接收方不是项目成员"
- **THEN** 批量转让状态为"partial_failed"

### 集成测试：ProjectTransfer

#### Scenario: 完整转让流程
- **GIVEN** 发起方发起转让，接收方接受
- **WHEN** 所有权转移完成
- **THEN** 转让历史显示完整记录
- **THEN** 审计日志记录所有步骤
- **THEN** 项目详情页的 Owner 字段更新

---

