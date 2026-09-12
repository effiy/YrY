---
doc_type: test
title: "YV-09-137: 用户反馈收集 — 应用内反馈组件、反馈分类、截图附件、反馈分类面板、反馈转Issue、反馈分析 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-137"
source_prds: ["67-prd-用户反馈收集"]
source_modules: []
---
# YV-09-137: 用户反馈收集 — 应用内反馈组件、反馈分类、截图附件、反馈分类面板、反馈转Issue、反馈分析 — 测试规格

> 来源 PRD：[67-prd-用户反馈收集.md](../../prds/2026-09/67-prd-用户反馈收集.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 场景 1：用户提交 Bug 反馈

**GIVEN** 用户在 Bug 列表页面
**WHEN** 用户点击右侧 Feedback Tab，选择"Bug 报告"，填写标题和描述，截取页面截图，提交
**THEN** 反馈提交成功，显示反馈编号 #FB-XXX
**AND** 自动采集上下文（页面 URL、浏览器信息、时间戳）正确记录
**AND** 管理员收到新反馈通知
**AND** AI 预分类结果为 "bug"

### 场景 2：截取页面并标注敏感信息

**GIVEN** 用户打开 FeedbackWidget
**WHEN** 用户点击"截取当前页面"
**THEN** 自动截取当前可视区域，显示预览
**WHEN** 用户点击"标注"，用矩形框覆盖手机号区域，选择"模糊"
**THEN** 该区域被模糊处理
**AND** 标注信息保存在 screenshot metadata 中

### 场景 3：管理员审核并转 Issue

**GIVEN** 管理员在反馈管理面板，有一条待处理反馈
**WHEN** 管理员查看反馈详情，点击"接受"
**THEN** 反馈状态变为 accepted
**WHEN** 管理员点击"转 Issue"，选择"Bug"
**THEN** 创建新 Bug 记录，关联 feedback_id
**AND** 反馈状态变为 converted，converted_issue_id 记录 Bug ID
**AND** 反馈者收到通知："您的反馈已转为 Bug #BUG-456 进行处理"

### 场景 4：拒绝反馈并回复原因

**GIVEN** 管理员收到一条不合理的反馈
**WHEN** 管理员点击"拒绝"，填写拒绝原因"该功能设计如此，请参考文档 XXX"
**THEN** 反馈状态变为 declined
**AND** 反馈者收到回复通知，包含拒绝原因

### 场景 5：查看我的反馈历史

**GIVEN** 用户已提交 3 条反馈（1 条已关闭，2 条处理中）
**WHEN** 用户打开 FeedbackWidget，滚动到"我的反馈"区域
**THEN** 显示 3 条反馈记录，按提交时间倒序
**AND** 每条显示标题、状态标签、提交时间
**AND** 点击可查看详情和管理员回复

### 场景 6：反馈分析仪表盘

**GIVEN** 系统中有 50 条反馈记录（30 bug、15 suggestion、5 question）
**WHEN** 管理员打开反馈分析页面
**THEN** 显示反馈趋势图（按周/月）
**AND** 反馈类型分布饼图（bug 60%、suggestion 30%、question 10%）
**AND** 功能模块分布柱状图
**AND** 平均处理时间统计
**AND** 用户满意度趋势（关闭反馈时收集的评分）

---

