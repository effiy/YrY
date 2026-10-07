---

doc_type: module
prd_id: "PE-09-102"
title: "PE-09-102-test: 提示词模板 — 测试方案"
status: 已完成
priority: P1
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-102-test: 提示词模板 — 测试方案

## 测试范围

| 测试项 | 类型 | 验证内容 |
|--------|------|----------|
| 组件渲染 | 单元 | TemplatePicker 正确渲染 8 个模板 |
| 分类筛选 | 单元 | 点击分类 Tab 过滤模板列表 |
| 搜索过滤 | 单元 | 搜索框输入匹配模板名称/内容 |
| 变量表单 | 单元 | 选择模板后显示变量输入框 |
| 预览替换 | 单元 | 填写变量后预览正确替换占位符 |
| Apply 写入 | 集成 | 点击 Apply 后 inputTemplate 更新 |
| 类型检查 | 类型 | vue-tsc --noEmit 通过 |

## 测试用例

### TC-01: 模板列表渲染

```
Given: TemplatePicker 组件挂载
When: 点击打开 popover
Then: 显示 8 个模板，4 个分类 Tab
```

### TC-02: 分类筛选

```
Given: 模板面板打开
When: 点击 "Code" 分类 Tab
Then: 仅显示 Code Review 和 Bug Analysis
```

### TC-03: 搜索过滤

```
Given: 模板面板打开
When: 输入 "review"
Then: 仅显示 Code Review 模板
```

### TC-04: 变量填充和预览

```
Given: 选择 "Code Review" 模板
When: 在 code 变量输入 "function foo() { return 1 }"
Then: 预览区显示包含该代码的完整提示词
```

### TC-05: Apply 写入输入框

```
Given: 变量已填写，预览正确
When: 点击 Apply 按钮
Then: state.inputTemplate 包含替换后的文本，popover 关闭
```

### TC-06: 空变量预览

```
Given: 选择模板但未填写任何变量
When: 查看预览
Then: 预览显示原始模板文本，占位符保持 {{variable}} 格式
```

## 测试环境

- Vitest 2 + jsdom 29
- 模拟 Pinia store：`setInputText` mock
- `npm test` 验证