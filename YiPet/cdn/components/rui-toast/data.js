/**
 * ruiToast · config data source
 * ----------------------------------------------------------------------
 * Static config for toast (icons / defaults / type aliases), decoupled from
 * runtime logic for independent maintenance. Exposed via
 * window.rui_TOAST_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - icons:        icon char for each semantic color
 *   - defaults:     duration, max count, template/container element ids, timeout
 *   - typeAliases:  type normalization map (e.g. warning -> warn)
 */

window.rui_TOAST_CONFIG = {
    icons: {
        default: '\u2139',   /* ℹ */
        success: '\u2713',   /* ✓ */
        warn:    '\u26A0',   /* ⚠ */
        warning: '\u26A0',   /* ⚠ */
        error:   '\u2715',   /* ✕ */
        info:    '\u2139'    /* ℹ */
    },
    defaults: {
        duration:      3500,  /* TOAST_DURATION_MS */
        maxToasts:     5,     /* MAX_TOASTS */
        templateId:    'rui-toast-tpl',
        hostId:        'rui-toast-host',
        loadTimeoutMs: (window.ruiComponentHelpers && window.ruiComponentHelpers.DEFAULT_LOAD_TIMEOUT_MS) || 5000
    },
    typeAliases: {
        warning: 'warn'
    }
};