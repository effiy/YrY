---
title: 多语言（i18n）专项 — 开发模块
tags: [yivad, dev, i18n, vue-i18n, 国际化, L10N]
category: projects/yivad/devs
created: 2026-09-12
updated: 2026-09-12
source: YiVad
type: dev_module
status: active
project: YiVad
project_key: yivad
prd: 85-prd-多语言专项优化与补充.md
tests: 85-test-多语言专项优化与补充.md
effort: m
risk: low
---

# 开发模块：多语言（i18n）专项优化与补充

> 对应 PRD：[85-prd-多语言专项优化与补充.md](../../prds/2026-09/85-prd-多语言专项优化与补充.md)
> 对应测试：[85-test-多语言专项优化与补充.md](../../tests/2026-09/85-test-多语言专项优化与补充.md)

## 0. 技术方案总览

### 0.1 分层改造清单

```
┌─────────────────────────────────────────────────────────────┐
│  文档层（4 篇）                                               │
│    08-规范-国际化规范.md  /  PRD  /  Dev(本文)  /  Test       │
├─────────────────────────────────────────────────────────────┤
│  配置入口层                                                   │
│    languages/index.ts  +  languages/modules/index.ts         │
│    → 顶部 JSDoc 文档链接 + fallbackLocale 补充说明            │
├─────────────────────────────────────────────────────────────┤
│  运行时切换层                                                 │
│    Header/components/Language.vue                            │
│    → 自身国际化 + documentElement.lang/dir 同步               │
├─────────────────────────────────────────────────────────────┤
│  工具函数层                                                   │
│    utils/index.ts → getTimeState 返回 locale 键               │
├─────────────────────────────────────────────────────────────┤
│  组件扫盲层（重点）                                           │
│    views/**  +  components/**  +  stores/**  +  routers/**   │
│    → ElMessage / ElNotification / ElMessageBox 裸字符串替换   │
├─────────────────────────────────────────────────────────────┤
│  校验工具层（可选 CI）                                         │
│    scripts/check-i18n-locales.mjs                            │
│    → 键路径一致性 + 占位符一致性                              │
└─────────────────────────────────────────────────────────────┘
```

### 0.2 关键设计决策

| # | 决策 | 理由 | 备选 |
|---|------|------|------|
| D1 | 不引入第三个语言 | PRD Out of Scope，预留 `documentElement.dir` 接口即可 | 一次加 ja-JP / zh-TW |
| D2 | getTimeState 返回 locale 键而非直接返回字符串 | 保持国际化入口唯一（t()），避免调用方重复判断 | 在 home 页写死切换逻辑 |
| D3 | ElConfigProvider 仍然在 App.vue 顶层挂载 | 避免切换语言时 Element Plus 控件不刷新 | 给全局 App 加 `:key="i18n.locale.value"` 强制重建 |
| D4 | 校验脚本走 Node CLI 而非 Vite 插件 | CI 复用方便，本地 `pnpm i18n:check` 也能跑 | 写成 Vite 插件，dev server 实时报错 |

## 1. 文档交付清单

| # | 路径 | 状态 | 验收要点 |
|---|------|------|---------|
| 1 | `workflows/开发规范/08-规范-国际化规范.md` | ✅ 已交付 | 章节完整：核心原则 / 目录 / 键命名 / 用法 / 扫盲指引 / FAQ |
| 2 | `prds/2026-09/85-prd-多语言专项优化与补充.md` | ✅ 已交付 | Front-matter 完整 + 8 条 FR + UAT 矩阵 + 追踪矩阵 |
| 3 | `devs/2026-09/85-dev-多语言专项优化与补充.md` | 🚧 本文 | §2～§6 每节均有可执行的子项 |
| 4 | `tests/2026-09/85-test-多语言专项优化与补充.md` | 🚧 待交付 | 用例矩阵覆盖 T-01 ～ T-10 |

README 引用确认：
- 日常开发 → "添加国际化文本" → `08-规范-国际化规范.md` ✅
- 代码审查 → "是否使用 $t() 而非硬编码文本" → 同上 ✅

## 2. 配置入口层改造

### 2.1 `src/languages/index.ts`

**改动点**：顶部 JSDoc 入口 + 导出辅助函数（`getAvailableLocales`、`normalizeLocale`）。

```ts
/**
 * YiVad 多语言入口（vue-i18n 11.x，Composition API 模式）。
 *
 * 规范文档：file:///Users/yi/YrY/YiKnowledge/projects/yivad/workflows/开发规范/08-规范-国际化规范.md
 * PRD：file:///Users/yi/YrY/YiKnowledge/projects/yivad/prds/2026-09/85-prd-多语言专项优化与补充.md
 *
 * 新增键 → 编辑对应 modules/<name>/zh.ts + en.ts
 * 新增模块 → 编辑 modules/index.ts 注册两个文件
 */

import { createI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { messages } from "./modules";

export type LocaleCode = "zh" | "en";
export const AVAILABLE_LOCALES: LocaleCode[] = ["zh", "en"];

export function normalizeLocale(input: string): LocaleCode {
  const key = input.toLowerCase().replace("_", "-");
  if (key.startsWith("zh")) return "zh";
  return "en";
}

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === "string" && (AVAILABLE_LOCALES as string[]).includes(v);
}

const isDev = process.env.NODE_ENV !== "production";

const i18n = createI18n({
  legacy: false,
  locale: normalizeLocale(getBrowserLang()),
  fallbackLocale: "en",
  missingWarn: isDev,
  fallbackWarn: isDev,
  messages
});

export default i18n;
```

### 2.2 `src/languages/modules/index.ts`

同样顶部加 JSDoc，并用 `as const` 保证 messages 类型收窄（对校验脚本友好）。

```ts
/**
 * 所有 locale 模块的注册入口。
 *
 * 「新增一个模块」的标准步骤：
 *   1) 新建 modules/<name>/{zh.ts,en.ts}，两个文件都 `export default { <name>: { ... } }`
 *   2) 在本文件顶部 `import zh<Name> from "./<name>/zh"` 和 `import en<Name> from "./<name>/en"`
 *   3) 在 messages.zh / messages.en 中分别展开 `...zh<Name>` 和 `...en<Name>`
 *
 * 完整步骤图示与常见坑：file:///Users/yi/YrY/YiKnowledge/projects/yivad/workflows/开发规范/08-规范-国际化规范.md#新增模块-locale-的步骤
 */

// ...原有 import ...

export const messages = {
  zh: { /* ...原有展开... */ } as const,
  en: { /* ...原有展开... */ } as const
};

export type MessagesSchema = typeof messages;
```

## 3. 运行时切换层改造

### 3.1 `Header/components/Language.vue`

**改动**：
- 语言选项列表从 `languageList` 改为走 `t("header.languageOptions.zh|en")`
- 切换时同步 `document.documentElement.lang` 与 `dir`
- Element Plus locale（如有动态 import 机制）一起刷新

```vue
<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useGlobalStore } from "@/stores/modules/global";
import { AVAILABLE_LOCALES, type LocaleCode } from "@/languages";
import { LanguageType } from "@/stores/interface";

const i18n = useI18n();
const { t } = i18n;
const globalStore = useGlobalStore();
const language = computed<LocaleCode>(() => (globalStore.language as LocaleCode) || "zh");

const languageList = computed(() =>
  AVAILABLE_LOCALES.map(code => ({
    value: code,
    label: t(`header.languageOptions.${code}`)
  }))
);

function applyDocumentLocale(lang: LocaleCode) {
  document.documentElement.lang = lang;
  document.documentElement.dir = "ltr"; // RTL 语言（ar/ur/he）→ "rtl"
}

watchEffect(() => applyDocumentLocale(language.value));

function changeLanguage(lang: string) {
  const next = lang as LocaleCode;
  i18n.locale.value = next;
  globalStore.setGlobalState("language", next as LanguageType);
  applyDocumentLocale(next);
}
</script>
```

### 3.2 `common/zh.ts` + `common/en.ts` 补键

补入 `languageOptions` 与若干「扫盲」时会用到的公共提示。

```ts
// zh
header: {
  languageOptions: { zh: "简体中文", en: "English" },
  // ... 原有
},
common: {
  createSuccess: "创建成功",
  updateSuccess: "更新成功",
  deleteSuccess: "删除成功",
  saveSuccess: "保存成功",
  archiveSuccess: "归档成功",
  restoreSuccess: "恢复成功",
  operationSuccess: "操作成功",
  operationFailed: "操作失败",
  confirmDelete: "确认删除？",
  confirmArchive: "确认归档？",
  confirmRestore: "确认恢复？",
  // ... 原有
}
```

```ts
// en
header: {
  languageOptions: { zh: "Simplified Chinese", en: "English" },
  // ... 原有
},
common: {
  createSuccess: "Created successfully",
  updateSuccess: "Updated successfully",
  deleteSuccess: "Deleted successfully",
  saveSuccess: "Saved successfully",
  archiveSuccess: "Archived successfully",
  restoreSuccess: "Restored successfully",
  operationSuccess: "Operation successful",
  operationFailed: "Operation failed",
  confirmDelete: "Confirm deletion?",
  confirmArchive: "Confirm archive?",
  confirmRestore: "Confirm restore?",
  // ... 原有
}
```

## 4. 工具函数层改造

### 4.1 `utils/index.ts` → `getTimeState`

```ts
/**
 * 根据当前时段返回「问候语」对应的 locale 键。
 *
 * 调用方必须使用 t(getTimeState()) 进行渲染，不可直接显示返回值。
 * 对应键定义：common.greeting.morning | afternoon | evening | night
 */
export function getTimeState() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "common.greeting.morning";
  if (h < 14) return "common.greeting.afternoon1";
  if (h < 18) return "common.greeting.afternoon2";
  if (h < 24) return "common.greeting.evening";
  return "common.greeting.night";
}
```

在 `common/zh.ts` + `common/en.ts` 中补齐：

```ts
// zh
greeting: {
  morning: "早上好 ⛅",
  afternoon1: "下午好 🌞",
  afternoon2: "下午好 🌞",
  evening: "晚上好 🌛",
  night: "夜深了 🌛"
}

// en
greeting: {
  morning: "Good morning ⛅",
  afternoon1: "Good afternoon 🌞",
  afternoon2: "Good afternoon 🌞",
  evening: "Good evening 🌛",
  night: "Good night 🌛"
}
```

调用方（典型地 home 页面 `QuickNav.vue` / `index.vue`）中：

```vue
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getTimeState } from "@/utils";
const { t } = useI18n();
const greeting = computed(() => t(getTimeState()));
</script>

<template>
  <h2 class="welcome">{{ greeting }}</h2>
</template>
```

## 5. 组件级硬编码扫盲（清单式改造）

> 对每一项，遵循 "定位 → 设计 locale 键 → 双写 zh/en → 替换 → 本地回归" 五步。

### 5.1 高优先级（立即影响语言切换体验）

| 文件 | 硬编码位置 | 建议 locale 键 |
|------|-----------|---------------|
| `views/proTable/treeProTable/index.vue:56` | ElMessageBox.title = "温馨提示" | `common.tips` |
| `components/Upload/FileUpload.vue:46-52` | 两处 ElNotification.title/message 中文 | `upload.sizeExceeded` / `upload.countExceeded`（新增 upload 模块或归入 common） |
| `hooks/useHandleData.ts` | 若存在批量删除成功/失败中文提示 | `common.batchDeleteSuccess` / `common.operationFailed` |
| `layouts/components/Header/components/Breadcrumb.vue:40` | fallback 用 "首页" 已通过 translateTitle 处理，确认不会漏 | （结构已正确） |

### 5.2 中优先级（用户不易察觉但违反规范）

| 文件 | 现象 | 处理方式 |
|------|------|---------|
| demo 目录下 ViewsDemo.vue / TablesDemo.vue 的静态数据 | 演示数据含中文姓名/标题 | 演示数据不在业务路径，允许不强制翻译；若要严谨则包一层 `__DEMO__` 注释并在 lint 中排除 |
| router 中 `meta.title` 走动态路由 | 通过 `useMenuI18n.translateTitle` 统一翻译 | 确认 flatMenuListGet 装配时正确注入，不必单独处理 |
| `stores/modules/*` 中 ElMessage 调用 | 若存在中文字符串 | 改为 `t(...)`；注意 store 中必须 `useI18n` 在每次 action 内调用，不要顶层解构 |

### 5.3 扫盲执行顺序建议

```bash
# 第 1 轮：面向用户的提示语
rg 'ElMessage\.(success|error|warning|info)\s*\(\s*"' src/
rg 'ElNotification\(' src/
rg 'ElMessageBox\.(alert|confirm|prompt)\(' src/

# 第 2 轮：模板文本（排除 comments）
rg '>\s*[\u4e00-\u9fa5]' src/**/*.vue
rg ':label="\s*"[\u4e00-\u9fa5]' src/**/*.vue
rg ':title="\s*"[\u4e00-\u9fa5]' src/**/*.vue
rg ':placeholder="\s*"[\u4e00-\u9fa5]' src/**/*.vue

# 第 3 轮：对象属性（含 rules.message）
rg 'message:\s*"[\u4e00-\u9fa5]' src/
rg 'title:\s*"[\u4e00-\u9fa5][^"]*"' src/views src/components
```

每修改 10 处 → 切换语言跑一遍 → 再继续。

## 6. locale 结构一致性校验脚本

路径：`YiVad/scripts/check-i18n-locales.mjs`

用法：

```json
// package.json 中
"scripts": {
  "i18n:check": "node scripts/check-i18n-locales.mjs",
  "lint": "... && pnpm i18n:check"
}
```

脚本逻辑（伪代码）：

```mjs
import messages from "../src/languages/modules/index.ts" assert { type: "ts" };  // 或用 esbuild/tsx

function collectPaths(obj, prefix = "") {
  const out = new Set();
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") out.addAll(collectPaths(v, p));
      else out.add(p);
    }
  }
  return out;
}

function collectPlaceholders(str) {
  const r = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const out = new Set();
  let m;
  while ((m = r.exec(str))) out.add(m[1]);
  return out;
}

const zhPaths = collectPaths(messages.zh);
const enPaths = collectPaths(messages.en);
const onlyZh = diff(zhPaths, enPaths);
const onlyEn = diff(enPaths, zhPaths);
// 再对交集的 leaf 值比较 placeholder 集合

process.exit(onlyZh.size + onlyEn.size + placeholderMismatches.length === 0 ? 0 : 1);
```

注：实际实现中用 `tsx` / `esbuild` 读 TS 模块更简单；亦可退一步直接扫描 `src/languages/modules/**/*` 下的两个 TS 文件按行解析（只要我们的结构严格维持「export default { ... }」即可用 AST-less 方式得到路径集合）。

## 7. 类型与接口变更

| 文件 | 新增导出 | 用途 |
|------|---------|------|
| `languages/index.ts` | `LocaleCode = "zh" \| "en"` | 全局统一语言值域 |
| 同上 | `AVAILABLE_LOCALES` | UI 下拉选项 & 运行时校验 |
| 同上 | `normalizeLocale(input: string): LocaleCode` | 将各种拼写归一化 |
| 同上 | `isLocaleCode(v): v is LocaleCode` | 类型守卫 |
| `languages/modules/index.ts` | `MessagesSchema` | 给校验脚本/测试用类型推断 |

### 破坏性变更（Breaking Changes）

- **无**。所有现有 locale 键保持不变，仅新增导出与辅助函数。
- `getTimeState` 原本返回英文字符串，改返回 locale 键 → **属于破坏性变更**：所有调用方（经查仅 home 页面 1 处）需同步改为 `t(getTimeState())`，在同一 commit 中修复。

## 8. 回归范围

切换语言并验证以下页面关键文本：

| 页面 | 关注项 |
|------|--------|
| /home | 欢迎语、Dashboard 卡片标题 |
| /project | 列表标题、搜索 placeholder、所有按钮、批量操作确认框 |
| /project/yivad | 8 个 Tab 标题、Overview Activity 分组、Todo 操作 tooltip |
| /issue | 表格列、筛选、空状态 |
| /bug | 同上 |
| /kanban | 列标题、搜索、右键菜单 |
| /system/menu | 菜单管理相关标题/按钮 |
| Header 下拉 | 主题/布局/语言 |

## 9. 风险与回滚

| 风险 | 回滚策略 |
|------|---------|
| 扫盲替换导致 locale 键不对、页面显示 `a.b.c` | 立刻 `git revert`，PR 中必须包含「切中英双语截屏」 |
| `getTimeState` 改返回键后，有其他隐藏调用方显示裸 key | 搜索 `getTimeState` 全量替换，单测覆盖 |
| i18n:check 在 CI 误报，阻塞发布 | 在 scripts/ 中加 EXCLUDE 白名单，同时在 MR 注释说明 |

## 10. 完成定义（DoD）

- [ ] 4 篇文档 Front-matter 齐全、README 超链接可点击
- [ ] `languages/index.ts` 新增 4 个导出 + JSDoc 顶注
- [ ] Language.vue 下拉双语、切换时 `<html lang>` 同步更新
- [ ] getTimeState 调用方通过 `t(...)` 渲染，中英文都正确
- [ ] 扫盲清单 5.1 全部替换完毕；5.2 中 demo 数据有明确豁免理由（若不替换）
- [ ] `pnpm i18n:check` 对当前 locale 通过；人为删一个 en 键能正确报错
- [ ] 本地 Test 用例 T-01 ～ T-07 全部 pass
