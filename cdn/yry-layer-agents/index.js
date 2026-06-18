/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayerAgents · Vue 3 YryLayerAgents · Layer 5 Agent 角色 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryLayerAgents] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-layer-agents-tpl';
  var READY_EVENT = 'yry-layer-agents-ready';
  var TAG_NAME = 'yry-layer-agents';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryLayerAgents] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryLayerAgents] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return { name: 'YryLayerAgents', template: templateHTML };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryLayerAgents' } }));
  }


  /* ── 等待依赖组件就绪 ── */
  var depsLoaded = 0;
  var totalDeps = 3;

  function checkDeps() {
    depsLoaded++;
    if (depsLoaded >= totalDeps) doInit();
  }

    if (window.YryLayer) { depsLoaded++; }
    else { document.addEventListener('yry-layer-ready', checkDeps, { once: true }); }
    if (window.YrySubTitle) { depsLoaded++; }
    else { document.addEventListener('yry-sub-title-ready', checkDeps, { once: true }); }
    if (window.YryCardGrid) { depsLoaded++; }
    else { document.addEventListener('yry-card-grid-ready', checkDeps, { once: true }); }

  function doInit() {
    if (!window.Vue) return;

    var timedOut = false;
    var timeoutId = setTimeout(function () {
      timedOut = true;
      console.error('[YryLayerAgents] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
        window.YryLayerAgents = buildComponent(templateHTML);

        if (typeof window.Vue.defineCustomElement === 'function') {
          var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
          if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
        }

        fireReady();
      })
      .catch(function (err) {
        if (timedOut) return;
        clearTimeout(timeoutId);
        console.error('[YryLayerAgents] 模板加载失败:', err, '· URL:', templateUrl);
      });

  }

  if (depsLoaded >= totalDeps) doInit();
})();