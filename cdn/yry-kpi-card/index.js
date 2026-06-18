/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryKpiCard · Vue 3 KPI 指标卡组件 (loader)

   props: label · num · trend · trendDir (up/down/flat) · numColor (health/warn/fail/cyan/accent)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-kpi-card/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-kpi-card/index.js"></script>
     <div id="my-kpi"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryKpiCard, {
           label: '路径完整度', num: '100%', trend: '↑ 5 大域全覆盖', trendDir: 'up', numColor: 'health'
         }).mount('#my-kpi');
       }
       if (window.YryKpiCard) mount();
       else document.addEventListener('yry-kpi-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryKpiCard] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-kpi-card-tpl';
  var READY_EVENT = 'yry-kpi-card-ready';
  var TAG_NAME = 'yry-kpi-card';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryKpiCard] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryKpiCard] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryKpiCard',
      props: {
        label:    { type: String, default: '' },
        num:      { type: String, default: '' },
        trend:    { type: String, default: '' },
        trendDir: { type: String, default: 'flat' },
        numColor: { type: String, default: '' }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryKpiCard' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryKpiCard] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryKpiCard = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryKpiCardCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryKpiCardCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryKpiCard] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();