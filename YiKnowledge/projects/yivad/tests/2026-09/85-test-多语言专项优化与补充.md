---
title: 多语言（i18n）专项 — 测试文档
tags: [yivad, test, i18n, vue-i18n, 国际化, 回归测试]
category: projects/yivad/tests
created: 2026-09-12
updated: 2026-09-12
source: YiVad
type: test_plan
status: active
project: YiVad
project_key: yivad
prd: 85-prd-多语言专项优化与补充.md
dev: 85-dev-多语言专项优化与补充.md
priority: p1
automation: partial
---

# 测试文档：多语言（i18n）专项优化与补充

> 对应 PRD：[85-prd-多语言专项优化与补充.md](../../prds/2026-09/85-prd-多语言专项优化与补充.md)
> 对应 Dev：[85-dev-多语言专项优化与补充.md](../../devs/2026-09/85-dev-多语言专项优化与补充.md)

## 0. 测试策略总览

### 0.1 范围

```
┌──────────────────────────────────────────────┐
│ In Scope                                 │
│  • 语言切换即时性（不刷新页面）              │
│  • locale 键 中英双语完整度                  │
│  • 常见提示语/确认框双语                    │
│  • 文档索引完整性                        │
│  • 结构一致性脚本（i18n:check）             │
├──────────────────────────────────────────────┤
│ Out of Scope                              │
│  • 第三语言 ja/zh-TW 切换                 │
│  • Element Plus 控件内建文案的 100% 覆盖     │
│  • 翻译语义正确性（需 Product Owner 人工）   │
│  • 后端返回中文翻译                         │
└──────────────────────────────────────────────┘
```

### 0.2 环境

| 环境 | 说明 |
|------|------|
| 浏览器 | Chrome 最新 · 窗口 1280×800 + 移动端 375×812 |
| 语言初始态 | 先 zh → 切到 en → 再回 zh |
| 后端 | 本地 YiAi @ localhost:8000 或 mock 等价 |
| 账号 | admin / 同开发用账号（具备所有菜单权限） |

### 0.3 执行方式

- **手工回归**：T-01 ～ T-10（本轮全部手工执行，每轮 30 min）
- **自动化（可选 Vitest）**：T-11 / T-12（推荐加入 CI，每 MR 自动跑）

## 1. 手工测试用例（T-01 ～ T-10）

### T-01 文档索引完整性

| 项目 | 内容 |
|------|------|
| 用例 ID | T-01 |
| 场景 | 文档 & 引用完整性 |
| 前置条件 | 本地知识库可访问 `http://localhost:8848/#/project/yivad` |
| 步骤 | 1) 打开项目详情 → Overview Tab 2) 在 README 的「日常开发」表格点击「添加国际化文本」→国际化规范」3) 在「代码审查」表格点击同一链接 4) 在项目 README 顶部 Front-matter 确认存在 |
| 期望 | a) 两篇超链接跳转成功，目标文件打开 404 b) 文档本身含章节齐全（规范、PRD、Dev、Test 四篇齐全且 Front-matter 有 prd/dev/tests 相互引用） |
| 优先级 | P1 |
| 相关 FR | FR-01 |

---

### T-02 语言下拉选项双语自举

| 项目 | 内容 |
|------|------|
| 用例 ID | T-02 |
| 场景 | Header 语言切换器自举 |
| 前置 | 登录进入任一页面 |
| 步骤 | 1) 默认 zh 打开语言下拉，记录选项文字 2) 点击 English 切换，等待 500ms 3) 再次打开语言下拉 |
| 期望 | zh 态下显示「简体中文」「English」；en 态下显示「Simplified Chinese」「English」；两个选项的显示文字都跟当前 locale 对应键匹配 |
| 优先级 | P1 |
| 相关 FR | FR-02 |

---

### T-03 首页欢迎语双语

| 项目 | 内容 |
|------|------|
| 用例 ID | T-03 |
| 场景 | 首页欢迎语跟随时段和 locale 切换 |
| 前置 | 登录，可访问 /home |
| 步骤 | 1) 切中文 → 首页 → 记录欢迎语 2) 切英文 → 首页 → 再读欢迎语 3) 可选：调整系统时间（6/13/19/2 四个区间各测一次） |
| 期望 | 中文分别对应「早上好 / 下午好 / 晚上好 / 夜深了」；英文为 "Good morning / Good afternoon / Good evening / Good night"；都不会直接出现裸 key 如 `common.greeting.morning` |
| 优先级 | P1 |
| 相关 FR | FR-03 |

---

### T-04 HTML lang 实时同步

| 项目 | 内容 |
|------|------|
| 用例 ID | T-04 |
| 场景 | documentElement 属性 |
| 前置 | 已登录 |
| 步骤 | 1) 打开 DevTools → Elements → 2) 语言选 zh 3) 选 en 4) 再选 zh |
| 期望 | 每次切换后，`<html lang="zh">` ↔ `<html lang="en">` 跟语言一致，切换后立即更新（刷新前就变） |
| 优先级 | P1 |
| 相关 FR | FR-04 |

---

### T-05 Project Detail · Tab 标签 + Activity 分组 + Todo 操作

| 项目 | 内容 |
|------|------|
| 用例 ID | T-05 |
| 场景 | 项目详情页标签 |
| 前置 | 进入 `#/project/yivad |
| 步骤 | 1) zh 态下观察 8 个 Tab 2) 切 en，观察 Tab 标签 3) Overview 中 Activity 分组标签「今天/昨天/未知日期 4) Todo 操作按钮的 hover 5) 再次切回 zh |
| 期望 | 8 Tab: 不会出现混用；Activity 分组在 en 态 Today/Yesterday/Unknown · Completed/Started/... 全英；Todo 的中文不会漏翻；不会看到 tab 内容的操作 tooltip 随语言正确变化 |
| 优先级 | P0 |
| 相关 FR | FR-05 |

---

### T-06 新建/归档项目 全套提示语

| 项目 | 内容 |
|------|------|
| 用例 ID | T-06 |
| 场景 | CRUD 关键提示 |
| 前置 | `#/project` 列表页 |
| 步骤 | 1) 切到 en 2) New Project → 填一个 Identifier=TEST01，Name=Test，提交 3) 成功提示；取消；选中 TEST01，点 Archive 确认 4) 确认框、成功提示；然后 Restore 5) 切回 zh 重复一次 6) 清掉测试数据 |
| 期望 | 创建/归档//成功提示以及确认的标题、按钮、提示完全随语言更新；不出现硬编码中文；ElMessage / ElMessageBox 内文字都对应当前 locale 键 |
| 优先级 | P0 |
| 相关 FR | FR-05 |

---

### T-07 搜索占位符完整性（表单、tooltip、列标题、Breadcrumb

| 项目 | 内容 |
|------|------|
| 用例 ID | T-07 |
| 场景 | 容易遗漏位置 |
| 前置 | 已登录，具备菜单权限 |
| 步骤 | 1) 切 en 2) 进入 /project 列表 → 搜索框 placeholder、sort 下拉全部选项 3) 进入 /issue → 表格列(标题/优先级/负责人等 4) Breadcrumb：Home / Project Management / Projects 的每项 5) 系统/setting (可选：user profile 下拉按钮 tooltip |
| 期望 | 所有 placeholder / option / 列 / 面包屑均对应翻译；无英文 mix， 无裸 key （如 `project.list.searchPlaceholder` 原封不动显示) |
| 优先级 | P1 |
| 相关 FR | FR-05 |

---

### T-08 locale 结构一致性脚本有效性

| 项目 | 内容 |
|------|------|
| 用例 ID | T-08 |
| 场景 | 校验脚本的效用 |
| 前置 | 本地仓库根 `cd YiVad` |
| 步骤 | 1) `pnpm i18n:check` → 记录退出码 2) 编辑 `project/en.ts`，故意删一个键（比如 project.detail.tabs.xxx注释掉 analytics）3) 再跑一次 4) 还原 5) 再改 `project/zh.ts` 某带 `{total}` 占位键，在 en 改成 `{n}`，重跑 |
| 期望 | 1) 0 差异， exit 0；2/3) 差异 → 报 `缺失键 仅 端 ，exit 5) 差异（占位符不一致）4) 成功， exit 1 |
| 优先级 | P2 |
| 相关 FR | FR-06 |

---

### T-09 新增模块 locale 的步骤验证

| 项目 | 内容 |
|------|------|
| 场景 | 新人 4 步流 |
| 前置 | YiVad 源码 |
| 步骤 | 1) 按文档步骤新建 `languages/modules/foo/zh.ts` + `en.ts` 导出 `{ foo: { title: "" }` 2) 注册到 `modules/index.ts` 3) 在任一组件 `t('foo.title')` 渲染 4) 中英切换 |
| 期望 | zh/en 分别显示两语言；脚本 `pnpm i18n:check` 通过 无； 文档 4 步均无遗漏 |
| 优先级 | P2 |
| 相关 FR | FR-01, FR-06 |

---

### T-10 刷新 & 重开浏览器 语言持久化

| 项目 | 内容 |
|------|------|
| 用例 ID | T-10 |
| 场景 | 切换后保持 |
| 前置 | 正常登录 |
| 步骤 | 1) 到 为 2) F5 刷新页面 3) 再看 Header → 当前语言；再关 4) 开（或新开一个同域窗口 → 重新访问 |
| 期望 | F5 后仍是 en；重启仍是 en（ globalStore 的 language 值不依赖路由，不回退 zh） |
| 优先级 | P1 |
| 相关 FR | FR-02 / NFR-02 |

## 2. 自动化建议（Vitest，可选接入 CI）

### T-11 Locale 键结构 + 占位符一致性（等价 i18n:check 包装单测）

文件：`tests/unit/i18n-locales.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { messages } from "@/languages/modules";

function walk(obj: any, prefix = ""): Array<[string, unknown]> {
  const rows: Array<[string, unknown]> = [];
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") rows.push(...walk(v, p));
      else rows.push([p, v]);
    }
  }
  return rows;
}

describe("i18n locale completeness", () => {
  const zhRows = Object.fromEntries(walk(messages.zh));
  const enRows = Object.fromEntries(walk(messages.en));

  it("zh / en 键路径完全一致", () => {
    const zhKeys = Object.keys(zhRows).sort();
    const enKeys = Object.keys(enRows).sort();
    expect(zhKeys).toEqual(enKeys);
  });

  it("含 {xxx} 占位符名称在 zh/en 中相同", () => {
    const re = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const bad: string[] = [];
    for (const k of Object.keys(zhRows)) {
      const zv = String(zhRows[k] ?? "");
      const ev = String(enRows[k] ?? "");
      const zhPh = [...zv.matchAll(re).map(m => m[1]).sort();
      const enPh = [...ev.matchAll(re).map(m => m[1]).sort();
      if (JSON.stringify(zhPh) !== JSON.stringify(enPh)) bad.push(`${k}: zh=${zhPh.join(",") || "∅"} vs en=${enPh.join(",") || "∅"}`);
    }
    expect(bad).toEqual([]);
  });
});
```

**断言**：若有人提交 PR 时仅加 zh 不加 en → T-11 fail → 防止退化。

### T-12 useDetailTabs · Tab 标签在切换时均能翻译

文件：`tests/unit/detail-tabs-i18n.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useDetailTabs } from "@/hooks/useDetailTabs";
import i18n from "@/languages";
import { createI18n } from "vue-i18n";

describe("useDetailTabs labels", () => {
  setActivePinia(createPinia());
  const localI18n = createI18n({
    legacy: false,
    locale: "zh",
    fallbackLocale: "en",
    messages: i18n.global.messages,
  });

  it("zh 不出现 project.detail.tabs.* 裸 key", () => {
    // （简化：用 Ref mock 最小 project 注入即可
    const proj = ref({ key: "yivad" }) as any;
    const kfiles = ref([]) as any;
    const fdate = ref(null) as any;
    const issues = ref([]) as any;
    const mods = ref([]) as any;
    const { tabs } = useDetailTabs(proj, kfiles, fdate, issues, mods);
    for (const tab of tabs.value) {
      expect(tab.label).not.toMatch(/^project\.detail\.tabs\./);
      expect(tab.label.trim().length).toBeGreaterThan(0);
    }
  });
});
```

## 3. 缺陷严重度与通过标准

| 级别 | 定义 | 放行标准 |
|------|------|--------|
| P0 阻断 | Tab 不变 / 新建项目显示裸 key / 确认框中文显示中文在 en 下； 切到英文仍 | 不允许存在 1 个 |
| P1 严重 | 单个提示语 / breadcrumb / 单个页面 缺失翻译缺翻译或 串 | ≤ 2 个 P1，且在 zh 不影响主流程 |
| P2 一般 | 非关键 UI 文本漏译 / 演示数据 / tooltip 没翻 / 文档引用 | 每轮 ≤ 5 个，在本专期前修修复本项 |

### 通过：T-01 ～ T-10 10 条全部通过，T-08/T-11/T-12 3 条 8 测试 CI 绿 |

## 4. 回归矩阵（每轮执行）

| 版本 | 测试人 | 日期 | T-01 | T-02 | T-03 | T-04 | T-05 | T-06 | T-07 | T-08 | T-09 | T-10 | T-11 | T-12 |
|------|--------|------|------|------|------|------|------|------|------|------|------|------|------|------|
| v1.0 首轮 | —— | 2026-09-12 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

## 5. 已知豁免项（Exceptions）

| # | 豁免项 | 理由 |
|---|--------|------|
| E-01 | demo 目录的中文演示数据 | 仅 dev 环境可见，不面向 end user |
| E-02 | Element Plus 自带 zh-CN / en 组件内极少量未覆盖（分页文字 | 保持 ELement Plus 版本升级后再补齐，本 PR |
| E-03 | 后端返后端返回值→ 枚举字典前端 lookup（本 PRD Out of Scope | 需独立模块 09/后续 PRD 覆盖 |
| E-04 | 极罕见场景深菜单（如未启用的隐藏功能）不翻译 | 对应模块激活时再补齐 |

> 所有豁免项必须在代码注释加「E-XX， 引用本页编号」
