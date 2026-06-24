/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryStoryCard · Vue 3 故事任务卡片组件 (loader)
   适用: Layer 3 的 7 张故事任务卡片

   props 简表:
     icon        (可选) 故事 icon emoji
     name        (必填) 故事名
     nameHref    (可选) 故事名链接
     nameTarget  (可选) _blank 等
     badge       (可选) 版本号徽标
     desc        (可选) 故事描述(支持 HTML,经 v-html 渲染)
     scenes      (可选) 场景 tag 文本数组
     demo        (可选) 效果演示链接 URL
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryStoryCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  window.YrYVueCE.define({
    componentName: 'YryStoryCard',
    templateId: 'yry-story-card-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryStoryCard',
        props: {
          icon: { type: String, default: '' },
          name: { type: String, required: true },
          nameHref: { type: String, default: '' },
          nameTarget: { type: String, default: '' },
          badge: { type: String, default: '' },
          desc: { type: String, default: '' },
          scenes: {
            type: Array,
            default: function () {
              return [];
            }
          },
          demo: { type: String, default: '' },
          links: {
            type: Array,
            default: function () {
              return [];
            }
          }
        },
        template: templateHTML
      };
    }
  });
})();
