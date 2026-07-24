/**
 * yry-test-scenes · shared scene listing renderer
 * ----------------------------------------------------------------------
 * Reads window.REPORT_CONFIG.options.scopeTitle from data.js (which
 * must be loaded before this script) and populates the page title,
 * heading, meta, and scene list. This single template serves all
 * projects, so only `data.js` varies.
 */
(function () {
  'use strict';
  var cfg = (window.REPORT_CONFIG && window.REPORT_CONFIG.options) || {};
  var projectName = cfg.scopeTitle || '';
  var titleText = projectName ? projectName + ' · Test Scenes' : 'Test Scenes';

  document.title = titleText;

  var SCENES = [
    { slug: 'scene-1-post-init-full-self-check',          num: 1, title: 'Post-Init Full Self-Check',               desc: 'Full integrity verification after pipeline init.' },
    { slug: 'scene-2-pre-commit-incremental-self-check',   num: 2, title: 'Pre-Commit Incremental Self-Check',      desc: 'Fast incremental check that runs before every commit.' },
    { slug: 'scene-3-doc-code-consistency',                num: 3, title: 'Doc-Code Consistency',                   desc: 'Detects drift between documentation and actual code.' },
    { slug: 'scene-4-security-surface-regression',         num: 4, title: 'Security Surface Regression',            desc: 'Guards against re-introducing known security surface issues.' },
    { slug: 'scene-5-cross-story-integration-regression',  num: 5, title: 'Cross-Story Integration Regression',     desc: 'Verifies that scenes compose correctly across stories.' },
    { slug: 'scene-6-third-party-framework-service',       num: 6, title: 'Third-Party Framework & Service',       desc: 'Validates external framework and service integrations.' },
  ];

  // Extra scene — auto-detected by project name
  var EXTRA = {
    YiPet: { slug: 'scene-6-cdn-component-lifecycle',  num: 7, title: 'CDN Component Lifecycle',   desc: 'Validates CDN-served component registration, caching, and teardown.' },
    YiPot: { slug: 'scene-6-ipc-window-lifecycle',     num: 7, title: 'IPC · Window Lifecycle',    desc: 'Verifies inter-process communication and window lifecycle hooks.' },
    YiWeb: { slug: 'scene-6-view-hook-lifecycle',      num: 7, title: 'View · Hook Lifecycle',     desc: 'Ensures view and hook lifecycle phases fire in the correct order.' },
  };
  var extra = EXTRA[projectName] || null;
  var allScenes = extra ? SCENES.concat(extra) : SCENES;

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') { e.className = attrs[k]; }
        else { e.setAttribute(k, attrs[k]); }
      });
    }
    if (children) {
      if (typeof children === 'string') { e.textContent = children; }
      else { children.forEach(function (c) { e.appendChild(c); }); }
    }
    return e;
  }

  var root = document.getElementById('scene-listing-root');
  if (!root) return;

  // Heading
  root.appendChild(el('h1', null, titleText.replace(' · ', ' \u00b7 ')));

  // Meta
  root.appendChild(el('p', { className: 'meta' },
    'Cross-project self-check automation suite · ' + allScenes.length + ' scenes' +
    (projectName ? ' · YiDoc/projects/' + projectName + '/test/' : '')));

  // Scene list
  var ul = el('ul');
  allScenes.forEach(function (s) {
    var link = el('a', { href: s.slug + '/index.md' }, s.num + '. ' + s.title);
    var desc = el('div', { className: 'desc' }, s.desc);
    ul.appendChild(el('li', null, [link, desc]));
  });
  root.appendChild(ul);
})();
