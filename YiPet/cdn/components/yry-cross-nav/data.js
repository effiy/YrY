/**
 * ruiCrossNav · config data source
 * ----------------------------------------------------------------------
 * Static config for the cross-navigation component (template ID / timeout /
 * default props), decoupled from runtime logic for independent maintenance.
 * Exposed via window.rui_CROSS_NAV_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *   - defaults:      default values for basePath / separator / active /
 *                    ariaLabel / activeAriaLabel
 *
 * Note: readyEvent / errorEvent are managed by shared/loader.js (the
 *       loader dispatches them internally) and are not configured here.
 */

window.rui_CROSS_NAV_CONFIG = {
    templateId:    'yry-cross-nav-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        basePath:        './',
        separator:       '·',
        active:          '',
        ariaLabel:       'Cross navigation',
        activeAriaLabel: 'Current page'
    }
};
