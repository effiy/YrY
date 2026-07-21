/**
 * yry-sortable — shared sortable-table mixin for the section components
 *                (largest / coupling / risk / health).
 * ----------------------------------------------------------------------
 * Exposes `window.RuiSortable` with:
 *   - sortBy(rows, key, dir)  → new sorted array (does not mutate input)
 *   - setSortMixin(defaults)  → Vue 2-style options fragment that adds
 *                                data.sortKey / data.sortDir + the
 *                                setSort / sortClass / sortAria methods.
 *
 * Usage in a component:
 *
 *     (function () {
 *         window.ruiReportLargest = Object.assign({
 *             name: 'ruiReportLargest',
 *             template: '#yry-report-largest-tpl',
 *             props: { ... },
 *             computed: { ... },
 *             methods: { ... }
 *         }, window.RuiSortable.setSortMixin({ sortKey: 'bytes', sortDir: -1 }));
 *     })();
 *
 * This keeps the per-component file focused on its own data + computed
 * + template, while sharing the boilerplate that was duplicated across
 * 4 components.
 */
(function () {
    'use strict';

    /**
     * Sort an array of plain rows by a key + direction.
     *   - key may be a string field name; comparison is locale-aware for
     *     strings and numeric for everything else.
     *   - dir:  1 ascending, -1 descending.
     */
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

    /**
     * Build the shared options fragment. Call with optional default
     * { sortKey, sortDir } — the resulting fragment is merged into the
     * component via Object.assign or Vue's mixins array.
     */
    function setSortMixin(defaults) {
        var initialKey = (defaults && defaults.sortKey) || null;
        var initialDir = (defaults && defaults.sortDir) != null ? defaults.sortDir : -1;
        return {
            data: function () {
                return {
                    sortKey: initialKey,
                    sortDir: initialDir,
                };
            },
            methods: {
                setSort: function (key) {
                    if (this.sortKey === key) {
                        this.sortDir = -this.sortDir;
                    } else {
                        this.sortKey = key;
                        this.sortDir = -1;
                    }
                },
                sortClass: function (key) {
                    if (this.sortKey !== key) return '';
                    return this.sortDir === 1 ? 'sort-asc' : 'sort-desc';
                },
                sortAria: function (key) {
                    if (this.sortKey !== key) return 'none';
                    return this.sortDir === 1 ? 'ascending' : 'descending';
                },
                sortBy: function (rows) {
                    return sortBy(rows, this.sortKey, this.sortDir);
                },
            },
        };
    }

    window.RuiSortable = {
        sortBy: sortBy,
        setSortMixin: setSortMixin,
    };
})();
