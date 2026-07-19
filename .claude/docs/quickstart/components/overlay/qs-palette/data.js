/**
 * qsPalette · config data source
 * ----------------------------------------------------------------------
 * Command palette (Cmd/Ctrl+K) overlay. Searches across the page's
 * sections, concepts, commands, and FAQ.

 * Exposed via window.QS_PALETTE_CONFIG and read by index.js.
 */
window.QS_PALETTE_CONFIG = {
    templateId:    'qs-palette-tpl',
    loadTimeoutMs: 5000,
    defaults: {}
};
