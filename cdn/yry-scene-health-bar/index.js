/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneHealthBar · Vue 3 场景健康进度条 (loader)

   props: segments — JSON 字符串,每项 {pct, cls}

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-health-bar/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-scene-health-bar/index.js"></script>
     <yry-scene-health-bar segments='[{"pct":75,"cls":"strength"},{"pct":25,"cls":"gap"}]'></yry-scene-health-bar>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySceneHealthBar] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-health-bar-tpl';
  var READY_EVENT = 'yry-scene-health-bar-ready';
  var TAG_NAME = 'yry-scene-health-bar';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySceneHealthBar] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySceneHealthBar] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YrySceneHealthBar',
      props: {
        segments: { type: String, default: '[]' }
      },
      computed: {
        parsedSegments: function () {
          try { return JSON.parse(this.segments); } catch (e) { return []; }
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySceneHealthBar' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySceneHealthBar] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySceneHealthBar = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YrySceneHealthBarCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YrySceneHealthBarCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySceneHealthBar] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();