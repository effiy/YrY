/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCdnAggCard · Vue 3 CDN 聚合中心卡片组件 (loader)
   适用: docs/index.html 中"七张聚合页"区块中的单张聚合卡片

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-cdn-agg-card-tpl"> 内容
     3) 注册组件到 window.YryCdnAggCard
     4) 同时通过 Vue.defineCustomElement 注册为 <yry-cdn-agg-card>
     5) 派发 'yry-cdn-agg-card-ready' 事件,通知页面挂载

   Props:
     href        (必填) 卡片跳转链接
     title       (可选) 链接 title 属性 (悬停提示)
     emoji       (可选) 左侧 emoji 图标
     name        (必填) 卡片主标题 (如 "清单聚合")
     badge       (可选) 右上角小徽标 (如 "checklist.html")
     dataSource  (可选) 数据源徽标 (如 "manifest.json")
     body        (可选) 描述文字 (支持 HTML,经 v-html 渲染)
     chips       (可选) 标签数组 (每个元素为字符串)
     refresh     (可选) 更新频率说明 (支持 HTML,经 v-html 渲染)
     cta         (可选) 底部 CTA 文字 (如 "浏览清单 →")
     target      (可选) 链接打开方式 (_blank 等)
     shortcut    (可选) 键盘快捷键数字 (如 "1"), 渲染为首位高亮 chip

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cdn-agg-card/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/shared/vue-ce-loader.js"></script>
     <script src="../../../../cdn/yry-cdn-agg-card/index.js"></script>

     <!-- 方式 A · 单卡 (custom element) -->
     <yry-cdn-agg-card
       href="../cdn/checklist.html"
       title="全卡片文件清单"
       emoji="📋" name="清单聚合" badge="checklist.html"
       data-source="manifest.json"
       cta="浏览清单 →"></yry-cdn-agg-card>

     <!-- 方式 B · Vue.createApp -->
     Vue.createApp(window.YryCdnAggCard, {
       href: '../cdn/checklist.html', emoji: '📋', name: '清单聚合',
       body: '全卡片文件清单 · <code>manifest.json</code> 驱动',
       chips: ['状态徽章','类型过滤','名称搜索'],
       cta: '浏览清单 →'
     }).mount('#host');
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCdnAggCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var COMPONENT_NAME = 'YryCdnAggCard';
  var TEMPLATE_ID = 'yry-cdn-agg-card-tpl';

  window.YrYVueCE.define({
    componentName: COMPONENT_NAME,
    templateId: TEMPLATE_ID,
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: COMPONENT_NAME,
        props: {
          href: { type: String, required: true },
          title: { type: String, default: '' },
          emoji: { type: String, default: '' },
          name: { type: String, required: true },
          badge: { type: String, default: '' },
          dataSource: { type: String, default: '' },
          body: { type: String, default: '' },
          chips: {
            type: Array,
            default: function () { return []; }
          },
          cta: { type: String, default: '' },
          refresh: { type: String, default: '' },
          target: { type: String, default: '' },
          shortcut: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();