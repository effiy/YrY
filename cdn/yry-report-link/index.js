/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryReportLink · Vue 3 评分报告链接 chip 组件 (loader)
   适用: docs/index.html 中 score-report section 内的 <a class="sr-link"> 单条链接

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-report-link-tpl"> 内容
     3) 注册组件到 window.YryReportLink
     4) 同时通过 Vue.defineCustomElement 注册为 <yry-report-link>
     5) 派发 'yry-report-link-ready' 事件

   Props:
     href   (必填) 链接 URL
     title  (可选) 链接 title 属性(悬停提示)
     emoji  (可选) 链接前的 emoji 图标
     text   (必填) 链接文字

   依赖:
     - Vue 3
     - 页面级 .sr-link 样式 (来自 docs/index.html 内联 <style>)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-report-link/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/shared/vue-ce-loader.js"></script>
     <script src="../../../../cdn/yry-report-link/index.js"></script>

     <yry-report-link href="健康报告/health-2026-06-22.html"
                      emoji="🩺" text="今日健康"
                      title="2026-06-22 项目综合健康报告"></yry-report-link>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryReportLink] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var COMPONENT_NAME = 'YryReportLink';
  var TEMPLATE_ID = 'yry-report-link-tpl';

  window.YrYVueCE.define({
    componentName: COMPONENT_NAME,
    templateId: TEMPLATE_ID,
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: COMPONENT_NAME,
        props: {
          href:  { type: String, required: true },
          title: { type: String, default: '' },
          emoji: { type: String, default: '' },
          text:  { type: String, required: true }
        },
        template: templateHTML
      };
    }
  });
})();