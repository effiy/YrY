/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryProgressBar · Vue 3 进度条组件 (loader)

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-progress-bar-tpl"> 内容
     3) 注册组件到 window.YryProgressBar
     4) 派发 'yry-progress-bar-ready' 事件

   props:
     done  — 已完成数量 (默认 0)
     total — 总数量 (默认 0)
     label — 左侧标签文字 (默认 "进度")

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-progress-bar/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-progress-bar/index.js"></script>
     <div id="my-progress"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryProgressBar, {
           done: 3, total: 8, label: '总体进度'
         }).mount('#my-progress');
       }
       if (window.YryProgressBar) mount();
       else document.addEventListener('yry-progress-bar-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryProgressBar] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryProgressBar',
    templateId: 'yry-progress-bar-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryProgressBar',
        props: {
          done: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
          label: { type: String, default: '进度' }
        },
        computed: {
          pct: function () {
            var total = this.total || 0;
            return total > 0 ? Math.round((this.done / total) * 100) : 0;
          }
        },
        template: templateHTML
      };
    }
  });
})();
