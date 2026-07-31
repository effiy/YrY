---
key: sc_brd_draft_generation
name: BRD初稿生成
status: planning
priority: p0
createdAt: 1753920000000
updatedAt: 1753920000000
---

# BRD初稿生成

## 描述 (description)

业务方输入售后业务的自然语言描述，智能体调用 LLM 生成符合 12 章节模板的 BRD 初稿，可直接导入 YiVad story 页面进行编辑。

## 触发条件 (trigger)

业务方在 BRD 智能体入口提交业务描述并点击「生成 BRD」。

## 前置条件 (prerequisites)

- 用户已登录 YiVad
- 已配置可用的 Ollama LLM 服务
- 业务描述长度满足最小阈值（如 ≥ 50 字）

## 预期结果 (expectedResult)

- 30 秒内流式输出完整 BRD 初稿
- 输出内容覆盖 BRD 模板全部 12 个章节
- 生成完成后自动创建一条 story 记录并跳转至详情页
- 生成失败时给出明确错误提示并保留输入内容

## 步骤 (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | 用户已登录 YiVad，进入 BRD 智能体入口 |
| 2 | When | 用户在输入框填写售后业务描述并点击「生成 BRD」 |
| 3 | Then | 前端调用 YiAi BRD 生成接口，SSE 流式返回 |
| 4 | And | UI 实时渲染 BRD 各章节内容 |
| 5 | Then | 生成完成后调用 create_document 写入 stories 集合 |
| 6 | And | 自动跳转到该 story 的详情页 |
| 7 | When | LLM 返回为空或超时 |
| 8 | Then | 显示错误提示并保留用户输入 |

## 标签 (tags)

- AI
- BRD
- LLM
- SSE

## 关联文件 (files)

- filePath: YiVad/src/views/story/index.vue
- filePath: YiAi/src/domain/ai/chat.py
- filePath: YiAi/src/services/ai/chat_service.py
