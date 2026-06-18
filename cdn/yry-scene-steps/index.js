/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — YrySceneSteps · 场景步骤清单 (custom element)
   零依赖 vanilla JS — 无需 Vue/React

   页面使用方式:
     <link rel="stylesheet" href="../../../../cdn/yry-scene-steps/index.css">
     <script src="../../../../cdn/yry-scene-steps/index.js"></script>
     <yry-scene-steps>
       <div class="step">
         <div class="step-header">...</div>
         <div class="step-body">...</div>
       </div>
     </yry-scene-steps>

   Step HTML 由 markdown 提取器生成，组件只提供样式和点击展开行为。
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TAG_NAME = 'yry-scene-steps';

  var YrySceneSteps = function () {
    return Reflect.construct(HTMLElement, [], YrySceneSteps);
  };
  YrySceneSteps.prototype = Object.create(HTMLElement.prototype);

  YrySceneSteps.prototype.connectedCallback = function () {
    // Move light DOM children into a wrapper, then bind events
    var wrapper = document.createElement('div');
    wrapper.className = 'sts-wrapper';
    while (this.firstChild) {
      wrapper.appendChild(this.firstChild);
    }
    this.appendChild(wrapper);

    // Bind click-to-toggle on step headers
    var self = this;
    wrapper.addEventListener('click', function (e) {
      var header = e.target.closest('.step-header');
      if (!header) return;
      var body = header.parentElement.querySelector('.step-body');
      if (body) body.classList.toggle('open');
    });

    // Bind checkbox → status change
    wrapper.addEventListener('change', function (e) {
      var cb = e.target.closest('.step-checkbox');
      if (!cb) return;
      var step = cb.closest('.step');
      var status = step.querySelector('.step-status');
      if (!status) return;
      if (cb.checked) {
        status.textContent = '已完成';
        status.className = 'step-status status-done';
      } else {
        status.textContent = '待执行';
        status.className = 'step-status status-pending';
      }
      self._updateProgress();
    });

    this._updateProgress();
  };

  YrySceneSteps.prototype._updateProgress = function () {
    var wrapper = this.querySelector('.sts-wrapper');
    if (!wrapper) return;
    var total = wrapper.querySelectorAll('.step-checkbox').length;
    var done = wrapper.querySelectorAll('.step-checkbox:checked').length;

    // Update yry-progress-bar component by attribute, or query by tag name
    var bar = document.querySelector('yry-progress-bar');
    if (bar) {
      bar.setAttribute('done', done);
      bar.setAttribute('total', total);
    }
  };

  if (!customElements.get(TAG_NAME)) {
    customElements.define(TAG_NAME, YrySceneSteps);
  }
})();