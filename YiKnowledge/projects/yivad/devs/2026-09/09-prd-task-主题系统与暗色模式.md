---
doc_type: module
prd_task_id: "YV-09-26"
title: "主题系统与暗色模式 — 开发方案"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "09-prd-主题系统与暗色模式.md"
related_tests: ["YV-09-26"]
---

# 主题系统与暗色模式 — 开发方案

> 来源 PRD：[09-prd-主题系统与暗色模式.md](../../prds/2026-09/09-prd-主题系统与暗色模式.md)
> 需求编号：YV-09-26 · 优先级：高 · 人天：1.5d
> 测试方案：[09-prd-test-主题系统与暗色模式.md](../../tests/2026-09/09-prd-test-主题系统与暗色模式.md)

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 目录

- [一、架构总览](#sec-1)
- [二、关键技术决策](#sec-2)
- [三、Composable 接口契约](#sec-3)
- [四、实施路线图](#sec-4)
- [五、代码审查检查清单](#sec-5)
- [六、实现完成记录](#sec-6)
- [七、已知缺口与技术债](#sec-7)

---

<a id="sec-1"></a>
## 一、架构总览

### 1.1 分层结构

```
┌──────────────────────────────────────┐
│  UI 层                                │
│  SwitchDark — 暗色切换按钮            │
│  ThemeDrawer — 主题配置抽屉            │
├──────────────────────────────────────┤
│  Hook 层                              │
│  useTheme — 主题切换 + localStorage   │
├──────────────────────────────────────┤
│  Store 层                             │
│  chartTheme.ts — ECharts 主题管理     │
├──────────────────────────────────────┤
│  工具/配置层                          │
│  chart/themes.ts — 4 套 ECharts 主题  │
│  config/mermaidThemes.ts — 15 套主题  │
│  styles/element-dark.scss — 暗色变量  │
└──────────────────────────────────────┘
```

### 1.2 主题切换数据流

```
用户点击暗色切换
  → useTheme.toggleDark() 更新状态 + localStorage
  → document.documentElement 设置 dark class
  → Element Plus CSS 变量即时生效
  → chartThemeStore.setTheme() 切换 ECharts 主题
  → Mermaid 渲染器检测亮/暗 → 自动使用对应默认主题
```

### 1.3 文件清单

```
YiVad/src/
├── hooks/useTheme.ts                    # 主题切换 hook
├── stores/chartTheme.ts                 # 图表主题 Pinia store（49 行）
├── utils/chart/themes.ts                # 4 套 ECharts 主题预设
├── config/mermaidThemes.ts              # 15 套 Mermaid 主题（224 行）
├── styles/element-dark.scss             # Element Plus 暗色变量覆盖
├── styles/theme/                        # 主题样式目录
├── components/SwitchDark/               # 暗色切换组件
└── layouts/components/ThemeDrawer/      # 主题配置抽屉
```

---

<a id="sec-2"></a>
## 二、关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 暗色方案 | Element Plus CSS 变量 | 官方支持，组件级适配，无需逐个覆盖 |
| ECharts 主题 | 4 套预设 + chartTheme store | 预设覆盖常见场景，自定义满足品牌色 |
| Mermaid 主题 | 15 套 + auto-derive | 根据 bg/fg 参数自动生成完整主题配置 |
| 持久化 | localStorage | 轻量、同步读取、首屏即恢复 |
| 图表主题联动 | useTheme → store.setTheme() | 解耦：全局主题与图表主题独立管理 |

---

<a id="sec-3"></a>
## 三、Composable 接口契约

### 3.1 `useTheme`

```typescript
function useTheme(): {
  isDark: Ref<boolean>;
  themeColor: Ref<string>;
  toggleDark(): void;
  setThemeColor(color: string): void;
}
```

**要点**：
- `isDark` 初始化从 localStorage 读取，默认跟随 `prefers-color-scheme`
- `toggleDark()` 更新 `document.documentElement` class + localStorage
- `setThemeColor()` 设置 CSS 变量 `--el-color-primary`

---

<a id="sec-4"></a>
## 四、实施路线图

| 步骤 | 任务 | 产出 | 人天 | 状态 |
|------|------|------|------|------|
| 1 | 亮/暗切换 | useTheme.ts + SwitchDark 组件 + element-dark.scss | 0.3 | ✅ |
| 2 | 主题配置抽屉 | ThemeDrawer 组件（主色/圆角/暗色开关） | 0.3 | ✅ |
| 3 | ECharts 主题 | 4 套预设 + chartTheme store + 自定义 CRUD | 0.4 | ✅ |
| 4 | Mermaid 主题 | 15 套 auto-derive 主题 + 亮/暗默认值 | 0.3 | ✅ |
| 5 | 持久化 | localStorage 集成 + 刷新恢复 | 0.2 | ✅ |

**总计：1.5d**

---

<a id="sec-5"></a>
## 五、代码审查检查清单

### 主题切换
- [x] 亮/暗切换即时生效（< 100ms CSS 变量切换）
- [x] localStorage 持久化正确（刷新保持）
- [x] `prefers-color-scheme` 媒体查询作为默认值fallback
- [x] 暗色模式下全部 Element Plus 组件正确渲染

### 图表主题
- [x] ECharts 4 套预设颜色完整（每套 ≥ 8 色）
- [x] Mermaid 15 套主题均能生成有效配置
- [x] 图表主题跟随全局切换，无手动刷新需要
- [x] 自定义主题 CRUD 正常（创建/编辑/删除）
- [x] 自定义主题删除后回退默认主题

### 样式
- [x] 不自定义 hack Element Plus 内部样式
- [x] `element-dark.scss` 仅覆盖必要变量
- [x] 主题切换无 FOUC（Flash of Unstyled Content）

---

<a id="sec-6"></a>
## 六、实现完成记录

> **完成日期**：2026-09-11 · **复核日期**：2026-09-15
> **状态**：全部 5 个子需求已实现。

### 6.1 产出清单

| 分类 | 文件数 | 关键产出 |
|------|--------|---------|
| Hooks | 1 | `useTheme.ts` |
| Stores | 1 | `chartTheme.ts`（49 行） |
| Utils/Config | 2 | `chart/themes.ts`、`config/mermaidThemes.ts`（224 行） |
| 组件 | 2 | `SwitchDark/`、`ThemeDrawer/` |
| 样式 | 2 | `element-dark.scss`、`styles/theme/` |
| 测试 | 2 | `useTheme.test.ts`、`chart-themes.test.ts` |
| **合计** | **10** | |

### 6.2 架构决策落地

- **Element Plus CSS 变量暗色方案。** 不 hack 内部样式，通过官方暗色变量集覆盖。
- **图表主题解耦。** ECharts/Mermaid 主题通过 store/config 独立管理，useTheme 仅控制全局开关。
- **auto-derive 算法。** Mermaid 15 套主题由 `getMermaidThemeConfig(isDark, themeName?)` 根据 bg/fg 参数自动生成完整配置，无需手动维护 15 份独立配置。

---

<a id="sec-7"></a>
## 七、已知缺口与技术债

### 7.1 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| 1 | 组件测试待补（SwitchDark、ThemeDrawer） | 主题 UI 组件无自动化测试覆盖 | 补充 `@vue/test-utils` 组件测试（0.2d） |

### 7.2 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 主题配置导入/导出 | P2 | 0.2 | 支持导出主题配置为 JSON 文件并导入 | 待实现 |
| 2 | `prefers-color-scheme` 自动跟随 | P3 | 0.1 | 用户未手动设置时自动跟随系统亮/暗模式 | 待实现 |

---