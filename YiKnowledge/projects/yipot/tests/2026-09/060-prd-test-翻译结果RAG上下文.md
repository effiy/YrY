---

doc_type: module
prd_id: "PO-09-60"
title: "PO-09-60-test: 翻译结果 RAG 上下文展示 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: test
---

# PO-09-60-test: 翻译结果 RAG 上下文展示 — 测试方案

## 测试用例

### TC-01: RAG 来源返回

```
Given: YiAi RAG 索引已构建，YiKnowledge 有 yivad 项目文档
When: 调用 translateWithContext({text: "ProTable 驱动的数据视图", domain: "yivad"})
Then: 返回 {text: "...", sources: [...包含 YiKnowledge 文件路径]}
      sources 中至少有一条 file_path 包含 "yivad"
```

### TC-02: 无匹配时不显示

```
Given: 翻译文本与 YiKnowledge 内容无关
When: 调用 translateWithContext({text: "Hello world", domain: "yivad"})
Then: sources = []，TargetArea 不显示 RAG 芯片
```

### TC-03: RAG 芯片显示

```
Given: sources 包含 2 条来源
When: 渲染 TargetArea
Then: 显示 "RAG: yivad/prds/file.md · engineer/.../file.md"
      最多显示 3 个芯片
```

### TC-04: RAG 芯片 tooltip

```
Given: source 有 file_path + score
When: 鼠标悬停 RAG 芯片
Then: tooltip 显示完整路径 + 分数百分比
```

### TC-05: 加载中隐藏

```
Given: isLoading = true
When: 渲染 TargetArea
Then: RAG 芯片不显示
```

## 测试环境

- YiAi 运行，RAG 索引已构建
- YiKnowledge 有内容
- YiPot `pnpm tauri dev`