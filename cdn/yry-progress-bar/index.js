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
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../cdn/shared/vue-ce-loader.js"></script>
     <script src="../cdn/yry-progress-bar/index.js"></script>
     <yry-progress-bar></yry-progress-bar>          <!-- 自动滚动追踪 -->
     <yry-progress-bar done="5" total="10"></yry-progress-bar>  <!-- 任务进度 -->
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

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
          // Vue 3 CE 中 this.$el 是模板根元素 (.pb-wrap),不是 host (<yry-progress-bar>)
          // 通过 parentElement 回到 host 判定是否显式设置了 done/total
          var host = this.$el && this.$el.parentElement;
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
          this.$nextTick(function () { self._updateScroll(); });
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
