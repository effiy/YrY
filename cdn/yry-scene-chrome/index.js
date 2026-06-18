/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneChrome · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySceneChrome] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-chrome-tpl';
  var READY_EVENT = 'yry-scene-chrome-ready';
  var TAG_NAME = 'yry-scene-chrome';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySceneChrome] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySceneChrome] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return name: 'YrySceneChrome',
      props: {
        theme:      { type: String, default: 'a' },
        title:      { type: String, default: '' },
        titleAccent:{ type: String, default: '' },
        subtitle:   { type: String, default: '' },
        toolbar:    { type: String, default: '' },
        breadcrumb: { type: String, default: '[]' },
        crossnav:   { type: String, default: '[]' }
      },
      computed: {
        parsedBc: function () { try { return JSON.parse(this.breadcrumb); } catch (e) { return []; } },
        parsedCn: function () { try { return JSON.parse(this.crossnav); } catch (e) { return []; } }
      },
      template: templateHTML;
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySceneChrome' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySceneChrome] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySceneChrome = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySceneChrome] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();