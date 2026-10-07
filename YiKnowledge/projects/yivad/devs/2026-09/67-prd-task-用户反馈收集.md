---
prd_task_id: "YV-09-137"
title: "YV-09-137: 用户反馈收集 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "67-prd-用户反馈收集.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户反馈收集]
roles: [engineer]
benefit: "开发方案：task-用户反馈收集"
lifecycle: active
---

# YV-09-137: 用户反馈收集 — 开发方案

> 需求编号：YV-09-137 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

页面右下角反馈按钮，用户可提交 Bug/建议/好评，附带截图和页面上下文。

### 反馈类型

| 类型 | 必填字段 |
|------|---------|
| Bug 报告 | 标题、描述、截图（可选） |
| 功能建议 | 标题、描述 |
| 好评 | 评分（1-5）、评论（可选） |

### 自动采集上下文

| 字段 | 说明 |
|------|------|
| 当前页面 URL | 用户所在页面 |
| UserAgent | 浏览器信息 |
| 截图 | 当前页面截图（可选） |

> 低优先级。


### 架构方案

**技术路线**：全局反馈入口（浮动按钮/帮助菜单 → 反馈表单弹窗），提交后写入 MongoDB + 可选截图

**数据模型**：
```
MongoDB `user_feedback` 集合；字段：`type` (bug/feature/praise), `message`, `screenshot_base64`, `url`, `user_agent`, `status`
```

**组件树**：
```
FeedbackButton.vue (全局浮动) + FeedbackDialog.vue (分类 + 描述 + 截图上传) + FeedbackList.vue (管理视图)
```

**关键决策**：
截图功能使用 `html2canvas`；反馈自动附带当前页面 URL 和用户信息


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
