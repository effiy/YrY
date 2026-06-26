/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryDashboardQuicknav · Vue 3 仪表板快速锚点组件 (loader)

   适用: docs/index.html 评分仪表板顶部的胶囊式快速锚点
         (📸最新报告 / 📐评分机制 / 📋实时评分 / 🔬维度分解 / 📑详细报告 / 🧭CDN 聚合)

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-dashboard-quicknav-tpl"> 内容
     3) 注册组件到 window.YryDashboardQuicknav
     4) 同时通过 Vue.defineCustomElement 注册为 <yry-dashboard-quicknav>
     5) 派发 'yry-dashboard-quicknav-ready' 事件,通知页面挂载

   Props:
     chips       (必填) 锚点数组,每项: { id, label, title, href, target }
                        - id      滚动监听的目标 id (必填)
                        - label   chip 文本 (必填)
                        - title   hover 提示
                        - href    链接地址;缺省为 '#' + id
                        - target  _blank 等
     id          (可选) 容器 id,缺省 'sr-quicknav'
     ariaLabel   (可选) 容器 aria-label,缺省 '仪表板快速导航'
     scrollSpy   (可选) 是否启用内置滚动联动高亮,缺省 true
     spyOffset   (可选) IntersectionObserver 的 rootMargin,缺省 '-20% 0px -70% 0px'

   页面使用方式 (Custom Element 形式):
     <link rel="stylesheet" href="../../../../cdn/yry-dashboard-quicknav/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/shared/vue-ce-loader.js"></script>
     <script src="../../../../cdn/yry-dashboard-quicknav/index.js"></script>

     <yry-dashboard-quicknav id="sr-quicknav"
                            aria-label="评分仪表板快速导航"></yry-dashboard-quicknav>

     <script>
       var CHIPS = [
         { id: 'sm-snapshot',    label: '📸 最新报告', title: '最新报告快照 — 今日健康 + 20 技能自循环巡检',     href: '#sm-snapshot' },
         { id: 'sm-methodology', label: '📐 评分机制', title: '八维加权评分体系 — PHI·SHI·TQI·SII·AQI·DQI·UPHI·DHI', href: '#sm-methodology' },
         { id: 'score-report',   label: '📋 实时评分', title: '实时评分报告 — 综合评分·趋势·预测·可靠性·诊断·架构', href: '#score-report' },
         { id: 'sr-dim-list',    label: '🔬 维度分解', title: '维度评分分解 — 按严重程度排序·支持筛选',            href: '#sr-dim-list' },
         { id: 'sr-detail-nav',  label: '📑 详细报告', title: '详细报告导航 — 13 个子页面入口',                     href: '#sr-detail-nav' },
         { id: 'sec-cdn-agg',    label: '🧭 CDN 聚合', title: 'CDN 聚合中心 — 七张聚合页·实时 KPI·1-7 键盘跳转',     href: '#sec-cdn-agg' }
       ];
       function mount() {
         var el = document.getElementById('sr-quicknav');
         el.chips = CHIPS;
       }
       if (window.YryDashboardQuicknav) mount();
       else document.addEventListener('yry-dashboard-quicknav-ready', mount, { once: true });
     </script>

   页面使用方式 (Vue.createApp 形式):
     Vue.createApp(window.YryDashboardQuicknav, {
       chips: CHIPS,
       ariaLabel: '评分仪表板快速导航',
       scrollSpy: true
     }).mount('#sr-quicknav');
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryDashboardQuicknav] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  const COMPONENT_NAME = 'YryDashboardQuicknav';
  const TEMPLATE_ID = 'yry-dashboard-quicknav-tpl';

  window.YrYVueCE.define({
    componentName: COMPONENT_NAME,
    templateId: TEMPLATE_ID,
    buildComponent: function (templateHTML) {
      return {
        name: COMPONENT_NAME,
        props: {
          chips: {
            type: Array,
            default: function () { return []; }
          },
          id: { type: String, default: 'sr-quicknav' },
          ariaLabel: { type: String, default: '仪表板快速导航' },
          scrollSpy: { type: Boolean, default: true },
          spyOffset: { type: String, default: '-20% 0px -70% 0px' }
        },
        watch: {
          chips: function (next) {
            if (this.scrollSpy && !this._spy && next && next.length) {
              this._initScrollSpy();
            }
          }
        },
        mounted: function () {
          if (this.scrollSpy) this._initScrollSpy();
        },
        beforeUnmount: function () {
          if (this._spy) {
            this._spy.disconnect();
            this._spy = null;
          }
        },
        methods: {
          _initScrollSpy: function () {
            const root = this.$el;
            if (!root || typeof root.querySelectorAll !== 'function') return;
            if (!window.IntersectionObserver) return;

            const chips = Array.prototype.slice.call(root.querySelectorAll('.sr-qn-chip'));
            if (!chips.length) return;

            const self = this;
            const spy = new window.IntersectionObserver(function (entries) {
              entries.forEach(function (e) {
                if (e.isIntersecting) {
                  const id = e.target.id;
                  chips.forEach(function (c) {
                    c.classList.toggle('is-active', c.getAttribute('data-target') === id);
                  });
                }
              });
            }, { rootMargin: self.spyOffset, threshold: 0 });

            chips.forEach(function (c) {
              const target = document.getElementById(c.getAttribute('data-target'));
              if (target) spy.observe(target);
            });

            this._spy = spy;
          },
          onChipClick: function (_e, chip) {
            /* 命中锚点时让浏览器原生处理 (#id 平滑滚动);
               此处仅阻止 [target=_blank] 走外部链接时触发滚动。 */
            if (chip && chip.target === '_blank') {
              return true; // 不 preventDefault
            }
            return true;
          }
        },
        template: templateHTML
      };
    }
  });
})();
