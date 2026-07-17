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
 *       · layout: default layout variant, mapped to a CSS class on the
 *         grid root by index.html (see index.css for the visual diff):
 *         - 'grid' (default) — spacious CSS-Grid layout; auto-wraps
 *           with a 220px min column, giving 2–3 cards per row.
 *         - 'row'           — tight CSS-Grid layout; 150px min column
 *           so 6 cards fit in a row on a 1200px viewport.
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
