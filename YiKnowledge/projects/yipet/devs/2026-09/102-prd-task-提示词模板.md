---

doc_type: module
prd_id: "PE-09-102"
title: "PE-09-102-dev: 提示词模板 — 开发方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: task
---

# PE-09-102-dev: 提示词模板 — 开发方案

## 改动清单

### 1. 新建 `src/chat/components/TemplatePicker.vue`

**新建文件**，210 行 Vue SFC，包含：

- **8 个内置模板**，分为 4 类（Code/Docs/Q&A/Analysis）
- **搜索过滤**：按名称/内容匹配
- **分类 Tab**：All + 4 类按钮
- **变量表单**：选择模板后渲染每个 `{{variable}}` 的输入框
- **实时预览**：变量值替换占位符后的完整提示词
- **Apply**：写入 `store.state.inputTemplate`

模板定义：

| 模板 | 分类 | 变量 |
|------|------|------|
| Code Review | code | code |
| Bug Analysis | code | description, error, env |
| Write PRD | docs | feature, users |
| API Documentation | docs | endpoint, method |
| Knowledge Q&A | qa | question |
| Explain Concept | qa | concept |
| Data Analysis | analysis | data, goals |
| Summarize Content | analysis | content, format |

### 2. 集成到 `ChatToolbar.vue`

**文件**: `YiPet/src/chat/components/ChatToolbar/ChatToolbar.vue`

- 导入 `TemplatePicker` 组件
- 在 `PromptHistoryPopover` 旁边添加 `<TemplatePicker />`

### 3. 数据流

```
TemplatePicker.vue
  → 用户选择模板 → 填写变量 → 实时预览
  → Apply → store.setInputText(text)
    → state.inputTemplate = text
    → dispatchEvent('yipet:set-input')
      → ChatInput 接收并填入 textarea
```

## 验证步骤

1. 点击工具栏 Collection 图标按钮
2. 确认显示 4 个分类 Tab + 8 个模板
3. 选择 "Code Review"，填写 `code` 变量，预览显示替换后文本
4. 点击 Apply，确认输入框已填充模板内容