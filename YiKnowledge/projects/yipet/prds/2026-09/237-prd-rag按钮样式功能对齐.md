---
doc_type: prd
title: "YP-09-237: 聊天弹框 RAG 按钮样式功能与 YiVad 对齐"
status: 已完成
priority: P1
project: YiPet
project_id: yipet
owner: Chengliang.Yi
prd_month: "202609"
prd_task_id: YP-09-237
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 改进
roles: [engineer]
tags: [需求文档, RAG, 聊天, 样式对齐, 跨项目一致性]
category: 项目/Chrome扩展/需求
related:
  - ./236-体验优化-rag按钮交互改进.md
---

# YP-09-237: 聊天弹框 RAG 按钮样式功能与 YiVad 对齐

> 需求编号：YP-09-237 · 优先级：P1 · 人天：0.5d · 状态：已完成

## 背景

YiPet 聊天弹框的 RAG 按钮已在 236 中修复了交互缺陷（`unavailable` 状态 pointer-events 精准拦截 + `toggleRag` 用户反馈），但整体样式和功能内容与 YiVad `http://localhost:8848/#/ai-chat` 的 RAG 按钮仍有以下差距：

1. **弹出框样式**：内边距、圆角、分区标题分隔线、文档计数徽章等视觉元素与 YiVad 不一致
2. **交互提示缺失**：设置标签缺少 `?` 信息提示圆圈（tooltip），用户无法快速了解各选项含义
3. **上下文感知缺失**：未展示从上下文文件中推导出的 RAG 范围（derived scope bar）
4. **空状态消息**：索引未构建时的提示文本不够详细，缺少服务器端命令指引

## 目标

使 YiPet RAG 设置弹出框在**视觉样式**和**交互内容**上与 YiVad aiChat 完全对齐，确保跨项目用户体验一致。

## 范围

### 改动文件

| 文件 | 改动 |
|------|------|
| `src/chat/components/ChatToolbar/ChatToolbar.vue` | 新增 `derivedScope` computed + 范围栏模板 + 7 个 tooltip 圆圈 + 更新空状态消息 |
| `src/chat/components/ChatToolbar/styles/global.scss` | 弹出框样式对齐 + 新增 `.ct-rag-info` / `.ct-rag-scope-bar` |

### 样式对齐对比

| 样式元素 | 修改前 (YiPet) | 修改后 (对齐 YiVad) |
|----------|---------------|-------------------|
| 弹出框内边距 | `12px 14px` | `14px 16px` |
| 弹出框圆角 | `10px` | `8px` |
| 分区标题 | 无分隔线 | `::after` 伪元素横线 |
| 文档计数 | 纯文本 | 胶囊徽章 (`border-radius: 999px`) |
| 行间距 | `padding: 3px 8px; margin: 1px -4px` | `padding: 2px 6px; margin: 0 -6px` |
| 分区容器 | `margin-bottom: 6px` | `display: flex; gap: 2px; padding: 10px 0` |
| 信息提示 | 无 | 7 个 `el-tooltip` `?` 圆圈 |
| 派生范围栏 | 无 | 绿色 `ctx` 徽章栏 |
| 空状态消息 | 简略 | 含 `python -m scripts.build_index` 命令指引 |

## 关联文档

- [开发方案](../devs/2026-09/237-prd-task-rag按钮样式功能对齐.md)
- [测试方案](../tests/2026-09/237-prd-test-rag按钮样式功能对齐.md)
- [236 RAG 按钮交互改进](./236-体验优化-rag按钮交互改进.md)