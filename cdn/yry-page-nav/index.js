/* ═══════════════════════════════════════════════════════════════════════════
   YrY CDN — yry-page-nav · 页面导航生成器 (vanilla JS, no framework)

   使用方式:
     <script type="application/json" id="yry-page-config">
     { "page": {"type":"架构图","icon":"📐","file":"架构图.html"}, ... }
     </script>
     <div id="yry-nav"></div>
     <script src="../../../../cdn/yry-page-nav/index.js"></script>

   依赖: yry-page-nav/index.css
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var configEl = document.getElementById('yry-page-config');
  if (!configEl) return;

  var cfg;
  try { cfg = JSON.parse(configEl.textContent); }
  catch (e) { return; }

  var container = document.getElementById('yry-nav');
  if (!container) return;

  var p = cfg.page || {};
  var story = cfg.story || '';
  var scene = cfg.scene || {};
  var depth = cfg.depth || '../../../';
  var scenes = cfg.scenes || [];
  var pages = cfg.pages || [];

  /* ── Breadcrumb ─────────────────────────────────────────────────────── */
  var bc = document.createElement('nav');
  bc.className = 'breadcrumb';

  var bca = document.createElement('a');
  bca.href = depth + 'index.html';
  bca.textContent = '📄 文档中心';
  bc.appendChild(bca);

  var bcs1 = document.createElement('span');
  bcs1.className = 'bc-sep';
  bcs1.textContent = '/';
  bc.appendChild(bcs1);

  var bcc1 = document.createElement('span');
  bcc1.className = 'bc-current';
  bcc1.textContent = story;
  bc.appendChild(bcc1);

  var bcs2 = document.createElement('span');
  bcs2.className = 'bc-sep';
  bcs2.textContent = '/';
  bc.appendChild(bcs2);

  var bcc2 = document.createElement('span');
  bcc2.className = 'bc-current';
  bcc2.textContent = '场景 ' + scene.num + ' · ' + scene.name;
  bc.appendChild(bcc2);

  var bcs3 = document.createElement('span');
  bcs3.className = 'bc-sep';
  bcs3.textContent = '/';
  bc.appendChild(bcs3);

  var bcc3 = document.createElement('span');
  bcc3.className = 'bc-current';
  bcc3.textContent = p.icon + ' ' + p.type;
  bc.appendChild(bcc3);

  /* ── Scene Nav ──────────────────────────────────────────────────────── */
  var sn = document.createElement('nav');
  sn.className = 'scene-nav';

  for (var i = 0; i < scenes.length; i++) {
    var sc = scenes[i];
    var isActive = (sc.num === scene.num);
    var href = isActive ? p.file : ('../' + sc.dir + '/' + p.file);

    var sna = document.createElement('a');
    sna.className = 'scene-nav-link' + (isActive ? ' active' : '');
    sna.href = href;
    sna.textContent = '🎨 场景' + sc.num + ' · ' + sc.name;
    sn.appendChild(sna);

    if (i < scenes.length - 1) {
      var snsep = document.createElement('span');
      snsep.className = 'scene-nav-sep';
      snsep.textContent = '·';
      sn.appendChild(snsep);
    }
  }

  var snsep2 = document.createElement('span');
  snsep2.className = 'scene-nav-sep';
  snsep2.textContent = '·';
  sn.appendChild(snsep2);

  var snidx = document.createElement('a');
  snidx.className = 'scene-nav-link story';
  snidx.href = 'index.md';
  snidx.textContent = '📖 场景说明';
  sn.appendChild(snidx);

  /* ── Cross Nav ──────────────────────────────────────────────────────── */
  var cn = document.createElement('nav');
  cn.className = 'cross-nav';

  for (var j = 0; j < pages.length; j++) {
    var pg = pages[j];
    if (pg.type === p.type) {
      var cns = document.createElement('span');
      cns.className = 'cross-link on';
      cns.textContent = pg.icon + ' ' + pg.type;
      cn.appendChild(cns);
    } else {
      var cna = document.createElement('a');
      cna.className = 'cross-link';
      cna.href = pg.file;
      cna.textContent = pg.icon + ' ' + pg.type;
      cn.appendChild(cna);
    }
    if (j < pages.length - 1) {
      var cnsep = document.createElement('span');
      cnsep.className = 'cross-sep';
      cnsep.textContent = '·';
      cn.appendChild(cnsep);
    }
  }

  container.appendChild(bc);
  container.appendChild(sn);
  container.appendChild(cn);
})();