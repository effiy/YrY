/*!
 * YiPot Docs - Per-project config shim
 * Sets window.YRY_DOC_CONFIG, then loads the shared layout.js.
 */
window.YRY_DOC_CONFIG = {
    brand:        'YiPot',
    tagline:      'Tauri Desktop Translator',
    version:      'v3.0.7',
    manifestUrl:  '',
    manifestLabel:'',
    brandColor:   '#60a5fa',
    pages: [
        { key: 'index',         href: 'index.html',         icon: 'ri-honour-line',         label: 'Introduction'  },
        { key: 'setup',         href: 'setup.html',         icon: 'ri-tools-fill',          label: 'Setup'         },
        { key: 'customization', href: 'customization.html', icon: 'ri-paint-line',          label: 'Customization' },
        { key: 'specifications',href: 'specifications.html',icon: 'ri-file-list-3-line',    label: 'Specifications'},
        { key: 'windows',       href: 'windows.html',       icon: 'ri-layout-2-line',       label: 'Windows'       },
        { key: 'faq',           href: 'faq.html',           icon: 'ri-question-answer-line',label: 'FAQ'           },
        { key: 'changelog',     href: 'changelog.html',     icon: 'ri-book-open-line',      label: 'Changelog'     }
    ]
};
(function () {
    var s = document.createElement('script');
    s.src = '../../../templates/docs/js/layout.js';
    document.head.appendChild(s);
})();
