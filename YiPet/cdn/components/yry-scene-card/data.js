/**
 * ruiSceneCard · config data source
 * ----------------------------------------------------------------------
 * Static config for the scene-card component (template ID / timeout / default
 * props / default footer link list), decoupled from runtime logic for
 * independent maintenance. Exposed via window.rui_SCENE_CARD_CONFIG and read
 * by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *                     (also used as the ruiTagChip dependency-wait timeout)
 *   - defaults:      default props
 *       · nameTarget:   link target, default '_blank' (new window)
 *       · defaultLinks: default footer link list
 *                       (list / architecture / graph / source / tests / demo / review ...)
 *                       each item = { icon, label, href, target }
 *                         - href may use a {name} placeholder, replaced at runtime by props.name (URL-encoded)
 *                         - target defaults to '_blank' when omitted
 *                       props.links behavior:
 *                         · null/undefined (default) → fall back to defaultLinks below
 *                         · []                       → explicitly "show no footer links"
 *                         · [...]                    → override defaultLinks with the given array
 *
 * Note: the ruiTagChip dependency is awaited via the 'yry-tag-chip-ready' event
 *     and is not configured here (the loader manages ready/error event names
 *     internally).
 */

window.rui_SCENE_CARD_CONFIG = {
    templateId:    'yry-scene-card-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        nameTarget:   '_blank',
        defaultLinks: [
            /* ── 7 general entries · all jump-enabled by default · text labels only ·
               hrefs use {name} placeholder (URL-encoded at runtime by props.name) ── */
            { label: 'List', href: 'https://github.com/example/{name}#readme',                    target: '_blank' },
            { label: 'Architecture', href: 'docs/components/workflow/index.html',                  target: '_blank' },
            { label: 'Graph', href: 'https://github.com/example/{name}/network/dependents',        target: '_blank' },
            { label: 'Tests', href: 'https://github.com/example/{name}/actions',                   target: '_blank' },
            { label: 'Source', href: 'https://github.com/example/{name}',                          target: '_blank' },
            { label: 'Demo', href: 'https://{name}.example.com',                                    target: '_blank' },
            { label: 'Review', href: 'https://github.com/example/{name}/pulls',                     target: '_blank' }
        ]
    }
};