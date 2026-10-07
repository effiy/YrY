---
prd_task_id: "YV-09-128"
title: "YV-09-128: 知识共享空间 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "58-prd-知识共享空间.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 知识共享空间]
roles: [engineer]
benefit: "开发方案：task-知识共享空间"
lifecycle: active
---

# YV-09-128: 知识共享空间 — 开发方案

> 需求编号：YV-09-128 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

团队知识 Wiki：Markdown 编辑 + 分类目录 + 搜索，与 YiKnowledge 同步。

### 功能

| 功能 | 说明 |
|------|------|
| Wiki 页面 | Markdown 编辑 + 预览 |
| 目录树 | 可拖拽排序的页面层级 |
| 同步 | 与 YiKnowledge 双向同步 |
| 权限 | 编辑/查看权限控制 |

> 低优先级。


### 架构方案

**技术路线**：独立页面 (`/share`)，知识库文件分享链接生成 + 访问控制

**数据模型**：
```
MongoDB `share_links` 集合；字段：`token`, `file_path`, `expires_at`, `access_count`, `password_hash`
```

**组件树**：
```
ShareManager.vue (已创建的分享列表) + ShareLinkDialog.vue (生成链接 + 权限设置)
```

**关键决策**：
分享链接鉴权：公开（无密码）vs 密码保护 vs 仅登录用户；文件内容通过 YiAi `/read-file` 端点获取


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
