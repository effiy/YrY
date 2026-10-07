---

doc_type: module
prd_id: "PE-09-118"
title: "PE-09-118: /search 命令 — 从聊天中搜索 YiKnowledge 内容"
status: 已完成
priority: P1
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: 需求
---

# PE-09-118: /search 知识搜索命令

> 跨项目搜索：对齐 YiVad 全局搜索能力。输入 `/search <query>` 在聊天中搜索 YiKnowledge 内容，结果以表格展示。

## 示例输出

```
## Knowledge Search: "RPC 协议"
| # | File | Snippet |
|---|------|---------|
| 1 | projects/yiai/workflows/05-RPC协议规范.md | RPC 协议完整规范请求响应错误码方法契约 |
| 2 | projects/yiai/workflows/架构设计/06-架构-跨项目数据流全景.md | 所有数据通过 RPC 信封流转 |
```

## 范围

- YiPet API 层新增 `KnowledgeService.search()` → YiAi `/knowledge-search`
- `/search <query>` 命令：显示最多 8 条结果
- 60s TTL 缓存（YiAi 后端缓存）
- 无结果时显示提示

## 验收标准

- [ ] `/search RPC 协议` 返回 YiKnowledge 匹配结果表格
- [ ] 无结果时显示 "No results for ..."
- [ ] 空查询提示用法