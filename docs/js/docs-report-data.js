/**
 * YrY 文档中心 · <yry-report-section> 数据注入
 * 从 docs/index.html 内联 <script> (原 9 个 setSec 块 ~310 行) 迁出
 *
 * 9 个 section 数据源:
 *   1) sm-snapshot       — 最新报告入口 (2026-06-23)
 *   2) sec-cdn-resources — 13 个 CDN 资源入口
 *   3) sec-skills-market — 20 个 SKILL.md 入口
 *   4) sec-rules-lib     — 治理规则/共享库/自约束 (45 项)
 *   5) sec-lib-index     — lib/ 24 模块完整索引
 *   6) sec-tests-infra   — 25 个测试入口
 *   7) sec-readme-nav    — 22 个 README 锚点 (含 extraIntro 速览)
 *   8) sec-claude-nav    — 8 个 CLAUDE.md 锚点 (含 extraIntro 铁律速览)
 *   9) sec-troubleshooting — 9 个故障排查锚点
 *
 * 依赖: YryReportSection (window.YryReportSection) 必须先加载
 */
  (function () {
    var __script = document.currentScript;
    var __src = __script && __script.src ? __script.src : '';
    function setSec(id, cfg) {
      var el = document.getElementById(id);
      if (!el || !window.YryReportSection) return;
      if (cfg.title != null) el.title = cfg.title;
      if (cfg.metaInfo != null) el.metaInfo = cfg.metaInfo;
      if (cfg.intro != null) el.intro = cfg.intro;
      if (cfg.extraIntro != null) el.extraIntro = cfg.extraIntro;
      if (cfg.footerNote != null) el.footerNote = cfg.footerNote;
      if (cfg.footerTight != null) el.footerTight = cfg.footerTight;
      if (cfg.linksClass != null) el.linksClass = cfg.linksClass;
      if (cfg.links != null) el.links = cfg.links;
    }

    function mountSections() {
  var dataUrl = __src ? __src.replace(/docs-report-data\.js(\?[^]*)?$/, 'docs-report-data.json') : './js/docs-report-data.json';
  fetch(dataUrl).then(function(r){return r.json();}).then(function(items){
    items.forEach(function(it){ setSec(it.id, it.config); });
  }).catch(function(err){ console.error('[docs-report-data] load failed:', err); });
}

    if (window.YryReportSection) mountSections();
    else document.addEventListener('yry-report-section-ready', mountSections, { once: true });
  })();
