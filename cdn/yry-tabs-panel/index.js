/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTabsPanel · 标签页 + 面板切换 (init helper)

   本组件依赖 shared.js 的 YrY.initTabs() 进行切换逻辑。
   样式由 index.css 提供，HTML 结构直接使用 yry-tabs / yry-panel 类名。

   YrY.initTabs(containerSelector) 行为:
     - 在 containerSelector 范围内查找所有 .yry-tab
     - 点击时读取 data-panel 属性
     - 调用 YrY.switchPanel(name, '.yry-tab', '.yry-panel') 切换

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-tabs-panel/index.css">
     <script src="../../../../cdn/shared/index.js"></script>
     <script>YrY.initTabs();</script>
   ═══════════════════════════════════════════════════════════════════════════ */

/* YryTabsPanel — pure CSS + shared.js init.
   No Vue 3 dependency needed. The initTabs() function handles all interactive behavior.
   See shared.js for implementation details. */
