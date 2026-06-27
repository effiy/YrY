/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryReportSection · Vue 3 评分报告 Section 容器 (loader)
   适用: docs/index.html 中所有 <section class="score-report"> 区块

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-report-section-tpl"> 内容
     3) 注册组件到 window.YryReportSection
     4) 同时通过 Vue.defineCustomElement 注册为 <yry-report-section>
     5) 派发 'yry-report-section-ready' 事件

   依赖 (异步加载链):
     - Vue 3
     - YryReportLink (window.YryReportLink || 监听 'yry-report-link-ready')

   Props:
     title          (必填) sr-title 主标题
     metaInfo       (可选) 右侧元信息文本
     intro          (可选) sr-intro-box 内容 (支持 HTML,经 v-html 渲染) — links 之上
     extraIntro     (可选) 第二个 sr-intro-box (links 之下 · 用于 README/CLAUDE.md 双 intro)
     links          (可选) 链接数组 — 内部自动渲染为 <yry-report-link>
     linksClass     (可选) 链接容器 class (默认 'sr-links is-tight-gap')
     footerNote     (可选) sr-footer-note 底部说明 (支持 HTML)
     footerTight    (可选) 底部说明使用紧凑间距
     id             (可选) section id (用于 # 锚点跳转)
     titleId        (可选) sr-title 的 id (用于 #sr-detail-nav 等子锚点)
     linksId        (可选) 链接容器的 id (用于折叠按钮 data-target)
     sectionClass   (可选) 额外加在 section 上的 class
     showHeader     (可选) 是否显示 sr-header (默认 true)

   页面使用方式:
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/shared/vue-ce-loader.js"></script>
     <script src="../../../../cdn/yry-report-link/index.js"></script>
     <script src="../../../../cdn/yry-report-section/index.js"></script>

     <yry-report-section id="skills-market"></yry-report-section>
     <script>
       function mount() {
         document.getElementById('skills-market').links = [
           { href: '../skills/rui/SKILL.md', emoji: '🛡', text: 'rui',
             title: '主线编排器 — Gate A/B' },
           { href: '../skills/rui-code/SKILL.md', emoji: '⌨', text: 'rui-code',
             title: '代码源码实现管线' }
         ];
       }
       if (window.YryReportSection) mount();
       else document.addEventListener('yry-report-section-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryReportSection] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var COMPONENT_NAME = 'YryReportSection';
  var TEMPLATE_ID = 'yry-report-section-tpl';
  var READY_EVENT = 'yry-report-section-ready';
  var DEP_GLOBAL = 'YryReportLink';

  window.YrYVueCE.define({
    componentName: COMPONENT_NAME,
    templateId: TEMPLATE_ID,
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: COMPONENT_NAME,
        props: {
          title:        { type: String, required: true },
          metaInfo:     { type: String, default: '' },
          intro:        { type: String, default: '' },
          extraIntro:   { type: String, default: '' },
          links: {
            type: Array,
            default: function () { return []; }
          },
          linksClass:   { type: String, default: 'sr-links is-tight-gap' },
          footerNote:   { type: String, default: '' },
          footerTight:  { type: Boolean, default: false },
          id:           { type: String, default: '' },
          titleId:      { type: String, default: '' },
          linksId:      { type: String, default: '' },
          sectionClass: { type: String, default: '' },
          showHeader:   { type: Boolean, default: true }
        },
        components: {
          YryReportLink: window[DEP_GLOBAL] || null
        },
        template: templateHTML,
        mounted: function () {
          var self = this;
          this.$nextTick(function () {
            document.dispatchEvent(new CustomEvent(READY_EVENT + ':mounted', {
              detail: { component: COMPONENT_NAME, host: self.$el, id: self.id }
            }));
          });
        },
        updated: function () {
          var self = this;
          this.$nextTick(function () {
            document.dispatchEvent(new CustomEvent(READY_EVENT + ':updated', {
              detail: { component: COMPONENT_NAME, host: self.$el, id: self.id }
            }));
          });
        }
      };
    }
  });
})();
