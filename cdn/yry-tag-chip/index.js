/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTagChip · Vue 3 标签芯片组件 (loader)
   适用: 卡片内的标签行 (tags-row) · 状态徽标 · 角色分类

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-tag-chip-tpl"> 内容
     3) 注册组件到 window.YryTagChip
     4) 派发 'yry-tag-chip-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-tag-chip/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-tag-chip/index.js"></script>
     <div id="tag-row"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryTagChip, { text: '自建', modifier: 'accent' }).mount('#tag-row');
         // 或循环:
         [{text:'v1.0',modifier:'cyan'}, {text:'核心',modifier:'accent'}].forEach(...);
       }
       if (window.YryTagChip) mount();
       else document.addEventListener('yry-tag-chip-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryTagChip] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryTagChip',
    templateId: 'yry-tag-chip-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryTagChip',
        props: {
          /* 必填: 标签文本 */
          text: { type: String, required: true },
          /* 可选: 颜色变体
                 取值: accent | info | cyan | green | purple | red | warn | blue
                 默认: 'info' */
          modifier: { type: String, default: 'info' },
          /* 可选: 如果提供则渲染为 <a>,否则渲染为 <span> */
          href: { type: String, default: '' }
        },
        template: templateHTML
      };
    }
  });
})();
