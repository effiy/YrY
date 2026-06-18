/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCmdHead · Vue 3 命令面板头部组件 (loader)

   props: title · subtitle (HTML) · stats (JSON 字符串数组)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cmd-head/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cmd-head/index.js"></script>
     <div id="my-head"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCmdHead, {
           title: '⚡ 命令面板', subtitle: '描述',
           stats: '[{"html":"👤 <b>Owner</b>: dev"}]'
         }).mount('#my-head');
       }
       if (window.YryCmdHead) mount();
       else document.addEventListener('yry-cmd-head-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryCmdHead] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-cmd-head-tpl';
  var READY_EVENT = 'yry-cmd-head-ready';
  var TAG_NAME = 'yry-cmd-head';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryCmdHead] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryCmdHead] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryCmdHead',
      props: {
        title:    { type: String, default: '' },
        subtitle: { type: String, default: '' },
        stats:    { type: String, default: '[]' }
      },
      computed: {
        parsedStats: function () {
          try { return JSON.parse(this.stats); } catch (e) { return []; }
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryCmdHead' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryCmdHead] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryCmdHead = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryCmdHeadCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryCmdHeadCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryCmdHead] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();