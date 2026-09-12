---
doc_type: module
prd_task_id: "YV-09-200"
title: "YV-09-200: 用户外观设置 — 主题(亮色/暗色/自动)、语言、日期格式、时区、密度(舒适/紧凑)、字号 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "74-prd-用户外观设置.md"
---

# YV-09-200: 用户外观设置 — 主题(亮色/暗色/自动)、语言、日期格式、时区、密度(舒适/紧凑)、字号 — 开发任务

> 来源 PRD：[74-prd-用户外观设置.md](../prds/2026-09/74-prd-用户外观设置.md)
> 需求编号：YV-09-200 · 优先级：P2 · 人天：0.3d

## 五、实施步骤

| 步骤 | 操作 | 路径 | 验证 | 人天 |
|------|------|------|------|------|
| 1 | 实现外观设置 Store | `stores/appearance.ts` | 状态管理 + localStorage 持久化 | 0.05 |
| 2 | 添加 CSS 变量体系 | `variables.css` | 密度/字号变量全局生效 | 0.03 |
| 3 | 实现外观设置主页面框架 | `AppearanceSettings.vue` | 双栏布局 + 实时预览 | 0.04 |
| 4 | 实现主题选择器 | `ThemeSelector.vue` | 亮色/暗色/自动三种模式 | 0.04 |
| 5 | 实现语言选择器 | `LanguageSelector.vue` | 语言切换即时生效 | 0.03 |
| 6 | 实现日期格式选择器 | `DateFormatSelector.vue` | 5 种格式模板 | 0.03 |
| 7 | 实现时区选择器 | `TimezoneSelector.vue` | IANA 时区列表搜索 | 0.03 |
| 8 | 实现密度选择器 | `DensitySelector.vue` | 舒适/标准/紧凑三种模式 | 0.02 |
| 9 | 实现字号滑块 + 预览面板 | `FontSizeSlider.vue` + `PreviewPanel.vue` | 字号调整 + 实时预览 | 0.03 |

**总人天：0.3d**

---
