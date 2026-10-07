---

doc_type: module
prd_id: "PE-09-106"
title: "PE-09-106-test: 翻译快捷键 — 测试方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: test
---

# PE-09-106-test: 翻译快捷键 — 测试方案

## 测试用例

### TC-01: 快捷键触发翻译

```
Given: 页面有选中文本 "Hello world"
When: 按下 Ctrl+Shift+Y
Then: translateSelection() 被调用
      翻译结果填入聊天输入框
```

### TC-02: 无选中文本提示

```
Given: 页面无选中文本
When: 按下 Ctrl+Shift+Y
Then: translateSelection() 检测 sel.length < 2
      通知 "Select text on the page first"
```

### TC-03: 快捷键注册

```
Given: 键盘注册初始化完成
When: 显示快捷键速查面板 (?)
Then: 列表包含 "Ctrl+Shift+Y — 翻译选中文本"
```

## 测试环境

- Chrome 加载 YiPet 扩展
- YiAi 运行在 localhost:10086