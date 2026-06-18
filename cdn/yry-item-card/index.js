/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryItemCard · Vue 3 资产卡片组件 (loader)
   适用: 资产/技能/Agent/规则/参考 统一卡片展示

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-item-card-tpl"> 内容
     3) 注册组件到 window.YryItemCard
     4) 派发 'yry-item-card-ready' 事件,通知页面挂载

   依赖 (异步加载链):
     - Vue 3                  (window.Vue)
     - YryTagChip  (window.YryTagChip  ||  监听 'yry-tag-chip-ready' 事件)

   加载链机制: 即使本 <script> 在 yry-tag-chip/index.js 之后执行,
   YryTagChip 也是异步 fetch 完成才注册到 window.YryTagChip 的。
   所以这里必须等待 'yry-tag-chip-ready' 事件,而不是直接检查 window.YryTagChip。

   props 简表:
     icon          (必填) 卡片左侧字母/图标
     iconModifier  (可选) skill | agent | rule | ref · 影响左侧方块背景色
     name          (必填) 卡片主标题
     nameHref      (可选) 主标题链接
     nameTarget    (可选) _blank 等
     badge         (可选) 主标题后的小徽标(如 "新")
     desc          (可选) 描述文字(支持 HTML,经 v-html 渲染)
     tags          (可选) 标签数组 · 内部使用 <yry-tag-chip> 渲染
     meta          (可选) 底部元信息
	     demo          (可选) 效果演示链接 URL

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-item-card/index.css">
     <link rel="stylesheet" href="../../../../cdn/yry-tag-chip/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-tag-chip/index.js"></script>
     <script src="../../../../cdn/yry-item-card/index.js"></script>
     <div id="item-1"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryItemCard, {
           icon: 'C', iconModifier: 'rule',
           name: 'yry-cdn-lib', nameHref: '...', badge: '新',
           desc: 'YrY 自建 CDN 共享库 — ...',
           tags: [
             { text: '自建', modifier: 'accent' },
             { text: 'jsDelivr', modifier: 'info' }
           ],
           meta: 'shared.css + theme.css + ...'
         }).mount('#item-1');
       }
       if (window.YryItemCard) mount();
       else document.addEventListener('yry-item-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var COMPONENT_NAME = 'YryItemCard';
  var TAG_NAME       = 'yry-item-card';
  var TEMPLATE_ID    = 'yry-item-card-tpl';
  var READY_EVENT    = 'yry-item-card-ready';
  var DEP_EVENT      = 'yry-tag-chip-ready';
  var DEP_GLOBAL     = 'YryTagChip';
  var LOAD_TIMEOUT_MS    = 5000;
  var DEP_TIMEOUT_MS     = 5000;

  var script = document.currentScript;
  if (!script || !script.src) {
    console.warn('[' + COMPONENT_NAME + '] 无法获取当前脚本 URL,组件已跳过注册');
    return;
  }
  var scriptUrl;
  try {
    scriptUrl = new URL(script.getAttribute('src'), window.location.href);
  } catch (e) {
    console.warn('[' + COMPONENT_NAME + '] 解析脚本 URL 失败:', e);
    return;
  }
  var templateUrl = new URL('index.html', scriptUrl).href;

  function buildComponent(templateHTML) {
    return {
      name: COMPONENT_NAME,
      components: { YryTagChip: window[DEP_GLOBAL] },
      props: {
        icon:         { type: String, required: true },
        iconModifier: { type: String, default: '' },
        name:         { type: String, required: true },
        nameHref:     { type: String, default: '' },
        nameTarget:   { type: String, default: '' },
        badge:        { type: String, default: '' },
        desc:         { type: String, default: '' },
        tags:         { type: Array,  default: function () { return []; } },
        meta:         { type: String, default: '' },
        demo:         { type: String, default: '' },
        links:        { type: Array,  default: function () { return []; } }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: COMPONENT_NAME } }));
  }

  /* ── 主流程: 加载模板 + 注册组件 ────────────────────────────────── */
  function loadAndRegister() {
    if (!window.Vue) {
      console.warn('[' + COMPONENT_NAME + '] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
      return;
    }
    if (!window[DEP_GLOBAL]) {
      console.warn('[' + COMPONENT_NAME + '] 依赖 ' + DEP_GLOBAL + ' 未加载,组件已跳过注册。请先引入 yry-tag-chip/index.js');
      return;
    }

    var timedOut = false;
    var timeoutId = setTimeout(function () {
      timedOut = true;
      console.error('[' + COMPONENT_NAME + '] 模板加载超时 (' + LOAD_TIMEOUT_MS + 'ms):', templateUrl);
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
        window[COMPONENT_NAME] = buildComponent(templateHTML);

        /* ── 注册为自定义元素(允许 <yry-item-card> 标签直接使用) ──── */
        if (typeof window.Vue.defineCustomElement === 'function') {
          var YryItemCardCE = window.Vue.defineCustomElement(
            buildComponent(templateHTML),
            { shadowRoot: false }
          );
          if (!customElements.get(TAG_NAME)) {
            customElements.define(TAG_NAME, YryItemCardCE);
          }
        }

        fireReady();
      })
      .catch(function (err) {
        if (timedOut) return;
        clearTimeout(timeoutId);
        console.error('[' + COMPONENT_NAME + '] 模板加载失败:', err, '· URL:', templateUrl);
      });
  }

  /* ── 启动 ──────────────────────────────────────────────────────── */
  if (window[DEP_GLOBAL]) {
    /* 依赖已就绪 · 立即执行 */
    loadAndRegister();
  } else {
    /* 等待依赖 ready 事件(避免与 YryTagChip 的异步 fetch 产生竞态) */
    var depTimedOut = false;
    var depTimer = setTimeout(function () {
      depTimedOut = true;
      console.error('[' + COMPONENT_NAME + '] 等待依赖 ' + DEP_GLOBAL + ' 超时 (' + DEP_TIMEOUT_MS + 'ms),组件已放弃注册');
    }, DEP_TIMEOUT_MS);

    document.addEventListener(DEP_EVENT, function once() {
      if (depTimedOut) return;
      clearTimeout(depTimer);
      loadAndRegister();
    }, { once: true });
  }
})();
