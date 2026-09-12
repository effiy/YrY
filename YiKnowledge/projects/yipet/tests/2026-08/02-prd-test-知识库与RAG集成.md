---
doc_type: test
title: "知识库与 RAG 集成 — 知识树浏览、RAG 聊天、文件预览与子问题分解 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-03"
source_prds: ["02-功能实现-知识库与RAG集成"]
source_modules: []
---

# 知识库与 RAG 集成 — 测试规格

> 来源 PRD：[02-功能实现-知识库与RAG集成.md](../../prds/2026-08/02-功能实现-知识库与RAG集成.md)
> 提取日期：2026-09-11

---

## 测试场景

### 功能验证

- **GIVEN** 用户打开知识树面板
- **WHEN** 浏览 YiKnowledge 目录结构
- **THEN** 目录树正确渲染，文件可点击预览

- **GIVEN** 用户在 RAG 聊天中输入问题
- **WHEN** 发送消息触发 RAG 检索
- **THEN** 返回检索增强的回答，引用来源文件

### 边界测试

- 空知识库目录的展示
- 超大 Markdown 文件的加载性能
- 多层嵌套目录的树渲染

### 异常测试

- RAG 后端不可用时的降级提示
- 文件读取失败时的错误提示
- @提及解析失败时的回退行为

## 验收标准

- [ ] 知识树浏览正常，文件预览支持 Markdown/代码/图片
- [ ] RAG 聊天返回检索增强的正确回答
- [ ] @提及自动补全和解析正常工作
- [ ] 异常路径有合理的降级/错误提示