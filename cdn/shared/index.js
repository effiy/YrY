/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — shared/index.js · 共享运行时 (window.YrY)

   本文件提供:
     1) YrY.initTabs(containerSelector)  — 标签页切换初始化
     2) YrY.switchPanel(name, tabSel, panelSel) — 面板切换
     3) YrY.sceneMeta(basePath) — 场景 7 件交付物图标 + 路径展开

   页面使用方式:
     <script src="shared/index.js" defer></script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var DELIVERY_FILE_MAP = [
    { icon: '📋', label: '清单', file: '清单.html' },
    { icon: '📐', label: '架构', file: '架构图.html' },
    { icon: '🔗', label: '图谱', file: '知识图谱.html' },
    { icon: '🧪', label: '测试', file: '测试面板.html' },
    { icon: '📄', label: '源码', file: '源码.html' },
    { icon: '💡', label: '演示', file: '演示.html' },
    { icon: '📝', label: '审查', file: '审查.html' }
  ];

  /**
   * YrY.switchPanel(name, tabSelector, panelSelector)
   * 切换标签页和对应面板的显示状态。
   *
   * @param {string} name — data-panel 值
   * @param {string} tabSel — 标签选择器 (默认 '.yry-tab')
   * @param {string} panelSel — 面板选择器 (默认 '.yry-panel')
   */
  function switchPanel(name, tabSel, panelSel) {
    var tabs = document.querySelectorAll(tabSel || '.yry-tab');
    var panels = document.querySelectorAll(panelSel || '.yry-panel');

    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      if (tab.getAttribute('data-panel') === name) {
        tab.classList.add('on');
      } else {
        tab.classList.remove('on');
      }
    }

    for (var j = 0; j < panels.length; j++) {
      var panel = panels[j];
      if (panel.id === 'panel' + name.charAt(0).toUpperCase() + name.slice(1)) {
        panel.classList.add('on');
      } else if (panel.getAttribute('data-panel') === name) {
        panel.classList.add('on');
      } else {
        panel.classList.remove('on');
      }
    }
  }

  /**
   * YrY.initTabs(containerSelector)
   * 在指定容器内查找 .yry-tab 元素并绑定点击切换事件。
   *
   * @param {string} containerSel — CSS 选择器 (默认 'body')
   */
  function initTabs(containerSel) {
    var container = document.querySelector(containerSel || 'body');
    if (!container) return;

    var tabs = container.querySelectorAll('.yry-tab');
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      // 避免重复绑定
      if (tab.getAttribute('data-yry-tab-bound') === '1') continue;
      tab.setAttribute('data-yry-tab-bound', '1');

      tab.addEventListener('click', function (e) {
        var target = e.currentTarget;
        var name = target.getAttribute('data-panel');
        if (!name) return;
        // 在全局范围切换面板 (面板可能在 container 外部)
        switchPanel(name, '.yry-tab', '.yry-panel');
      });
    }
  }

  /**
   * YrY.sceneMeta(basePath)
   * 根据场景目录路径展开 7 件标准交付物图标 + 文件路径。
   *
   * @param {string} basePath — 场景目录路径, 如 'yry-progress-bar/scenes/场景-1-需求与设计'
   * @returns {Array<{icon: string, label: string, href: string}>}
   */
  function sceneMeta(basePath) {
    if (!basePath) return [];
    // 确保路径以 / 结尾
    var base = basePath.replace(/\/$/, '');
    return DELIVERY_FILE_MAP.map(function (d) {
      return { icon: d.icon, label: d.label, href: base + '/' + d.file };
    });
  }

  // ── 挂载到 window.YrY ──────────────────────────────────────────────
  window.YrY = {
    initTabs: initTabs,
    switchPanel: switchPanel,
    sceneMeta: sceneMeta
  };

})();
