---

doc_type: task
prd_task_id: "YP-09-104"
title: "YP-09-104: Web 搜索结果显示 — 技术设计"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "104-基础设施-Web搜索结果显示.md"

type: task
---

# YP-09-104: Web 搜索结果显示 — 技术设计

## 实现

**文件**：`src/chat/components/WebSearchResults.vue`

**域名权威分级**：high（.gov/.edu/GitHub/MDN 等顶级域名）、medium（一般）、low（无法解析）。通过 `domainTier(url)` 函数判断。

**组件 props**：`results: WebSearchResult[]`, `images?: WebImageResult[]`, `query?: string`, `timingMs?: number`

**功能**：favicon 显示、复制引用、图片灯箱、搜索耗时标签、权威来源计数

## 非功能需求

| 维度 | 实现 |
|------|------|
| 性能 | 虚拟列表（结果 < 50 条不启用） |
| 安全 | URL 新标签页 `noopener` |