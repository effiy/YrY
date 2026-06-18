/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneStats · Vue 3 场景统计卡组 (loader)

   props: items — JSON 字符串,每项 {value, label, color?}

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-stats/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-stats/index.js"></script>
     <yry-scene-stats items='[{"value":"5","label":"总断言","color":"t"}]'></yry-scene-stats>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySceneStats] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-stats-tpl';
  var READY_EVENT = 'yry-scene-stats-ready';
  var TAG_NAME = 'yry-scene-stats';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySceneStats] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySceneStats] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YrySceneStats',
      props: {
        items: { type: String, default: '[]' }
      },
      computed: {
        parsedItems: function () {
          try { return JSON.parse(this.items); } catch (e) { return []; }
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySceneStats' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySceneStats] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySceneStats = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YrySceneStatsCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YrySceneStatsCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySceneStats] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();