/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryPhaseStrip · Vue 3 阶段进度条组件 (loader)

   props: phases (JSON 字符串) · cols (每行列数,默认 6)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-phase-strip/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-phase-strip/index.js"></script>
     <div id="my-phases"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryPhaseStrip, {
           cols: '6', phases: '[{"name":"S1","count":"5/5","state":"done"}]'
         }).mount('#my-phases');
       }
       if (window.YryPhaseStrip) mount();
       else document.addEventListener('yry-phase-strip-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryPhaseStrip] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryPhaseStrip',
    templateId: 'yry-phase-strip-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryPhaseStrip',
        props: {
          phases: { type: String, default: '[]' },
          cols: { type: [String, Number], default: 6 }
        },
        computed: {
          parsedPhases: function () {
            try {
              return JSON.parse(this.phases);
            } catch (e) {
              return [];
            }
          }
        },
        methods: {
          dotChar: function (state) {
            if (state === 'done') return '✓';
            if (state === 'active') return '●';
            return '';
          }
        },
        template: templateHTML
      };
    }
  });
})();
