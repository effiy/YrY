/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryStoryCardList · Vue 3 故事卡片列表组件 (loader)
   适用: 故事任务面板 · 多故事卡 + 场景列表 + 摘要条

   本文件负责:
     1) 运行时 fetch 同目录的 index.html
     2) 解析 <script type="text/x-template" id="yry-story-card-list-tpl"> 内容
     3) 注册组件到 window.YryStoryCardList
     4) 派发 'yry-story-card-list-ready' 事件

   页面使用方式:
     <link rel="stylesheet" href="../../cdn/yry-story-card-list/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../cdn/yry-story-card-list/index.js"></script>
     <yry-story-card-list id="scl-app"></yry-story-card-list>
     <script>
       var el = document.getElementById('scl-app');
       el.summary = [{ value: '6', label: '故事' }, ...];
       el.stories = [{ badge: 'CDN', badgeVariant: 'cdn', title: '...', desc: '...', meta: [...], scenes: [...] }, ...];
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryStoryCardList] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-story-card-list-tpl';

  var READY_EVENT = 'yry-story-card-list-ready';

  var TAG_NAME = 'yry-story-card-list';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YryStoryCardList',
    templateId: 'yry-story-card-list-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryStoryCardList',
        props: {
          /* 摘要条: [{ value, label }] */
          summary: {
            type: Array,
            default: function () {
              return [];
            }
          },
          /* 故事列表: [{ badge, badgeVariant, title, desc, meta: [{text}], scenes: [{ name, href, desc, links: [{label, href}] }] }] */
          stories: {
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
