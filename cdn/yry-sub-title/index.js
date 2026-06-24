/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySubTitle · Vue 3 子区块标题组件 (loader)
   适用: 文档中心子区块的标题行(如 "运行时依赖 (6)")

   props 简表:
     icon   (可选) 标题前的 emoji
     text   (必填) 标题文字
     count  (可选) 右侧计数徽标(浅灰色,大写)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySubTitle] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YrySubTitle',
    templateId: 'yry-sub-title-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YrySubTitle',
        props: {
          icon: { type: String, default: '' },
          text: { type: String, required: true },
          count: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
