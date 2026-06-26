/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryItemCards · 静态资产卡片数据 + 自动注入控制器 (Vue 3 自定义元素, full)

   页面使用方式:
     <link rel="stylesheet" href="../cdn/yry-item-cards/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../cdn/yry-item-cards/index.js"></script>
     <yry-item-cards></yry-item-cards>

   行为:
     1) 内置 12 个 grid 的完整卡片数据(agent/rule/ref/story/scene 等)
     2) 自动遍历 DOM,寻找匹配 gridId 的 <yry-card-grid> 元素并设置 .items 属性
     3) 通过 MutationObserver + 复合组件 ready 事件 + 周期轮询三层兜底,
        确保 yry-layer-agents/rules/refs 异步渲染 grid 后能挂载数据
     4) 暴露 window.YRY_ITEM_CARDS 给旧版调用方
     5) 自动补齐 7 种交付物图标链接
     6) 派发 yry-item-cards-ready 事件

   数据迁移说明:
     本组件 1:1 保留 docs/js/yry-item-cards.js 的 553 行数据与多重兜底挂载逻辑,
     但改为 Vue 3 custom element 模式,模板来自 index.html,数据集中在 buildComponent() 内。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  /* global requestAnimationFrame, MutationObserver */

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryItemCards] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }
  var _script = document.currentScript;
  var _dataUrl = _script && _script.src ? _script.src.replace(/index\.js(\?[^]*)?$/, 'data.json') : './data.json';
  var _dataCache = null;
  var _dataPromise = fetch(_dataUrl).then(function(r){return r.json();}).then(function(d){_dataCache = d;}).catch(function(err){console.error('[YryItemCards] data.json load failed:', err);});


  var TAG_NAME = 'yry-item-cards';

  var TEMPLATE_ID = 'yry-item-cards-tpl';

  var READY_EVENT = 'yry-item-cards-ready';

  var LOAD_TIMEOUT_MS = 5000;

  var DELIVERY_ICONS = [];

  function buildItemCardsData() { return _dataCache; }

  function enrichLinks(grids) {
    Object.keys(grids).forEach(function (gridId) {
      (grids[gridId] || []).forEach(function (item) {
        if (item.links) return;
        var links = [];
        DELIVERY_ICONS.forEach(function (d) {
          var entry = { icon: d.icon, label: d.label };
          if (d.label === '源码' && item.nameHref) entry.href = item.nameHref;
          links.push(entry);
        });
        item.links = links;
      });
    });
    return grids;
  }

  _dataPromise.then(function(){
    if (_dataCache) {
      DELIVERY_ICONS = _dataCache.DELIVERY_ICONS || [];
    }
    window.YrYVueCE.define({
    componentName: 'YryItemCards',
    script: _script,
    templateId: 'yry-item-cards-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryItemCards',
        template: templateHTML,
        data: function () {
          var grids = enrichLinks(buildItemCardsData());
          /* 暴露给全局,兼容旧版调用方 */
          window.YRY_ITEM_CARDS = grids;
          return { grids: grids, mounted: {} };
        },
        methods: {
          mountAll: function () {
            var grids = this.grids;
            var mountedGrids = this.mounted;
            var mountCount = 0,
              pendingGrids = [];
            var self = this;

            Object.keys(grids).forEach(function (gridId) {
              if (mountedGrids[gridId]) return;
              var grid = document.getElementById(gridId);
              if (!grid) {
                pendingGrids.push(gridId);
                return;
              }
              if (grid.tagName && grid.tagName.toLowerCase() === 'yry-card-grid') {
                grid.items = grids[gridId];
                mountedGrids[gridId] = true;
                mountCount++;
                return;
              }
              /* 旧路径 fallback:plain <div class="card-grid"> → 手动挂载 */
              if (!window.YryItemCard) {
                console.warn('[YryItemCards] YryItemCard 未注册,跳过挂载 #' + gridId);
                return;
              }
              grids[gridId].forEach(function (item) {
                var host = document.createElement('div');
                grid.appendChild(host);
                if (window.Vue && window.YryItemCard) {
                  window.Vue.createApp(window.YryItemCard, item).mount(host);
                }
                mountCount++;
              });
              mountedGrids[gridId] = true;
            });

            if (mountCount > 0) {
              console.info(
                '[YryItemCards] 成功挂载',
                mountCount,
                '张卡片到',
                Object.keys(mountedGrids).length,
                '个 grid'
              );
            } else if (pendingGrids.length) {
              console.info(
                '[YryItemCards] 待挂载 grid:',
                pendingGrids.join(', '),
                '· 等待 yry-layer-*-ready 事件或 MutationObserver'
              );
            }

            /* 还原原静态 item-card 的交错动画延迟 */
            if (typeof requestAnimationFrame !== 'undefined') {
              requestAnimationFrame(function () {
                var i = 0;
                document.querySelectorAll('.card-grid .item-card').forEach(function (card) {
                  if (!card.style.animationDelay) {
                    card.style.animationDelay = 0.01 + (i % 20) * 0.012 + 's';
                  }
                  i++;
                });
              });
            }

            return pendingGrids.length;
          },
          setupObserver: function () {
            if (typeof MutationObserver === 'undefined') return;
            var self = this;
            var pendingTimer = null;
            function scheduleMount() {
              if (pendingTimer) return;
              pendingTimer = setTimeout(function () {
                pendingTimer = null;
                self.mountAll();
              }, 0);
            }
            ['yry-layer-agents', 'yry-layer-rules', 'yry-layer-refs'].forEach(function (tagName) {
              var el = document.querySelector(tagName);
              if (!el) return;
              var mo = new MutationObserver(function () {
                scheduleMount();
              });
              mo.observe(el, { childList: true, subtree: true });
            });
            var bodyMO = new MutationObserver(function (mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                  var n = added[j];
                  if (n.nodeType !== 1) continue;
                  if (n.id && window.YRY_ITEM_CARDS[n.id]) {
                    scheduleMount();
                    return;
                  }
                  if (n.querySelector && n.querySelector('yry-card-grid')) {
                    scheduleMount();
                    return;
                  }
                }
              }
            });
            bodyMO.observe(document.body, { childList: true, subtree: true });
          },
          triggerAll: function () {
            var self = this;
            this.mountAll();
            if (window.YryItemCard) this.mountAll();
            else
              document.addEventListener(
                'yry-item-card-ready',
                function () {
                  self.mountAll();
                },
                { once: true }
              );
            document.addEventListener('yry-layer-agents-ready', function () {
              self.mountAll();
            });
            document.addEventListener('yry-layer-rules-ready', function () {
              self.mountAll();
            });
            document.addEventListener('yry-layer-refs-ready', function () {
              self.mountAll();
            });
            if (document.readyState === 'loading') {
              document.addEventListener(
                'DOMContentLoaded',
                function () {
                  self.setupObserver();
                },
                { once: true }
              );
            } else {
              this.setupObserver();
            }
            [1000, 2000, 4000, 8000].forEach(function (delay) {
              setTimeout(function () {
                self.mountAll();
              }, delay);
            });
          }
        },
        mounted: function () {
          var self = this;
          this.$nextTick(function () {
            self.triggerAll();
          });
          document.dispatchEvent(
            new CustomEvent(READY_EVENT, { detail: { component: 'YryItemCards' } })
          );
        }
      };
    }
  });
 });})();
