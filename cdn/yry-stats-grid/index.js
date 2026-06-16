/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryStatsGrid · Vue 3 统计卡组组件 (loader)
   适用: 进度概览、KPI 总览等多卡片统计区

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-stats-grid-tpl"> 内容
     3) 注册组件到 window.YryStatsGrid
     4) 派发 'yry-stats-grid-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-stats-grid/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-stats-grid/index.js"></script>
     <div id="stats-grid-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryStatsGrid, {
           items: [
             { value: 16, label: '已完成',  modifier: 'health' },
             { value: 0,  label: '进行中',  modifier: 'warn-h' },
             { value: 0,  label: '待开始' },
             { value: '100%', label: '完成进度', modifier: 'accent' }
           ]
         }).mount('#stats-grid-app');
       }
       if (window.YryStatsGrid) mount();
       else document.addEventListener('yry-stats-grid-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryStatsGrid] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-stats-grid-tpl';
  var READY_EVENT = 'yry-stats-grid-ready';
  var TAG_NAME    = 'yry-stats-grid';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryStatsGrid] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryStatsGrid] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryStatsGrid',
      props: {
        items: { type: Array, required: true }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryStatsGrid' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryStatsGrid] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
  }, LOAD_TIMEOUT_MS);

  fetch(templateUrl, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
      return r.text();
    })
    .then(function (htmlText) {
      if (timedOut) return;
      clearTimeout(timeoutId);

      var doc = new DOMParser().parseFromString(htmlText, 'text/html');
      var tpl = doc.getElementById(TEMPLATE_ID);
      if (!tpl) {
        throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');
      }

      var templateHTML = tpl.innerHTML;
      window.YryStatsGrid = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-stats-grid> 标签直接使用) ────── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryStatsGridCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryStatsGridCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryStatsGrid] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
