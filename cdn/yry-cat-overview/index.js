/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCatOverview · Vue 3 风险类别总览组件 (loader)

   props: title · segments (JSON) · stats (JSON)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cat-overview/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cat-overview/index.js"></script>
     <div id="my-ov"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCatOverview, {
           title: '总评分分布', segments: '[...]', stats: '[...]'
         }).mount('#my-ov');
       }
       if (window.YryCatOverview) mount();
       else document.addEventListener('yry-cat-overview-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryCatOverview] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-cat-overview-tpl';
  var READY_EVENT = 'yry-cat-overview-ready';
  var TAG_NAME = 'yry-cat-overview';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryCatOverview] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryCatOverview] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryCatOverview',
      props: {
        title:    { type: String, default: '' },
        segments: { type: String, default: '[]' },
        stats:    { type: String, default: '[]' }
      },
      computed: {
        parsedSegments: function () {
          try { return JSON.parse(this.segments); } catch (e) { return []; }
        },
        parsedStats: function () {
          try { return JSON.parse(this.stats); } catch (e) { return []; }
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryCatOverview' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryCatOverview] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      if (!tpl) throw new Error('未找到模板 ' + TEMPLATE_ID);

      var templateHTML = tpl.innerHTML;
      window.YryCatOverview = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryCatOverview] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();