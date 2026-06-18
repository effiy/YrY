/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneFooter · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YrySceneFooter] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-footer-tpl';
  var READY_EVENT = 'yry-scene-footer-ready';
  var TAG_NAME = 'yry-scene-footer';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YrySceneFooter] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YrySceneFooter] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return name: 'YrySceneFooter',
      props: {
        version:  { type: String, default: '' },
        date:     { type: String, default: '' },
        docsLink: { type: String, default: '' }
      },
      template: templateHTML;
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YrySceneFooter' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YrySceneFooter] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YrySceneFooter = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YrySceneFooter] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();