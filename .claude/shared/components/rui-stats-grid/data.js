/**
 * ruiStatsGrid · config data source
 * ----------------------------------------------------------------------
 * Static config for the stats-grid component (template ID / timeout /
 * default props), decoupled from runtime logic for independent maintenance.
 * Exposed via window.rui_STATS_GRID_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *   - defaults:      default props
 *       · layout: default layout variant
 *         - 'grid' (default) — wrapped multi-row flex grid
 *         - 'row'           — single horizontal row
 *
 * Note: readyEvent / errorEvent are managed by shared/loader.js (the
 *     loader dispatches them internally) and are not configured in data.js.
 */

window.rui_STATS_GRID_CONFIG = {
    templateId:    'rui-stats-grid-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        layout: 'grid'
    }
};
