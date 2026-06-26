/**
 * vue-ce-loader.js — 共享 Vue Custom Element 加载器
 *
 * 提供 window.YrYVueCE.define() 统一入口,供所有 CDN 组件调用。
 * 每个组件只需声明 componentName / templateId / buildComponent,
 * 本 loader 负责模板获取、解析、Vue 组件构建、Custom Element 注册
 * 以及 ready 事件派发。
 *
 * 加载链:
 *   <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
 *   <script src="../cdn/shared/vue-ce-loader.js"></script>
 *   <script src="../cdn/yry-breadcrumb/index.js"></script>
 *   <!-- 组件自动注册为 <yry-breadcrumb> -->
 *
 * 每个组件加载后派发 {tag-name}-ready 事件,
 * 供 yry-docs-binding 等控制器监听并二次绑定。
 */

(function () {
  'use strict';

  if (window.YrYVueCE) return; // 已加载,幂等

  /**
   * PascalCase → kebab-case
   * 'YryBreadcrumb' → 'yry-breadcrumb'
   * 'YryPanelHub'  → 'yry-panel-hub'
   */
  function pascalToKebab(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
  }

  var LOAD_TIMEOUT_MS = 5000;

  /**
   * 注册入口 — 每个 CDN 组件 IIFE 内同步调用
   *
   * @param {{
   *   componentName: string,   // PascalCase, e.g. 'YryBreadcrumb'
   *   templateId: string,      // <script type="text/x-template" id="...">
   *   buildComponent: (templateHTML: string) => object  // → Vue options
   * }} opts
   */
  function define(opts) {
    if (!opts || !opts.componentName || !opts.templateId || typeof opts.buildComponent !== 'function') {
      console.error('[vue-ce-loader] define() 参数不完整:', opts);
      return;
    }

    if (!window.Vue || typeof window.Vue.defineCustomElement !== 'function') {
      console.error('[vue-ce-loader] Vue 3 未加载或 defineCustomElement 不可用');
      return;
    }

    var script = document.currentScript || opts.script || null;
    if (!script || !script.src) {
      console.error('[vue-ce-loader] 无法获取调用脚本 URL (' + opts.componentName + ')');
      return;
    }

    var scriptUrl = new URL(script.getAttribute('src'), window.location.href);
    var templateUrl = new URL('index.html', scriptUrl).href;
    var tagName = pascalToKebab(opts.componentName);
    var readyEvent = tagName + '-ready';

    var timedOut = false;
    var timeoutId = setTimeout(function () {
      timedOut = true;
      console.error('[vue-ce-loader] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms): ' + templateUrl);
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
        var tpl = doc.getElementById(opts.templateId);
        if (!tpl) throw new Error('未找到 <script type="text/x-template" id="' + opts.templateId + '">');

        var component = opts.buildComponent(tpl.innerHTML);
        if (!component) throw new Error('buildComponent 返回空值');

        // 注入 name (若 buildComponent 未设置)
        if (!component.name) component.name = opts.componentName;

        var CE = window.Vue.defineCustomElement(component, { shadowRoot: false });
        if (!customElements.get(tagName)) {
          customElements.define(tagName, CE);
        }

        // 暴露全局构造函数供 Vue.createApp() 直接挂载
        window[opts.componentName] = component;

        // 派发 ready 事件
        document.dispatchEvent(new CustomEvent(readyEvent, {
          detail: { componentName: opts.componentName, tagName: tagName }
        }));
      })
      .catch(function (err) {
        if (timedOut) return;
        clearTimeout(timeoutId);
        console.error('[vue-ce-loader] 模板加载失败 (' + opts.componentName + '):', err.message);
      });
  }

  window.YrYVueCE = { define: define };
})();
