/**
 * rui HTML CDN — unified shared loader
 * ----------------------------------------------------------------------
 * Load this single script BEFORE any CDN component index.js. It provides:
 *
 *   1. createAsyncMountAPI({ apiNamespace })
 *      ── Creates a mount queue so components can mount before or after
 *         their template/data/CSS finishes loading. Returns an object
 *         with resolveMountQueue, rejectMountQueue, flushMountQueue,
 *         and setComponentOptions.
 *
 *   2. ruiLoadComponent({ componentDir, callerSrc, configKey, cssMarker,
 *         templateId, defaults, readyEvent, errorEvent }, onReady)
 *      ── Loads data.js, index.css, and HTML template from the component
 *         directory. Dispatches ready/error events. Calls onReady(cfg, ctx)
 *         with the resolved config and a context object providing
 *         fetchTemplate(), dispatchReady(), dispatchError().
 *
 *   3. ruiBootstrapFromCurrentScript(options, fallbackFn)
 *      ── Derives the component directory from document.currentScript.src,
 *         then delegates to ruiLoadComponent. Handles the common case of
 *         a component's index.js calling this synchronously in its IIFE.
 *
 *   4. Vue 3 CDN loader (auto-injected via primary + fallback URLs)
 *   5. ruiComponentHelpers (bootstrapComponent, waitForReady, constants)
 *   6. ruiBootstrapComponent — the unified component bootstrap entry point
 *
 * Console Guard compliance:
 *   - All fetch failures dispatch error events (never uncaught)
 *   - All promises have timeout guards
 *   - CSS injection is idempotent (checks element id)
 *   - Data is loaded as plain <script> (not module)
 * ---------------------------------------------------------------------- */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     2. Utilities: escapeRegExp, extractTemplateFromHTML
     ═══════════════════════════════════════════════════════════════════════════ */

  function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function extractTemplateFromHTML(html, id) {
    const escaped = escapeRegExp(id);
    const m = html.match(new RegExp('<template[^>]*id=["\']' + escaped + '["\'][^>]*>([\\s\\S]*?)<\\/template>', 'i'))
           || html.match(new RegExp('<script[^>]*type=["\']text/x-template["\'][^>]*id=["\']' + escaped + '["\'][^>]*>([\\s\\S]*?)<\\/script>', 'i'));
    return m ? m[1] : null;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     3. createAsyncMountAPI
     ═══════════════════════════════════════════════════════════════════════════ */

  window.createAsyncMountAPI = function (opts) {
    const ns = (opts && opts.apiNamespace) || 'rui';
    const _queue = [];
    let _options = null;
    let _settled = false;

    function resolveMountQueue() {
      _settled = true;
      while (_queue.length) {
        const entry = _queue.shift();
        try {
          entry.resolve(_options);
        } catch (e) {
          console.warn('[' + ns + '] mount queue resolve error:', e && e.message);
        }
      }
    }

    function rejectMountQueue(err) {
      _settled = true;
      while (_queue.length) {
        const entry = _queue.shift();
        try {
          entry.reject(err || new Error('[' + ns + '] mount failed'));
        } catch (e) {
          console.warn('[' + ns + '] mount queue reject error:', e && e.message);
        }
      }
    }

    function flushMountQueue() {
      if (_settled) return;
      if (_options) {
        resolveMountQueue();
      }
    }

    function setComponentOptions(opts) {
      _options = opts;
      // Expose the resolved Vue component options on window[ns] so that
      // host pages can read them after the *-ready event fires. This is
      // the contract rui-init/templates/index.js (and the rui-report-*
      // pages) rely on: they check `window.ruiBreadcrumb.name === 'ruiBreadcrumb'`
      // and then call `app.component('rui-breadcrumb', window.ruiBreadcrumb)`.
      // Without this mirror, the options sit inside the mountAPI closure
      // and are unreachable from the host page, so Vue renders the custom
      // tags as empty elements (e.g. 4 bare <rui-scene-card> in the DOM).
      if (opts) {
        if (!opts.name) opts.name = ns;
        window[ns] = opts;
      }
      flushMountQueue();
    }

    function enqueue(resolve, reject) {
      if (_settled) {
        if (_options) {
          resolve(_options);
        } else {
          reject(new Error('[' + ns + '] mount queue already rejected'));
        }
      } else {
        _queue.push({ resolve: resolve, reject: reject });
      }
    }

    return {
      resolveMountQueue: resolveMountQueue,
      rejectMountQueue: rejectMountQueue,
      flushMountQueue: flushMountQueue,
      setComponentOptions: setComponentOptions,
      enqueue: enqueue
    };
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     4. ruiLoadComponent
     ═══════════════════════════════════════════════════════════════════════════ */

  window.ruiLoadComponent = function (opts, onReady) {
    const dir    = (opts && opts.componentDir) || '';
    const dKey   = (opts && opts.configKey)  || '';
    const marker = (opts && opts.cssMarker)  || '';
    const tplId  = (opts && opts.templateId) || '';
    const defs   = (opts && opts.defaults)   || {};
    const ready  = (opts && opts.readyEvent)  || 'rui-component-ready';
    const error  = (opts && opts.errorEvent)  || 'rui-component-error';
    const ns     = (opts && opts.componentDir) ? opts.componentDir.replace(/^.*\//, '') : 'rui-component';
    const loadTimeout = (opts && opts.loadTimeoutMs) || 7000;

    if (!dir) {
      const err = new Error('[' + ns + '] componentDir is required');
      console.error(err);
      document.dispatchEvent(new CustomEvent(error, { detail: { error: err } }));
      return;
    }

    // Idempotent CSS injection
    if (marker && !document.getElementById(marker)) {
      const cssPath = dir.replace(/\/?$/, '/') + 'index.css';
      const link = document.createElement('link');
      link.id = marker;
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.onerror = function () {
        console.warn('[' + ns + '] CSS failed to load: ' + cssPath);
      };
      document.head.appendChild(link);
    }

    // Load data.js as plain <script>
    function loadData() {
      return new Promise(function (resolve, reject) {
        const dataPath = dir.replace(/\/?$/, '/') + 'data.js';
        const key = dKey;
        const existed = window[key];

        const s = document.createElement('script');
        s.src = dataPath;
        s.async = false;
        s.onload = function () {
          if (window[key] !== undefined) {
            resolve(window[key]);
          } else if (existed !== undefined) {
            resolve(existed);
          } else {
            reject(new Error('[' + ns + '] data.js loaded but ' + key + ' not found on window'));
          }
        };
        s.onerror = function () {
          reject(new Error('[' + ns + '] failed to load ' + dataPath));
        };
        document.head.appendChild(s);
      });
    }

    // Fetch template text
    function loadTemplate() {
      return new Promise(function (resolve, reject) {
        const existing = document.querySelector('script[type="text/x-template"]#' + tplId);
        if (existing) {
          resolve(existing.textContent);
          return;
        }

        const htmlPath = dir.replace(/\/?$/, '/') + 'index.html';
        const xhr = new XMLHttpRequest();
        xhr.open('GET', htmlPath, true);
        xhr.timeout = loadTimeout;
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 400) {
            const template = extractTemplateFromHTML(xhr.responseText, tplId);
            if (template) {
              resolve(template);
            } else {
              reject(new Error('[' + ns + '] template id "' + tplId + '" not found in ' + htmlPath));
            }
          } else {
            reject(new Error('[' + ns + '] failed to load ' + htmlPath + ' (status ' + xhr.status + ')'));
          }
        };
        xhr.onerror = function () {
          reject(new Error('[' + ns + '] network error loading ' + htmlPath));
        };
        xhr.ontimeout = function () {
          reject(new Error('[' + ns + '] timeout loading ' + htmlPath + ' after ' + loadTimeout + 'ms'));
        };
        xhr.send();
      });
    }

    // Build context for onReady
    const ctx = {
      fetchTemplate: function (id, timeoutMs) {
        return new Promise(function (resolve, reject) {
          let el = document.querySelector('script[type="text/x-template"]#' + id);
          if (!el) {
            el = document.querySelector('template#' + id);
          }
          if (el) {
            resolve(el.textContent || el.innerHTML);
            return;
          }
          const htmlPath = dir.replace(/\/?$/, '/') + 'index.html';
          const tm = timeoutMs || loadTimeout;
          const xhr = new XMLHttpRequest();
          xhr.open('GET', htmlPath, true);
          xhr.timeout = tm;
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
              const template = extractTemplateFromHTML(xhr.responseText, id);
              if (template) {
                resolve(template);
              } else {
                reject(new Error('[' + ns + '] template "' + id + '" not found'));
              }
            } else {
              reject(new Error('[' + ns + '] failed to load template (status ' + xhr.status + ')'));
            }
          };
          xhr.onerror = function () {
            reject(new Error('[' + ns + '] network error fetching template'));
          };
          xhr.ontimeout = function () {
            reject(new Error('[' + ns + '] template fetch timed out'));
          };
          xhr.send();
        });
      },
      dispatchReady: function () {
        document.dispatchEvent(new CustomEvent(ready, { detail: { componentName: ns } }));
      },
      dispatchError: function (err) {
        document.dispatchEvent(new CustomEvent(error, { detail: { error: err, componentName: ns } }));
      }
    };

    // Load data first, then template, then notify
    let mergedConfig = {};
    loadData()
      .then(function (data) {
        mergedConfig = Object.assign({}, defs, data || {});
        return loadTemplate();
      })
      .then(function (template) {
        mergedConfig._template = template;
        if (typeof onReady === 'function') {
          onReady(mergedConfig, ctx);
        }
        // DO NOT call ctx.dispatchReady() here.
        // Each component owns the ready dispatch:
        //   · createStandardOnReady / wrapOnReady dispatch synchronously
        //     after mountAPI.setComponentOptions(opts), so window[ns] is
        //     already set when listeners run.
        //   · Self-mount components (rui-back-top, rui-toast) dispatch
        //     from inside their own _mountApp() right after the Vue app
        //     finishes mounting.
        // A previous version of this code also dispatched here, but
        // createStandardOnReady is async (setComponentOptions runs in
        // the fetchTemplate().then microtask), so an extra dispatch on
        // this synchronous line fires *-ready BEFORE* window[ns] is
        // populated. Host pages such as rui-init/templates/index.js
        // then read window.ruiBreadcrumb inside their *-ready listener
        // and find it still undefined, so app.component(...) is never
        // called and Vue renders the custom tags as empty elements.
      })
      .catch(function (err) {
        console.error('[' + ns + ']', err && err.message || err);
        ctx.dispatchError(err);
      });
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     5. ruiBootstrapFromCurrentScript
     ═══════════════════════════════════════════════════════════════════════════ */

  window.ruiBootstrapFromCurrentScript = function (opts, fallbackFn) {
    const src    = (opts && opts.callerSrc) || '';
    const cKey   = (opts && opts.configKey)  || '';
    const marker = (opts && opts.cssMarker)  || '';
    const ready  = (opts && opts.readyEvent)  || 'rui-component-ready';
    const error  = (opts && opts.errorEvent)  || 'rui-component-error';
    const dConf  = (opts && opts.defaultConfig) || {};
    const name   = (opts && opts.componentName) || 'rui-component';

    if (!src) {
      if (typeof fallbackFn === 'function') {
        fallbackFn();
      }
      console.error('[' + name + '] cannot determine component directory — no callerSrc');
      return;
    }

    const dir = src.replace(/\/index\.js(\?.*)?$/, '/');

    window.ruiLoadComponent({
      componentDir: dir,
      configKey:    cKey,
      cssMarker:    marker,
      templateId:   (dConf && dConf.templateId) || '',
      defaults:     dConf,
      readyEvent:   ready,
      errorEvent:   error,
      loadTimeoutMs: (dConf && dConf.loadTimeoutMs) || 7000
    }, function (cfg, ctx) {
      if (typeof opts.onReady === 'function') {
        opts.onReady(cfg, ctx);
      }
    });
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     6. Vue 3 CDN loader
     ═══════════════════════════════════════════════════════════════════════════ */

  const currentScript = document.currentScript;
  const ns = currentScript && currentScript.dataset.namespace || 'app';
  window.__vueLoadPromise = new Promise(function (resolve) {
    window.__vueLoadResolve = resolve;
  });
  let PRIMARY = currentScript && currentScript.dataset.vuePath || '';
  let FALLBACK = currentScript && currentScript.dataset.vueFallback || '';
  // If neither PRIMARY nor FALLBACK are explicitly set, auto-derive both.
  // When PRIMARY is set but FALLBACK is not, FALLBACK mirrors PRIMARY
  // (single-CDN mode). When both are set, dual-CDN mode is active.
  if (!PRIMARY && !FALLBACK) {
    const scriptSrc = currentScript ? currentScript.src : '';
    const base = scriptSrc.replace(/\/shared\/loader\.js(\?.*)?$/, '');
    PRIMARY = base + '/shared/vendor/vue@3.4.27/vue.global.prod.js';
    FALLBACK = base + '/shared/vendor/vue@3/vue.global.prod.js';
  } else if (!FALLBACK) {
    FALLBACK = PRIMARY;
  }

  function injectVue(url) {
    const s = document.createElement('script');
    s.src = url;
    s.async = false;
    s.onload = function () { window.__vueLoadResolve(); };
    s.onerror = function () {
      if (url === PRIMARY && url !== FALLBACK) {
        console.warn('[' + ns + '] primary Vue CDN failed, trying fallback');
        injectVue(FALLBACK);
      } else if (url === PRIMARY) {
        console.warn('[' + ns + '] Vue CDN failed, no fallback configured');
      } else {
        console.error('[' + ns + '] both Vue CDNs unreachable — page will not mount');
      }
    };
    document.head.appendChild(s);
  }
  injectVue(PRIMARY);

  /* ═══════════════════════════════════════════════════════════════════════════
     6b. Optional Mermaid injector
     ─────────────────────────────────────────────────────────────────────────
     Pages that need Mermaid (e.g. rui-report-test) opt in by setting
     `data-mermaid-path` (and optionally `data-mermaid-fallback`) on the
     <script src="loader.js"> tag. If `data-mermaid-path` is absent the
     loader does nothing — pages that don't need Mermaid are unaffected.

     Path resolution:
       1. `data-mermaid-path` (if set) wins outright.
       2. Otherwise auto-derive as <loader-base>/shared/vendor/mermaid.min.js,
          which is the canonical local copy in this repo.

     Loading: identical primary/fallback pattern as Vue. A window.mermaid
     load promise (window.__mermaidLoadPromise) is exposed so host pages
     can await readiness, but they may also simply poll for
     `typeof window.mermaid === 'object'`.
     ═══════════════════════════════════════════════════════════════════════════ */

  let MERMAID_PRIMARY = currentScript && currentScript.dataset.mermaidPath || '';
  let MERMAID_FALLBACK = currentScript && currentScript.dataset.mermaidFallback || '';
  if (MERMAID_PRIMARY || MERMAID_FALLBACK) {
    if (!MERMAID_FALLBACK) MERMAID_FALLBACK = MERMAID_PRIMARY;
    window.__mermaidLoadPromise = new Promise(function (resolve) {
      window.__mermaidLoadResolve = resolve;
    });
    (function injectMermaid(url, isRetry) {
      var s = document.createElement('script');
      s.src = url;
      s.async = false;
      s.onload = function () {
        if (window.__mermaidLoadResolve) window.__mermaidLoadResolve();
      };
      s.onerror = function () {
        if (!isRetry && MERMAID_FALLBACK && MERMAID_FALLBACK !== MERMAID_PRIMARY) {
          console.warn('[' + ns + '] primary Mermaid failed, trying fallback');
          injectMermaid(MERMAID_FALLBACK, true);
        } else {
          console.error('[' + ns + '] Mermaid failed to load from: ' + url +
            ' — diagrams will fall back to raw source text.');
        }
      };
      document.head.appendChild(s);
    })(MERMAID_PRIMARY, false);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     7. rui Component Helpers + ruiBootstrapComponent
     ═══════════════════════════════════════════════════════════════════════════ */

  const MS_PER_MINUTE = 60000;
  const MS_PER_HOUR   = 3600000;
  const MS_PER_DAY    = 86400000;
  const DEFAULT_LOAD_TIMEOUT_MS = 5000;

  function createFailHandler(componentName, mountAPI) {
    return function _fail(ctx, err) {
      console.error('[' + componentName + ']', err);
      if (ctx && typeof ctx.dispatchError === 'function') ctx.dispatchError(err);
      if (mountAPI) mountAPI.rejectMountQueue(err);
    };
  }

  function createStandardOnReady(componentName, mountAPI, buildOptions) {
    const fail = createFailHandler(componentName, mountAPI);
    return function _onReady(cfg, ctx) {
      ctx.fetchTemplate(cfg.templateId, cfg.loadTimeoutMs)
        .then(function (tpl) {
          mountAPI.setComponentOptions(buildOptions(cfg, tpl));
          ctx.dispatchReady();
          mountAPI.flushMountQueue();
        })
        .catch(function (err) { fail(ctx, err); });
    };
  }

  function wrapOnReady(onReady, mountAPI) {
    return function (cfg, ctx) {
      return onReady(cfg, ctx, mountAPI);
    };
  }

  function ruiBootstrapComponent(options) {
    const componentName = options.componentName;
    const mountAPI = window.createAsyncMountAPI({ apiNamespace: componentName });
    const fail = createFailHandler(componentName, mountAPI);
    let onReady = options.onReady;

    if (!onReady && options.buildOptions) {
      onReady = createStandardOnReady(componentName, mountAPI, options.buildOptions);
    } else if (onReady) {
      onReady = wrapOnReady(onReady, mountAPI);
    }

    const defaultConfig = options.defaultConfig || {};
    if (defaultConfig.loadTimeoutMs === undefined) {
      defaultConfig.loadTimeoutMs = DEFAULT_LOAD_TIMEOUT_MS;
    }

    window.ruiBootstrapFromCurrentScript({
      configKey:     options.configKey,
      cssMarker:     options.cssMarker,
      readyEvent:    options.readyEvent,
      errorEvent:    options.errorEvent,
      componentName: componentName,
      callerSrc:     options.callerSrc || '',
      defaultConfig: defaultConfig,
      onReady:       onReady
    }, function () {
      fail(null, new Error('loader.js not loaded'));
    });
  }

  function waitForReady(globalName, readyEvent, errorEvent, timeoutMs, checkFn) {
    checkFn = checkFn || function () { return window[globalName] && window[globalName].name === globalName; };
    return new Promise(function (resolve, reject) {
      if (checkFn()) { resolve(); return; }
      let settled = false;
      function done(fn, arg) {
        return function () {
          if (settled) return;
          settled = true;
          fn(arg);
        };
      }
      document.addEventListener(readyEvent, done(resolve), { once: true });
      document.addEventListener(errorEvent, done(reject), { once: true });
      setTimeout(function () {
        done(reject, new Error(globalName + ' load timed out'));
      }, timeoutMs);
    });
  }

  window.ruiComponentHelpers = {
    createFailHandler:    createFailHandler,
    createStandardOnReady: createStandardOnReady,
    bootstrapComponent:   ruiBootstrapComponent,
    waitForReady:         waitForReady,
    MS_PER_MINUTE: MS_PER_MINUTE,
    MS_PER_HOUR:   MS_PER_HOUR,
    MS_PER_DAY:    MS_PER_DAY,
    DEFAULT_LOAD_TIMEOUT_MS: DEFAULT_LOAD_TIMEOUT_MS
  };

  window.ruiBootstrapComponent = ruiBootstrapComponent;
})();
