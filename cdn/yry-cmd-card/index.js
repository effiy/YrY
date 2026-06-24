/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YryCmdCard · Vue 3 命令执行卡片组件 (loader)

   props:
     stage      — 阶段标签 (如 "步骤 1")
     name       — 命令名称
     desc       — 命令描述
     cmd        — 实际命令文本
     expectHtml — 预期输出 (支持内联 HTML)
     owner      — 责任人
     duration   — 耗时
     priority   — 优先级: p0 / p1 / p2

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-cmd-card/index.css">
     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
     <script src="../../../../cdn/yry-cmd-card/index.js"></script>
     <div id="my-cmd"></div>
     <script>
       function mount() {
         Vue.createApp(window.YryCmdCard, {
           stage: '步骤 1', name: '初始化', cmd: '/rui init',
           owner: 'planner', priority: 'p0'
         }).mount('#my-cmd');
       }
       if (window.YryCmdCard) mount();
       else document.addEventListener('yry-cmd-card-ready', mount, { once: true });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryCmdCard] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  var TEMPLATE_ID = 'yry-cmd-card-tpl';

  var READY_EVENT = 'yry-cmd-card-ready';

  var TAG_NAME = 'yry-cmd-card';

  var LOAD_TIMEOUT_MS = 5000;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

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
    componentName: 'YryCmdCard',
    templateId: 'yry-cmd-card-tpl',
    buildComponent: function buildComponent(templateHTML) {
      return {
        name: 'YryCmdCard',
        props: {
          stage: { type: String, default: '' },
          name: { type: String, default: '' },
          desc: { type: String, default: '' },
          cmd: { type: String, default: '' },
          expectHtml: { type: String, default: '' },
          owner: { type: String, default: '' },
          duration: { type: String, default: '' },
          priority: { type: String, default: '' }
        },
        data: function () {
          return { copied: false };
        },
        computed: {
          metaItems: function () {
            var items = [];
            if (this.owner) items.push('<span>👤 ' + esc(this.owner) + '</span>');
            if (this.duration) items.push('<span>⏱ ' + esc(this.duration) + '</span>');
            if (this.priority)
              items.push(
                '<span>🎯 <span class="c-priority ' +
                  esc(this.priority) +
                  '">' +
                  esc(this.priority.toUpperCase()) +
                  '</span></span>'
              );
            return items;
          }
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
