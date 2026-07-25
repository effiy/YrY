/**
 * yry-kbd.js — YiDoc shared keyboard shortcut manager.
 *
 * Exposes window.yryKbd with three methods:
 *   - register(vm, bindings)   — register a Vue instance's keyboard bindings
 *   - unregister(vm)           — remove a Vue instance
 *   - getDescriptions()        — return all active binding descriptions
 *
 * Usage from a Vue mounted() hook:
 *   yryKbd.register(this, [
 *     { key: 'Escape', handler: function () { ... }, scope: this, desc: 'Reset focus' },
 *     { keys: ['j','k'], handler: function (key) { ... }, scope: this, desc: 'Navigate sections' },
 *   ]);
 *
 * @module yry-kbd
 * @since Phase 1 refactoring — extracted from 7 duplicate inline copies.
 */
;(function () {
    'use strict';
    var instances = [];
    function _isIgnored(e) {
        var tag = e.target.tagName;
        return (
            e.ctrlKey || e.metaKey || e.altKey ||
            tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
            e.target.isContentEditable
        );
    }
    function _onKeydown(e) {
        if (_isIgnored(e)) return;
        for (var i = instances.length - 1; i >= 0; i--) {
            var inst = instances[i];
            if (!inst._bindings) continue;
            for (var j = 0; j < inst._bindings.length; j++) {
                var b = inst._bindings[j];
                var matched = false;
                var key = e.key;
                if (b.key && b.key === key) {
                    matched = true;
                } else if (b.keys && b.keys.indexOf(key) !== -1) {
                    matched = true;
                    key = key;
                }
                if (matched) {
                    e.preventDefault();
                    var fn = b.handler;
                    var ctx = b.scope || null;
                    if (b.keys) {
                        fn.call(ctx, e.key);
                    } else {
                        fn.call(ctx);
                    }
                    return;
                }
            }
        }
    }
    document.addEventListener('keydown', _onKeydown, true);
    window.yryKbd = {
        register: function (vm, bindings) {
            this.unregister(vm);
            vm._bindings = bindings;
            instances.push(vm);
        },
        unregister: function (vm) {
            var idx = instances.indexOf(vm);
            if (idx !== -1) {
                instances.splice(idx, 1);
            }
            delete vm._bindings;
        },
        getDescriptions: function () {
            var result = [];
            for (var i = 0; i < instances.length; i++) {
                var bnds = instances[i]._bindings;
                if (!bnds) continue;
                for (var j = 0; j < bnds.length; j++) {
                    var b = bnds[j];
                    if (b.desc) {
                        result.push({
                            key: b.key || (b.keys ? b.keys.join(' ') : ''),
                            desc: b.desc
                        });
                    }
                }
            }
            return result;
        }
    };
})();
