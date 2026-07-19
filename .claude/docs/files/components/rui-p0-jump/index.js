/**
 * rui-p0-jump — fixed bottom-left "jump to P0 risk" button.
 * ----------------------------------------------------------------------
 * Replaces the inline `<a class="p0-jump">` floating button in
 * files/index.html. Only renders when `count > 0` (passing 0 hides
 * the button without leaving an empty anchor in the DOM).
 */
(function () {
    'use strict';

    window.ruiP0Jump = {
        name: 'ruiP0Jump',
        template: '#rui-p0-jump-tpl',
        props: {
            count: { type: Number,  default: 0 },
            href:  { type: String,  default: '#risk' },
            label: { type: String,  default: 'P0 risk' }
        },
        computed: {
            visible: function () {
                return this.count > 0;
            },
            title: function () {
                return this.count + ' critical alert' + (this.count > 1 ? 's' : '');
            }
        }
    };
})();
