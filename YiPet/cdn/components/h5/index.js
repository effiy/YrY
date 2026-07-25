/**
 * YrY · H5 Components — barrel exports
 *
 * All h5/ components are vanilla JavaScript (non-Vue) modules used by
 * the H5 app shell. They follow a directory-per-component structure
 * with index.js as the entry point.
 */

// ── Imports for window registration ──────────────────────────────────────
import * as _BaseList             from './BaseList/index.js';
import * as _Chat                 from './Chat/index.js';
import * as _NewsList             from './NewsList/index.js';
import * as _PreviewMod           from './Preview/index.js';
import * as _SearchMod            from './Search/index.js';
import * as _SessionList          from './SessionList/index.js';
import * as _SwipeScrollController from './SwipeScrollController/index.js';
import * as _VirtualList          from './VirtualList/index.js';

// ── Re-exports (keep for module consumers) ──────────────────────────────
export { BaseList } from './BaseList/index.js';
export { Chat } from './Chat/index.js';
export { NewsList } from './NewsList/index.js';
export { default as Preview } from './Preview/index.js';
export { default as Search } from './Search/index.js';
export { SessionList } from './SessionList/index.js';
export { SwipeScrollController } from './SwipeScrollController/index.js';
export { VirtualList } from './VirtualList/index.js';

// ── Window registration ─────────────────────────────────────────────────
(function _registerH5ComponentsOnWindow() {
  const allExports = {
    ..._BaseList,
    ..._Chat,
    ..._NewsList,
    ..._PreviewMod,
    ..._SearchMod,
    ..._SessionList,
    ..._SwipeScrollController,
    ..._VirtualList
  };

  // Strip 'default' key (redundant since named re-exports cover it)
  if ('default' in allExports) delete allExports.default;

  // Register under window.YiPet.H5
  if (window.YiPet && typeof window.YiPet.register === 'function') {
    window.YiPet.register('H5', allExports);
  } else {
    window.YiPet = window.YiPet || {};
    window.YiPet.H5 = allExports;
  }

  // Expose on window directly (skip existing keys)
  Object.keys(allExports).forEach(function (key) {
    if (!(key in window)) {
      window[key] = allExports[key];
    }
  });
})();
