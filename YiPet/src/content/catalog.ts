/**
 * CDN Resource Catalog — single source of truth for every injectable resource.
 * Maps short keys to file paths and global checks for runtime injection.
 */

export interface CdnEntry {
  key: string;         // short key, e.g. 'vue', 'dayjs'
  path: string;        // relative to CDN base, e.g. 'vendor/vue@3.5.13/vue.global.prod.js'
  type: 'js' | 'css';
  global?: string;     // window property to check for already-loaded
  desc: string;        // human-readable label
}

export const CDN_CATALOG: CdnEntry[] = [
  // Frameworks & Core
  { key: 'vue',       path: 'vendor/vue@3.5.13/vue.global.prod.js',       type: 'js',  global: 'Vue',        desc: 'Vue 3.5.13' },
  { key: 'react',     path: 'vendor/react@15.6.1/react.min.js',           type: 'js',  global: 'React',      desc: 'React 15.6.1' },
  { key: 'react-dom', path: 'vendor/react@15.6.1/react-dom.min.js',       type: 'js',  global: 'ReactDOM',   desc: 'ReactDOM 15.6.1' },
  { key: 'jquery',    path: 'vendor/jquery@3.7.1/jquery.min.js',          type: 'js',  global: 'jQuery',     desc: 'jQuery 3.7.1' },
  { key: 'popper',    path: 'vendor/popper.js/popper.min.js',             type: 'js',  global: 'Popper',     desc: 'Popper.js' },

  // UI Frameworks
  { key: 'bootstrap', path: 'vendor/bootstrap@5.2.3/js/bootstrap.bundle.min.js', type: 'js',  global: 'bootstrap',  desc: 'Bootstrap 5.2.3 JS' },
  { key: 'bootstrap-css', path: 'vendor/bootstrap@5.2.3/css/bootstrap.min.css',  type: 'css', desc: 'Bootstrap 5.2.3 CSS' },
  { key: 'swiper',    path: 'vendor/swiper@7.0.3/js/swiper-bundle.min.js',  type: 'js',  global: 'Swiper', desc: 'Swiper 7.0.3' },
  { key: 'swiper-css', path: 'vendor/swiper@7.0.3/css/swiper-bundle.min.css', type: 'css', desc: 'Swiper 7.0.3 CSS' },

  // Animation
  { key: 'gsap',      path: 'vendor/gsap/TweenMax.min.js',                type: 'js',  global: 'TweenMax',   desc: 'GSAP TweenMax' },
  { key: 'anime',     path: 'vendor/anime@3.0.0/anime.min.js',            type: 'js',  global: 'anime',      desc: 'Anime.js 3.0' },
  { key: 'aos',       path: 'vendor/aos/js/aos.js',                       type: 'js',  global: 'AOS',        desc: 'AOS scroll animation' },
  { key: 'aos-css',   path: 'vendor/aos/css/aos.css',                     type: 'css', desc: 'AOS CSS' },
  { key: 'wow',       path: 'vendor/wow@1.1.3/wow.min.js',                type: 'js',  global: 'WOW',        desc: 'WOW.js 1.1.3' },
  { key: 'animate-css', path: 'vendor/animate.css@3.5.1/animate.min.css', type: 'css', desc: 'Animate.css 3.5.1' },
  { key: 'typed',     path: 'vendor/typed.js@2.0.11/typed.min.js',        type: 'js',  global: 'Typed',      desc: 'Typed.js 2.0.11' },
  { key: 'typing',    path: 'vendor/typing/typing.min.js',                 type: 'js',  global: 'Typing',     desc: 'Typing.js' },

  // Date & Time
  { key: 'dayjs',     path: 'vendor/dayjs@1.11.21/dayjs.min.js',          type: 'js',  global: 'dayjs',      desc: 'Day.js 1.11.21' },
  { key: 'dayjs-zh',  path: 'vendor/dayjs@1.11.21/locale/zh-cn.js',      type: 'js',  desc: 'Day.js Chinese locale pack' },
  { key: 'dayjs-utc', path: 'vendor/dayjs@1.11.21/plugin/utc.js',         type: 'js',  desc: 'Day.js UTC plugin' },
  { key: 'dayjs-tz',  path: 'vendor/dayjs@1.11.21/plugin/timezone.js',    type: 'js',  desc: 'Day.js Timezone plugin' },
  { key: 'dayjs-rel', path: 'vendor/dayjs@1.11.21/plugin/relativeTime.js',type: 'js',  desc: 'Day.js RelativeTime' },
  { key: 'dayjs-dur', path: 'vendor/dayjs@1.11.21/plugin/duration.js',    type: 'js',  desc: 'Day.js Duration' },
  { key: 'dayjs-adv', path: 'vendor/dayjs@1.11.21/plugin/advancedFormat.js',type: 'js', desc: 'Day.js AdvancedFormat' },
  { key: 'dayjs-cpf', path: 'vendor/dayjs@1.11.21/plugin/customParseFormat.js',type: 'js', desc: 'Day.js CustomParseFormat' },
  { key: 'countdown', path: 'vendor/countdown/countdown.min.js',          type: 'js',  desc: 'Countdown.js' },

  // Charts
  { key: 'apexcharts', path: 'vendor/apexcharts@3.46.0/apexcharts.min.js', type: 'js', global: 'ApexCharts',  desc: 'ApexCharts 3.46.0' },
  { key: 'mermaid',   path: 'vendor/mermaid.min.js',                       type: 'js',  global: 'mermaid',    desc: 'Mermaid diagram' },
  { key: 'progressbar', path: 'vendor/progressbar@1.1.0/progressbar.min.js', type: 'js', global: 'ProgressBar', desc: 'ProgressBar.js 1.1.0' },

  // Export / Document
  { key: 'html2canvas', path: 'vendor/html2canvas@1.4.1/html2canvas.min.js', type: 'js', global: 'html2canvas', desc: 'html2canvas 1.4.1' },
  { key: 'jspdf',     path: 'vendor/jspdf@2.5.2/jspdf.umd.min.js',         type: 'js',  global: 'jspdf',      desc: 'jsPDF 2.5.2' },
  { key: 'xlsx',      path: 'vendor/xlsx@0.20.3/xlsx.full.min.js',         type: 'js',  global: 'XLSX',       desc: 'SheetJS 0.20.3' },
  { key: 'turndown',  path: 'vendor/turndown.js',                          type: 'js',  global: 'TurndownService', desc: 'Turndown HTML→MD' },
  { key: 'marked',    path: 'vendor/marked.min.js',                        type: 'js',  global: 'marked',     desc: 'Marked MD→HTML' },

  // Icons & Fonts
  { key: 'feather',   path: 'vendor/feather-icons/feather.min.js',         type: 'js',  global: 'feather',    desc: 'Feather Icons' },
  { key: 'fa-css',    path: 'vendor/font-awesome@4.7.0/css/font-awesome.min.css', type: 'css', desc: 'Font Awesome 4.7.0' },
  { key: 'mdi-css',   path: 'vendor/materialdesignicons/css/materialdesignicons.min.css', type: 'css', desc: 'Material Design Icons' },
  { key: 'flaticon',  path: 'vendor/flaticon/css/flaticon.css',            type: 'css', desc: 'Flaticon CSS' },

  // Carousels
  { key: 'owl-carousel', path: 'vendor/owl-carousel@2.2.1/js/owl.carousel.min.js', type: 'js', desc: 'Owl Carousel 2.2.1' },
  { key: 'owl-css',   path: 'vendor/owl-carousel@2.2.1/css/owl.carousel.min.css', type: 'css', desc: 'Owl Carousel CSS' },
  { key: 'slick',     path: 'vendor/slick-carousel@1.8.1/js/slick.min.js',  type: 'js',  desc: 'Slick Carousel 1.8.1' },
  { key: 'slick-css', path: 'vendor/slick@1.6.0/css/slick.css',            type: 'css', desc: 'Slick CSS' },

  // Lightbox & Modal
  { key: 'fancybox',  path: 'vendor/fancybox@3.5.7/js/fancybox.min.js',    type: 'js',  desc: 'Fancybox 3.5.7' },
  { key: 'fancybox-css', path: 'vendor/fancybox@3.5.7/css/fancybox.min.css', type: 'css', desc: 'Fancybox CSS' },
  { key: 'venobox',   path: 'vendor/venobox@1.7.3/js/venobox.min.js',      type: 'js',  desc: 'Venobox 1.7.3' },
  { key: 'venobox-css', path: 'vendor/venobox@1.7.3/css/venobox.css',      type: 'css', desc: 'Venobox CSS' },
  { key: 'magnific',  path: 'vendor/magnific-popup@1.1.0/jquery.magnific-popup.min.js', type: 'js', desc: 'Magnific Popup (needs jQuery)' },

  // Layout & Scroll
  { key: 'isotope',   path: 'vendor/isotope@3.0.6/isotope.min.js',         type: 'js',  desc: 'Isotope 3.0.6 (needs jQuery)' },
  { key: 'simplebar', path: 'vendor/simplebar@5.1.0/simplebar.min.js',     type: 'js',  desc: 'SimpleBar 5.1.0' },
  { key: 'simplebar-css', path: 'vendor/simplebar@5.1.0/simplebar.min.css', type: 'css', desc: 'SimpleBar CSS' },
  { key: 'smooth-scroll', path: 'vendor/smooth-scrollbar/smooth-scrollbar.min.js', type: 'js', desc: 'Smooth Scrollbar' },
  { key: 'overscroll', path: 'vendor/overscroll/overscroll.min.js',        type: 'js',  desc: 'Overscroll' },
  { key: 'perfect-scroll', path: 'vendor/perfect-scrollbar@1.5.0/perfect-scrollbar.min.js', type: 'js', desc: 'Perfect Scrollbar 1.5.0' },

  // jQuery Plugins
  { key: 'waypoints', path: 'vendor/waypoints@4.0.0/waypoints.min.js',     type: 'js',  desc: 'Waypoints 4.0.0 (needs jQuery)' },
  { key: 'counterup', path: 'vendor/counterup/counterup.min.js',           type: 'js',  desc: 'Counter-Up (needs jQuery)' },
  { key: 'sticky',    path: 'vendor/sticky@1.0.4/jquery.sticky.min.js',    type: 'js',  desc: 'Sticky Kit 1.0.4 (needs jQuery)' },
  { key: 'scrollup',  path: 'vendor/scrollup@2.4.1/jquery.scrollUp.min.js',type: 'js',  desc: 'ScrollUp 2.4.1 (needs jQuery)' },
  { key: 'theia',     path: 'vendor/theia-sticky-sidebar@1.7.0/jquery.theia.sticky.min.js', type: 'js', desc: 'Theia Sticky Sidebar (needs jQuery)' },
  { key: 'slicknav-css', path: 'vendor/slicknav@1.0.10/css/slicknav.css',  type: 'css', desc: 'SlickNav CSS' },

  // Utilities
  { key: 'md5',       path: 'vendor/md5.js',                                type: 'js',  desc: 'MD5 hash' },
  { key: 'modernizr', path: 'vendor/modernizr@3.6.0/modernizr.min.js',      type: 'js',  global: 'Modernizr', desc: 'Modernizr 3.6.0' },
  { key: 'leaflet',   path: 'vendor/leaflet@1.1.1/leaflet.js',              type: 'js',  desc: 'Leaflet 1.1.1 map' },
  { key: 'swup',      path: 'vendor/swup/swup.min.js',                      type: 'js',  global: 'Swup',       desc: 'Swup page transition' },

  // YiPet Utils
  { key: 'url',       path: 'utils/url.js',                                 type: 'js',  global: 'UrlBuilder', desc: 'UrlBuilder utility' },
  { key: 'log',       path: 'utils/log.js',                                 type: 'js',  global: 'LoggerUtils', desc: 'LoggerUtils logging' },

  // YiPet Styles
  { key: 'variables-css', path: 'styles/variables.css',                     type: 'css', desc: 'YiPet design variables' },
  { key: 'reset-css', path: 'styles/reset.css',                             type: 'css', desc: 'YiPet CSS reset' },
];

export const catalogByKey: Record<string, CdnEntry> = Object.fromEntries(
  CDN_CATALOG.map(e => [e.key, e]),
);
