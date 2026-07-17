/**
 * ruiPanelHub · config data source
 * ----------------------------------------------------------------------
 * Static config for the panel-hub toolbar component (template ID / timeout /
 * default props), decoupled from runtime logic for independent maintenance.
 * Exposed via window.rui_PANEL_HUB_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *   - defaults:      default values for flow / ariaLabel
 *
 * Note: the window.PanelHub global API (register / open / close / toggle /
 *     isOpen / panelLink / escHtml / relativeTime) is project state
 *     — it lives in index.js alongside the component runtime, NOT here,
 *     since it depends on per-page DOM elements and is independent of the
 *     template config in this file.
 *
 * Note: readyEvent / errorEvent are managed by shared/loader.js (the
 *     loader dispatches them internally) and are not configured here.
 */

window.rui_PANEL_HUB_CONFIG = {
    templateId:    'rui-panel-hub-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        ariaLabel: 'Panel hub toolbar',
        flow:      ''
    }
};
