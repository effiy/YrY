---
doc_type: test
title: "仪表盘组件体系 — 测试用例"
status: 进行中
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-M10"
source_prds: ["03-prd-仪表盘组件体系"]
source_modules: ["YV-09-M10"]
---

# 仪表盘组件体系 — 测试用例

> 来源 PRD：[03-prd-仪表盘组件体系.md](../../prds/2026-09/03-prd-仪表盘组件体系.md)
> 开发方案：[03-prd-task-仪表盘组件体系.md](../../devs/2026-09/03-prd-task-仪表盘组件体系.md)
> 需求编号：YV-09-M10 · 优先级：中

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。用例覆盖度以 PRD 的 `FR-x.y` / `NFR-x` 编号追溯，不复制需求正文。

---

## 目录

- [一、测试范围与目标](#sec-1)
- [二、测试策略](#sec-2)
- [三、测试环境与前置条件](#sec-3)
- [四、准入与准出标准](#sec-4)
- [五、需求覆盖矩阵](#sec-5)
- [六、单元测试](#sec-6)
- [七、组件测试](#sec-7)
- [八、集成测试](#sec-8)
- [九、端到端场景](#sec-9)
- [十、性能验收测试](#sec-10)
- [十一、无障碍测试](#sec-11)
- [十二、缺陷分级与处理流程](#sec-12)
- [十三、自动化现状与缺口](#sec-13)
- [测试策略](#sec-strategy)
- [测试环境与前置条件](#sec-env)
- [准入与准出标准](#sec-criteria)
- [缺陷分级](#sec-defects)

---

<a id="sec-1"></a>
## 一、测试范围与目标


### 在范围内

| 范围 | 内容 |
|------|------|
| 1 个 composable | `useDashboard`（仪表盘核心逻辑） |
| 2 个 Pinia store | `dashboard.ts`、`chartTheme.ts` |
| 4 个工具模块 | `chart/themes.ts`、`chart/downsampling.ts`、`chart/echarts.ts`、`config/mermaidThemes.ts` |
| 10 个图表组件 | LineChart/BarChart/PieChart/AreaChart/ScatterChart/HeatmapChart/GaugeChart/RadarChart/TreemapChart/FunnelChart |
| 5 个 Dashboard 组件 | DashboardGrid/DashboardWidget/DashboardToolbar/WidgetPicker/WidgetSettings |

### 不在范围内

| 排除项 | 原因 |
|--------|------|
| ECharts实例管理 | 依赖浏览器DOM，需E2E测试 |
| WebSocket实时更新 | 后端端点未确认 |
| 图表交互钻取/联动 | 组件已创建但交互逻辑待实现 |
| 仪表盘导出/分享/版本管理 | 依赖后端支持 |

---

<a id="sec-2"></a>
---

<a id="sec-2"></a>
## 二、测试策略

### 2.1 分层模型

四层测试金字塔：L1 单元测试（1 个 composable + 2 个 store + 4 个工具模块）→ L2 组件测试（10 个图表组件 + 5 个 Dashboard 组件）→ L3 集成测试（composable ↔ 组件 ↔ store）→ L4 端到端场景（/demo 全链路）。自动化门禁（L1-L2）每次提交执行，人工执行（L3-L4）在提测与发版前。

| 层级 | 用例编号 | 自动化 | 执行时机 |
|------|---------|--------|---------|
| L1 单元 | UT-D01 ~ UT-D06 | 是 | 每次提交 |
| L2 组件 | CT-D01 ~ CT-D02 | 是 | 每次提交 |
| L3 集成 | IT-D01 ~ IT-D02 | 否 | 提测 / 回归 |
| L4 端到端 | E2E-D1 ~ E2E-D8 | 否 | 提测 / 发版前 |

### 2.2 优先级定义

| 级别 | 含义 | 用例范围 |
|------|------|---------|
| P0 | 核心能力，失败即阻塞发布 | UT-D02、CT-D01 |
| P1 | 重要能力，失败需评估 | UT-D01/03/04/05/06、CT-D02、IT-D01/02、E2E-D1~D3 |
| P2 | 增强能力，可延后 | E2E-D4~D8 |

---

<a id="sec-3"></a>
## 三、测试环境与前置条件

### 3.1 环境矩阵

| 项 | 要求 |
|----|------|
| 操作系统 | macOS / Linux（CI 为 Linux） |
| Node.js | 与项目 `.nvmrc` 一致 |
| 包管理器 | pnpm |
| 浏览器 | Chrome 最新版（图表渲染基准） |
| 前端 | Rsbuild dev server 运行于 `:8848` |
| 屏幕 | 1920×1080 |

### 3.2 执行命令

```bash
# 单元测试
pnpm test

# 单文件
pnpm exec vitest run tests/hooks/useDashboard.test.ts

# 覆盖率
pnpm exec vitest run --coverage

# 类型检查
pnpm exec vue-tsc --noEmit
```

---

<a id="sec-4"></a>
## 四、准入与准出标准

### 4.1 准入（开始测试的条件）

| # | 条件 |
|---|------|
| 1 | 开发方案中对应 FR 的实现已提交 |
| 2 | `pnpm exec vue-tsc --noEmit` 无错误 |
| 3 | 图表组件可在 demo 页面正常渲染 |
| 4 | 该能力对应的 composable/store 已有测试文件 |

### 4.2 准出（提测通过的条件）

| # | 条件 | 阈值 |
|---|------|------|
| 1 | P0 用例通过率 | 100% |
| 2 | P1 用例通过率 | ≥ 95% |
| 3 | 遗留缺陷 | 无 Blocker / Critical |
| 4 | 需求覆盖 | FR-1 ~ FR-17 无未覆盖项（除未实现项） |

---

<a id="sec-5"></a>
## 五、需求覆盖矩阵


| FR | 需求 | 单元 | 组件 | 集成 | 状态 |
|----|------|------|------|------|------|
| FR-1 | 图表库标准化 | UT-D01 | CT-D02 | — | ✅ 组件已创建，组件测试待补 |
| FR-2 | 仪表盘自定义系统 | UT-D02/03 | — | — | ✅ store+hook已有测试 |
| FR-3 | 自定义小部件系统 | — | — | — | ✅ 组件已创建，测试待补 |
| FR-4 | 图表交互钻取 | — | — | — | ⚠️ 未实现 |
| FR-5 | 图表实时更新 | — | — | — | ⚠️ 未实现 |
| FR-9 | 图表自定义主题 | UT-D04/05 | — | — | ✅ themes+mermaid测试就绪 |
| FR-10 | 图表性能优化 | UT-D06 | — | — | ✅ 降采样测试就绪 |
| FR-13 | 仪表盘收藏与刷新 | UT-D02 | — | — | ⚠️ 部分覆盖 |
| FR-15 | 仪表盘版本管理 | — | — | — | ⚠️ 未实现 |
| FR-17 | 数据分析控制台 | — | — | — | ⚠️ 未实现 |

---

<a id="sec-3"></a>
---

<a id="sec-6"></a>
## 六、单元测试


> 位置：`tests/hooks/` + `tests/utils/` · 框架：Vitest

### UT-D01 `useDashboard`（P1·6用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | 初始化仪表盘 | initDashboard创建默认仪表盘 |
| 2 | 添加小部件 | addWidgetFromPicker正确创建WidgetConfig |
| 3 | 全屏切换 | toggleFullscreen切换isFullscreen |
| 4 | 小部件选择器显隐 | showWidgetPicker初始为false |
| 5 | 刷新所有小部件 | refreshAll设置isRefreshing→完成 |
| 6 | 创建新仪表盘 | createNewDashboard调用store |

### UT-D02 `useDashboardStore`（P0·9用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | 创建仪表盘 | createDashboard返回DashboardConfig |
| 2 | 选择仪表盘 | selectDashboard切换currentId |
| 3 | 删除仪表盘自动选择下一个 | deleteDashboard后currentId更新 |
| 4 | 重命名仪表盘 | renameDashboard更新name |
| 5 | 添加/删除小部件 | addWidget/removeWidget操作 |
| 6 | 更新小部件配置 | updateWidget更新title |
| 7 | localStorage持久化 | 新建→新实例读取一致 |
| 8 | 腐败数据回退 | 非法JSON→空数组 |
| 9 | saveLayout更新timestamp | updatedAt变更 |

### UT-D03 `chart-themes`（P1·7用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | 4套预设主题 | chartThemes有4个key |
| 2 | 每套8个颜色 | colors.length≥8 |
| 3 | 主题必填字段完整 | id/name/colors/bg/textStyle |
| 4 | getTheme未知ID返回default | getTheme("unknown")===default |
| 5 | getTheme(undefined)返回default | 空参数回退 |
| 6 | 暗色主题背景正确 | dark.bg==="#1d1e1f" |
| 7 | applyTheme注入颜色和背景 | applyTheme后option含theme属性 |

### UT-D04 `mermaidThemes`（P1·8用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | 15套主题 | MERMAID_THEME_NAMES长度为15 |
| 2 | 亮色默认github-light | LIGHT_THEME_DEFAULT正确 |
| 3 | 暗色默认tokyo-night | DARK_THEME_DEFAULT正确 |
| 4 | 亮色模式生成配置 | getMermaidThemeConfig(false)返回base主题 |
| 5 | 暗色模式生成配置 | getMermaidThemeConfig(true)返回base主题 |
| 6 | 指定主题名生效 | getMermaidThemeConfig(false,"dracula")正确 |
| 7 | 未知主题回退 | getMermaidThemeConfig(false,"x")不抛异常 |
| 8 | 所有15套生成有效配置 | 遍历MERMAID_THEME_NAMES全部通过 |

### UT-D05 `chartThemeStore`（P1·5用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | 默认主题 | currentThemeKey==="default" |
| 2 | 切换主题 | setTheme("dark")→currentThemeKey==="dark" |
| 3 | 预设列表 | presetThemes.length≥4 |
| 4 | 自定义主题创建 | addCustomTheme→currentThemeKey正确 |
| 5 | 删除自定义回退default | removeCustomTheme→回退default |

### UT-D06 `LTTB downsampling`（P1·8用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | threshold≥dataLength返回原始 | 3点→threshold=5→3点 |
| 2 | data太小返回原始 | 2点→threshold=5→2点 |
| 3 | 降采样到threshold | 1000→100 |
| 4 | 首尾点保留 | result[0]===data[0], result[last]===data[last] |
| 5 | shouldDownsample大数据返回true | 10000点+800px→true |
| 6 | shouldDownsample小数据返回false | 50点+800px→false |
| 7 | getThreshold跟随viewport | 1200px>400px |
| 8 | 最小threshold=3 | 5点→threshold=3→3点 |

---

<a id="sec-4"></a>
---

<a id="sec-7"></a>
## 七、组件测试


> **状态：待补。** 10 个图表组件和 5 个 Dashboard 组件已创建，组件测试用例待编写。

### CT-D01 ChartContainer（P1·5用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1 | Loading 状态渲染 | loading=true 时显示骨架屏 |
| 2 | Error 状态渲染 + 重试 | error 消息 + 重试按钮触发 emit |
| 3 | Empty 状态渲染 | 数据为空时显示空状态提示 |
| 4 | 工具栏按钮功能 | 导出/全屏/刷新按钮触发对应事件 |
| 5 | 响应式 resize | 容器尺寸变化时 ECharts resize 被调用 |

### CT-D02 图表组件渲染（P1·10用例）
| # | 用例 | 覆盖 |
|---|------|------|
| 1-10 | 10种图表组件基础渲染 | 每种图表接受对应数据格式后正确渲染 |

---

<a id="sec-5"></a>
---

<a id="sec-8"></a>
## 八、集成测试


> **状态：待补。**

### IT-D01 布局 × 刷新 × 主题切换（P1）
- **GIVEN** 仪表盘 6 个小部件
- **WHEN** 拖拽重排→刷新→暗色模式
- **THEN** 布局持久化，图表颜色跟随主题

### IT-D02 图表下钻 × 面包屑导航（P1）
- **GIVEN** 区域销售柱状图
- **WHEN** 点击柱→下钻城市→下钻产品线
- **THEN** 面包屑路径完整，可返回

---

<a id="sec-6"></a>
---

<a id="sec-9"></a>
## 九、端到端场景


> **状态：全部待补** — UI组件和E2E基础设施未就绪。

| # | 场景 | 优先级 |
|---|------|--------|
| E2E-D1 | 仪表盘自定义布局（拖入3个小部件→调整→刷新恢复） | P1 |
| E2E-D2 | 图表钻取交互（饼图→点击→下钻柱状图→面包屑导航） | P1 |
| E2E-D3 | 图表联动（柱状图刷选→表格同步筛选） | P1 |
| E2E-D4 | 实时数据更新（WebSocket推送→图表平滑追加） | P2 |
| E2E-D5 | 仪表盘导出（6个图表→PDF 2×分辨率） | P2 |
| E2E-D6 | 仪表盘分享（生成链接→7天有效期→仅查看） | P2 |
| E2E-D7 | 版本回滚（5个历史版本→回滚到第3个） | P2 |
| E2E-D8 | Kiosk模式（3个仪表盘→30s轮播→60s刷新） | P2 |

---

<a id="sec-7"></a>
---

<a id="sec-10"></a>
## 十、性能验收测试

> 采集工具：Chrome DevTools Performance & Memory

### 10.1 图表渲染性能

| # | 数据量 | 图表类型 | 渲染时间 | 帧率 |
|---|--------|---------|---------|------|
| PT-D01 | 1,000 点 | 折线图 | < 50ms | 60fps |
| PT-D02 | 10,000 点 | 折线图 | < 200ms | 60fps |
| PT-D03 | 100,000 点 | 折线图（降采样后） | < 200ms | 30fps |

### 10.2 仪表盘性能

| # | 场景 | 阈值 |
|---|------|------|
| PT-D04 | 仪表盘首屏渲染（6 个小部件） | < 2s |
| PT-D05 | 拖拽操作响应 | < 16ms（60fps） |
| PT-D06 | 内存占用（6 小部件） | < 50MB |

---

<a id="sec-11"></a>
## 十一、无障碍测试

> 标准：WCAG 2.1 AA · 方法：Chrome DevTools Lighthouse

| # | 检查项 | 方法 | 预期 |
|---|--------|------|------|
| A11Y-D01 | 图表 aria-label | 检查 DOM | 每个图表有描述性 aria-label |
| A11Y-D02 | 键盘导航 | Tab/Enter/Arrow 操作 | 可切换小部件、进入交互 |
| A11Y-D03 | 色盲友好 | Lighthouse 审计 | 调色板避免红绿组合 |
| A11Y-D04 | 数据表格降级 | 检查"查看数据表格"入口 | 每个图表提供表格替代视图 |

---

<a id="sec-12"></a>
## 十二、缺陷分级与处理流程

### 12.1 分级定义

| 级别 | 定义 | 响应 | 示例 |
|------|------|------|------|
| Blocker | 阻塞测试或导致数据损坏 | 立即修复 | 图表渲染崩溃；降采样数据错误 |
| Critical | 核心功能不可用 | 当日修复 | 仪表盘保存失败；主题切换不生效 |
| Major | 功能缺陷但有替代路径 | 本迭代修复 | 图表 Tooltip 位置偏移；导出分辨率错误 |
| Minor | 体验或边界问题 | 排期修复 | 动画卡顿；键盘焦点顺序不对 |
| Trivial | 视觉细节 | 可延后 | 间距/图标微调 |

### 12.2 回归要求

| 缺陷类型 | 必须重跑的用例 |
|---------|--------------|
| 降采样相关 | UT-D06、PT-D01~D03 |
| 主题相关 | UT-D03/04/05 |
| 仪表盘布局相关 | UT-D01/02、E2E-D1 |

---

<a id="sec-13"></a>
## 十三、自动化现状与缺口


### 已有测试文件

| 位置 | 文件数 | 说明 |
|------|--------|------|
| `tests/hooks/useDashboard.test.ts` | 1 | useDashboard hook 测试（6用例） |
| `tests/hooks/useDashboardStore.test.ts` | 1 | dashboard store 测试（9用例） |
| `tests/hooks/chartThemeStore.test.ts` | 1 | chartTheme store 测试（5用例） |
| `tests/utils/chart-themes.test.ts` | 1 | ECharts主题测试（7用例） |
| `tests/utils/chart-downsampling.test.ts` | 1 | 降采样算法测试（8用例） |
| `tests/utils/mermaidThemes.test.ts` | 1 | Mermaid主题测试（8用例） |
| **合计** | **6** | **43 用例** |

### 执行状态

| 指标 | 值 |
|------|-----|
| 全局测试 | 78 文件 · 680 用例 · 100% 通过 |
| 本模块测试 | 6 文件 · 43 用例 · 全部通过 |
| 执行命令 | `cd YiVad && pnpm test` |

---
