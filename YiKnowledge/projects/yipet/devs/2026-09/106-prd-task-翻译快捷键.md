---

doc_type: module
prd_id: "PE-09-106"
title: "PE-09-106-dev: 翻译快捷键 — 开发方案"
status: 已完成
priority: P2
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"

type: task
---

# PE-09-106-dev: 翻译快捷键 — 开发方案

## 改动清单

### 1. `shared/shortcutTypes.ts` — 新增快捷方式定义

```typescript
{ id: 'translate-selection', keys: 'Ctrl+Shift+Y',
  description: '翻译选中文本', category: 'chat',
  scope: 'global', customizable: true },
```

### 2. `chat/index.ts` — 注册事件监听器

```typescript
window.addEventListener('yipet:shortcut:translate-selection', () => {
    store.translateSelection();
});
```

### 3. 数据流

```
用户选中文本 → Ctrl+Shift+Y
  → KeyboardRegistry 匹配到 translate-selection
    → dispatchEvent('yipet:shortcut:translate-selection')
      → store.translateSelection()
        → window.getSelection() → translationService.translate()
          → 结果填入 state.inputTemplate
```

## 验证步骤

1. 在任意页面选中一段文本
2. 按 Ctrl+Shift+Y
3. 确认翻译结果出现在聊天输入框中