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

  if (!window.Vue) {
    console.warn('[YryPhaseStrip] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-phase-strip-tpl';
  var READY_EVENT = 'yry-phase-strip-ready';
  var TAG_NAME = 'yry-phase-strip';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryPhaseStrip] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryPhaseStrip] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryPhaseStrip',
      props: {
        phases: { type: String, default: '[]' },
        cols:   { type: [String, Number], default: 6 }
      },
      computed: {
        parsedPhases: function () {
          try { return JSON.parse(this.phases); } catch (e) { return []; }
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

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryPhaseStrip' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryPhaseStrip] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryPhaseStrip = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryPhaseStripCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryPhaseStripCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryPhaseStrip] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();