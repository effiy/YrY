---
title: 多语言（i18n）专项优化与补充
tags: [yivad, prd, i18n, vue-i18n, 国际化, L10N]
category: projects/yivad/prds
created: 2026-09-12
updated: 2026-09-12
source: YiVad
type: prd
status: active
project: YiVad
project_key: yivad
module: i18n
priority: p1
effort: m
---

# PRD：多语言（i18n）专项优化与补充

> 统一规范 **vue-i18n 11.x** 在 YiVad 项目中的落地：补全缺失的文档、修复硬编码文本、提升语言切换的一致性与运行时体验，建立从「新增键」到「CI 校验」的完整闭环。

## 0. 背景与问题

### 0.1 现状

YiVad 使用 vue-i18n 11.x 作为国际化框架，已拆分 `src/languages/modules/<name>/{zh,en}.ts` 共 20+ 模块，顶层 README 和代码约定中均明确要求「用户可见文本必须国际化」。

### 0.2 实际痛点（来自 Bug 与 Code Review）

| # | 痛点 | 影响范围 | 典型复现 |
|---|------|---------|---------|
| P1 | **缺少完整的国际化规范文档** | 全团队 | 新人不知道键怎么命名、MessageFormat 怎么用，反复踩坑 |
| P2 | **Tab 标签/菜单/动态路由标题硬编码** | Project Detail / 菜单管理 | `useDetailTabs.ts` 里写死中文，切到英文不变 |
| P3 | **Activity 相对时间硬编码** | Project Detail → Overview | "Today"/"Yesterday"/"Completed" 英文不地道 |
| P4 | **语言切换器本身不国际化** | Header → Language 下拉 | "Simplified Chinese" / "English" 写死，英文用户看到中文菜单 |
| P5 | **ElMessage / ElNotification 直接写中文字符串** | 散落在 20+ 组件 | `ElMessage.success("创建成功")` 永远中文 |
| P6 | **`getTimeState()` 问候语硬编码英文** | 首页 Welcome | 永远 Good morning，中文用户体验割裂 |
| P7 | **缺少 locale 完整性检查工具** | CI/CD | 新键只加 zh 漏掉 en，等用户切语言才发现 |
| P8 | **缺少「新增模块 locale」的步骤文档** | 开发体验 | 新建模块不知道还要改 `modules/index.ts` |
| P9 | **路由 `meta.title` 未走翻译链路** | 动态路由 & 面包屑 | 部分页面 title 显示原始 key 或硬编码 |

### 0.3 目标

- **文档闭环**：补全国际化专项规范、PRD、Dev、Test 四类文档，被 README 和代码审查清单引用
- **零硬编码**：对 `YiVad/src` 做一次全量扫盲，移除模板 + ElMessage 中所有裸中文/英文，并纳入后续 CI
- **运行时一致**：语言切换后，Tab、下拉、动态标题、Breadcrumb、ElConfigProvider 全部即时响应，无需刷新
- **防退化**：建立开发期警告 + 静态结构校验两步防线，回归用例覆盖语言切换场景

## 1. 范围

### In Scope（本次交付）

| 模块 | 交付物 |
|------|-------|
| 文档 | 新增 4 篇：国际化规范、i18n PRD（本文）、Dev 开发模块、Test 测试文档 |
| 代码 | `languages/` 入口与模块汇总增强 |
| 代码 | Language.vue 切换器自身国际化 |
| 代码 | `utils/index.ts` → `getTimeState` 国际化 |
| 代码 | 散落在 `src/**` 的 ElMessage / ElNotification 硬编码文本修正 |
| 代码 | `useDetailTabs` / `HeroDateNav` 等 Tab/标签 翻译正确性确认 |
| 体验 | 切换语言后同步 `document.documentElement.lang` 与 `dir` |
| 校验 | locale 键 中英结构一致性 校验脚本（可选嵌入 CI） |

### Out of Scope（不做 / 后续版本）

- 新增第三个语言（ja-JP / ko-KR / zh-TW）— 预留接口，不在本次交付
- 后端返回文案 翻译（前端枚举 lookup 方案在 FAQ 提及，不做具体字段）
- 按 locale 分包懒加载 — 当前模块数 < 25，打包体积可接受，未来超过阈值在 PRD 中追加提案

## 2. 用户故事

```
As a  英文用户（陈博 / Chengbo@example.com）
I want 进入 Project Detail 后所有 Tab、Activity、提示都显示英语
So that 我能以母语无障碍完成项目管理

As a  前端开发（张伟）
I want 新建国际化键时有清晰的命名/目录规范和步骤指引
So that 我不用反复翻历史代码，也不会漏掉 en.ts

As a  Tech Lead（李芳）
I want PR 审查时能快速判断 i18n 是否做对
So that 国际化不再是 review 中的大段重复评论
```

## 3. 功能需求

### FR-01 文档体系

**描述**：补全以下四篇文档，并在项目 README 总索引 / 代码审查表 / Bug 模板中建立引用。

| 文档 | 位置 | 内容要点 |
|------|------|---------|
| 国际化规范 | `workflows/开发规范/08-规范-国际化规范.md` | 命名、目录、用法、常见陷阱、FAQ、代码审查 checklist |
| 多语言专项 PRD | `prds/2026-09/85-prd-多语言专项优化.md` | 本文 |
| 多语言专项 Dev | `devs/2026-09/85-dev-多语言专项优化.md` | 技术方案、变更点清单、接口/类型、回归范围 |
| 多语言专项 Test | `tests/2026-09/85-test-多语言专项优化.md` | 用例矩阵（切换场景）、手工回归指南、自动化建议 |

**验收**：README「日常开发」「代码审查」两行中点击可跳转，且 4 篇文档存在且 Front-Matter 完整。

### FR-02 Language.vue 切换器自身国际化

**描述**：语言下拉的选项名也要走 `t()`，让英文用户看到 "简体中文" 的翻译版本。

```ts
// zh.ts
header: { languageOptions: { zh: "简体中文", en: "English" } }

// en.ts
header: { languageOptions: { zh: "Simplified Chinese", en: "English" } }
```

**验收**：切到英文 → 打开语言下拉 → `zh` 选项显示 **Simplified Chinese**；切到中文 → 显示 **简体中文**。

### FR-03 首页问候语 `getTimeState` 国际化

**描述**：`utils/index.ts` 中基于时段返回的问候语改为返回 locale 键，由调用方（home 页面）走 `t()` 渲染。

**验收**：语言切换后，首页欢迎语随 zh/en 变化。

### FR-04 运行时语言切换增强

**描述**：`changeLanguage()` 除了更新 `i18n.locale.value` 与 globalStore，还同步：

```ts
document.documentElement.lang = lang;        // 对 SEO / 屏幕阅读器友好
document.documentElement.dir = "ltr";        // 当前均 LTR，为 RTL 语言预留
```

**验收**：DevTools → Elements → `<html lang="zh">`，切英文后更新为 `<html lang="en">`。

### FR-05 ElMessage / ElNotification / ElMessageBox 文案国际化扫盲

**描述**：正则全量扫描 `src/**`，把以下模式逐个替换为 `t(...)`：

```
ElMessage.*("[\u4e00-\u9fa5]
ElNotification.*("[\u4e00-\u9fa5]
ElMessageBox.*("[\u4e00-\u9fa5]
```

**验收**：扫描结果 = 0（或仅剩非面向用户的 debug 日志），`common/zh.ts` 和 `common/en.ts` 补齐新增的键。

### FR-06 locale 键结构一致性校验

**描述**：在 `YiVad/scripts/` 添加一个校验脚本（或 Vite 插件），在 dev & CI 中运行：

1. 遍历所有 locale 键路径，断言 `zh` 和 `en` 的键路径集合 **完全相同**
2. 含 `{name}` 占位符的键，断言 zh / en 中出现的占位符名称集合相同
3. 失败时打印差异清单，CI 退出码 1

**验收**：手动在 zh.ts 加一个键 → 运行校验 → 报告差异，不通过；补齐 en → 通过。

### FR-07 文档/代码中建立「新增 locale 键」和「新增 locale 模块」的操作指南链接

**描述**：在 `languages/index.ts`、`languages/modules/index.ts` 顶部添加 JSDoc 注释，指向本 PRD 和国际化规范文档。

**验收**：IDE 中打开两个文件，顶部能看到指向文档的超链接。

## 4. 非功能需求

### NFR-01 性能

- 切换语言后，首屏响应 < 80ms（关键 Tab 标题、主要文本全部重渲染完成）
- 不引入额外的运行时依赖（vue-i18n 已在栈中）
- 校验脚本在 CI 中耗时 < 3s（locale 文件总和 < 5000 行时）

### NFR-02 兼容性

- 不破坏现有 locale 键：所有 `t("a.b.c")` 调用方保持有效
- `getBrowserLang` 的输出值域保持 `{zh, en}`，不引入第三值
- Element Plus 的 locale 加载机制保持现状（未来可升级为动态 import）

### NFR-03 可维护性

- 新增模块 locale 步骤不超过 4 步（建目录→写 zh→写 en→注册）
- 新增键 2 步且有文档可查
- 代码审查 checklist 中的国际化条目 ≤ 5 条但覆盖关键风险

## 5. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 扫盲时误改 debug 级字符串 | 中 | 低 | 只替换 `ElMessage / ElNotification / ElMessageBox / 模板` 四类；代码 diff 人工 review |
| 切换语言后 Element Plus 组件内部仍显示原语言 | 中 | 中 | 确认 `ElConfigProvider` 已绑定 locale，并在切换时同步刷新；若仍不生效加显式 `key` 强制重建 |
| 校验脚本假阳性 / 假阴性 | 低 | 中 | 用已知故意破坏的 locale 做单测，覆盖：缺键、占位符不一致、键名 typo 三类 |
| 文档写完无人看 | 高 | 中 | PR 模板 + Code Review checklist 强制引用；新人 Onboarding 第一步读国际化规范 |

## 6. 验收标准（UAT）

| ID | 场景 | 步骤 | 期望 |
|----|------|------|------|
| UAT-01 | 切换语言全局生效 | 1) 中文进入 Project Detail 2) 切英文 3) 观察 8 个 Tab 标题 + Activity 时间分组 | 所有 Tab 显示英文；Activity 的 "Today/Yesterday/Completed" 全部英文 |
| UAT-02 | 语言切换器自举 | 1) 切英文 2) 打开语言下拉 | 选项显示 "Simplified Chinese" 和 "English" |
| UAT-03 | 首页问候语双语 | 1) 切中文 → 首页 2) 切英文 → 首页 | 中文显示「早上好 / 下午好 / 晚上好」；英文显示 "Good morning/afternoon/evening" |
| UAT-04 | HTML lang 属性 | 1) 打开 DevTools 2) 切中英文各一次 | `<html lang>` 实时同步 zh / en |
| UAT-05 | 常见操作提示双语 | 1) 新建项目成功 2) 删除确认 3) 无权限提示 | 成功/确认/错误提示随语言切换 |
| UAT-06 | 文档可达 | 1) 打开 YiVad 项目 README 2) 点击「添加国际化文本」链接 | 跳转到 `08-规范-国际化规范.md` 且能正常打开 |
| UAT-07 | 新增键不会漏 | 1) 在 zh.ts 加键 `project._test.foo` 2) 运行校验脚本 | 脚本 FAIL 并列出 en 缺失的路径 |

## 7. 需求追踪矩阵

| PRD 条目 | 对应 Dev 条目 | 对应 Test 用例 |
|----------|--------------|---------------|
| FR-01 文档体系 | Dev §2 文档交付清单 | T-01 文档索引完整性 |
| FR-02 切换器自举 | Dev §3.1 Language.vue 改造 | T-02 语言下拉双语 |
| FR-03 问候语国际化 | Dev §3.2 getTimeState 返回键 | T-03 首页欢迎语切换 |
| FR-04 运行时同步 lang | Dev §3.3 documentElement 同步 | T-04 html.lang 实时 |
| FR-05 扫盲替换 | Dev §4 组件级改造清单 | T-05 关键场景提示语 |
| FR-06 结构校验 | Dev §5 校验脚本 + (可选) CI | T-06 脚本对已知差异的检出率 |
| FR-07 代码内文档链接 | Dev §6 JSDoc 入口 | T-01 文档可达（包含） |

---

## 8. 变更记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-09-12 | v1.0 | 初始版本 — 基于 9 月国际化专项 Bug 回溯整理 |
