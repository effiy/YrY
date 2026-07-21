/**
 * ruiBreadcrumb · config data source
 * ----------------------------------------------------------------------
 * Static config for the breadcrumb component (template ID / timeout / default
 * props), decoupled from runtime logic for independent maintenance.
 * Exposed via window.rui_BREADCRUMB_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *   - defaults:      default values for ariaLabel / separator
 *
 * Note: readyEvent / errorEvent are now managed by shared/loader.js (the
 *     loader dispatches them internally) and are not configured in data.js.
 */

window.rui_BREADCRUMB_CONFIG = {
    templateId:    'rui-breadcrumb-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        ariaLabel: 'Breadcrumb navigation',
        separator: '/'
    }
};