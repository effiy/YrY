/**
 * rui HTML CDN — unified shared loader (YiPet edition)
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
 *   Resource layout (YiPet):
 *     cdn/loader.js          — this file
 *     cdn/components/yry-back-top/  — shared Vue components (data.js, index.css, index.html, index.js)
 *     cdn/diagram/           — SVG diagram engine
 *     cdn/fonts/             — self-hosted font files
 *     libs/                  — vendor libraries (vue.global.js, mermaid.min.js, etc.)
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
    const ready  = (opts && opts.readyEvent)  || 'yry-component-ready';
    const error  = (opts && opts.errorEvent)  || 'yry-component-error';
    const ns     = (opts && opts.componentDir) ? opts.componentDir.replace(/^.*\//, '') : 'yry-component';
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
    const ready  = (opts && opts.readyEvent)  || 'yry-component-ready';
    const error  = (opts && opts.errorEvent)  || 'yry-component-error';
    const dConf  = (opts && opts.defaultConfig) || {};
    const name   = (opts && opts.componentName) || 'yry-component';

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
     6. Vue 3 CDN loader (YiPet: auto-derives from libs/)
     ═══════════════════════════════════════════════════════════════════════════ */

  const currentScript = document.currentScript;
  const ns = currentScript && currentScript.dataset.namespace || 'app';
  window.__vueLoadPromise = new Promise(function (resolve) {
    window.__vueLoadResolve = resolve;
  });
  let PRIMARY = currentScript && currentScript.dataset.vuePath || '';
  let FALLBACK = currentScript && currentScript.dataset.vueFallback || '';
  // If neither PRIMARY nor FALLBACK are explicitly set, auto-derive both
  // from the loader.js location: cdn/loader.js → libs/vue.global.js.
  // Pages can override via data-vue-path / data-vue-fallback attributes.
  if (!PRIMARY && !FALLBACK) {
    const scriptSrc = currentScript ? currentScript.src : '';
    // Strip loader.js filename to get the directory (e.g. .../cdn)
    const loaderDir = scriptSrc.replace(/\/loader\.js(\?.*)?$/, '');
    // Derive libs/ as sibling of the directory containing loader.js
    const libsDir = loaderDir.replace(/\/cdn\/?$/, '') + '/libs';
    PRIMARY   = libsDir + '/vue.global.js';
    FALLBACK  = libsDir + '/vue.global.js';
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
     Pages that need Mermaid opt in by setting `data-mermaid-path` (and
     optionally `data-mermaid-fallback`) on the <script src="loader.js"> tag.
     If `data-mermaid-path` is absent the loader does nothing — pages that
     don't need Mermaid are unaffected.

     Path resolution:
       1. `data-mermaid-path` (if set) wins outright.
       2. Otherwise auto-derive as <libsDir>/mermaid.min.js (YiPet/libs/).

     Loading: identical primary/fallback pattern as Vue. A window.mermaid
     load promise (window.__mermaidLoadPromise) is exposed so host pages
     can await readiness.
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

  /* ═══════════════════════════════════════════════════════════════════════════
     8. API & Config Bootstrap (YiPet)
     ─────────────────────────────────────────────────────────────────────────
     当 <script src="loader.js" data-bootstrap="api"> 时，自动加载完整的
     API 运行时依赖链，使 __YiPet_API__ 可立即使用。

     依赖加载顺序：
       cdn/utils/http/request.js  → RequestClient
       cdn/utils/http/logger.js   → Logger
       cdn/utils/http/token.js    → TokenManager
       cdn/utils/http/error.js    → ApiErrorHandler
       cdn/utils/http/index.js    → 降级兜底
       cdn/utils/core/configLoader.js  → __YiPet_Config__
       cdn/utils/core/serviceRegistry.js → __YiPet_Services__
       cdn/utils/core/apiManager.js → ApiManager
       src/api/faq.service.js      → FaqService
       src/api/session.service.js  → SessionService
       src/api/index.js            → __YiPet_API__ (统一门面)

     使用方式：
       <script src="/cdn/loader.js" data-bootstrap="api"></script>
       <script>
         window.__YiPet_API__.ready().then(function(api) {
           api.faq.getFaqs().then(console.log)
         })
       </script>
     ═══════════════════════════════════════════════════════════════════════════ */

  (function bootstrapYiPetAPI() {
    var cs = document.currentScript
    var bootstrap = cs && (cs.dataset.bootstrap || '')
    if (bootstrap !== 'api') return

    // 从 loader.js 位置推导 cdn/ 根目录
    var loaderSrc = cs ? cs.src : ''
    var cdnRoot = loaderSrc.replace(/\/loader\.js(\?.*)?$/, '')
    var srcRoot = cdnRoot.replace(/\/cdn\/?$/, '') + '/src'

    // 依赖加载顺序（严格有序）
    var deps = [
      // HTTP 运行时
      cdnRoot + '/utils/http/request.js',
      cdnRoot + '/utils/http/logger.js',
      cdnRoot + '/utils/http/token.js',
      cdnRoot + '/utils/http/error.js',
      cdnRoot + '/utils/http/index.js',
      // 配置 & 服务注册
      cdnRoot + '/utils/core/configLoader.js',
      cdnRoot + '/utils/core/serviceRegistry.js',
      cdnRoot + '/utils/core/apiManager.js',
      // 业务 Service
      srcRoot + '/api/faq.service.js',
      srcRoot + '/api/session.service.js',
      // 统一 API 入口
      srcRoot + '/api/index.js'
    ]

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var s = document.createElement('script')
        s.src = src
        s.async = false
        s.onload = function () { resolve() }
        s.onerror = function () {
          console.warn('[YiPet:Bootstrap] 脚本加载失败: ' + src)
          resolve() // 不阻塞后续加载
        }
        document.head.appendChild(s)
      })
    }

    // 串行加载所有依赖
    console.log('[YiPet:Bootstrap] 开始加载 API 运行时 (' + deps.length + ' 个模块) ...')
    var chain = Promise.resolve()
    deps.forEach(function (url) {
      chain = chain.then(function () { return loadScript(url) })
    })
    chain.then(function () {
      console.log('[YiPet:Bootstrap] API 运行时加载完成，__YiPet_API__ 已就绪')
    }).catch(function (err) {
      console.error('[YiPet:Bootstrap] 加载失败:', err && err.message || err)
    })
  })();
})();
