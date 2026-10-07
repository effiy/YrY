---

doc_type: module
prd_id: "PE-09-104"
title: "PE-09-104-test: 翻译质量反馈 — 测试方案"
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

# PE-09-104-test: 翻译质量反馈 — 测试方案

## 测试用例

### TC-01: 翻译完成后显示反馈按钮

```
Given: 用户选中页面文本并触发翻译
When: translateSelection 成功返回
Then: _lastTranslation 被设置 {source, target, provider, ...}
      ChatInput footer 显示 "Rate translation: 👍 👎"
```

### TC-02: 点击 👍 提交好评

```
Given: _lastTranslation 已设置
When: 点击 👍 按钮
Then: submitTranslationFeedback('good') 被调用
      translationService.feedback({rating: 'good', ...}) 成功
      通知 "Feedback (good) recorded"
      _lastTranslation 置为 null，按钮消失
```

### TC-03: 点击 👎 提交差评

```
Given: _lastTranslation 已设置
When: 点击 👎 按钮
Then: submitTranslationFeedback('bad') 被调用
      反馈数据写入 MongoDB translation_feedback {rating: 'bad'}
```

### TC-04: 无翻译时不显示反馈按钮

```
Given: _lastTranslation 为 null
When: 渲染 ChatInput
Then: "Rate translation" 区域不显示
```

### TC-05: 反馈失败不阻塞

```
Given: YiAi 不可达
When: 点击 👍 按钮
Then: catch 块静默处理，_lastTranslation 置为 null
      按钮消失，不影响后续翻译
```

### TC-06: 类型检查通过

```
Given: 修改了 types.ts, stores/chat.ts, ChatInput.vue
When: 运行 vue-tsc --noEmit
Then: 无类型错误
```

## 测试环境

- Vitest 2 + jsdom 29
- Mock translationService.feedback
- Mock notify 函数
- `npm test` + `npm run typecheck`