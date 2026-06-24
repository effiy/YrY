/* ═══════════════════════════════════════════════════════════════════════════
   YryCardGrid · Vue 3 卡片网格容器

   职责:
     - 接受 items prop (数组),每项对应一张 yry-item-card
     - 自动给带 onClick 的卡片绑定 click 事件 (阻止默认跳转并执行回调)
     - 注册为 <yry-card-grid> 自定义元素,允许 light DOM 渲染

   Props:
     items : Array<{
       icon, iconModifier, name, nameHref, nameTarget, badge, desc,
       tags, meta, onClick?
     }>

   依赖:
     - Vue 3                  (window.Vue)
     - YryItemCard            (window.YryItemCard · 通过 components 注册为子组件)

   使用:
     <yry-card-grid id="agent-roles-grid"></yry-card-grid>
     <script>document.getElementById('agent-roles-grid').items = [...];</script>

   注册事件:
     yry-card-grid-ready · 监听此事件以确认组件已注册到 customElements
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCardGrid] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-card-grid-tpl';

  var READY_EVENT = 'yry-card-grid-ready';

  var TAG_NAME = 'yry-card-grid';

  var DEP_GLOBAL = 'YryItemCard';

  var DEP_EVENT = 'yry-item-card-ready';

  var LOAD_TIMEOUT_MS = 5000;

  var DEP_TIMEOUT_MS = 5000;

  function getScriptUrl() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('yry-card-grid') !== -1) {
        return scripts[i].src;
      }
    }
    return scripts[scripts.length - 1].src;
  }

  window.YrYVueCE.define({
    componentName: 'YryCardGrid',
    templateId: 'yry-card-grid-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryCardGrid',
        props: {
          items: {
            type: Array,
            default: function () {
              return [];
            }
          }
        },
        components: {
          YryItemCard: window[DEP_GLOBAL] || null
        },
        template: templateHTML,
        methods: {
          /**
           * 提取需要传递给 <yry-item-card> 的 props
           * 过滤掉 onClick (它是函数,不应该作为 prop 传递,而是通过 DOM 事件处理)
           */
          cardProps: function (item) {
            var out = {};
            var k;
            for (k in item) {
              if (k !== 'onClick' && Object.prototype.hasOwnProperty.call(item, k)) {
                out[k] = item[k];
              }
            }
            return out;
          },
          /**
           * 重新绑定 onClick 到渲染后的链接元素
           * 并应用交错动画延迟(staggered fadeInUp,与旧版 .item-card 行为一致)
           */
          bindOnClicks: function () {
            var wrappers = this.$refs.grid ? this.$refs.grid.querySelectorAll(':scope > *') : [];
            var self = this;
            wrappers.forEach(function (wrapper, i) {
              var item = self.items[i];
              if (!item) return;

              /* 交错动画延迟 (0.01 + (i % 20) * 0.012) 秒 */
              var card = wrapper.matches('.item-card')
                ? wrapper
                : wrapper.querySelector('.item-card');
              if (card) {
                card.style.animationDelay = 0.01 + (i % 20) * 0.012 + 's';
              }

              /* 绑定 onClick 拦截 */
              if (typeof item.onClick !== 'function') return;
              var link = wrapper.querySelector('.item-card .name a');
              if (!link) return;
              if (link.__yryBound) return;
              link.__yryBound = true;
              link.addEventListener('click', function (e) {
                e.preventDefault();
                try {
                  item.onClick();
                } catch (err) {
                  console.error('[YryCardGrid] onClick 执行失败:', err);
                }
              });
            });
          }
        },
        mounted: function () {
          this.$nextTick(this.bindOnClicks);
        },
        updated: function () {
          this.$nextTick(this.bindOnClicks);
        }
      };
    }
  });
})();
