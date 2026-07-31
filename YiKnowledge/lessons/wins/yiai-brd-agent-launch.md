---
title: YiAi BRD 智能体上线
tags: [成功案例, YiAi, BRD, 智能体, 上线]
category: lessons/wins
created: 2026-07-31
updated: 2026-07-31
source: internal
type: summary
status: stable
---

# YiAi BRD 智能体上线

## 1. 背景

YiAi 需要从 PRD/需求描述自动生成 BRD（Business Requirement Document）。涉及：

- 多步骤推理（市场 → 用户 → 方案 → 风险 → 指标）
- 结构化输出（YiDoc BRD 模板）
- 与 YiKnowledge 知识库联动（检索竞品 / 方法论）
- 流式输出 + 可编辑 + 一键回流 YiDoc

## 2. 方案

分阶段推进：

| 阶段 | 内容 |
|---|---|
| 1 | prompt 设计 + 输出结构契约 |
| 2 | YiKnowledge 检索接入（RAG） |
| 3 | 流式输出 + 前端渲染 |
| 4 | 可编辑 + 回流 YiDoc |
| 5 | 灰度 + 反馈闭环 |

## 3. 关键成功因素

1. **prompt 与结构契约先行**：先定输出 JSON schema，再写 prompt，避免后端解析崩
2. **RAG 召回质量**：YiKnowledge 内嵌 embedding + top-k 调优（top 5 → top 8）
3. **流式体验**：SSE + 前端增量渲染，用户可中断
4. **可编辑回流**：生成不是终点，用户编辑后写回 YiDoc
5. **反馈闭环**：每条 BRD 记录 user feedback，迭代 prompt
6. **灰度发布**：先内部 5 人，再全员

## 4. 量化效果

- BRD 撰写时间：平均 2h → 25min（-79%）
- 结构完整性：90%+（人工抽检）
- 用户编辑回流率：60%（说明生成质量可用但仍需微调）
- 上线后 0 P0 bug

## 5. 可复用经验

### 智能体方法论

- **结构契约先行**：JSON schema 驱动 prompt，解析不崩
- **RAG > 长 prompt**：知识库检索比塞进 context 更准
- **流式 + 可中断**：长生成必有用户感知
- **生成 → 编辑 → 回流**：生成不是终点
- **反馈闭环**：user feedback 是下一轮 prompt 优化的燃料

### 风险点

- prompt 漂移：每次模型升级要重跑评测
- RAG 召回偏：top-k 调优 + 多路召回（向量 + BM25）
- 生成幻觉：关键数字 / 名字必须可溯源到 YiKnowledge

## 6. 后续追踪

- prompt 评测集建立（每周跑）
- YiKnowledge 内嵌 embedding 升级（bge-large → bge-m3）
- 探索 multi-agent：市场分析 + 方案设计 + 风险评估 分工

## 7. 与其他项目关系

- YiKnowledge：提供 RAG 检索源（methodology / product / industry）
- YiDoc：BRD 最终落点，模板复用
- YiVad aicr：CodeViewer / ChatPanel 组件复用

## 8. 关联记忆

- 个人 memory: `project_yry_knowledge_bridge.md`（YiKnowledge 与 YiAi 联动）
- 工具：[BRD 生成 prompt](../../resources/prompts/brd-generation-prompt.md)
- 工具：[YiDoc BRD 模板](../../projects/YiAi/templates/brd.md)
