/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryLayerRefs · Vue 3 Layer 6 参考入口复合组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryLayerRefs] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  const TEMPLATE_ID = 'yry-layer-refs-tpl';
  const READY_EVENT = 'yry-layer-refs-ready';
  const TAG_NAME = 'yry-layer-refs';
  const LOAD_TIMEOUT_MS = 5000;

  const script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryLayerRefs] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  let scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryLayerRefs] 解析脚本 URL 失败:', e);
    return;
  }
  const templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return { name: 'YryLayerRefs', template: templateHTML };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryLayerRefs' } }));
  }


  /* ── 等待依赖组件就绪 ── */
  let depsLoaded = 0;
  const totalDeps = 3;

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

    /* 兜底超时:若任一依赖超过 6s 仍未就绪,强制推进 doInit() */
    setTimeout(function () {
      if (depsLoaded < totalDeps) {
        console.warn('[YryLayerRefs] 依赖等待超时(6s),已就绪', depsLoaded, '/', totalDeps, '· 强制继续');
        depsLoaded = totalDeps;
        doInit();
      }
    }, 6000);

  function doInit() {
    if (!window.Vue) return;

    let timedOut = false;
    const timeoutId = setTimeout(function () {
      timedOut = true;
      console.error('[YryLayerRefs] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
    }, LOAD_TIMEOUT_MS);

    fetch(templateUrl, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
        return r.text();
      })
      .then(function (htmlText) {
        if (timedOut) return;
        clearTimeout(timeoutId);

        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        const tpl = doc.getElementById(TEMPLATE_ID);
        if (!tpl) throw new Error('未找到模板 ' + TEMPLATE_ID);

        const templateHTML = tpl.innerHTML;
        window.YryLayerRefs = buildComponent(templateHTML);

        if (typeof window.Vue.defineCustomElement === 'function') {
          const ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
          if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
        }

        fireReady();
      })
      .catch(function (err) {
        if (timedOut) return;
        clearTimeout(timeoutId);
        console.error('[YryLayerRefs] 模板加载失败:', err, '· URL:', templateUrl);
      });

  }

  if (depsLoaded >= totalDeps) doInit();
})();
