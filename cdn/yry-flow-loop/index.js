/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryFlowLoop · Vue 3 闭环数据流图组件 (loader)
   适用: 自改进仪表板 · 管线概览 · 闭环流程演示

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-flow-loop-tpl"> 内容
     3) 注册组件到 window.YryFlowLoop
     4) 派发 'yry-flow-loop-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-flow-loop/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-flow-loop/index.js"></script>
     <div id="flow-loop-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryFlowLoop, {
           stages: [
             { icon: '①', name: '观察', sub: '数据采集', variant: 'observe' },
             { icon: '②', name: '诊断', sub: 'D0-D8', variant: 'diagnose' },
             { icon: '③', name: '改进', sub: 'proposals', variant: 'improve' },
             { icon: '④', name: '评估', sub: 'E1-E4', variant: 'evaluate' }
           ],
           loopArrow: true,
           loopIcon: '↻'
         }).mount('#flow-loop-app');
       }
       if (window.YryFlowLoop) mount();
       else document.addEventListener('yry-flow-loop-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryFlowLoop] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-flow-loop-tpl';

  var READY_EVENT = 'yry-flow-loop-ready';

  var TAG_NAME    = 'yry-flow-loop';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryFlowLoop',
    templateId: 'yry-flow-loop-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
      name: 'YryFlowLoop',
      props: {
        /* 必填: 闭环节点列表
           每项: { icon: string, name: string, sub?: string, variant: 'observe'|'diagnose'|'improve'|'evaluate' }
           variant 决定左侧色条颜色,对应观察/诊断/改进/评估四段 */
        stages:    { type: Array,  required: true },
        /* 可选: 是否在末尾显示回环箭头 (默认 true) */
        loopArrow: { type: Boolean, default: true },
        /* 可选: 回环箭头图标 (默认 ↻) */
        loopIcon:  { type: String,  default: '↻' },
        /* 可选: 节点间箭头图标 (默认 →) */
        arrowIcon: { type: String,  default: '→' }
      },
      template: templateHTML
    };
  }
  });
})();
