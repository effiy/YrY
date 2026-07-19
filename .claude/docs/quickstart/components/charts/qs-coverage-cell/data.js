/**
 * qsCoverageCell · config data source
 * ----------------------------------------------------------------------
 * Radial progress cell. Used by the per-section coverage grid.
 *
 * Exposed via window.QS_COVERAGE_CELL_CONFIG and read by index.js.
 */
window.QS_COVERAGE_CELL_CONFIG = {
    templateId:    'qs-coverage-cell-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        size: 48
    }
};
