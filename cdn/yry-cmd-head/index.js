/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCmdHead · Vue 3 命令面板头部组件 (loader)

   props: title · subtitle (HTML) · stats (JSON 字符串数组)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cmd-head/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cmd-head/index.js"></script>
     <div id="my-head"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCmdHead, {
           title: '⚡ 命令面板', subtitle: '描述',
           stats: '[{"html":"👤 <b>Owner</b>: dev"}]'
         }).mount('#my-head');
       }
       if (window.YryCmdHead) mount();
       else document.addEventListener('yry-cmd-head-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCmdHead] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryCmdHead',
    templateId: 'yry-cmd-head-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryCmdHead',
        props: {
          title: { type: String, default: '' },
          subtitle: { type: String, default: '' },
          stats: { type: String, default: '[]' }
        },
        computed: {
          parsedStats: function () {
            try {
              return JSON.parse(this.stats);
            } catch (e) {
              return [];
            }
          }
        },
        template: templateHTML
      };
    }
  });
})();
