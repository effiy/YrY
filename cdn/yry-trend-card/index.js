/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryTrendCard · Vue 3 趋势柱状图组件 (loader)

   props: title · axis · bars (JSON 字符串,每项 {value, label, color?})

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-trend-card/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-trend-card/index.js"></script>
     <div id="my-trend"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryTrendCard, {
           title: '📈 趋势', axis: 'D-7 → D0',
           bars: '[{"value":62,"label":"62%"}]'
         }).mount('#my-trend');
       }
       if (window.YryTrendCard) mount();
       else document.addEventListener('yry-trend-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryTrendCard] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-trend-card-tpl';
  var READY_EVENT = 'yry-trend-card-ready';
  var TAG_NAME = 'yry-trend-card';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryTrendCard] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryTrendCard] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryTrendCard',
      props: {
        title: { type: String, default: '' },
        axis:  { type: String, default: '' },
        bars:  { type: String, default: '[]' }
      },
      computed: {
        parsedBars: function () {
          try { return JSON.parse(this.bars); } catch (e) { return []; }
        }
      },
      methods: {
        barHeight: function (v) {
          return Math.max(2, Math.min(100, v || 0));
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryTrendCard' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryTrendCard] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryTrendCard = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryTrendCardCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryTrendCardCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryTrendCard] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();