---
key: sc_multilingual_brd
name: 多语言BRD生成
status: planning
priority: p1
createdAt: 1753920000000
updatedAt: 1753920000000
---

# 多语言BRD生成

## 描述 (description)

智能体根据所选目标国家/语言，将已生成的 BRD 翻译并适配为对应语言版本，保留所有结构化字段与表格，输出符合当地合规要求的 BRD。

## 触发条件 (trigger)

用户在 story 详情页点击「生成多语言版本」并选择目标国家/语言。

## 前置条件 (prerequisites)

- 该 story 已存在 BRD 初稿
- 目标语言在支持列表内（zh-CN / en / de / fr / es / it 等）
- 用户具备该 story 的编辑权限

## 预期结果 (expectedResult)

- 目标语言 BRD 与原语言结构一致（章节、表格、字段一一对应）
- 涉及国家、品牌、合规条款按目标国本地化
- 生成记录写入 story 的 attachments 字段
- 切换语言时零延迟加载已生成版本

## 步骤 (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | story 已有中文 BRD 初稿，用户在详情页 |
| 2 | When | 用户点击「生成多语言版本」并选择目标国家 Germany / en |
| 3 | Then | 前端调用 YiAi 多语言生成接口 |
| 4 | And | LLM 按目标语言流式翻译各章节 |
| 5 | Then | 翻译完成后写入 story.attachments |
| 6 | And | 详情页多语言切换器出现新版本入口 |
| 7 | When | 用户切换至 en 版本 |
| 8 | Then | 详情页加载并展示 en 版本 BRD |

## 标签 (tags)

- AI
- BRD
- i18n
- LLM

## 关联文件 (files)

- filePath: YiVad/src/views/story/index.vue
- filePath: YiVad/src/api/modules/story.ts
- filePath: YiAi/src/domain/ai/chat.py
