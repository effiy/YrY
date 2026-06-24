/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN · Shared Vue 3 Custom-Element Loader
   适用: 55 个 Vue3 组件（yry-*）统一注册为 <custom-element>

   功能:
     - 运行时 fetch 自身 index.html → DOMParser 提取 <script type="text/x-template">
     - 注册为 window[ComponentName] 供 createApp 使用
     - 同时 defineCustomElement 注册为 <tag-name> Web Component
     - 模板加载超时（默认 5s）与失败兜底
     - 加载完成派发 <name>-ready 事件

   使用方式（组件 index.js 薄 wrapper）:
     <script src="../../shared/vue-ce-loader.js"></script>
     <script src="../../yry-story-card/index.js"></script>
     <script>
       window.YrYVueCE.define({
         componentName: 'YryStoryCard',
         templateId: 'yry-story-card-tpl',
         buildComponent: function (templateHTML) {
           return { name: 'YryStoryCard', props: {...}, template: templateHTML };
         }
       });
     </script>

   对应场景: docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var DEFAULT_TIMEOUT_MS = 5000;

  function kebabCase(pascalOrCamel) {
    return pascalOrCamel
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  function define(options) {
    if (!options || typeof options !== 'object') {
      throw new TypeError('[YrYVueCE] define: options 必填');
    }
    var componentName = options.componentName;
    var templateId = options.templateId;
    var buildComponent = options.buildComponent;
    if (!componentName || typeof componentName !== 'string') {
      throw new TypeError('[YrYVueCE] define: componentName 必填');
    }
    if (!templateId || typeof templateId !== 'string') {
      throw new TypeError('[YrYVueCE] define: templateId 必填');
    }
    if (typeof buildComponent !== 'function') {
      throw new TypeError('[YrYVueCE] define: buildComponent 必填');
    }
    var tagName = options.tagName || kebabCase(componentName);
    var readyEvent = options.readyEvent || tagName + '-ready';
    var timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

    if (!window.Vue) {
      console.warn(
        '[' + componentName + '] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js'
      );
      return;
    }
    var script = document.currentScript;
    if (!script || !script.src) {
      console.warn('[' + componentName + '] 无法获取当前脚本 URL,组件已跳过注册');
      return;
    }
    var scriptUrl;
    try {
      scriptUrl = new URL(script.getAttribute('src'), window.location.href);
    } catch (e) {
      console.warn('[' + componentName + '] 解析脚本 URL 失败:', e);
      return;
    }
    var templateUrl = new URL('index.html', scriptUrl).href;

    function fireReady() {
      document.dispatchEvent(new CustomEvent(readyEvent, { detail: { component: componentName } }));
    }

    var timedOut = false;
    var timeoutId = setTimeout(function () {
      timedOut = true;
      console.error('[' + componentName + '] 模板加载超时 (' + timeoutMs + 'ms):', templateUrl);
    }, timeoutMs);

    fetch(templateUrl, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
        return r.text();
      })
      .then(function (htmlText) {
        if (timedOut) return;
        clearTimeout(timeoutId);

        var doc = new DOMParser().parseFromString(htmlText, 'text/html');
        var tpl = doc.getElementById(templateId);
        if (!tpl) {
          throw new Error('未找到 <script type="text/x-template" id="' + templateId + '">');
        }

        var templateHTML = tpl.innerHTML;
        window[componentName] = buildComponent(templateHTML);

        if (typeof window.Vue.defineCustomElement === 'function') {
          var CE = window.Vue.defineCustomElement(buildComponent(templateHTML), {
            shadowRoot: false
          });
          if (!customElements.get(tagName)) {
            customElements.define(tagName, CE);
          }
        }

        fireReady();
      })
      .catch(function (err) {
        if (timedOut) return;
        clearTimeout(timeoutId);
        console.error('[' + componentName + '] 模板加载失败:', err, '· URL:', templateUrl);
      });
  }

  window.YrYVueCE = { define: define, kebabCase: kebabCase };
})();
