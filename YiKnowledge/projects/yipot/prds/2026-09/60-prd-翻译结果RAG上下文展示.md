---

doc_type: module
prd_id: "PO-09-60"
title: "PO-09-60: 翻译结果展示 RAG 上下文来源 — YiPot TargetArea 中显示术语来源"
status: 已完成
priority: P2
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"

type: 需求
---

# PO-09-60: 翻译结果展示 RAG 上下文来源

> 跨项目透明度改进：YiAi `translate_with_context` 利用 YiKnowledge RAG 检索领域术语增强翻译，但 YiPot UI 不显示使用了哪些术语来源。

## 背景

YiAi `services/translation/context_service.py` 的 `translate_with_context` 方法：
1. 接收 `domain` 参数，通过 RAG 引擎查询 `YiKnowledge/projects/<domain>/` 下的领域术语
2. 将术语注入翻译系统提示词，提升技术文档翻译准确率
3. 当前返回仅翻译文本字符串，不返回使用的 RAG 来源

用户无法知道：
- 翻译是否使用了领域知识增强
- 使用了哪些 YiKnowledge 文件的术语
- 术语是否准确（无法溯源验证）

## 范围

**In scope**：
- YiAi `translate_with_context` 返回格式改为 `{text, sources}` 字典
- YiPot `yiaiAdapter.ts` 透传 `sources` 字段
- YiPot TargetArea 在翻译结果下方显示 RAG 来源芯片（路径 + 分数）

**Out of scope**：
- 字典翻译引擎的 RAG 增强（当前仅 LLM 引擎支持）
- 用户手动选择术语源

| 优先级 | 故事 | 验收标准 |
|--------|------|----------|
| P2 | 后端返回来源 | `translate_with_context` 返回 `{text: string, sources: Array<{file_path, score, snippet}>}` |
| P2 | 前端透传 | YiPot `translateViaYiAi` 返回包含 `ragSources` 的结果 |
| P2 | UI 展示 | 翻译结果下方显示 1-3 个 RAG 来源芯片，点击可展开片段 |

## 验收标准

- [ ] 使用 AI 引擎翻译技术文档时，若启用 RAG 上下文，UI 显示来源芯片
- [ ] 每个芯片显示 YiKnowledge 文件路径和检索分数
- [ ] 无 RAG 上下文时不显示芯片区域

## 关联

- YiAi：[context_service.py](../../yiai/devs/2026-09/)
- YiVad 参考：MessageBubble 中的 RagMetaBadge/RagSourcesPanel