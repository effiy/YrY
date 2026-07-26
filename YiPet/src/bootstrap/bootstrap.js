/**
 * YiPet Bootstrap — CDN Resource Loader
 *
 * Architecture (Chrome MV3):
 *   1. Chrome loads this file as a content script (isolated world).
 *   2. The content script resolves `chrome.runtime.getURL('cdn/')` and
 *      injects a <script> tag loading THIS SAME FILE into the page DOM.
 *   3. The second execution runs in the MAIN world, where `window.YiPet`
 *      is visible from the DevTools console ("top" context).
 *   4. If the page CSP blocks the injection, a minimal bridge is set in
 *      the isolated world instead (switch DevTools context to access).
 *
 * Usage (from DevTools console):
 *   YiPet.help()                  // Print usage guide
 *   YiPet.list()                  // List all available resources
 *   YiPet.list('vue')             // Filter by keyword
 *   await YiPet.load('vendor/vue@3.5.13/vue.global.prod.js')
 *   await YiPet.vue()             // Shorthand — same as above
 *   YiPet.css('vendor/animate.css@3.5.1/animate.min.css')
 *   YiPet.cdn('vendor/jquery@3.7.1/jquery.min.js')  // Get full URL
 *
 * @module bootstrap/bootstrap
 * @since 1.2.0
 */

;(function (root) {
  'use strict'

  /* ═══════════════════════════════════════════════════════════════════════════
     Context Detection
     ═══════════════════════════════════════════════════════════════════════════ */

  // Only content scripts have chrome.runtime.getURL
  var _isContentScript = false
  try {
    _isContentScript = !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
  } catch (_) {}

  // When injected into MAIN world, the <script> tag carries data-base
  var _cs = typeof document !== 'undefined' ? document.currentScript : null
  var _injectedBase = (_cs && _cs.dataset && _cs.dataset.base) || ''

  /* ═══════════════════════════════════════════════════════════════════════════
     Phase 1: Content Script — inject self into MAIN world
     ═══════════════════════════════════════════════════════════════════════════ */

  if (_isContentScript && !_injectedBase) {
    ;(function injectIntoMainWorld() {
      var extBase = chrome.runtime.getURL('cdn/')
      var selfUrl = chrome.runtime.getURL('src/bootstrap/bootstrap.js')

      var el = document.createElement('script')
      el.src = selfUrl
      el.dataset.base = extBase
      el.id = 'yipet-bootstrap'

      // Try injecting; some pages have strict CSP that blocks extension scripts
      el.onerror = function () {
        console.warn(
          '%c[YiPet]%c CSP blocked MAIN world injection. ' +
          'Switch DevTools console to the extension context (%c' +
          chrome.runtime.id + '%c) to use YiPet.',
          'color:#6366f1;font-weight:bold', 'color:inherit',
          'color:#f59e0b', 'color:inherit'
        )
        // Fallback: set YiPet in isolated world (accessible via context switcher)
        createYiPet(root, extBase)
      }

      ;(document.head || document.documentElement).appendChild(el)
    })()
    return  // Content script done — MAIN world execution will follow
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     Phase 2: MAIN world — initialize YiPet API
     ═══════════════════════════════════════════════════════════════════════════ */

  var BASE = _injectedBase || 'cdn/'  // fallback for CSP-blocked pages or direct use
  createYiPet(root, BASE)

  /* ═══════════════════════════════════════════════════════════════════════════
     Implementation
     ═══════════════════════════════════════════════════════════════════════════ */

  function createYiPet(root, BASE) {
    var _loaded = {}   // { path: true }

    /* ── Helpers ─────────────────────────────────────────────────────────── */

    function _resolve(path) { return BASE + path }

    function _log(label, msg, style) {
      var s = style || 'color:#6366f1;font-weight:bold'
      console.log('%c[YiPet]%c ' + label + '%c ' + msg, s, 'color:inherit', 'color:#888')
    }
    function _ok(msg)   { _log('✓', msg, 'color:#22c55e;font-weight:bold') }
    function _skip(msg) { _log('⊘', msg, 'color:#f59e0b;font-weight:bold') }
    function _err(msg)  { _log('✗', msg, 'color:#ef4444;font-weight:bold') }

    /* ── Catalog ─────────────────────────────────────────────────────────── */

    var CATALOG = [
      // Frameworks & Core
      { key:'vue',       path:'vendor/vue@3.5.13/vue.global.prod.js',       type:'js',  global:'Vue',        desc:'Vue 3.5.13' },
      { key:'react',     path:'vendor/react@15.6.1/react.min.js',           type:'js',  global:'React',      desc:'React 15.6.1' },
      { key:'react-dom', path:'vendor/react@15.6.1/react-dom.min.js',       type:'js',  global:'ReactDOM',   desc:'ReactDOM 15.6.1' },
      { key:'jquery',    path:'vendor/jquery@3.7.1/jquery.min.js',          type:'js',  global:'jQuery',     desc:'jQuery 3.7.1' },
      { key:'popper',    path:'vendor/popper.js/popper.min.js',             type:'js',  global:'Popper',     desc:'Popper.js' },
      // UI Frameworks
      { key:'bootstrap', path:'vendor/bootstrap@5.2.3/js/bootstrap.bundle.min.js', type:'js',  global:'bootstrap',  desc:'Bootstrap 5.2.3 JS' },
      { key:'bootstrap-css', path:'vendor/bootstrap@5.2.3/css/bootstrap.min.css',  type:'css', desc:'Bootstrap 5.2.3 CSS' },
      { key:'swiper',    path:'vendor/swiper@7.0.3/js/swiper-bundle.min.js',  type:'js',  global:'Swiper', desc:'Swiper 7.0.3' },
      { key:'swiper-css', path:'vendor/swiper@7.0.3/css/swiper-bundle.min.css', type:'css', desc:'Swiper 7.0.3 CSS' },
      // Animation
      { key:'gsap',      path:'vendor/gsap/TweenMax.min.js',                type:'js',  global:'TweenMax',   desc:'GSAP TweenMax' },
      { key:'anime',     path:'vendor/anime@3.0.0/anime.min.js',            type:'js',  global:'anime',      desc:'Anime.js 3.0' },
      { key:'aos',       path:'vendor/aos/js/aos.js',                       type:'js',  global:'AOS',        desc:'AOS scroll animation' },
      { key:'aos-css',   path:'vendor/aos/css/aos.css',                     type:'css', desc:'AOS CSS' },
      { key:'wow',       path:'vendor/wow@1.1.3/wow.min.js',                type:'js',  global:'WOW',        desc:'WOW.js 1.1.3' },
      { key:'animate-css', path:'vendor/animate.css@3.5.1/animate.min.css', type:'css', desc:'Animate.css 3.5.1' },
      { key:'typed',     path:'vendor/typed.js@2.0.11/typed.min.js',        type:'js',  global:'Typed',      desc:'Typed.js 2.0.11' },
      { key:'typing',    path:'vendor/typing/typing.min.js',                 type:'js',  global:'Typing',     desc:'Typing.js' },
      // Date & Time
      { key:'dayjs',     path:'vendor/dayjs@1.11.21/dayjs.min.js',          type:'js',  global:'dayjs',      desc:'Day.js 1.11.21' },
      { key:'dayjs-zh',  path:'vendor/dayjs@1.11.21/locale/zh-cn.js',      type:'js',  desc:'Day.js Chinese locale pack' },
      { key:'dayjs-utc', path:'vendor/dayjs@1.11.21/plugin/utc.js',         type:'js',  desc:'Day.js UTC plugin' },
      { key:'dayjs-rel', path:'vendor/dayjs@1.11.21/plugin/relativeTime.js',type:'js',  desc:'Day.js RelativeTime' },
      { key:'dayjs-dur', path:'vendor/dayjs@1.11.21/plugin/duration.js',    type:'js',  desc:'Day.js Duration' },
      { key:'dayjs-adv', path:'vendor/dayjs@1.11.21/plugin/advancedFormat.js',type:'js', desc:'Day.js AdvancedFormat' },
      { key:'dayjs-cpf', path:'vendor/dayjs@1.11.21/plugin/customParseFormat.js',type:'js', desc:'Day.js CustomParseFormat' },
      { key:'countdown', path:'vendor/countdown/countdown.min.js',          type:'js',  desc:'Countdown.js' },
      // Charts
      { key:'apexcharts', path:'vendor/apexcharts@3.46.0/apexcharts.min.js', type:'js', global:'ApexCharts',  desc:'ApexCharts 3.46.0' },
      { key:'mermaid',   path:'vendor/mermaid.min.js',                       type:'js',  global:'mermaid',    desc:'Mermaid diagram' },
      { key:'progressbar', path:'vendor/progressbar@1.1.0/progressbar.min.js', type:'js', global:'ProgressBar', desc:'ProgressBar.js 1.1.0' },
      // Export / Document
      { key:'html2canvas', path:'vendor/html2canvas@1.4.1/html2canvas.min.js', type:'js', global:'html2canvas', desc:'html2canvas 1.4.1' },
      { key:'jspdf',     path:'vendor/jspdf@2.5.2/jspdf.umd.min.js',         type:'js',  global:'jspdf',      desc:'jsPDF 2.5.2' },
      { key:'xlsx',      path:'vendor/xlsx@0.20.3/xlsx.full.min.js',         type:'js',  global:'XLSX',       desc:'SheetJS 0.20.3' },
      { key:'turndown',  path:'vendor/turndown.js',                          type:'js',  global:'TurndownService', desc:'Turndown HTML→MD' },
      { key:'marked',    path:'vendor/marked.min.js',                        type:'js',  global:'marked',     desc:'Marked MD→HTML' },
      // Icons & Fonts
      { key:'feather',   path:'vendor/feather-icons/feather.min.js',         type:'js',  global:'feather',    desc:'Feather Icons' },
      { key:'fa-css',    path:'vendor/font-awesome@4.7.0/css/font-awesome.min.css', type:'css', desc:'Font Awesome 4.7.0' },
      { key:'mdi-css',   path:'vendor/materialdesignicons/css/materialdesignicons.min.css', type:'css', desc:'Material Design Icons' },
      { key:'flaticon',  path:'vendor/flaticon/css/flaticon.css',            type:'css', desc:'Flaticon CSS' },
      // Carousels
      { key:'owl-carousel', path:'vendor/owl-carousel@2.2.1/js/owl.carousel.min.js', type:'js', desc:'Owl Carousel 2.2.1' },
      { key:'owl-css',   path:'vendor/owl-carousel@2.2.1/css/owl.carousel.min.css', type:'css', desc:'Owl Carousel CSS' },
      { key:'slick',     path:'vendor/slick-carousel@1.8.1/js/slick.min.js',  type:'js',  desc:'Slick Carousel 1.8.1' },
      { key:'slick-css', path:'vendor/slick@1.6.0/css/slick.css',            type:'css', desc:'Slick CSS' },
      // Lightbox & Modal
      { key:'fancybox',  path:'vendor/fancybox@3.5.7/js/fancybox.min.js',    type:'js',  desc:'Fancybox 3.5.7' },
      { key:'fancybox-css', path:'vendor/fancybox@3.5.7/css/fancybox.min.css', type:'css', desc:'Fancybox CSS' },
      { key:'venobox',   path:'vendor/venobox@1.7.3/js/venobox.min.js',      type:'js',  desc:'Venobox 1.7.3' },
      { key:'venobox-css', path:'vendor/venobox@1.7.3/css/venobox.css',      type:'css', desc:'Venobox CSS' },
      { key:'magnific',  path:'vendor/magnific-popup@1.1.0/jquery.magnific-popup.min.js', type:'js', desc:'Magnific Popup (needs jQuery)' },
      // Layout & Scroll
      { key:'isotope',   path:'vendor/isotope@3.0.6/isotope.min.js',         type:'js',  desc:'Isotope 3.0.6 (needs jQuery)' },
      { key:'simplebar', path:'vendor/simplebar@5.1.0/simplebar.min.js',     type:'js',  desc:'SimpleBar 5.1.0' },
      { key:'simplebar-css', path:'vendor/simplebar@5.1.0/simplebar.min.css', type:'css', desc:'SimpleBar CSS' },
      { key:'smooth-scroll', path:'vendor/smooth-scrollbar/smooth-scrollbar.min.js', type:'js', desc:'Smooth Scrollbar' },
      { key:'overscroll', path:'vendor/overscroll/overscroll.min.js',        type:'js',  desc:'Overscroll' },
      { key:'perfect-scroll', path:'vendor/perfect-scrollbar@1.5.0/perfect-scrollbar.min.js', type:'js', desc:'Perfect Scrollbar 1.5.0' },
      // jQuery Plugins
      { key:'waypoints', path:'vendor/waypoints@4.0.0/waypoints.min.js',     type:'js',  desc:'Waypoints 4.0.0 (needs jQuery)' },
      { key:'counterup', path:'vendor/counterup/counterup.min.js',           type:'js',  desc:'Counter-Up (needs jQuery)' },
      { key:'sticky',    path:'vendor/sticky@1.0.4/jquery.sticky.min.js',    type:'js',  desc:'Sticky Kit 1.0.4 (needs jQuery)' },
      { key:'scrollup',  path:'vendor/scrollup@2.4.1/jquery.scrollUp.min.js',type:'js',  desc:'ScrollUp 2.4.1 (needs jQuery)' },
      { key:'theia',     path:'vendor/theia-sticky-sidebar@1.7.0/jquery.theia.sticky.min.js', type:'js', desc:'Theia Sticky Sidebar (needs jQuery)' },
      { key:'slicknav-css', path:'vendor/slicknav@1.0.10/css/slicknav.css',  type:'css', desc:'SlickNav CSS' },
      // Utilities
      { key:'md5',       path:'vendor/md5.js',                                type:'js',  desc:'MD5 hash' },
      { key:'modernizr', path:'vendor/modernizr@3.6.0/modernizr.min.js',      type:'js',  global:'Modernizr', desc:'Modernizr 3.6.0' },
      { key:'leaflet',   path:'vendor/leaflet@1.1.1/leaflet.js',              type:'js',  desc:'Leaflet 1.1.1 map' },
      { key:'swup',      path:'vendor/swup/swup.min.js',                      type:'js',  global:'Swup',       desc:'Swup page transition' },
      // YiPet Utils
      { key:'url',       path:'utils/url.js',                                 type:'js',  global:'UrlBuilder', desc:'UrlBuilder utility' },
      { key:'log',       path:'utils/log.js',                                 type:'js',  global:'LoggerUtils', desc:'LoggerUtils logging' },
      // YiPet Styles
      { key:'variables-css', path:'styles/variables.css',                     type:'css', desc:'YiPet design variables' },
      { key:'reset-css', path:'styles/reset.css',                             type:'css', desc:'YiPet CSS reset' }
    ]

    var _byKey = {}
    for (var i = 0; i < CATALOG.length; i++) { _byKey[CATALOG[i].key] = CATALOG[i] }

    /* ── Script loading ──────────────────────────────────────────────────── */

    function _loadJS(path) {
      return new Promise(function (resolve, reject) {
        if (_loaded[path]) { resolve(false); return }
        var url = _resolve(path)
        var el  = document.createElement('script')
        el.src   = url
        el.onload  = function () { _loaded[path] = true; resolve(true) }
        el.onerror = function () { reject(new Error('Failed: ' + path)) }
        document.head.appendChild(el)
      })
    }

    function _loadCSS(path) {
      if (_loaded[path]) return false
      var url = _resolve(path)
      var el  = document.createElement('link')
      el.rel   = 'stylesheet'
      el.href  = url
      el.onload = function () { _loaded[path] = true }
      document.head.appendChild(el)
      return true
    }

    /* ── Shorthand factory ───────────────────────────────────────────────── */

    function _makeShortcut(entry) {
      return function () {
        if (entry.global && typeof root[entry.global] !== 'undefined') {
          _skip(entry.desc + ' — already present on page, skipped')
          return Promise.resolve(false)
        }
        if (entry.type === 'css') {
          var ok = _loadCSS(entry.path)
          ok ? _ok(entry.desc) : _skip(entry.desc + ' — already loaded')
          return Promise.resolve(ok)
        }
        return _loadJS(entry.path).then(function (loaded) {
          loaded ? _ok(entry.desc) : _skip(entry.desc + ' — already loaded')
          return loaded
        }).catch(function (e) { _err(entry.desc + ' — ' + e.message) })
      }
    }

    /* ── Public API ──────────────────────────────────────────────────────── */

    var YiPet = {
      version: '1.2.0',

      cdn: function (path) {
        return _resolve(path)
      },

      load: function (path) {
        var entry = _byKey[path]
        var realPath = entry ? entry.path : path
        return _loadJS(realPath).then(function (loaded) {
          var label = entry ? entry.desc : realPath
          loaded ? _ok(label) : _skip(label + ' — already loaded')
          return loaded
        }).catch(function (e) { _err((entry ? entry.key : path) + ' — ' + e.message) })
      },

      css: function (path) {
        var entry = _byKey[path]
        var realPath = entry ? entry.path : path
        var ok = _loadCSS(realPath)
        var label = entry ? entry.desc : realPath
        ok ? _ok(label) : _skip(label + ' — already loaded')
        return ok
      },

      loaded: function () {
        return Object.keys(_loaded)
      },

      list: function (filter) {
        var q = (filter || '').toLowerCase()
        var rows = []
        for (var i = 0; i < CATALOG.length; i++) {
          var c = CATALOG[i]
          if (q && c.key.indexOf(q) === -1 && c.desc.toLowerCase().indexOf(q) === -1 && c.path.toLowerCase().indexOf(q) === -1) continue
          var loaded = !!_loaded[c.path]
          if (c.global && typeof root[c.global] !== 'undefined') loaded = true
          rows.push({
            'Key': c.key,
            'Type': c.type.toUpperCase(),
            'Status': loaded ? '✓ Loaded' : '-',
            'Description': c.desc
          })
        }
        if (!rows.length) {
          console.log('%c[YiPet]%c No resources matching "%s"', 'color:#6366f1;font-weight:bold', 'color:inherit', filter || '')
          return
        }
        console.group('%c[YiPet]%c CDN Resources' + (filter ? ' (matching "' + filter + '")' : '') + ' — ' + rows.length + ' items',
          'color:#6366f1;font-weight:bold', 'color:inherit')
        console.table(rows, ['Key', 'Type', 'Status', 'Description'])
        console.log('%c  Usage: YiPet.load("key")%c or %cawait YiPet.key()',
          'color:#22c55e', 'color:#888', 'color:#22c55e')
        console.groupEnd()
      },

      help: function () {
        console.group('%c\U0001F43E YiPet CDN Bootstrap %c v1.2.0',
          'font-size:16px;color:#6366f1;font-weight:bold', 'color:#888;font-size:12px')
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#444')
        console.log('%c  YiPet.cdn(path)%c          — Get full URL of a CDN resource',         'color:#22c55e;font-weight:bold', 'color:inherit')
        console.log('%c  YiPet.load(path)%c         — Dynamically load JS file (returns Promise)', 'color:#22c55e;font-weight:bold', 'color:inherit')
        console.log('%c  YiPet.css(path)%c          — Dynamically load CSS file',                    'color:#22c55e;font-weight:bold', 'color:inherit')
        console.log('%c  YiPet.list(filter?)%c      — List available resources, supports keyword filtering',  'color:#22c55e;font-weight:bold', 'color:inherit')
        console.log('%c  YiPet.loaded()%c           — List of loaded resources',       'color:#22c55e;font-weight:bold', 'color:inherit')
        console.log('%c  YiPet.help()%c             — Show this help',                                 'color:#22c55e;font-weight:bold', 'color:inherit')
        console.log('')
        console.log('%c  Shorthand methods (common libraries):', 'color:#f59e0b;font-weight:bold')
        console.log('%c  await YiPet.vue()         YiPet.jquery()      YiPet.bootstrap()',    'color:inherit')
        console.log('%c  await YiPet.react()       YiPet.dayjs()       YiPet.gsap()',         'color:inherit')
        console.log('%c  await YiPet.anime()       YiPet.swiper()      YiPet.apexcharts()',   'color:inherit')
        console.log('%c  await YiPet.mermaid()     YiPet.marked()      YiPet.xlsx()',         'color:inherit')
        console.log('%c  await YiPet.html2canvas() YiPet.turndown()    YiPet.feather()',      'color:inherit')
        console.log('%c  YiPet.animateCSS()        YiPet.bootstrapCSS() YiPet.fancybox()',    'color:inherit')
        console.log('')
        console.log('%c  Examples:', 'color:#f59e0b;font-weight:bold')
        console.log('%c  > YiPet.list("vue")%c          // Search Vue-related resources',     'color:#a78bfa', 'color:#888')
        console.log('%c  > await YiPet.vue()%c          // Load Vue 3 to current page', 'color:#a78bfa', 'color:#888')
        console.log('%c  > YiPet.css("animate-css")%c   // Load Animate.css',                  'color:#a78bfa', 'color:#888')
        console.log('%c  > YiPet.cdn("vendor/jquery@3.7.1/jquery.min.js")%c',                         'color:#a78bfa', 'color:#888')
        console.groupEnd()
      }
    }

    /* ── Attach shortcut methods ─────────────────────────────────────────── */

    for (var j = 0; j < CATALOG.length; j++) {
      var entry = CATALOG[j]
      var method = entry.key.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase() })
      if (!YiPet[method]) { YiPet[method] = _makeShortcut(entry) }
    }

    /* ── Export ──────────────────────────────────────────────────────────── */

    root.YiPet = YiPet

    /* ── Auto-load all catalog resources ────────────────────────────────── */

    // CSS (sync injection, order-safe)
    for (var k = 0; k < CATALOG.length; k++) {
      if (CATALOG[k].type === 'css') _loadCSS(CATALOG[k].path)
    }

    // JS (sequential injection to respect inter-library dependencies)
    var jsQueue = []
    for (var m = 0; m < CATALOG.length; m++) {
      if (CATALOG[m].type === 'js') jsQueue.push(CATALOG[m])
    }

    ;(function loadSeq(i) {
      if (i >= jsQueue.length) {
        _log('\U0001F43E', 'CDN Bootstrap ready — type YiPet.help() for usage guide', 'color:#6366f1;font-weight:bold')
        return
      }
      _loadJS(jsQueue[i].path).then(function () {
        loadSeq(i + 1)
      }).catch(function () {
        loadSeq(i + 1)
      })
    })(0)
  }

})(typeof globalThis !== 'undefined' ? globalThis : window)
