/**
 * ruiBackTop · config data source
 * ----------------------------------------------------------------------
 * Static config for the back-top component (template ID / timeout / threshold /
 * offsets / icon / a11y label / host element id), decoupled from runtime logic
 * for independent maintenance.
 * Exposed via window.rui_BACK_TOP_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:     DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs:  timeout for fetch(index.html)
 *   - defaults:       default props (used when the Vue component's data() initializes)
 *       · threshold:      pixels scrolled before the button shows, default 400
 *       · size:           button diameter (px), default 42
 *       · bottomOffset:   distance from viewport bottom (px), default 28
 *       · rightOffset:    distance from viewport right (px), default 28
 *       · iconChar:       char shown inside the button, default '↑' (up arrow)
 *       · ariaLabel:      a11y label, default 'Back to top'
 *       · hostId:         host div id where the Vue app mounts, default 'rui-back-top-host'
 *       · zIndex:         button z-index, default 100 (ensures it sits above normal content)
 *
 * Note: readyEvent / errorEvent are managed by shared/loader.js (the loader
 *     dispatches them internally) and are not configured here.
 */

window.rui_BACK_TOP_CONFIG = {
    templateId:    'rui-back-top-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        threshold:    400,
        size:         42,
        bottomOffset: 28,
        rightOffset:  28,
        iconChar:     '\u2191', // ↑
        ariaLabel:    'Back to top',
        hostId:       'rui-back-top-host',
        zIndex:       100
    }
};
