---

doc_type: task
prd_task_id: "YP-09-102"
title: "YP-09-102: 选中文本即时翻译 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 0.15
source_prd: "102-基础设施-选中文本即时翻译.md"

type: task
---

# YP-09-102: 选中文本即时翻译 — 技术设计

## 实现

```typescript
async function translateSelection(fromLang?, toLang?) {
  const sel = window.getSelection()?.toString()?.trim();
  if (!sel || sel.length < 2) { notify('Select text first', 'info'); return; }
  const results = await getTranslation().translate({
    text: sel, from_lang: fromLang || 'auto',
    to_lang: toLang || 'zh', providers: ['openai', 'ollama']
  });
  const output = results.filter(r => r.text && !r.error)
    .map(r => `[${r.cached ? r.provider + ' (cached)' : r.provider}] ${r.text}`).join('\n');
  state.inputTemplate = `[Translate] ${output}`;
  if (!state.visible) state.visible = true;
}
```

## 错误处理

- 无选中 → notify info
- API 失败 → notify error
- 结果空 → notify warning