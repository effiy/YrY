/**
 * rui-sortable — shared sortable-table mixin for section components.
 * ----------------------------------------------------------------------
 * Exposes `window.RuiSortable` with:
 *   - sortBy(rows, key, dir)  → new sorted array (does not mutate input)
 *   - setSortMixin(defaults)  → Vue 2-style options fragment
 */
(function () {
    'use strict';

    function sortBy(rows, key, dir) {
        var src = (rows || []).slice();
        src.sort(function (a, b) {
            var av = a[key], bv = b[key];
            if (typeof av === 'string' || typeof bv === 'string') {
                return String(av).localeCompare(String(bv)) * dir;
            }
            return ((av || 0) - (bv || 0)) * dir;
        });
        return src;
    }

    function setSortMixin(defaults) {
        var initialKey = (defaults && defaults.sortKey) || null;
        var initialDir = (defaults && defaults.sortDir) != null ? defaults.sortDir : -1;
        return {
            data: function () {
                return { sortKey: initialKey, sortDir: initialDir };
            },
            methods: {
                setSort: function (key) {
                    if (this.sortKey === key) this.sortDir = -this.sortDir;
                    else { this.sortKey = key; this.sortDir = -1; }
                },
                sortClass: function (key) {
                    if (this.sortKey !== key) return '';
                    return this.sortDir === 1 ? 'sort-asc' : 'sort-desc';
                },
                sortAria: function (key) {
                    if (this.sortKey !== key) return 'none';
                    return this.sortDir === 1 ? 'ascending' : 'descending';
                },
                sortBy: function (rows) { return sortBy(rows, this.sortKey, this.sortDir); },
            },
        };
    }

    window.RuiSortable = { sortBy: sortBy, setSortMixin: setSortMixin };
})();
