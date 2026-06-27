/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryQuickstart · Vue 3 快速开始组件 (loader)

   props: tip (HTML) · cmd (命令文本,带复制按钮)

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-quickstart/index.css">
     <script src="../shared/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-quickstart/index.js"></script>
     <div id="my-qs"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryQuickstart, {
           tip: '复制整段 → 终端粘贴。', cmd: 'git clone ...'
         }).mount('#my-qs');
       }
       if (window.YryQuickstart) mount();
       else document.addEventListener('yry-quickstart-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryQuickstart] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-quickstart-tpl';

  var READY_EVENT = 'yry-quickstart-ready';

  var TAG_NAME = 'yry-quickstart';

  var LOAD_TIMEOUT_MS = 5000;

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (_e) {
        /* clipboard API 不可用,静默降级 */
      }
      document.body.removeChild(ta);
      resolve();
    });
  }

  window.YrYVueCE.define({
    componentName: 'YryQuickstart',
    templateId: 'yry-quickstart-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryQuickstart',
        props: {
          tip: { type: String, default: '' },
          cmd: { type: String, default: '' }
        },
        data: function () {
          return { copied: false };
        },
        methods: {
          doCopy: function () {
            var text = this.cmd || '';
            var self = this;
            copyToClipboard(text).then(function () {
              self.copied = true;
              setTimeout(function () {
                self.copied = false;
              }, 1500);
            });
          }
        },
        template: templateHTML
      };
    }
  });
})();
