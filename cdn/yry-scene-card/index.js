/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneCard · Vue 3 场景卡片组件 (loader)
   适用: Layer 4 的 37 张场景卡片

   props 简表:
     num         (可选) 场景序号,如 '场景 1'
     name        (必填) 场景名
     nameHref    (可选) 场景名链接
     nameTarget  (可选) _blank 等
     desc        (可选) 场景描述
     meta        (可选) 7 个交付物链接 · 形如 [{ icon, label, href, target? }]
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YrySceneCard',
    templateId: 'yry-scene-card-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YrySceneCard',
        props: {
          num: { type: String, default: '' },
          name: { type: String, required: true },
          nameHref: { type: String, default: '' },
          nameTarget: { type: String, default: '' },
          desc: { type: String, default: '' },
          meta: {
            type: Array,
            default: function () {
              return [];
            }
          }
        },
        computed: {
          deliveryLinks: function () {
            var DELIVERY_ICONS = [
              { icon: '📋', label: '清单' },
              { icon: '📐', label: '架构' },
              { icon: '🔗', label: '图谱' },
              { icon: '🧪', label: '测试' },
              { icon: '📄', label: '源码' },
              { icon: '💡', label: '演示' },
              { icon: '📝', label: '审查' }
            ];
            if (!this.meta || !this.meta.length) return DELIVERY_ICONS;
            var existing = {};
            this.meta.forEach(function (m) {
              existing[m.label] = m;
            });
            return DELIVERY_ICONS.map(function (d) {
              return existing[d.label] || { icon: d.icon, label: d.label };
            });
          }
        },
        template: templateHTML
      };
    }
  });
})();
