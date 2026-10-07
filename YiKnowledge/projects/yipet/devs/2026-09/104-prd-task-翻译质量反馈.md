---

doc_type: module
prd_id: "PE-09-104"
title: "PE-09-104-dev: 翻译质量反馈 — 开发方案"
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

# PE-09-104-dev: 翻译质量反馈 — 开发方案

## 改动清单

### 1. `chat/types.ts` — ChatState 新增字段

```typescript
_lastTranslation?: {
  source: string; target: string; provider: string;
  fromLang: string; toLang: string;
} | null;
```

### 2. `chat/stores/chat.ts` — 翻译状态追踪 + 反馈提交

**translateSelection 增强**（存储翻译上下文）：
```typescript
state._lastTranslation = {
  source: sel, target: output, provider: bestProvider,
  fromLang: fromLang || 'auto', toLang: targetLang,
};
```

**新增 submitTranslationFeedback**：
```typescript
async function submitTranslationFeedback(rating: 'good' | 'bad') {
    const last = state._lastTranslation;
    if (!last) return;
    try {
      const translation = getTranslation();
      if (translation) {
        await translation.feedback({
          source: last.source, target: last.target, rating,
          provider: last.provider, from_lang: last.fromLang, to_lang: last.toLang,
        });
        notify(`Feedback (${rating}) recorded`, 'success');
      }
    } catch { /* best-effort */ }
    state._lastTranslation = null;
}
```

**新增 clearTranslationFeedback**：
```typescript
function clearTranslationFeedback() {
    state._lastTranslation = null;
}
```

**导出**：
```typescript
translateSelection, submitTranslationFeedback, clearTranslationFeedback,
```

### 3. `ChatInput.vue` — 反馈按钮 UI

在 ci-footer-left 中新增：
```html
<div v-if="store.state._lastTranslation" class="ci-translation-feedback">
  <span class="ci-feedback-label">Rate translation:</span>
  <el-button size="small" text @click="store.submitTranslationFeedback('good')">👍</el-button>
  <el-button size="small" text @click="store.submitTranslationFeedback('bad')">👎</el-button>
</div>
```

### 4. 数据流

```
ChatInput 用户选中文本翻译
  → store.translateSelection()
    → translationService.translate({text, providers: ['openai','ollama']})
      → YiAi translate RPC → 返回 [{provider, text}]
    → state._lastTranslation = {source, target, provider, ...}
      → ChatInput 渲染 "Rate translation: 👍 👎"
        → 点击 👍 → submitTranslationFeedback('good')
          → translationService.feedback({source, target, rating: 'good', ...})
            → YiAi translate_service.translation_feedback()
              → MongoDB translation_feedback.insert_one()
                → YiVad TranslationAnalytics Dashboard 汇总展示
```

## 验证步骤

1. 在任意页面选中一段文本
2. 点击翻译按钮（或快捷键）
3. 确认输入区底部出现 "Rate translation: 👍 👎"
4. 点击 👍，确认通知 "Feedback (good) recorded"
5. 确认按钮消失，翻译文本保留在输入框