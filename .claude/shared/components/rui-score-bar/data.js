/**
 * ruiScoreBar · config data source
 * ----------------------------------------------------------------------
 * Static config for the score-bar component (template ID / timeout /
 * default props), decoupled from runtime logic for independent maintenance.
 * Exposed via window.rui_SCORE_BAR_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *   - defaults:      default props
 *       · label:      default label text shown next to the numeric score
 *       · showAlerts: whether P0/P1/P2 alert chips render when `alerts` is truthy
 *
 * Note: readyEvent / errorEvent are managed by shared/loader.js (the
 *     loader dispatches them internally) and are not configured in data.js.
 */

window.rui_SCORE_BAR_CONFIG = {
    templateId:    'rui-score-bar-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        label:      'Score',
        showAlerts: true
    }
};
