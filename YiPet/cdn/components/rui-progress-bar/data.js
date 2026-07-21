/**
 * ruiProgressBar · config data source
 * ----------------------------------------------------------------------
 * Static config for the progress bar component.
 * Exposed via window.rui_PROGRESS_BAR_CONFIG and read by index.js.
 */

window.rui_PROGRESS_BAR_CONFIG = {
    templateId:    'rui-progress-bar-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        modifier:  'accent',
        showValue: true
    }
};
