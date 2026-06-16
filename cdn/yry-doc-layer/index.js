/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryDocLayer · Vue 3 文档层级包装组件 (loader)
   适用: 文档中心页面的 7 个 layer,统一渲染 header + 多 sub-section

   依赖 (异步加载链):
     - Vue 3
     - YryLayer       (window.YryLayer       || 监听 'yry-layer-ready')
     - YrySubTitle    (window.YrySubTitle    || 监听 'yry-sub-title-ready')
     - YryTagChip     (window.YryTagChip     || 监听 'yry-tag-chip-ready')  · 通过 YryItemCard 间接依赖
     - YryItemCard    (window.YryItemCard    || 监听 'yry-item-card-ready')
     - YryStoryCard   (window.YryStoryCard   || 监听 'yry-story-card-ready')
     - YrySceneCard   (window.YrySceneCard   || 监听 'yry-scene-card-ready')

   props 简表:
     layerId        (可选) 渲染到 <div class="layer" id="..."> 的 id(经 YryLayer)
     num            (必填) layer 序号
     titleIcon      (可选) 标题 icon
     titlePrefix/titleAccent/titleSuffix 三段式标题
     stats          (可选) 统计行文本数组
     panels         (可选) 跳转面板 dots
     panelsTitle    (可选) "查看" 之类的小标签
     sections       (必填) 子区块数组: [{ subTitle, grid: 'card'|'story'|'scene', items: [...] }]

   grid 类型说明:
     - 'card'  → 渲染 YryItemCard
     - 'story' → 渲染 YryStoryCard
     - 'scene' → 渲染 YrySceneCard

   页面使用方式:
     <link rel="stylesheet" href=".../yry-layer/index.css">     (按需 6 个组件 CSS)
     ...
     <script src=".../yry-layer/index.js"></script>            (按需 6 个组件 JS)
     ...
     <script src=".../yry-doc-layer/index.js"></script>
     <div id="layer-deps-app"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryDocLayer, {
           layerId: 'layer-deps', num: '1',
           titleAccent: '第三方依赖与框架',
           stats: ['6 运行时 · 6 开发'],
           panels: [{ icon: '📦', panel: 'deps' }],
           sections: [
             { subTitle: { icon: '⚡', text: '运行时依赖' }, grid: 'card', items: [...] }
           ]
         }).mount('#layer-deps-app');
       }
       if (window.YryDocLayer) mount();
       else document.addEventListener('yry-doc-layer-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var COMPONENT_NAME = 'YryDocLayer';
  var TAG_NAME       = 'yry-doc-layer';
  var TEMPLATE_ID    = 'yry-doc-layer-tpl';
  var READY_EVENT    = 'yry-doc-layer-ready';

  /* ── 依赖表(组件名 + 全局名 + ready 事件名 + 超时) ────────────────── */
  var DEPS = [
    { name: 'YryLayer',     event: 'yry-layer-ready',     timeout: 5000 },
    { name: 'YrySubTitle',  event: 'yry-sub-title-ready', timeout: 5000 },
    { name: 'YryItemCard',  event: 'yry-item-card-ready', timeout: 5000 },
    { name: 'YryStoryCard', event: 'yry-story-card-ready',timeout: 5000 },
    { name: 'YrySceneCard', event: 'yry-scene-card-ready',timeout: 5000 }
  ];

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
      components: {
        YryLayer:     window.YryLayer,
        YrySubTitle:  window.YrySubTitle,
        YryItemCard:  window.YryItemCard,
        YryStoryCard: window.YryStoryCard,
        YrySceneCard: window.YrySceneCard
      },
      props: {
        layerId:             { type: String, default: '' },
        num:                 { type: String, required: true },
        titleIcon:           { type: String, default: '' },
        titlePrefix:         { type: String, default: '' },
        titleAccent:         { type: String, default: '' },
        titleSuffix:         { type: String, default: '' },
        stats:               { type: Array,  default: function () { return []; } },
        panels:              { type: Array,  default: function () { return []; } },
        panelsTitle:         { type: String, default: '' },
        panelsContainerTitle:{ type: String, default: '' },
        style:               { type: [String, Object], default: '' },
        numStyle:            { type: [String, Object], default: '' },
        sections:            { type: Array,  required: true }
      },
      methods: {
        componentFor: function (grid) {
          switch (grid) {
            case 'card':  return 'YryItemCard';
            case 'story': return 'YryStoryCard';
            case 'scene': return 'YrySceneCard';
            default:      return 'div';
          }
        }
      },
      template: templateHTML
    };
  }

  function fireReady() {
    document.dispatchEvent(new CustomEvent(READY_EVENT, { detail: { component: COMPONENT_NAME } }));
  }

  /* ── 加载模板 + 注册组件 ─────────────────────────────────────────── */
  function loadAndRegister() {
    if (!window.Vue) {
      console.warn('[' + COMPONENT_NAME + '] Vue 3 未加载,组件已跳过注册。请先引入 vue.global.prod.js');
      return;
    }
    /* 检查所有依赖都已在 window 上 */
    var missing = DEPS.filter(function (d) { return !window[d.name]; });
    if (missing.length) {
      console.warn('[' + COMPONENT_NAME + '] 依赖未就绪,组件已跳过注册。缺少:',
        missing.map(function (d) { return d.name; }).join(', '));
      return;
    }

    var timedOut = false;
    var timeoutId = setTimeout(function () {
      timedOut = true;
      console.error('[' + COMPONENT_NAME + '] 模板加载超时 (5000ms):', templateUrl);
    }, 5000);

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

        /* ── 注册为自定义元素(允许 <yry-doc-layer> 标签直接使用) ──── */
        if (typeof window.Vue.defineCustomElement === 'function') {
          var YryDocLayerCE = window.Vue.defineCustomElement(
            buildComponent(templateHTML),
            { shadowRoot: false }
          );
          if (!customElements.get(TAG_NAME)) {
            customElements.define(TAG_NAME, YryDocLayerCE);
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

  /* ── 启动: 等待所有依赖就绪 ─────────────────────────────────────── */
  function checkAllDepsReady() {
    return DEPS.every(function (d) { return !!window[d.name]; });
  }

  if (checkAllDepsReady()) {
    loadAndRegister();
  } else {
    var remaining = DEPS.length;
    var overallTimer = setTimeout(function () {
      console.error('[' + COMPONENT_NAME + '] 等待所有依赖超时 (8000ms),组件已放弃注册');
    }, 8000);

    DEPS.forEach(function (dep) {
      if (window[dep.name]) {
        if (--remaining === 0) { clearTimeout(overallTimer); loadAndRegister(); }
        return;
      }
      /* 单个依赖超时(独立计时) */
      var depTimer = setTimeout(function () {
        if (!window[dep.name]) {
          console.error('[' + COMPONENT_NAME + '] 依赖 ' + dep.name + ' 等待超时');
        }
      }, dep.timeout);
      document.addEventListener(dep.event, function () {
        clearTimeout(depTimer);
        if (--remaining === 0) {
          clearTimeout(overallTimer);
          loadAndRegister();
        }
      }, { once: true });
    });
  }
})();
