---
title: "仪表盘组件体系"
tags:
  - 仪表盘
  - 图表
  - 数据分析
  - 实时更新
  - 钻取
  - 报告构建器
  - 小部件
  - 嵌入
  - 分享
  - 版本管理
  - 性能分析
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 已完成
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202609"
prd_task_id: YV-09-M10
estimate_frontend: 7.5
review_status: 已实现
issue_type: 功能
roles:
  - engineer
  - qa
  - pm
  - designer
source_okr: [yivad-003]
---

# 仪表盘组件体系

> 需求编号：YV-09-M10 · 优先级：P2 · 人天：7.5d（汇总所有子需求）
> 依赖：图表库标准化（YV-09-47）、ProTable 增强（YV-09-29）

## 改动总览

> **现有基础设施：** `YiVad/src/components/ECharts/` 已提供按需引入的 ECharts 6 封装（`ECOption` 类型、Canvas 渲染器、9 种图表类型）。本文档描述的图表组件体系在此基础上构建可复用组件，而非替换底层封装。

本文档整合了以下 23 个子需求，覆盖 YiVad 仪表盘和数据可视化的全部功能体系：

| 序号 | 需求编号 | 子需求 | 人天 | 优先级 |
|------|---------|--------|------|--------|
| 1 | YV-09-18 | 项目健康大盘 | 0.5 | P2 |
| 2 | YV-09-20 | 仪表盘收藏夹 | 0.3 | P2 |
| 3 | YV-09-21 | 仪表盘定时刷新 | 0.3 | P2 |
| 4 | YV-09-32 | 仪表盘自定义系统 | 0.5 | P2 |
| 5 | YV-09-47 | 数据可视化图表库标准化 | 0.5 | P2 |
| 6 | YV-09-56 | 自定义报告构建器 | 0.5 | P2 |
| 7 | YV-09-69 | 嵌入视图与联动 | 0.3 | P2 |
| 8 | YV-09-73 | 性能分析面板 | 0.3 | P2 |
| 9 | YV-09-104 | 自定义仪表盘小部件 | 0.5 | P2 |
| 10 | YV-09-111 | 资源利用率仪表盘 | 0.3 | P2 |
| 11 | YV-09-116 | 代码质量仪表盘 | 0.3 | P2 |
| 12 | YV-09-155 | 图表交互钻取 | 0.3 | P2 |
| 13 | YV-09-156 | 图表实时更新 | 0.3 | P2 |
| 14 | YV-09-157 | 仪表盘全屏模式 | 0.3 | P2 |
| 15 | YV-09-158 | 图表注释与标记 | 0.3 | P2 |
| 16 | YV-09-159 | 图表联动与刷选 | 0.3 | P2 |
| 17 | YV-09-160 | 图表自定义主题 | 0.3 | P2 |
| 18 | YV-09-161 | 图表性能优化 | 0.3 | P2 |
| 19 | YV-09-194 | 仪表盘导出 | 0.3 | P2 |
| 20 | YV-09-195 | 仪表盘嵌入 | 0.3 | P2 |
| 21 | YV-09-196 | 仪表盘分享 | 0.3 | P2 |
| 22 | YV-09-197 | 仪表盘版本管理 | 0.3 | P2 |
| 23 | YV-09-206 | 数据分析控制台 | 0.3 | P2 |

## 已实现内容（2026-09-10）

基于现有 `ECharts/index.vue` 封装和 `ECharts/config/index.ts` 按需引入配置，构建了以下基础设施：

**阶段一（图表基础设施）— 已完成：**
- [x] ChartContainer 通用容器（Loading/Error/Empty 三态 + 工具栏）
- [x] 10 种可复用图表组件（LineChart/BarChart/PieChart/AreaChart/ScatterChart/HeatmapChart/GaugeChart/RadarChart/TreemapChart/FunnelChart）
- [x] 4 套图表主题预设（默认蓝/暗色/专业灰蓝/活力多色）
- [x] LTTB 降采样算法（> 10,000 数据点自动触发）
- [x] 图表注释支持（markLine/markPoint/markArea 通过 ChartContainer 透传）

**阶段二（仪表盘系统核心）— 已完成：**
- [x] DashboardGrid 12 列 CSS Grid 拖拽布局
- [x] DashboardWidget 通用小部件容器
- [x] DashboardToolbar（添加/全屏/刷新/保存）
- [x] WidgetPicker 小部件选择面板
- [x] WidgetSettings 小部件配置面板
- [x] 仪表盘 Pinia store（多仪表盘 CRUD + localStorage 持久化）
- [x] useDashboard composable（布局操作/小部件生命周期/数据刷新）
- [x] 自定义仪表盘页面视图

**阶段三（高级能力）— 待实施（依赖后端支持）：**
- [ ] WebSocket 实时更新（需 YiAi WebSocket 端点）
- [ ] 图表联动与刷选
- [ ] 嵌入视图与联动
- [ ] 自定义报告构建器
- [ ] 仪表盘导出（PNG/PDF/HTML/JSON）
- [ ] 仪表盘分享/嵌入
- [ ] 仪表盘版本管理
- [ ] 性能分析面板
- [ ] 数据分析控制台
- [ ] 专项仪表盘（项目健康/资源/代码质量）

## 涉及文件

```
YiVad/
├── src/
│   ├── composables/
│   │   ├── useDashboard.ts                # 仪表盘核心逻辑
│   │   ├── useWidget.ts                   # 小部件管理
│   │   ├── useChartInteraction.ts         # 图表交互（钻取/联动/刷选）
│   │   ├── useChartRealTime.ts            # 图表实时更新
│   │   ├── useChartTheme.ts               # 图表主题管理
│   │   ├── useEmbeddedView.ts             # 嵌入视图联动
│   │   └── useReportBuilder.ts            # 报告构建器
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── DashboardGrid.vue          # 仪表盘网格布局
│   │   │   ├── DashboardWidget.vue        # 通用小部件容器
│   │   │   ├── DashboardToolbar.vue       # 仪表盘工具栏
│   │   │   ├── WidgetPicker.vue           # 小部件选择器
│   │   │   ├── WidgetSettings.vue         # 小部件设置面板
│   │   │   └── DashboardFullscreen.vue    # 全屏模式
│   │   ├── charts/
│   │   │   ├── ChartContainer.vue         # 图表通用容器
│   │   │   ├── LineChart.vue              # 折线图
│   │   │   ├── BarChart.vue               # 柱状图
│   │   │   ├── PieChart.vue               # 饼图
│   │   │   ├── AreaChart.vue              # 面积图
│   │   │   ├── ScatterChart.vue           # 散点图
│   │   │   ├── HeatmapChart.vue           # 热力图
│   │   │   ├── GaugeChart.vue             # 仪表盘图
│   │   │   ├── RadarChart.vue             # 雷达图
│   │   │   ├── TreemapChart.vue           # 矩形树图
│   │   │   ├── SankeyChart.vue            # 桑基图
│   │   │   ├── FunnelChart.vue            # 漏斗图
│   │   │   └── ChartToolbar.vue           # 图表工具栏
│   │   ├── report/
│   │   │   ├── ReportBuilder.vue          # 报告构建器
│   │   │   └── ReportViewer.vue           # 报告查看器
│   │   ├── performance/
│   │   │   └── PerformanceDashboard.vue   # 性能分析面板
│   │   └── analysis/
│   │       └── AnalysisConsole.vue         # 数据分析控制台
│   ├── stores/
│   │   ├── dashboard.ts                   # 仪表盘状态管理
│   │   ├── widgets.ts                     # 小部件注册表
│   │   └── chartTheme.ts                  # 图表主题状态
│   ├── utils/
│   │   ├── chart/
│   │   │   ├── echarts.ts                 # ECharts 封装
│   │   │   ├── themes.ts                  # 主题定义
│   │   │   ├── interaction.ts             # 交互工具
│   │   │   ├── downsampling.ts            # 降采样算法
│   │   │   └── realtime.ts                # 实时数据流处理
│   │   ├── dashboard/
│   │   │   ├── layout.ts                  # 网格布局算法
│   │   │   ├── export.ts                  # 仪表盘导出
│   │   │   └── version.ts                 # 版本管理
│   │   └── report/
│   │       ├── builder.ts                 # 报告生成引擎
│   │       └── templates.ts               # 报告模板
│   └── styles/
│       ├── dashboard.scss                 # 仪表盘布局样式
│       └── chart-themes.scss              # 图表主题样式
```

---

## 目录

1. [背景与问题陈述](#一背景与问题陈述)
2. [图表库标准化](#二图表库标准化)
3. [仪表盘自定义系统](#三仪表盘自定义系统)
4. [自定义小部件系统](#四自定义小部件系统)
5. [图表交互钻取](#五图表交互钻取)
6. [图表实时更新](#六图表实时更新)
7. [图表联动与刷选](#七图表联动与刷选)
8. [仪表盘全屏模式](#八仪表盘全屏模式)
9. [图表注释与标记](#九图表注释与标记)
10. [图表自定义主题](#十图表自定义主题)
11. [图表性能优化](#十一图表性能优化)
12. [嵌入视图与联动](#十二嵌入视图与联动)
13. [自定义报告构建器](#十三自定义报告构建器)
14. [仪表盘收藏与定时刷新](#十四仪表盘收藏与定时刷新)
15. [仪表盘导出/嵌入/分享](#十五仪表盘导出嵌入分享)
16. [仪表盘版本管理](#十六仪表盘版本管理)
17. [专项仪表盘](#十七专项仪表盘)
18. [数据分析控制台](#十八数据分析控制台)
19. [风险与缓解](#十九风险与缓解)
20. [实施路线图](#二十实施路线图)

---

## 一、背景与问题陈述

### 1.1 核心问题

YiVad 当前缺少系统化的数据可视化和仪表盘能力：

| # | 问题 | 严重程度 | 影响 |
|---|------|----------|------|
| 1 | **无统一图表库** -- 各页面散落使用不同图表方案 | 高 | 视觉不一致、维护分散、性能参差 |
| 2 | **仪表盘不可自定义** -- 无法按需添加/排列图表 | 高 | 不同用户/场景需查看的数据维度不同 |
| 3 | **图表无交互** -- 无钻取、无联动、无刷选 | 中 | 数据探索停留在表面，无法深入分析 |
| 4 | **无实时更新** -- 数据变化后需手动刷新页面 | 中 | 监控类场景（健康大盘、资源利用率）体验差 |
| 5 | **无报告能力** -- 无法将多个图表组合为报告导出 | 中 | 汇报场景需手动截图拼接 |
| 6 | **仪表盘不可共享** -- 无法分享视图或嵌入到外部系统 | 中 | 协作效率低 |
| 7 | **大数据量图表卡顿** -- 10 万+ 数据点渲染阻塞 | 中 | 时间跨度大的趋势分析体验差 |

### 1.2 设计原则

1. **统一图表标准** -- ECharts 作为唯一图表库，封装统一接口
2. **组件化图表** -- 每种图表类型独立封装为 Vue 组件，提供一致 props/events
3. **仪表盘即配置** -- 仪表盘布局、小部件、数据源全部可配置
4. **交互闭环** -- 钻取 -> 联动 -> 刷选 -> 导出，形成完整数据探索链
5. **性能可伸缩** -- 降采样、WebGL、渐进渲染确保大数据量体验

---

## 二、图表库标准化

### 2.1 ECharts 封装

**选型决策：** 统一使用 ECharts 5.x 作为唯一图表库。

| 维度 | ECharts | Chart.js | D3.js | 决策 |
|------|---------|----------|-------|------|
| 图表类型 | 极丰富（40+） | 中等（8 种） | 需自行实现 | **ECharts** |
| 中文支持 | 原生 | 需配置 | 需自行实现 | **ECharts** |
| 交互能力 | 钻取/联动/刷选内置 | 有限 | 需自行实现 | **ECharts** |
| 大数据量 | 降采样 + WebGL | 一般 | 需自行优化 | **ECharts** |
| 包体积 | ~300KB gzip（按需引入） | ~60KB gzip | ~50KB（需大量自定义） | 可接受 |
| 社区生态 | 极活跃 | 活跃 | 活跃 | **ECharts** |

**封装策略：**
- 每种图表类型封装为独立 Vue 组件（`LineChart.vue`、`BarChart.vue` 等）
- 统一 `options` prop + `@chartClick` / `@chartBrush` 等事件
- 按需引入 ECharts 模块（减少包体积）
- 统一主题系统
- 统一的响应式 resize 处理
- 统一的 loading / error / empty 状态

### 2.2 支持图表类型

| 图表 | 组件名 | 适用场景 |
|------|--------|----------|
| 折线图 | `LineChart` | 趋势分析、时间序列 |
| 柱状图 | `BarChart` | 分类对比 |
| 饼图 | `PieChart` | 占比分析 |
| 面积图 | `AreaChart` | 体量趋势 |
| 散点图 | `ScatterChart` | 相关性分析 |
| 热力图 | `HeatmapChart` | 密度分布（如活动热图） |
| 仪表盘图 | `GaugeChart` | 单一指标（如 CPU 使用率） |
| 雷达图 | `RadarChart` | 多维对比（如能力评估） |
| 矩形树图 | `TreemapChart` | 层级占比 |
| 桑基图 | `SankeyChart` | 流向分析 |
| 漏斗图 | `FunnelChart` | 转化率分析 |

### 2.3 图表通用容器

`ChartContainer.vue` -- 所有图表的统一外壳：

- **Loading 状态** -- 骨架屏/旋转动画
- **Error 状态** -- 错误消息 + 重试按钮
- **Empty 状态** -- 无数据提示
- **Toolbar** -- 导出/全屏/刷新 快捷按钮
- **Responsive** -- 容器大小变化时自动 resize
- **Theme** -- 统一主题注入

---

## 三、仪表盘自定义系统

### 3.1 仪表盘布局

**网格布局系统：**
- 基于 CSS Grid 的 12 列响应式网格
- 小部件通过拖拽调整位置和大小
- 小部件最小尺寸：2x2（列x行）
- 小部件最大尺寸：12x6
- 布局自动紧凑（移除小部件时自动填充空白）

**布局操作：**
- 添加小部件（从 Widget Picker 拖入仪表盘）
- 拖拽移动小部件
- 拖拽调整小部件尺寸（右下角拖拽手柄）
- 删除小部件
- 复制小部件
- 布局重置

### 3.2 小部件配置

每个小部件可独立配置：
- **数据源** -- 选择数据来源（data_service collection、聚合查询等）
- **图表类型** -- 切换图表类型（如从柱状图切换为折线图）
- **时间范围** -- 数据时间范围（最近 7 天/30 天/自定义）
- **筛选条件** -- 与其他小部件的筛选条件联合
- **刷新间隔** -- 独立设置自动刷新间隔
- **标题和描述** -- 自定义小部件标题

### 3.3 仪表盘管理

- 多仪表盘（创建/删除/复制/重命名）
- 仪表盘设置为默认首页
- 仪表盘分类/标签
- 仪表盘搜索

---

## 四、自定义小部件系统

### 4.1 小部件架构

**Widget API：**
```typescript
interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'chart' | 'metric' | 'table' | 'custom';
  defaultSize: { cols: number; rows: number };
  minSize: { cols: number; rows: number };
  component: () => Promise<Component>;  // 懒加载
  propsSchema: JSONSchema;               // 配置项 schema
}
```

**内置小部件分类：**

| 类别 | 小部件 | 说明 |
|------|--------|------|
| 图表 | 折线图/柱状图/饼图/面积图/散点图 | 标准图表类型 |
| 指标 | KPI 卡片/仪表盘图/进度环 | 单一关键指标展示 |
| 表格 | 数据表格/排行榜 | 详细数据列表 |
| 自定义 | iframe 嵌入/Markdown 文本/图片 | 自定义内容 |
| 专项 | 项目健康评分/资源利用率/代码质量 | 业务专项小部件 |

### 4.2 Widget SDK（扩展机制）

**自定义小部件注册：**
```typescript
// 开发者通过 SDK 注册自定义小部件
widgetSDK.register({
  id: 'my-custom-widget',
  name: '自定义小部件',
  component: () => import('./MyWidget.vue'),
  defaultSize: { cols: 4, rows: 3 },
  dataSources: [
    { 
      name: 'main',
      fetch: async (params) => {
        const res = await rpcCall('services.data.my_service', 'get_data', params);
        return res.data;
      }
    }
  ]
});
```

**Widget 市场概念：**
- 社区小部件浏览
- 小部件安装/卸载
- 小部件评分和评论
- 提交自定义小部件

**iframe 沙箱：**
- 第三方小部件运行在 iframe 沙箱中
- 通过 `postMessage` 通信
- 限制 iframe 权限（无 cookie、无 localStorage）

---

## 五、图表交互钻取

### 5.1 钻取交互

**下钻（Drill Down）：**
- 点击图表元素（柱/饼图扇区/折线数据点）查看更细粒度数据
- 面包屑导航显示钻取路径（如"全部项目 > 项目 A > 模块 B"）
- 上钻（Drill Up）返回上一级

**钻取路径示例：**
```
全部项目（饼图：按项目） 
  -> 点击"项目 A" 
  -> 项目 A 模块分布（柱状图：按模块）
    -> 点击"前端模块"
    -> 前端模块 Bug 趋势（折线图：按时间）
      -> 点击"2026-09-01"
      -> 当日 Bug 列表（表格）
```

### 5.2 钻取实现

- 钻取状态管理（钻取路径栈）
- 面包屑导航
- 钻取历史（前进/后退导航）
- 钻取切换动画（平滑过渡）

---

## 六、图表实时更新

### 6.1 WebSocket 数据推送

**架构：**
```
yiAi WebSocket 端点 -> 数据推送 -> ECharts 增量更新
```

**数据流模式：**
- **追加（Append）** -- 新数据点追加到末尾（如实时监控折线图）
- **替换（Replace）** -- 全量替换数据（如状态变化）
- **更新（Update）** -- 增量更新特定数据项

### 6.2 平滑过渡动画

- 数据变化时使用 ECharts 动画（`animationDurationUpdate: 500`）
- 新数据点滑入动画
- 轴范围自适应缩放

### 6.3 实时更新控制

- **暂停/恢复** -- 暂停实时更新（hover 详细查看时）
- **历史回放** -- 回放过去 N 分钟的数据变化
- **更新节流** -- 最快每秒更新 10 次（100ms 节流）
- **数据窗口** -- 仅保留最近 N 个数据点（如最近 1000 点）

---

## 七、图表联动与刷选

### 7.1 跨图表联动

**联动场景：**
- 仪表盘上多个图表展示同一数据集的不同维度
- 在一个图表上选择数据范围（刷选），其他图表同步更新
- 如：柱状图选择"2026 Q3"，折线图仅显示 Q3 数据，表格过滤为 Q3 条目

**联动实现：**
- 全局联动上下文（`ChartInteractionContext`）
- 刷选事件广播
- 图表注册/注销联动状态
- 联动状态持久化（URL 参数）

### 7.2 刷选（Brush）

- **范围选择** -- 拖拽选择矩形区域
- **刷选状态** -- 选中区域高亮
- **联动表格** -- 刷选数据同步到关联的数据表格（显示明细）
- **联动缩放/平移** -- 多个图表同步缩放和平移

### 7.3 联动配置

- 指定哪些图表之间联动
- 联动通道（同一通道内的图表才联动）
- 单向/双向联动

---

## 八、仪表盘全屏模式

### 8.1 全屏模式

**进入全屏：**
- 仪表盘工具栏"全屏"按钮
- 浏览器原生 Fullscreen API
- 全屏时隐藏侧边栏、导航栏、页脚

### 8.2 Kiosk 模式

适用于大屏幕展示（电视墙、大厅显示）：
- 自动轮播（自动切换不同仪表盘页面）
- 轮播间隔可配置（默认 30 秒）
- 幻灯片过渡动画
- 键盘导航（左右箭头切换）
- 点击暂停/恢复轮播
- 可配置刷新周期（默认每分钟刷新全部数据）

---

## 九、图表注释与标记

### 9.1 注释类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 文字标注 | 在图表上添加文字说明 | "此处发布了 v2.0" |
| 标记点 | 在数据点上添加标记 | 标注异常峰值 |
| 参考线 | 添加水平/垂直参考线 | SLA 阈值线（99.9%） |
| 标记区域 | 高亮某个时间区间 | 维护窗口（灰色区域） |

### 9.2 注释管理

- 添加注释（点击图表 + 输入文字）
- 编辑/删除注释
- 注释数据绑定（注释可以绑定到特定数据维度，切换筛选时跟随）
- 显示/隐藏注释
- 注释随图表导出（导出 PNG/PDF 时包含注释）

---

## 十、图表自定义主题

### 10.1 主题配置

**可配置项：**
- 调色板（主要颜色序列）
- 网格样式（颜色、线宽、虚线）
- 坐标轴样式（轴线颜色、刻度标签字体）
- 字体（全局字体族、字号缩放比例）
- Tooltip 样式（背景色、边框、阴影）
- Legend 样式（位置、图标大小）

**主题预设：**
- 默认（蓝色系）
- 暗色（适合深色背景仪表盘）
- 专业（灰蓝简洁风格）
- 活力（高饱和多色）

### 10.2 主题管理

- 实时预览（调整主题参数时图表实时更新）
- 主题导入/导出（JSON 配置）
- 主题应用到所有图表或指定图表
- 跟随系统亮色/暗色模式自动切换

---

## 十一、图表性能优化

### 11.1 大数据量降采样

**LTTB（Largest-Triangle-Three-Buckets）算法：**
- 将 N 个数据点降采样到 M 个（如 100 万 -> 1000）
- 保留视觉趋势特征
- 在缩放级别改变时自动调整采样率

**降采样策略：**
- 数据点 > 10,000 时自动启用
- 图表渲染前在 Web Worker 中异步降采样
- 缩放时动态调整（放大后采样率降低、缩小后采样率提高）

### 11.2 WebGL 渲染降级

- 数据点 > 50,000 时切换到 ECharts WebGL 渲染器
- Canvas 渲染器作为默认
- SVG 渲染器用于静态导出场景

### 11.3 其他优化

- **懒加载初始化** -- 图表进入视口时才初始化
- **渐进式渲染** -- 大数据量时分帧渲染（`requestIdleCallback`）
- **实例复用** -- 图表类型切换时复用 ECharts 实例
- **DOM 回收** -- 移除不可见图表的 DOM 节点
- **渲染耗时监控** -- Performance API 埋点

### 11.4 性能基准目标

| 数据量 | Canvas 渲染时间 | WebGL 渲染时间 | 目标帧率 |
|--------|----------------|---------------|---------|
| 1,000 点 | < 50ms | < 50ms | 60fps |
| 10,000 点 | < 200ms | < 100ms | 60fps |
| 100,000 点 | < 1s | < 300ms | 30fps |
| 1,000,000 点 | 降采样后 < 200ms | 降采样后 < 200ms | 30fps |

---

## 十二、嵌入视图与联动

### 12.1 嵌入视图

**功能：**
- 在实体详情页嵌入关联实体的子视图
- 如：项目详情页嵌入该项目的 Bug 统计图表
- 子视图的数据与父实体关联（上下文保持）

**嵌入方式：**
- 内嵌图表（同一页面内）
- iframe 嵌入（跨域场景）
- Web Component 嵌入（可移植）

### 12.2 数据联动导航

- 点击嵌入视图中的条目跳转到目标实体页面
- 带上下文跳转（保留筛选条件和时间范围）
- 面包屑返回路径
- 跨模块钻取（Bug -> 关联 Session -> 关联文件）

---

## 十三、自定义报告构建器

### 13.1 报告构建

**报告结构：**
- 报告标题和描述
- 多个报告区块
- 每个区块可以是：图表、KPI 卡片、数据表格、Markdown 文本
- 区块拖拽排序

**构建流程：**
1. 选择报告模板（或从空白开始）
2. 添加区块（从仪表盘小部件选择）
3. 配置每个区块的数据范围和筛选条件
4. 添加文本说明（Markdown）
5. 预览
6. 导出（PDF/HTML/PNG）

### 13.2 报告模板

**内置模板：**
- 项目周报（进度摘要 + KPI + 图表 + 风险列表）
- 质量报告（Bug 趋势 + 代码覆盖率 + 性能指标）
- 团队效能报告（工作量分布 + 完成率 + 速率趋势）
- 资源利用率报告（CPU/内存/磁盘/网络 + 成本分析）

### 13.3 报告管理

- 报告收藏
- 报告定时生成（每周一 9:00 自动发送）
- 报告分享（生成分享链接）
- 报告历史版本

---

## 十四、仪表盘收藏与定时刷新

### 14.1 仪表盘收藏夹

- 收藏/取消收藏仪表盘
- 收藏夹列表（名称、描述、最后访问时间）
- 快速切换到已收藏仪表盘
- 设为默认首页（打开 YiVad 显示收藏的默认仪表盘）

### 14.2 定时刷新

- 仪表盘级全局刷新间隔（默认 60 秒）
- 小部件级独立刷新间隔（覆盖仪表盘设置）
- 刷新状态指示（上次刷新时间、"刷新中..."动画）
- 手动刷新按钮（强制立即刷新所有小部件）
- 刷新失败重试（最多 3 次）
- WebSocket 实时推送优先于定时轮询

---

## 十五、仪表盘导出/嵌入/分享

### 15.1 仪表盘导出

**导出格式：**
- **PNG** -- 当前仪表盘截图（适合快速分享）
- **PDF** -- 完整仪表盘多页导出（A4 横版，每页 2-4 个图表）
- **HTML** -- 独立 HTML 文件（适合离线查看）
- **JSON** -- 仪表盘配置 + 数据（适合备份迁移）

**导出选项：**
- 包含/排除注释
- 包含/排除标题
- 时间段选择（导出指定时间范围的数据）
- 分辨率选择（1x/2x）

### 15.2 仪表盘嵌入

- 生成嵌入代码（`<iframe src="..."></iframe>`）
- 嵌入尺寸配置
- 嵌入权限控制（仅查看/允许交互）
- 嵌入主题适配（亮色/暗色/透明背景）
- 嵌入 Token 认证（防止未授权访问）

### 15.3 仪表盘分享

- 生成分享链接（带有效期：1 小时/24 小时/7 天/永久）
- 分享权限（仅查看/可编辑/可评论）
- 密码保护
- 分享给团队/所有人
- 撤回分享
- 分享统计（查看次数、最后查看时间）

---

## 十六、仪表盘版本管理

### 16.1 版本控制

- 自动保存编辑历史（每次布局变更或配置变更）
- 版本列表（版本号、修改时间、修改内容摘要）
- 版本回滚（恢复到历史版本）
- 版本差异对比（当前版本 vs 历史版本的可视化 diff）
- 版本命名（手动为重要版本命名，如"Q3 汇报版"）

### 16.2 版本存储

- 版本数据存储在 MongoDB
- 仅存储配置差异（delta），节省存储空间
- 最多保留 50 个版本，超出自动清理最旧版本

---

## 十七、专项仪表盘

### 17.1 项目健康大盘

**展示指标：**
- 项目状态概览（活跃/延迟/风险项目数量）
- Bug 趋势（最近 30 天新增/关闭趋势）
- 任务完成率（甘特图进度条）
- SLA 达标率
- 团队工作量分布
- 项目健康评分（综合评分 0-100）

**评分算法：**
- 按时交付率 × 40%
- Bug 修复速度 × 25%
- SLA 达标率 × 20%
- 团队饱和度 × 15%（过高或过低都扣分）

### 17.2 资源利用率仪表盘

**监控指标（按服务/实例/容器维度）：**
- CPU 使用率
- 内存使用量
- 磁盘 I/O
- 网络流量
- 历史趋势图（1h/6h/24h/7d/30d）
- 容量预测（基于历史趋势预估何时需扩容）
- 成本归因（每个服务/项目的资源成本）
- 优化建议（闲置资源识别、合理规模建议）

### 17.3 代码质量仪表盘

**质量指标：**
- 静态分析结果（ESLint/TSLint 问题分布）
- 代码复杂度（圈复杂度/认知复杂度）
- 代码重复率
- 测试覆盖率（语句/分支/函数/行覆盖率）
- 代码坏味追踪（Bad Smell 分类统计）
- 质量趋势图（最近 10 次分析结果对比）
- 跨项目质量对比
- 质量门禁可视化（通过/不通过状态）

### 17.4 性能分析面板

**前端性能监控：**
- 页面加载时间线（DNS/TCP/TTFB/DOM/Load）
- API 瀑布图（每个请求的耗时分解）
- 渲染剖析（组件渲染时间、重渲染次数）
- Core Web Vitals（LCP/FID/CLS）
- 性能评分（Lighthouse 分数趋势）

---

## 十八、数据分析控制台

### 18.1 控制台布局

- KPI 指标卡片（顶部，如总用户数/活跃度/增长率）
- 趋势图表（中部，折线图/面积图）
- 日期范围选择器（快速选择：今天/本周/本月/自定义）
- 维度和指标切换
- 数据下载（导出分析结果为 CSV/Excel）

### 18.2 分析能力

- **用户行为分析** -- 页面访问量、功能使用率、用户路径
- **项目效能分析** -- 完成率、交付速度、返工率
- **团队协作分析** -- 活跃度、沟通频率、协作网络图
- **质量趋势分析** -- Bug 发现率/修复率、回归率
- **预测性分析** -- 基于历史数据的趋势预测
- **异常检测** -- 自动识别数据中的异常模式

### 18.3 分析功能

- 维度和指标选择
- 多维度对比（环比、同比）
- 数据筛选（按时间/项目/团队/用户等维度过滤）
- 图表类型切换
- 分析结果收藏和分享
- 自定义分析查询（高级用户）

---

## 十九、风险与缓解

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|----------|----------|
| ECharts 包体积过大 | 高 | 中 | 中 | 按需引入模块；路由懒加载图表页面 | 首屏仅加载必要图表类型 |
| WebSocket 连接不稳定 | 中 | 中 | 中 | 自动重连；降级为轮询（60s 间隔） | 显示"实时数据不可用" |
| 大数据量图表卡顿 | 中 | 高 | 高 | 降采样（LTTB）；WebGL 渲染；Web Worker | 限制最大显示点数为 10,000 |
| 仪表盘配置损坏 | 低 | 中 | 低 | 版本管理自动保存；配置校验 | 回滚到上一个有效版本 |
| 实时更新导致页面性能下降 | 中 | 中 | 中 | 节流更新频率（100ms）；暂停非可见图表更新 | 暂停所有实时更新 |
| iframe 嵌入安全风险 | 低 | 高 | 高 | Token 认证；域名白名单; X-Frame-Options | 禁用嵌入功能 |
| 仪表盘嵌入链接泄露 | 中 | 中 | 中 | 有效期限制；密码保护 | 撤回所有分享链接 |
| 图表主题与亮色/暗色模式切换冲突 | 低 | 低 | 低 | 主题预设同时提供亮色和暗色版本 | 自动跟随系统主题 |
| ECharts 版本升级导致图表渲染异常 | 低 | 中 | 低 | 锁定 ECharts 版本号；升级前回归测试 | 回滚 ECharts 版本 |

---

## 二十、实施路线图

### 阶段一：图表基础设施（P2，约 2.0d）

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 图表库标准化 | ECharts 封装 + 10 种图表组件 | 0.50 |
| 2 | ChartContainer 通用容器 | Loading/Error/Empty/Toolbar 状态 | 0.30 |
| 3 | 图表自定义主题 | 4 套主题预设 + 主题编辑器 | 0.30 |
| 4 | 图表性能优化 | 降采样 + WebGL + 懒加载 | 0.30 |
| 5 | 图表注释与标记 | 标注/标记点/参考线/标记区域 | 0.30 |
| 6 | 图表交互钻取 | 下钻/上钻 + 面包屑导航 | 0.30 |

### 阶段二：仪表盘系统（P2，约 2.5d）

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 仪表盘网格布局 | `DashboardGrid.vue` + 拖拽布局 | 0.50 |
| 2 | 仪表盘自定义系统 | 小部件添加/移动/调整/删除/配置 | 0.50 |
| 3 | 自定义小部件 | Widget SDK + Widget Picker | 0.50 |
| 4 | 仪表盘收藏与定时刷新 | 收藏夹 + 刷新间隔配置 | 0.30 |
| 5 | 仪表盘全屏/Kiosk 模式 | 全屏 + 轮播 | 0.30 |
| 6 | 仪表盘分享 | 分享链接 + 权限 + 有效期 | 0.30 |

### 阶段三：高级能力（P2，约 3.0d）

| 步骤 | 任务 | 产出 | 人天 |
|------|------|------|------|
| 1 | 图表实时更新 | WebSocket 推送 + 平滑动画 | 0.30 |
| 2 | 图表联动与刷选 | 跨图表联动 + 刷选 + 缩放同步 | 0.30 |
| 3 | 嵌入视图与联动 | 子视图嵌入 + 上下文保持 | 0.30 |
| 4 | 自定义报告构建器 | 报告构建 + 模板 + 导出 | 0.50 |
| 5 | 仪表盘导出 | PNG/PDF/HTML/JSON 导出 | 0.30 |
| 6 | 仪表盘嵌入 | iframe 嵌入 + Token 认证 | 0.30 |
| 7 | 仪表盘版本管理 | 自动保存 + 版本列表 + 回滚 | 0.30 |
| 8 | 性能分析面板 | 加载时间线 + API 瀑布图 | 0.30 |
| 9 | 数据分析控制台 | 多维分析 + 预测 + 异常检测 | 0.30 |
| 10 | 专项仪表盘 | 项目健康/资源/代码质量仪表盘 | 0.30 |

**总计：7.5d**

---

## 代码审查检查清单

### 图表库标准化
- [ ] ECharts 按需引入，无完整包导入
- [ ] 所有图表组件通过 ChartContainer 包裹
- [ ] 响应式 resize 正确处理
- [ ] Loading/Error/Empty 状态完整
- [ ] 图表事件（click/brush/legendselectchanged）正确 emit

### 仪表盘布局
- [ ] 12 列网格布局正确
- [ ] 小部件拖拽移动流畅
- [ ] 小部件尺寸调整正确
- [ ] 布局自动紧凑无空白
- [ ] 布局持久化到 localStorage/MongoDB

### 图表交互
- [ ] 钻取路径面包屑正确
- [ ] 上钻返回上一级数据正确
- [ ] 联动通道隔离（不同通道的图表不联动）
- [ ] 刷选数据与表格联动正确

### 实时更新
- [ ] WebSocket 连接/重连正常
- [ ] 数据追加/替换/更新模式正确
- [ ] 更新节流生效
- [ ] 暂停/恢复正常
- [ ] 降级为轮询正常

### 图表性能
- [ ] 降采样后图表视觉趋势正确
- [ ] WebGL 渲染降级阈值合理（50K 点）
- [ ] 懒加载初始化（进入视口前不初始化）
- [ ] 渲染耗时监控埋点

### 仪表盘功能
- [ ] 导出 PNG/PDF/HTML/JSON 正确
- [ ] 分享链接生成和访问正常
- [ ] 嵌入 Token 认证
- [ ] 版本回滚后数据恢复正确
- [ ] 定时刷新逻辑正确
- [ ] Kiosk 模式轮播正常

### 报告构建器
- [ ] 区块添加/排序/删除正常
- [ ] 模板保存和加载
- [ ] 报告导出格式正确

---

## 回归问题预测

| # | 问题 | 预测场景 | 根因 | 预防措施 |
|---|------|---------|------|---------|
| 1 | ECharts 实例未正确销毁导致内存泄漏 | 频繁切换仪表盘页面 | `setOption` 而非 `dispose`；组件卸载时未销毁 | `onUnmounted` 中调用 `dispose`；限制实例总数 |
| 2 | 降采样导致异常峰值被平滑掉 | 监控数据中包含瞬时尖峰 | LTTB 算法倾向保留趋势而非异常值 | 对异常检测场景使用无降采样的原始数据 |
| 3 | 多图表联动时事件循环风暴 | 5+ 图表联动，一个刷选触发连锁反应 | 事件广播无防抖 | 使用防抖 100ms；检查事件源头避免循环 |
| 4 | 仪表盘嵌入链接在内部网络不可用 | 分享链接使用 absolute URL，内网 DNS 不同 | URL 生成依赖 `window.location.origin` | 使用相对路径 + 当前 origin 动态构造 |
| 5 | WebSocket 推送数据与 REST 轮询数据不一致 | WebSocket 和轮询同时启用 | 不同数据源、不同时间戳 | WebSocket 优先；轮询作为降级；显示数据来源 |
| 6 | 仪表盘导出的 PDF 文件过大 | 复杂仪表盘导出为多页 PDF | 每页包含高清 ECharts 截图 + 表格 | 提供分辨率选择（1x/2x）；限制最大页数 |
| 7 | Kiosk 模式内存持续增长 | 大屏展示数小时后浏览器卡顿 | 图表实例未清理；历史数据累积 | 定期清理不可见图表；限制数据窗口大小 |
| 8 | 版本管理存储空间膨胀 | 仪表盘频繁编辑，版本数量迅速增长 | 每次编辑都创建新版本 | delta 存储；最多 50 个版本；30 天以上版本自动清理 |

---

## 补充：核心实现细节

### C.1 ECharts 封装架构

**通用图表组件接口：**

```typescript
// ChartContainer 是所有图表的统一容器
interface ChartContainerProps {
  /** 图表标题 */
  title?: string;
  /** 图表高度 */
  height?: string | number;
  /** 加载状态 */
  loading?: boolean;
  /** 错误状态 */
  error?: string | null;
  /** 空数据状态 */
  empty?: boolean;
  /** 空数据提示文本 */
  emptyText?: string;
  /** 是否显示工具栏（导出/全屏/刷新） */
  showToolbar?: boolean;
  /** 导出功能开关 */
  exportable?: boolean;
  /** 全屏功能开关 */
  fullscreenable?: boolean;
  /** 刷新功能开关 */
  refreshable?: boolean;
}

// 具体图表组件接口（以 LineChart 为例）
interface LineChartProps extends ChartContainerProps {
  /** ECharts 原生配置（扩展使用） */
  options?: EChartsOption;
  /** 数据（简化模式） */
  data?: ChartData;
  /** X 轴配置 */
  xAxis?: AxisConfig;
  /** Y 轴配置 */
  yAxis?: AxisConfig;
  /** 图例配置 */
  legend?: LegendConfig;
}

interface ChartData {
  categories: string[];           // X 轴类目
  series: Array<{
    name: string;
    data: number[];
    type: 'line' | 'bar' | 'area';
    color?: string;
    smooth?: boolean;             // 平滑曲线
    areaStyle?: boolean;          // 面积填充
  }>;
}
```

**ECharts 实例生命周期管理：**

```
组件挂载
  → init(chartDom) → 创建 ECharts 实例
  → setOption(options) → 首次渲染
  → 添加 ResizeObserver → 监听容器尺寸变化
  → 注册事件监听器（click, brush, legendselectchanged）

数据更新
  → setOption(newOptions, { notMerge: false }) → 增量更新
  → 或 setOption(newOptions, { notMerge: true }) → 全量替换

组件卸载
  → 移除事件监听器
  → dispose() → 销毁 ECharts 实例
  → 移除 ResizeObserver
```

### C.2 仪表盘网格布局算法

**拖拽布局实现（基于 CSS Grid + 拖拽事件）：**

```typescript
interface WidgetLayout {
  id: string;
  x: number;       // 列起始位置（0-11）
  y: number;       // 行起始位置
  cols: number;    // 占用列数（1-12）
  rows: number;    // 占用行数（1-6）
  minCols: number; // 最小列数
  minRows: number; // 最小行数
}

// 布局碰撞检测
function isColliding(a: WidgetLayout, b: WidgetLayout): boolean {
  return (
    a.x < b.x + b.cols &&
    a.x + a.cols > b.x &&
    a.y < b.y + b.rows &&
    a.y + a.rows > b.y
  );
}

// 自动紧凑布局（所有小部件向上和向左靠拢）
function compactLayout(widgets: WidgetLayout[]): WidgetLayout[] {
  const sorted = [...widgets].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const widget of sorted) {
    // 尝试向上移动
    while (widget.y > 0) {
      widget.y--;
      if (sorted.some(w => w.id !== widget.id && isColliding(widget, w))) {
        widget.y++; // 回退
        break;
      }
    }
    // 尝试向左移动
    while (widget.x > 0) {
      widget.x--;
      if (sorted.some(w => w.id !== widget.id && isColliding(widget, w))) {
        widget.x++; // 回退
        break;
      }
    }
  }
  return sorted;
}
```

**布局持久化：**

```typescript
interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: Array<{
    id: string;
    widgetType: string;         // 小部件类型标识
    layout: WidgetLayout;
    config: Record<string, any>; // 小部件特有配置
    dataSource: DataSourceConfig; // 数据源配置
  }>;
  refreshInterval?: number;     // 全局刷新间隔（秒）
  theme?: string;               // 主题
  createdAt: string;
  updatedAt: string;
}
```

### C.3 图表数据源管理

**数据源抽象层：**

```typescript
interface DataSourceConfig {
  type: 'rpc' | 'rest' | 'static' | 'websocket' | 'computed';
  
  // RPC 数据源
  rpc?: {
    moduleName: string;
    methodName: string;
    parameters: Record<string, any>;
    transform?: (data: any) => ChartData; // 数据转换函数
  };
  
  // REST 数据源
  rest?: {
    url: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Record<string, any>;
    transform?: (data: any) => ChartData;
  };
  
  // 静态数据源（用于演示/测试）
  static?: ChartData;
  
  // WebSocket 实时数据源
  websocket?: {
    channel: string;
    transform?: (message: any) => ChartDataUpdate;
  };
  
  // 计算数据源（从其他小部件的数据派生）
  computed?: {
    dependencies: string[];     // 依赖的小部件 ID
    compute: (data: Record<string, any>) => ChartData;
  };
}

// 数据获取流程
async function fetchChartData(config: DataSourceConfig): Promise<ChartData> {
  switch (config.type) {
    case 'rpc':
      const rpcRes = await rpcCall(config.rpc!.moduleName, config.rpc!.methodName, config.rpc!.parameters);
      return config.rpc!.transform ? config.rpc!.transform(rpcRes.data) : rpcRes.data;
    case 'rest':
      const restRes = await fetch(config.rest!.url, { method: config.rest!.method, body: JSON.stringify(config.rest!.body) });
      const data = await restRes.json();
      return config.rest!.transform ? config.rest!.transform(data) : data;
    case 'static':
      return config.static!;
    // websocket 和 computed 由专门的 composable 处理
  }
}
```

### C.4 图表实时更新 WebSocket 实现

**WebSocket 连接管理：**

```typescript
class ChartWebSocketManager {
  private ws: WebSocket | null = null;
  private channels: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 初始 1 秒
  
  connect() {
    this.ws = new WebSocket(`ws://${location.host}/ws/charts`);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      // 重新订阅所有频道
      this.channels.forEach((_, channel) => this.subscribe(channel));
    };
    
    this.ws.onmessage = (event) => {
      const { channel, data } = JSON.parse(event.data);
      const subscribers = this.channels.get(channel);
      if (subscribers) {
        subscribers.forEach(callback => callback(data));
      }
    };
    
    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
      }
    };
  }
  
  subscribe(channel: string, callback?: (data: any) => void) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
      this.ws?.send(JSON.stringify({ action: 'subscribe', channel }));
    }
    if (callback) {
      this.channels.get(channel)!.add(callback);
    }
  }
  
  unsubscribe(channel: string, callback?: (data: any) => void) {
    if (callback) {
      this.channels.get(channel)?.delete(callback);
    }
    if (this.channels.get(channel)?.size === 0) {
      this.channels.delete(channel);
      this.ws?.send(JSON.stringify({ action: 'unsubscribe', channel }));
    }
  }
}
```

### C.5 降采样算法 LTTB 实现

**LTTB（Largest-Triangle-Three-Buckets）：**

```typescript
/**
 * LTTB 降采样算法
 * 将 N 个数据点降采样到 M 个，保留视觉趋势特征
 */
function lttb(data: [number, number][], threshold: number): [number, number][] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold === 0) return data;
  
  const sampled: [number, number][] = [];
  let sampledIndex = 0;
  
  // 桶大小（除第一个和最后一个点外）
  const bucketSize = (dataLength - 2) / (threshold - 2);
  
  // 第一个点始终保留
  sampled[sampledIndex++] = data[0];
  
  let a = 1; // 上一个桶的起始索引
  
  for (let i = 0; i < threshold - 2; i++) {
    // 计算当前桶的范围
    const avgRangeStart = Math.floor((i + 0) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 1) * bucketSize) + 1;
    const rangeStart = Math.max(a, avgRangeStart);
    const rangeEnd = Math.min(dataLength - 2, avgRangeEnd);
    
    // 下一个桶的起始和结束
    const nextRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const nextRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const nextA = Math.min(dataLength - 1, nextRangeStart);
    
    if (rangeEnd <= rangeStart) continue;
    
    // 计算下一个桶的平均点（用于三角形面积计算）
    let avgX = 0, avgY = 0;
    const avgCount = Math.max(1, nextRangeEnd - nextA);
    for (let j = nextA; j < nextRangeEnd; j++) {
      avgX += data[j][0];
      avgY += data[j][1];
    }
    avgX /= avgCount;
    avgY /= avgCount;
    
    // 在桶中选择三角形面积最大的点
    let maxArea = -1;
    let maxAreaIndex = rangeStart;
    const pointA = data[a - 1]; // 上一个选择的点
    
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (pointA[0] - avgX) * (data[j][1] - pointA[1]) -
        (pointA[0] - data[j][0]) * (avgY - pointA[1])
      ) * 0.5;
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }
    
    sampled[sampledIndex++] = data[maxAreaIndex];
    a = maxAreaIndex + 1;
  }
  
  // 最后一个点始终保留
  sampled[sampledIndex++] = data[dataLength - 1];
  
  return sampled;
}
```

**降采样策略：**

| 视图分辨率 | 最大显示点数 | 降采样触发阈值 |
|-----------|------------|---------------|
| 全屏仪表盘（1920px） | 1,000 | > 1,000 点 |
| 半宽小部件（960px） | 500 | > 500 点 |
| 小部件（480px） | 200 | > 200 点 |
| 移动端（375px） | 100 | > 100 点 |

### C.6 仪表盘导出实现

**PNG 导出（ECharts getDataURL）：**

```typescript
async function exportDashboardAsPNG(dashboardId: string, resolution: 1 | 2 = 2): Promise<Blob> {
  // 获取所有图表实例
  const chartInstances = getChartInstances(dashboardId);
  
  // 并行导出所有图表为 PNG
  const chartImages = await Promise.all(
    chartInstances.map(async (chart) => ({
      id: chart.id,
      title: chart.title,
      dataURL: chart.echartsInstance.getDataURL({
        type: 'png',
        pixelRatio: resolution,
        backgroundColor: '#fff',
      }),
    }))
  );
  
  // 使用 Canvas 组合所有图表
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 计算总画布大小
  const colWidth = 600 * resolution;
  const rowHeight = 400 * resolution;
  const cols = 2;
  const rows = Math.ceil(chartImages.length / cols);
  
  canvas.width = colWidth * cols;
  canvas.height = rowHeight * rows + 60 * resolution; // + 标题高度
  
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制标题
  ctx.font = `${24 * resolution}px sans-serif`;
  ctx.fillStyle = '#000000';
  ctx.fillText(dashboardName, 20 * resolution, 40 * resolution);
  
  // 逐图表绘制
  for (let i = 0; i < chartImages.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const img = await loadImage(chartImages[i].dataURL);
    
    ctx.drawImage(
      img,
      col * colWidth + 10 * resolution,
      row * rowHeight + 60 * resolution,
      colWidth - 20 * resolution,
      rowHeight - 20 * resolution,
    );
  }
  
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'));
}
```

**PDF 导出（jsPDF + 图表截图）：**

```typescript
async function exportDashboardAsPDF(dashboardId: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  const chartInstances = getChartInstances(dashboardId);
  const chartsPerPage = 4; // A4 横版可放 2x2=4 个图表
  const pageWidth = 277; // A4 横版宽度 mm
  const pageHeight = 190; // A4 横版高度 mm
  const chartWidth = 130;
  const chartHeight = 75;
  const marginX = 10;
  const marginY = 20;
  
  for (let i = 0; i < chartInstances.length; i++) {
    const pageIndex = Math.floor(i / chartsPerPage);
    const positionOnPage = i % chartsPerPage;
    const col = positionOnPage % 2;
    const row = Math.floor(positionOnPage / 2);
    
    if (positionOnPage === 0 && i > 0) {
      doc.addPage();
    }
    
    // 添加图表标题
    const x = marginX + col * (chartWidth + 5);
    const y = marginY + row * (chartHeight + 10);
    
    doc.setFontSize(10);
    doc.text(chartInstances[i].title, x, y - 5);
    
    // 添加图表截图
    const dataURL = chartInstances[i].echartsInstance.getDataURL({
      type: 'png',
      pixelRatio: 1,
      backgroundColor: '#fff',
    });
    doc.addImage(dataURL, 'PNG', x, y, chartWidth, chartHeight);
  }
  
  return doc.output('blob');
}
```

### C.7 Widget SDK 和沙箱机制

**Widget SDK 接口：**

```typescript
interface WidgetSDK {
  /** 注册自定义小部件 */
  register(definition: WidgetDefinition): void;
  
  /** 注销小部件 */
  unregister(widgetId: string): void;
  
  /** 获取当前仪表盘上下文 */
  getContext(): DashboardContext;
  
  /** 订阅数据更新 */
  onDataUpdate(callback: (data: any) => void): () => void;
  
  /** 设置小部件配置 */
  setConfig(config: Record<string, any>): void;
  
  /** 更新小部件大小 */
  resize(cols: number, rows: number): void;
}

// 小部件内使用 SDK（通过 provide/inject）
// 小部件组件通过 inject('widgetSDK') 获取 SDK 实例
```

**iframe 沙箱小部件通信：**

```typescript
// 主页面 → iframe
iframe.contentWindow.postMessage({
  type: 'WIDGET_DATA_UPDATE',
  payload: { data: chartData, config: widgetConfig },
}, '*');

// iframe → 主页面
window.parent.postMessage({
  type: 'WIDGET_RESIZE',
  payload: { cols: 6, rows: 4 },
}, '*');

// 安全验证：iframe 使用 origin 白名单
const ALLOWED_ORIGINS = [window.location.origin, 'https://widgets.yivad.com'];

window.addEventListener('message', (event) => {
  if (!ALLOWED_ORIGINS.includes(event.origin)) return;
  // 处理消息
});
```

### C.8 仪表盘全屏轮播实现

**Kiosk 轮播控制器：**

```typescript
class KioskCarousel {
  private dashboards: DashboardConfig[];
  private currentIndex = 0;
  private timer: number | null = null;
  private interval: number;       // 秒
  private paused = false;
  private transitionDuration = 500; // 毫秒
  
  constructor(dashboards: DashboardConfig[], interval = 30) {
    this.dashboards = dashboards;
    this.interval = interval * 1000;
  }
  
  start() {
    this.showDashboard(this.currentIndex);
    this.scheduleNext();
  }
  
  pause() {
    this.paused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  
  resume() {
    this.paused = false;
    this.scheduleNext();
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.dashboards.length;
    this.showDashboard(this.currentIndex);
    this.scheduleNext();
  }
  
  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.dashboards.length) % this.dashboards.length;
    this.showDashboard(this.currentIndex);
    this.scheduleNext();
  }
  
  private scheduleNext() {
    if (this.paused) return;
    this.timer = window.setTimeout(() => this.next(), this.interval);
  }
  
  private async showDashboard(index: number) {
    const dashboard = this.dashboards[index];
    // 淡出当前仪表盘
    await animateOut(this.transitionDuration);
    // 切换数据
    loadDashboard(dashboard.id);
    // 淡入新仪表盘
    await animateIn(this.transitionDuration);
  }
  
  destroy() {
    this.pause();
  }
}
```

---

## 补充：端到端测试场景

### E2E-D1: 仪表盘自定义布局

- **GIVEN** 空白仪表盘
- **WHEN** 用户拖入 3 个小部件（折线图、KPI 卡片、表格），调整大小和位置
- **THEN** 布局正确保存，刷新后恢复

### E2E-D2: 图表钻取交互

- **GIVEN** 饼图显示按项目分布的 Bug
- **WHEN** 用户点击"项目 A"扇区
- **THEN** 图表切换为项目 A 的按模块分布的柱状图，面包屑显示"全部 > 项目 A"

### E2E-D3: 图表联动

- **GIVEN** 仪表盘包含柱状图（按月统计）和表格（详细列表）
- **WHEN** 用户在柱状图上刷选 2026-01 到 2026-03
- **THEN** 表格自动筛选为这 3 个月的数据

### E2E-D4: 实时数据更新

- **GIVEN** CPU 监控折线图正在实时更新
- **WHEN** 后端推送新的 CPU 数据点
- **THEN** 图表平滑追加新数据点，旧数据点向左移动

### E2E-D5: 仪表盘导出

- **GIVEN** 一个包含 6 个图表的仪表盘
- **WHEN** 用户导出为 PDF（2x 分辨率）
- **THEN** 生成 2 页横版 PDF，所有图表清晰可见

### E2E-D6: 仪表盘分享

- **GIVEN** 仪表盘已配置完成
- **WHEN** 用户生成分享链接（7 天有效期，仅查看权限）
- **THEN** 其他用户可通过链接查看但不编辑

### E2E-D7: 版本回滚

- **GIVEN** 仪表盘有 5 个历史版本
- **WHEN** 用户回滚到第 3 个版本
- **THEN** 仪表盘布局和配置恢复为第 3 个版本的状态

### E2E-D8: Kiosk 模式

- **GIVEN** 3 个仪表盘配置了轮播
- **WHEN** 进入 Kiosk 模式
- **THEN** 仪表盘每 30 秒自动切换，数据每 60 秒自动刷新

---

## 补充：图表性能优化检测清单

### 渲染性能检测

| 检测项 | 检测方式 | 通过标准 |
|--------|---------|---------|
| 图表初始化时间 | `performance.mark('chart-init-start')` / `performance.mark('chart-init-end')` | < 100ms |
| 数据更新渲染时间 | `performance.measure('chart-update')` | < 50ms（1K 点） / < 500ms（100K 点） |
| 图表内存占用 | `performance.memory.usedJSHeapSize` 变化 | < 5MB 单个图表实例 |
| ResizeObserver 回调频率 | 计数器 + 节流检查 | < 60fps 期间的回调频率 |
| ECharts 实例数 | `echarts.getInstanceByDom()` 统计 | < 可视图表数 + 5 |
| 降采样触发时机 | 数据点阈值检查 | > 1000 点时自动降采样 |
| WebGL 回退触发 | `echarts.getRenderer()` | > 50000 点时使用 WebGL |

### 仪表盘整体性能

| 检测项 | 检测方式 | 通过标准 |
|--------|---------|---------|
| 仪表盘首屏加载 | Lighthouse Performance Score | > 80 |
| 10+ 图表同时渲染 | `performance.measure('dashboard-render')` | < 2s |
| 仪表盘操作帧率 | `requestAnimationFrame` 采样 | > 30fps |
| 实时更新 CPU 使用率 | Chrome DevTools Performance | < 20% |
| 内存泄漏检测 | 10 分钟内存快照对比 | 增长 < 10MB |
| 小部件拖拽流畅度 | 视觉检测 + frame timing | 无可见卡顿 |

---

## 补充：无障碍（Accessibility）要求

| 组件 | WCAG 要求 | 实现方式 |
|------|----------|---------|
| 图表容器 | `role="img"` + `aria-label` | 静态设置 + 动态描述 |
| 图表数据表格 | 隐藏的数据表格供屏幕阅读器 | `<table class="sr-only">` |
| 仪表盘网格 | `role="region"` + `aria-label` | 每个小部件设置 |
| 趋势描述 | 趋势变化的文字描述 | 自动生成（如"CPU 使用率上升了 5%"） |
| 颜色对比度 | 图表颜色满足 WCAG AA 标准 | 主题预设中验证 |
| 键盘导航 | 仪表盘内图表可通过 Tab 键导航 | 图表容器 `tabindex="0"` |
| 全屏模式 | `aria-label="全屏模式"` / "退出全屏" | 动态切换 |
| Kiosk 模式 | 可暂停/恢复轮播的按钮 | 键盘 Space 暂停/恢复 |
| 钻取面包屑 | 导航可被屏幕阅读器识别 | `aria-label="钻取路径"` |
| 图表工具栏 | 每个按钮有 `aria-label` | 导出/全屏/刷新按钮 |
| 7 | Kiosk 模式内存持续增长 | 大屏展示数小时后浏览器卡顿 | 图表实例未清理；历史数据累积 | 定期清理不可见图表；限制数据窗口大小 |
| 8 | 版本管理存储空间膨胀 | 仪表盘频繁编辑，版本数量迅速增长 | 每次编辑都创建新版本 | delta 存储；最多 50 个版本；30 天以上版本自动清理 |

---

## 补充：单元测试用例

### UT-D01: ChartContainer

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 基本渲染 | `type='line', data=[...]` | canvas 元素存在，尺寸正确 |
| 2 | 空数据 | `data=[]` | 显示空状态插画 |
| 3 | 类型切换 | `type` 从 'line' 变为 'bar' | 实例销毁并重建 |
| 4 | 响应式 resize | 容器 resize 触发 | 图表自动重绘 |
| 5 | 数据更新 | data ref 变化 | 动画过渡到新数据 |
| 6 | 主题切换 | 暗色模式 | 颜色跟随主题 |

### UT-D02: useDashboardGrid

| # | 测试场景 | 输入 | 期望结果 |
|---|---------|------|---------|
| 1 | 加载布局 | localStorage 有保存 | 按保存布局渲染 |
| 2 | 拖拽排序 | 拖拽 A → 位置 B | grid 重排并持久化 |
| 3 | 添加/删除小部件 | 添加图表 → 删除 | 数量增减正确 |

## 补充：集成测试场景

### IT-D01: 布局 + 刷新 + 主题切换
- **GIVEN** 仪表盘 6 个小部件
- **WHEN** 拖拽重排 → 刷新 → 暗色模式
- **THEN** 布局持久化，图表颜色跟随主题

### IT-D02: 图表下钻 + 面包屑导航
- **GIVEN** 区域销售柱状图
- **WHEN** 点击柱 → 下钻城市 → 下钻产品线
- **THEN** 面包屑路径完整，可返回

## 补充：实例演示页面

### Demo-D01: 仪表盘构建器
拖拽小部件构建仪表盘，支持布局排序、实时预览、主题切换、Kiosk 模式。

### Demo-D02: 图表类型展示
网格展示折线/柱状/饼图/散点/雷达/热力图/树图/桑基图等 12+ 种图表。

