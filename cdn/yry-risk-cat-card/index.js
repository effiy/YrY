/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryRiskCatCard · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.Vue) {
    console.warn('[YryRiskCatCard] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  var TEMPLATE_ID = 'yry-risk-cat-card-tpl';
  var READY_EVENT = 'yry-risk-cat-card-ready';
  var TAG_NAME = 'yry-risk-cat-card';
  var LOAD_TIMEOUT_MS = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryRiskCatCard] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryRiskCatCard] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return name: 'YryRiskCatCard',
      props: {
        icon:          { type: String, default: '' },
        name:          { type: String, default: '' },
        count:         { type: String, default: '' },
        iconBg:        { type: String, default: '' },
        hot:           { type: Boolean, default: false },
        badge:         { type: String, default: '' },
        metrics:       { type: String, default: '[]' },
        progressWidth: { type: String, default: '50%' },
        progressColor: { type: String, default: '#f59e0b' },
        trendDir:      { type: String, default: '' },
        trendText:     { type: String, default: '' },
        trendSuffix:   { type: String, default: '' }
      },
      computed: {
        parsedMetrics: function () {
          try { return JSON.parse(this.metrics); } catch (e) { return []; }
        },
        progressStyle: function () {
          return { '--rcc-prog-w': this.progressWidth, '--rcc-prog-bg': this.progressColor };
        }
      },
      template: templateHTML;
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryRiskCatCard' } }));
  }

  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryRiskCatCard] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
      window.YryRiskCatCard = buildComponent(templateHTML);

      if (typeof window.Vue.defineCustomElement === 'function') {
        var ce = window.Vue.defineCustomElement(buildComponent(templateHTML), { shadowRoot: false });
        if (!customElements.get(TAG_NAME)) customElements.define(TAG_NAME, ce);
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryRiskCatCard] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();