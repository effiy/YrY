/**
 * YrY CDN · Top-level entry point
 * ----------------------------------------------------------------------
 * Load this module to register ALL CDN components and utilities on window.
 *
 * Usage:
 *   <script type="module" src="/cdn/index.js"></script>
 *
 * After loading:
 *   - window.YiPet.Utils    — all utility functions
 *   - window.YiPet.Core     — core system utilities
 *   - window.YiPet.H5       — H5 vanilla JS components
 *   - window.YiPet.Engines  — markdown/mermaid/diagram engines
 *
 * Individual utility functions are also exposed directly on window
 * (e.g. window.debounce, window.formatDate, window.createElement, etc.)
 * provided the key doesn't already exist.
 *
 * Individual Vue components register themselves on window via their
 * own index.js files when loaded (e.g. window.yryToast, window.yryButton).
 * ---------------------------------------------------------------------- */

// ── Utilities (self-register on window when loaded) ────────────────────
import '/cdn/utils/index.js';

// ── H5 Components (self-register on window when loaded) ────────────────
import '/cdn/components/h5/index.js';

// ── Engines ────────────────────────────────────────────────────────────
import * as _MarkdownEngine from '/cdn/engines/markdown/index.js';
import * as _MermaidEngine  from '/cdn/engines/mermaid/index.js';

// Register engines on window.YiPet.Engines
(function _registerEngines() {
  const engines = {
    MarkdownRendering: _MarkdownEngine,
    MermaidRendering:  _MermaidEngine,
    // Diagram engine is loaded separately as a non-module script
    // (it uses window.yryDepsDiagram pattern)
  };

  window.YiPet = window.YiPet || {};
  window.YiPet.Engines = { ...(window.YiPet.Engines || {}), ...engines };

  // Expose key engine APIs directly on window
  Object.keys(engines).forEach(function (ns) {
    var mod = engines[ns];
    if (mod && typeof mod === 'object') {
      Object.keys(mod).forEach(function (key) {
        if (!(key in window)) {
          window[key] = mod[key];
        }
      });
    }
  });
})();

// ── Export for module consumers ────────────────────────────────────────
export { default as Utils } from '/cdn/utils/index.js';
export { default as H5Components } from '/cdn/components/h5/index.js';
export { _MarkdownEngine as MarkdownEngine };
export { _MermaidEngine as MermaidEngine };
