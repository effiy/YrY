/**
 * ruiTagChip · config data source
 * ----------------------------------------------------------------------
 * Static config for the tag-chip component (template ID / timeout / default props),
 * decoupled from runtime logic for independent maintenance.
 * Exposed via window.rui_TAG_CHIP_CONFIG and read by index.js.
 *
 * Adjust here to change:
 *   - templateId:    DOM id of <script type="text/x-template" id="...">
 *   - loadTimeoutMs: timeout for fetch(index.html)
 *   - defaults:      default modifier value
 */

window.rui_TAG_CHIP_CONFIG = {
    templateId:    'rui-tag-chip-tpl',
    loadTimeoutMs: 5000,
    defaults: {
        modifier: 'info'
    }
};
