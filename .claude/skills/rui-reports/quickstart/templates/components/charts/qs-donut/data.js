/**
 * qsDonut · config data source
 * ----------------------------------------------------------------------
 * Pure SVG donut chart with center label. Used by the score banner.
 *
 * Exposed via window.QS_DONUT_CONFIG and read by index.js.
 */
window.QS_DONUT_CONFIG = {
    templateId:    'qs-donut-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        size:      140,
        thickness: 14
    }
};
