---

doc_type: module
prd_task_id: "YP-09-07"
title: "YP-09-07: 国际化与多语言支持 — MessageKey 类型联合 + t() 三层回退 + 语言热切换 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "14-功能实现-国际化与多语言支持.md"
source_okr: [yipet-004]

type: task
---

# YP-09-07: 国际化与多语言支持 — 开发方案

> 来源 PRD：[14-功能实现-国际化与多语言支持.md](../../prds/2026-09/14-功能实现-国际化与多语言支持.md)
> 需求编号：YP-09-07 · 优先级：P1 · 人天：1.0d

---

## 一、方案概述

建立 YiPet 国际化体系：79+ MessageKey 编译时类型检查、t() 三层回退 (当前语言→en→key)、localizeDOM() 批量翻译、运行时语言热切换。

### 三层回退策略

```
t("sendButton")
  → zh_CN: "发送"          (命中当前语言)
  → (若缺失) en: "Send"    (回退到英文)
  → (若缺失) "sendButton"  (显示 key 本身，便于定位问题)
```

---

## 二、核心模块设计

### 2.1 MessageKey 类型联合

```typescript
// src/i18n/message-keys.ts
// 79+ 个编译时类型检查的 i18n key
type MessageKey =
  // 聊天
  | "sendButton" | "stopButton" | "inputPlaceholder"
  | "newSession" | "deleteSession" | "exportSession"
  // 知识库
  | "knowledgeTree" | "ragSearch" | "scopeFile" | "scopeDir"
  | "ragStatusBuilt" | "ragStatusBuilding" | "ragStatusNotBuilt"
  // 皮肤
  | "colorPicker" | "rolePicker" | "modelPicker" | "petPreview"
  // 错误
  | "errorNetwork" | "errorTimeout" | "errorAuth" | "errorUnknown"
  // (共 79+ keys)
  ;

// t() 函数 — 编译时检查 key 有效性
function t(key: MessageKey, lang?: string): string {
  const locale = lang || currentLocale.value;
  return messages[locale]?.[key] || messages["en"]?.[key] || key;
}
```

### 2.2 localizeDOM

```typescript
// src/i18n/dom-localizer.ts
function localizeDOM(root: HTMLElement = document.body): void {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n") as MessageKey;
    if (key) el.textContent = t(key);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder") as MessageKey;
    if (key) (el as HTMLInputElement).placeholder = t(key);
  });
}

// Vue 指令
app.directive("i18n", {
  mounted(el, binding) { el.textContent = t(binding.value as MessageKey); },
  updated(el, binding) { el.textContent = t(binding.value as MessageKey); },
});
```

### 2.3 语言热切换

```typescript
// stores/i18n.ts
const currentLocale = useStorage("yipet:locale", "en");

watch(currentLocale, (newLocale) => {
  localizeDOM(); // 重新翻译所有 [data-i18n] 元素
  // Vue 响应式自动更新 v-i18n 指令
});
```

### 2.4 日期时间智能格式化

```typescript
function formatRelativeTime(ts: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diff = ts - Date.now();
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(diff / 86400000);
  return rtf.format(days, "day");
}
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 人天 |
|------|------|---------|------|
| 1 | MessageKey 类型联合定义 (79+ keys) | `message-keys.ts` | 0.25 |
| 2 | en/zh_CN 翻译文件 | `_locales/en/messages.json`, `zh_CN/` | 0.25 |
| 3 | t() + localizeDOM + v-i18n 指令 | `i18n/` | 0.25 |
| 4 | 语言切换 Store + 集成测试 | `stores/i18n.ts`, `tests/` | 0.25 |

**合计：1.0d**

## 四、完成定义

- [ ] 79+ MessageKey 编译时类型检查 (错误 key → tsc error)
- [ ] t() 三层回退 (当前→en→key)
- [ ] localizeDOM() 批量翻译
- [ ] 运行时语言热切换 (无需刷新)
- [ ] en + zh_CN 100% 覆盖
- [ ] `tsc --noEmit` 零错误