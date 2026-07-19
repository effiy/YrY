/**
 * qsSparkline · config data source
 * ----------------------------------------------------------------------
 * Pure SVG line + area chart, no deps. Used by the overview KPIs.
 *
 * Exposed via window.QS_SPARKLINE_CONFIG and read by index.js.
 */
window.QS_SPARKLINE_CONFIG = {
    templateId:    'qs-sparkline-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        tone:   'accent',
        width:  120,
        height: 32,
        fill:   true
    }
};
