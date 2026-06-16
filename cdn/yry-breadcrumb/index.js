/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryBreadcrumb · Vue 3 面包屑组件 (loader)
   适用: 审查 · 测试面板 · 演示 · 计划清单 · 架构图 · 知识图谱

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-breadcrumb-tpl"> 内容
     3) 注册组件到 window.YryBreadcrumb
     4) 派发 'yry-breadcrumb-ready' 事件,通知页面挂载

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-breadcrumb/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-breadcrumb/index.js"></script>
     <div id="breadcrumb-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryBreadcrumb, { items: [...] }).mount('#breadcrumb-app');
       }
       if (window.YryBreadcrumb) mount();
       else document.addEventListener('yry-breadcrumb-ready', mount, { once: true });
     </script>

   对应场景文档:
     - docs/故事任务面板/yry-cdn/场景-3-组件库与JS工具API/
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 依赖检测: 必须先加载 Vue 3 ────────────────────────────────────── */
  if (!window.Vue) {
    console.warn('[YryBreadcrumb] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
    return;
  }

  /* ── 常量 ──────────────────────────────────────────────────────────── */
  var TEMPLATE_ID = 'yry-breadcrumb-tpl';
  var READY_EVENT = 'yry-breadcrumb-ready';
  var TAG_NAME    = 'yry-breadcrumb';
  var LOAD_TIMEOUT_MS = 5000;

  /* ── 计算 index.html 的绝对 URL (基于本脚本自身的 src) ────────────── */
  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[YryBreadcrumb] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[YryBreadcrumb] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  /* ── 组件定义工厂 ──────────────────────────────────────────────────── */
  function buildComponent(templateHTML) {
    return {
      name: 'YryBreadcrumb',
      props: {
        /* 必填: 面包屑条目
           每项: { label: string, href?: string, icon?: string }
           - 有 href → 渲染 <a>
           - 无 href → 渲染 <span class="bc-current">,最后一项自动 aria-current="page" */
        items:     { type: Array,  required: true },
        ariaLabel: { type: String, default: '面包屑导航' },
        separator: { type: String, default: '/' }
      },
      template: templateHTML
    };
  }

  /* ── 派发 ready 事件 (页面挂载脚本监听) ───────────────────────────── */
  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: 'YryBreadcrumb' } }));
  }

  /* ── 加载模板并注册组件 ───────────────────────────────────────────── */
  var timedOut = false;
  var timeoutId = setTimeout(function () {
    timedOut = true;
    console.error('[YryBreadcrumb] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
  }, LOAD_TIMEOUT_MS);

  fetch(templateUrl, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + r.statusText);
      return r.text();
    })
    .then(function (htmlText) {
      if (timedOut) return; // 已超时,放弃注册
      clearTimeout(timeoutId);

      var doc = new DOMParser().parseFromString(htmlText, 'text/html');
      var tpl = doc.getElementById(TEMPLATE_ID);
      if (!tpl) {
        throw new Error('未找到 <script type="text/x-template" id="' + TEMPLATE_ID + '">');
      }

      var templateHTML = tpl.innerHTML;
      window.YryBreadcrumb = buildComponent(templateHTML);

      /* ── 注册为自定义元素(允许 <yry-breadcrumb> 标签直接使用) ───── */
      if (typeof window.Vue.defineCustomElement === 'function') {
        var YryBreadcrumbCE = window.Vue.defineCustomElement(
          buildComponent(templateHTML),
          { shadowRoot: false }
        );
        if (!customElements.get(TAG_NAME)) {
          customElements.define(TAG_NAME, YryBreadcrumbCE);
        }
      }

      fireReady();
    })
    .catch(function (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      console.error('[YryBreadcrumb] 模板加载失败:', err, '· URL:', templateUrl);
    });
})();
