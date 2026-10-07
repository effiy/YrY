---
prd_task_id: "YV-09-205"
title: "YV-09-205: 用户帮助与支持 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "79-prd-用户帮助与支持.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 用户帮助与支持]
roles: [engineer]
benefit: "开发方案：task-用户帮助与支持"
lifecycle: active
---

# YV-09-205: 用户帮助与支持 — 开发方案

> 需求编号：YV-09-205 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

帮助中心页面：常见问题/使用指南/快捷键参考/联系支持。

### 内容分类

| 分类 | 内容 |
|------|------|
| 快速入门 | 5 分钟上手指南 |
| 功能指南 | 各模块使用说明 |
| 快捷键 | 键盘快捷键列表 |
| 常见问题 | FAQ |
| 联系支持 | 反馈表单 |

> 低优先级。


### 架构方案

**技术路线**：全局帮助入口（Header 帮助按钮 → 侧边栏/弹窗），包含：文档链接、快捷键参考、常见问题、反馈入口

**数据模型**：
```
MongoDB `help_articles` 集合或复用 YiKnowledge markdown 文件
```

**组件树**：
```
HelpPanel.vue (侧边栏抽屉 + 搜索) + HelpArticle.vue (Markdown 渲染)
```

**关键决策**：
帮助内容源：优先复用 YiKnowledge 已有文档（通过 `/read-file` 获取），避免内容复制


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
