/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryRiskRow · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryRiskRow] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-risk-row-tpl';
  var READY_EVENT = 'yry-risk-row-ready';
  var TAG_NAME = 'yry-risk-row';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryRiskRow] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryRiskRow] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return name: 'YryRiskRow',
      props: {
        id:         { type: String, default: '' },
        name:       { type: String, default: '' },
        sub:        { type: String, default: '' },
        category:   { type: String, default: '' },
        score:      { type: [String, Number], default: 0 },
        scoreLevel: { type: String, default: 'low' },
        scoreInfo:  { type: String, default: '' },
        deadline:   { type: String, default: '' },
        owner:      { type: String, default: '' },
        status:     { type: String, default: 'pass' },
        statusText: { type: String, default: '' },
        details:    { type: String, default: '[]' },
        plan:       { type: String, default: '[]' },
        timeline:   { type: String, default: '[]' }
      },
      data: function () { return { open: false }; },
      computed: {
        parsedDetails:  function () { try { return JSON.parse(this.details); } catch (e) { return []; } },
        parsedPlan:     function () { try { return JSON.parse(this.plan); } catch (e) { return []; } },
        parsedTimeline: function () { try { return JSON.parse(this.timeline); } catch (e) { return []; } },
        scorePct:       function () { return Math.max(2, Math.min(100, ((Number(this.score) || 0) / 25) * 100)); }
      },
      template: templateHTML;
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryRiskRow' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryRiskRow] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryRiskRow = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryRiskRow] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();