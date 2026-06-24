/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryBreadcrumb · Vue 3 面包屑组件 (loader)
   适用: 审查 · 测试面板 · 演示 · 计划清单 · 架构图 · 知识图谱

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-breadcrumb-tpl"> 内容
     3) 注册组件到 window.YryBreadcrumb
     4) 派发 'yry-breadcrumb-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-breadcrumb/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-breadcrumb/index.js"></script>
     <div id="breadcrumb-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryBreadcrumb, { items: [...] }).mount('#breadcrumb-app');
       }
       if (window.YryBreadcrumb) mount();
       else document.addEventListener('yry-breadcrumb-ready', mount, { once: true });
     </script>

   对应场景文档:
     - docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryBreadcrumb] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-breadcrumb-tpl';

  var READY_EVENT = 'yry-breadcrumb-ready';

  var TAG_NAME    = 'yry-breadcrumb';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryBreadcrumb',
    templateId: 'yry-breadcrumb-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
      name: 'YryBreadcrumb',
      props: {
        /* 必填: 面包屑条目
           每项: { label: string, href?: string, icon?: string }
           - 有 href → 渲染 <a>
           - 无 href → 渲染 <span class="bc-current">,最后一项自动 aria-current="page" */
        items:     { type: Array,  required: true },
        ariaLabel: { type: String, default: '面包屑导航' },
        separator: { type: String, default: '/' }
      },
      template: templateHTML
    };
  }
  });
})();
