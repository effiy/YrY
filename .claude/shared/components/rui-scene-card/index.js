/* ═══════════════════════════════════════════════════════════════════════════
   rui HTML CDN — ruiSceneCard · Vue 3 asset card component (single-file entry)

   Applicable to: unified card display for assets/skills/agents/rules/references

   Brief props reference:
     name          (required) card main title
     nameHref      (optional) main title link
     nameTarget    (optional) link target, defaults to '_blank'
     badge         (optional) small badge after the main title (e.g. "New")
     desc          (optional) description text (supports HTML, rendered via v-html)
     tags          (optional) tag array · rendered with <rui-tag-chip>
     meta          (optional) bottom meta info
     demo          (optional) demo link URL
     links         (optional) bottom link array

   Page usage (host page):
     <script src="/.claude/shared/vendor/vue@3.4.27/vue.global.prod.js"></script>
     <script src="/.claude/shared/rui-tag-chip/index.js"></script>
     <script src="/.claude/shared/rui-scene-card/index.js"></script>
     <div id="card"></div>
     <script>
       window.ruiSceneCard.mount({ name: 'my-card', tags: [...] }, '#card').then(app => { ... });
     </script>
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var SELF_SRC = (document.currentScript && document.currentScript.src) || '';

    /* ── Build Vue component options + dispatch ready + drain the queue ─────────── */
    function buildOptions(cfg, tpl) {
        return {
            name: 'ruiSceneCard',
            components: { ruiTagChip: window.ruiTagChip },
            props: {
                name:         { type: String, required: true },
                nameHref:     { type: String, default: '' },
                nameTarget:   { type: String, default: function () { return cfg.defaults.nameTarget; } },
                badge:        { type: String, default: '' },
                desc:         { type: String, default: '' },
                tags:         { type: Array,  default: function () { return []; } },
                meta:         { type: String, default: '' },
                demo:         { type: String, default: '' },
                links:        { type: Array,  default: null }
            },
            computed: {
                resolvedLinks: function () {
                    var raw = Array.isArray(this.links)
                        ? this.links
                        : ((this.$options && this.$options._defaultLinks) || []);
                    var encodedName = encodeURIComponent(this.name || '');
                    var arr = raw.map(function (l) {
                        return {
                            icon:   l.icon   || '',
                            label:  l.label  || '',
                            href:   (l.href  || '').replace('{name}', encodedName),
                            target: l.target || '_blank'
                        };
                    });
                    var demo = this.demo;
                    if (demo && !arr.some(function (l) { return l.label === 'Demo'; })) {
                        arr.push({ label: 'Demo', href: demo, target: '_blank' });
                    }
                    return arr;
                }
            },
            _defaultLinks: (cfg.defaults && cfg.defaults.defaultLinks) || [],
            template: tpl
        };
    }

    /* ── Custom onReady: waits for ruiTagChip dependency before fetching template ── */
    function onReady(cfg, ctx, mountAPI) {
        function proceed() {
            ctx.fetchTemplate(cfg.templateId, cfg.loadTimeoutMs)
                .then(function (tpl) {
                    mountAPI.setComponentOptions(buildOptions(cfg, tpl));
                    ctx.dispatchReady();
                    mountAPI.flushMountQueue();
                })
                .catch(function (err) {
                    console.error('[ruiSceneCard]', err);
                    ctx.dispatchError(err);
                });
        }

        /* ruiTagChip ready: proceed immediately. Otherwise wait for ready event. */
        if (window.ruiTagChip && window.ruiTagChip.name) {
            proceed();
        } else {
            var depTimer = setTimeout(function () {
                document.removeEventListener('rui-tag-chip-ready', onTCReady);
                ctx.dispatchError(new Error('ruiTagChip dependency load timed out'));
            }, cfg.loadTimeoutMs || ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS);
            function onTCReady() {
                clearTimeout(depTimer);
                proceed();
            }
            document.addEventListener('rui-tag-chip-ready', onTCReady, { once: true });
        }
    }

    /* ── Bootstrap ── */
    ruiBootstrapComponent({
        componentName: 'ruiSceneCard',
        configKey:     'rui_SCENE_CARD_CONFIG',
        cssMarker:     'rui-scene-card-css',
        readyEvent:    'rui-scene-card-ready',
        errorEvent:    'rui-scene-card-error',
        callerSrc:     SELF_SRC,
        defaultConfig: {
            templateId:    'rui-scene-card-tpl',
            loadTimeoutMs: ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS
        },
        onReady: onReady
    });
})();
