---
doc_type: module
prd_task_id: "YV-09-137"
title: "YV-09-137: 用户反馈收集 — 应用内反馈组件、反馈分类、截图附件、反馈分类面板、反馈转Issue、反馈分析 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "67-prd-用户反馈收集.md"
---

# YV-09-137: 用户反馈收集 — 应用内反馈组件、反馈分类、截图附件、反馈分类面板、反馈转Issue、反馈分析 — 开发任务

> 来源 PRD：[67-prd-用户反馈收集.md](../prds/2026-09/67-prd-用户反馈收集.md)
> 需求编号：YV-09-137 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现 FeedbackService（提交、列表、状态管理） | `YiAi/services/feedback/feedback_service.py` | 提交反馈成功，生成反馈编号，列表查询正常 | 0.04 |
| 2 | 实现 FeedbackClassifier（AI 预分类） | `YiAi/services/feedback/feedback_classifier.py` | 输入反馈内容，输出类型建议（准确率 > 70%） | 0.03 |
| 3 | 实现 FeedbackToIssueService + FeedbackAnalytics | `YiAi/services/feedback/feedback_to_issue_service.py` + `feedback_analytics.py` | 反馈转 Bug 成功，分析数据聚合正确 | 0.03 |
| 4 | 实现 FeedbackWidget UI 组件 | `YiVad/src/components/feedback/FeedbackWidget.vue` | 侧边栏展开/收起，表单填写，上下文自动采集 | 0.05 |
| 5 | 实现 ScreenshotCapture + AnnotationTool | `YiVad/src/components/feedback/ScreenshotCapture.vue` + `AnnotationTool.vue` | 自动截图，标注（矩形/模糊），裁剪 | 0.05 |
| 6 | 实现反馈管理面板 + 详情页 | `YiVad/src/views/system/feedback-panel.vue` + `feedback-detail.vue` | 列表筛选、接受/拒绝/转 Issue、详情查看 | 0.05 |
| 7 | 实现反馈分析页面 + 全局注册 | `YiVad/src/views/system/feedback-analytics.vue` + `App.vue` | 图表展示反馈趋势、分类分布、满意度 | 0.05 |

**总人天：0.3d**

---
