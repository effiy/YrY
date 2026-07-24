/*!
 * YiviY Docs - Per-project config shim
 * Sets window.YRY_DOC_CONFIG, then loads the shared layout.js.
 */
window.YRY_DOC_CONFIG = {
    brand:        'YiviY',
    tagline:      'Video Translation & Dubbing',
    version:      'v1.0',
    manifestUrl:  '',
    manifestLabel:'',
    brandColor:   '#a78bfa',
    pages: [
        { key: 'index',         href: 'index.html',         icon: 'ri-honour-line',         label: 'Introduction'  },
        { key: 'setup',         href: 'setup.html',         icon: 'ri-tools-fill',          label: 'Setup'         },
        { key: 'customization', href: 'customization.html', icon: 'ri-paint-line',          label: 'Customization' },
        { key: 'specifications',href: 'specifications.html',icon: 'ri-file-list-3-line',    label: 'Specifications'},
        { key: 'pipeline',      href: 'pipeline.html',      icon: 'ri-flow-chart',          label: 'Pipeline'      },
        { key: 'faq',           href: 'faq.html',           icon: 'ri-question-answer-line',label: 'FAQ'           },
        { key: 'changelog',     href: 'changelog.html',     icon: 'ri-book-open-line',      label: 'Changelog'     }
    ]
};
(function () {
    var s = document.createElement('script');
    s.src = '../../../templates/docs/js/layout.js';
    document.head.appendChild(s);
})();
