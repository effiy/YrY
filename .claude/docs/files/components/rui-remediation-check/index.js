/**
 * rui-remediation-check — accessible checkbox toggle for one
 *                        remediation item.
 * ----------------------------------------------------------------------
 * Replaces the 3× duplicated `.remediation-check` blocks inside the
 * remediation-item markup. Emits `update:checked` on toggle so the
 * parent (page-level app) can persist the `remediationDone` map.
 *
 * The previous behaviour (disabled copy button + strikethrough on
 * `.is-done`) is preserved via the existing CSS rules in
 * files/index.css — the parent just binds `:checked` and toggles
 * `is-done` on the item row.
 */
(function () {
    'use strict';

    window.ruiRemediationCheck = {
        name: 'ruiRemediationCheck',
        template: '#rui-remediation-check-tpl',
        props: {
            checked:    { type: Boolean, default: false },
            disabled:   { type: Boolean, default: false },
            ariaLabel:  { type: String, default: 'Mark resolved' }
        },
        methods: {
            onChange: function (e) {
                this.$emit('update:checked', e.target.checked);
            }
        }
    };
})();
