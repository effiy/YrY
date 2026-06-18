/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryQuickstart · Vue 3 快速开始组件 (loader)

   props: tip (HTML) · cmd (命令文本,带复制按钮)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-quickstart/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-quickstart/index.js"></script>
     <div id="my-qs"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryQuickstart, {
           tip: '复制整段 → 终端粘贴。', cmd: 'git clone ...'
         }).mount('#my-qs');
       }
       if (window.YryQuickstart) mount();
       else document.addEventListener('yry-quickstart-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryQuickstart] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-quickstart-tpl';
  var READY_EVENT = 'yry-quickstart-ready';
  var TAG_NAME = 'yry-quickstart';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryQuickstart] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryQuickstart] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: 'YryQuickstart',
      props: {
        tip: { type: String, default: '' },
        cmd: { type: String, default: '' }
      },
      data: function () {
        return { copied: false };
      },
      methods: {
        doCopy: function () {
          var text = this.cmd || '';
          var self = this;
          copyToClipboard(text).then(function () {
            self.copied = true;
            setTimeout(function () { self.copied = false; }, 1500);
          });
        }
      },
      template: templateHTML
    };
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryQuickstart' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryQuickstart] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryQuickstart = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryQuickstartCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryQuickstartCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryQuickstart] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();