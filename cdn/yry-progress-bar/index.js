/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryProgressBar · Vue 3 进度条组件 (自包含: JS + CSS 内联)

   本文件负责:
     1) 注入样式到 document.head (幂等,单次)
     2) 运行时 fetch 同目录的 index.html → 解析模板 → 注册 CE
     3) 自动滚动追踪 (无 done/total 属性时) 或 任务进度条 (显式设置时)
     4) 派发 'yry-progress-bar-ready' 事件

   props:
     done  — 已完成数量 (默认 0)
     total — 总数量 (默认 0)
     label — 左侧标签文字 (默认 "进度")

   页面使用方式 (无需单独引入 CSS):
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../cdn/shared/vue-ce-loader.js"></script>
     <script src="../cdn/yry-progress-bar/index.js"></script>
     <yry-progress-bar></yry-progress-bar>          <!-- 自动滚动追踪 -->
     <yry-progress-bar done="5" total="10"></yry-progress-bar>  <!-- 任务进度 -->
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── CSS 内联注入 (幂等,单次) ─────────────────────────────────────
  (function injectCSS() {
    var STYLE_ID = 'yry-progress-bar-css';
    if (document.getElementById(STYLE_ID)) return;
    var script = document.currentScript;
    if (!script || !script.src) return;
    var link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = new URL('index.css', new URL(script.getAttribute('src'), window.location.href)).href;
    document.head.appendChild(link);
  })();

  // ── 组件注册 ──────────────────────────────────────────────────────
  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryProgressBar] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryProgressBar',
    templateId: 'yry-progress-bar-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryProgressBar',
        props: {
          done: { type: Number, default: 0 },
          total: { type: Number, default: 0 },
          label: { type: String, default: '进度' }
        },
        data: function () {
          return {
            _ticking: false,
            _onScroll: null,
            _scrollMode: false,
            _val: { done: 0, total: 0 }
          };
        },
        computed: {
          pct: function () {
            var d = this._scrollMode ? this._val.done : this.done;
            var t = this._scrollMode ? this._val.total : this.total;
            return t > 0 ? Math.round((d / t) * 100) : 0;
          }
        },
        methods: {
          _updateScroll: function () {
            var docH = document.documentElement.scrollHeight - window.innerHeight;
            this._val = { done: Math.round(window.scrollY), total: Math.max(1, Math.round(docH)) };
            this._ticking = false;
          }
        },
        mounted: function () {
          // 可靠找到宿主 <yry-progress-bar>: closest 会向上（含自身）查找，无论
          // $el 是模板根 (.pb-wrap) 还是宿主本身都能拿到正确的宿主元素
          var host = this.$el;
          if (host && typeof host.closest === 'function') {
            host = host.closest('yry-progress-bar');
          }
          if (host && (host.hasAttribute('done') || host.hasAttribute('total'))) return;
          this._scrollMode = true;
          var self = this;
          this._onScroll = function () {
            if (!self._ticking) {
              self._ticking = true;
              requestAnimationFrame(function () { self._updateScroll(); });
            }
          };
          window.addEventListener('scroll', this._onScroll, { passive: true });
          window.addEventListener('resize', this._onScroll, { passive: true });
          // 初始读取：用 rAF 确保 DOM 布局完成，不依赖 Vue 内部 $nextTick
          requestAnimationFrame(function () { self._updateScroll(); });
        },
        beforeUnmount: function () {
          if (this._onScroll) {
            window.removeEventListener('scroll', this._onScroll);
            window.removeEventListener('resize', this._onScroll);
            this._onScroll = null;
          }
        },
        template: templateHTML
      };
    }
  });
})();
