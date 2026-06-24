/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneChrome · Vue 3 组件 (loader)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YrySceneChrome] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-scene-chrome-tpl';

  var READY_EVENT = 'yry-scene-chrome-ready';

  var TAG_NAME = 'yry-scene-chrome';

  var LOAD_TIMEOUT_MS = 5000;

  window.YrYVueCE.define({
    componentName: 'YrySceneChrome',
    templateId: 'yry-scene-chrome-tpl',
    buildComponent: function buildComponent(templateHTML) {
    return {
        name: 'YrySceneChrome',
      props: {
        theme:      { type: String, default: 'a' },
        title:      { type: String, default: '' },
        titleAccent:{ type: String, default: '' },
        subtitle:   { type: String, default: '' },
        toolbar:    { type: String, default: '' },
        breadcrumb: { type: String, default: '[]' },
        crossnav:   { type: String, default: '[]' }
      },
      computed: {
        parsedBc: function () { try { return JSON.parse(this.breadcrumb); } catch (e) { return []; } },
        parsedCn: function () { try { return JSON.parse(this.crossnav); } catch (e) { return []; } }
      },
      template: templateHTML
      };
    }
  });
})();
