# §0 Effect Sketch — Data Flow Tracing

**What this scene demonstrates**: In a collection of static HTML template websites, the "data flow" is the browser's rendering pipeline: the user opens an `index.html` file → the browser parses the HTML DOM → fetches linked CSS stylesheets (`<link rel="stylesheet">`) and JavaScript files (`<script src="...">`) → executes scripts to initialize interactive components (carousels, charts, modals) → renders the final visual page. There is no server-side processing, no API calls, and no database — everything is pre-built static content served from the filesystem.

**Why it matters**: Understanding this flow is essential for debugging rendering issues. If a carousel doesn't animate, the root cause could be: (a) the Swiper JS file failed to load, (b) jQuery (a Swiper dependency) wasn't loaded first, (c) the CSS file is missing, or (d) the initialization script runs before the DOM is ready. Tracing the dependency chain from HTML entry → CSS/JS assets → runtime initialization is the systematic way to diagnose such failures.

---

# §1 Test Design — Verification Steps

## Step 1: Trace the entry HTML → CSS dependency chain
**Action**: For `Arter/index.html`, open the file and identify all `<link>` tags in `<head>`. Verify each `href` resolves to an existing file under `Arter/css/`.
**Expected**: Three plugin CSS files (`bootstrap.min.css`, `swiper.min.css`, `fancybox.min.css`) and one custom CSS (`style.css`) are linked. All paths resolve.
**File**: `/Users/yi/YrY/Websites/Arter/index.html`

## Step 2: Trace the HTML → JS dependency chain with execution order
**Action**: For `Arter/index.html`, identify all `<script>` tags (both in `<head>` and at the end of `<body>`). Verify the load order respects the dependency graph: jQuery must load before Bootstrap JS, which must load before Swiper, which must load before `main.js`.
**Expected**: Script order is `jquery.min.js` → (Bootstrap not loaded as script in Arter) → `swiper.min.js` → `fancybox.min.js` → `isotope.min.js` → `main.js`. Each file exists.
**File**: `/Users/yi/YrY/Websites/Arter/index.html` + `/Users/yi/YrY/Websites/Arter/js/plugins/`

## Step 3: Verify runtime initialization in the custom JS file
**Action**: Read `Arter/js/main.js` and identify the DOM-ready guard (`$(document).ready()` or `DOMContentLoaded`). Confirm that Swiper, Fancybox, and Isotope are initialized only after the DOM is fully parsed.
**Expected**: `main.js` contains initialization calls wrapped in a DOM-ready guard. All plugin constructors (`new Swiper(...)`, `$().fancybox(...)`, `$().isotope(...)`) are called with valid CSS selectors that match elements in `index.html`.
**File**: `/Users/yi/YrY/Websites/Arter/js/main.js` + `/Users/yi/YrY/Websites/Arter/index.html`

## Step 4: Trace the build-pipeline data flow for Adminto (gulp-based)
**Action**: Read `Adminto/Admin/gulpfile.js` and identify the build steps: what source files are processed (SCSS → CSS, JS concat + uglify), where the output lands (`dist/`), and what triggers a rebuild.
**Expected**: Gulp tasks include `sass` (SCSS → CSS), `scripts` (concat + uglify JS), `fileinclude` (partials → full HTML). Source lives in `src/`, output lands in `dist/`.
**File**: `/Users/yi/YrY/Websites/Adminto/Admin/gulpfile.js`

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `Arter/index.html` | file | Portfolio entry point. 4 CSS `<link>` tags in `<head>`, 5 JS `<script>` tags at end of `<body>` |
| `Arter/css/style.css` | file | Custom SCSS-compiled stylesheet (~3000 lines) with color theme variables |
| `Arter/css/plugins/bootstrap.min.css` | file | Bootstrap 4.x minified CSS (grid, utilities, components) |
| `Arter/css/plugins/swiper.min.css` | file | Swiper slider CSS (slide transitions, pagination bullets) |
| `Arter/css/plugins/fancybox.min.css` | file | Fancybox lightbox CSS (overlay, zoom animation) |
| `Arter/js/plugins/jquery.min.js` | file | jQuery 3.x — foundation for Bootstrap JS, Isotope, Fancybox |
| `Arter/js/plugins/swiper.min.js` | file | Swiper 8.x — touch slider JS |
| `Arter/js/plugins/fancybox.min.js` | file | Fancybox — image/video lightbox JS |
| `Arter/js/plugins/isotope.min.js` | file | Isotope — masonry/filter grid JS |
| `Arter/js/main.js` | file | Custom JS — DOM-ready guard with Swiper/Fancybox/Isotope init |
| `Adminto/Admin/gulpfile.js` | file | Gulp 4 build pipeline: SCSS → CSS, file-include → HTML, concat + uglify JS |
| `Adminto/Admin/src/` | dir | Gulp source: SCSS partials, JS modules, HTML partials (`main.html`, `menu.html`) |
| `Adminto/Admin/dist/` | dir | Gulp output: compiled CSS (`app.css`), bundled JS (`app.js`), final HTML pages |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Arter/index.html links 4 CSS files; all `href` paths resolve under `Arter/css/` |
| 2 | ✅ | Script order confirmed: jQuery → plugins (swiper, fancybox, isotope) → main.js; all files exist |
| 3 | ✅ | main.js wraps initialization in DOM-ready; selectors match HTML elements |
| 4 | ✅ | Adminto gulpfile defines sass, scripts, fileinclude tasks; src → dist pipeline confirmed |

**Overall**: pass — 4/4 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- Some websites (e.g., `Duck`) load React and TweenMax from CDN URLs rather than local files. If the CDN is unavailable, the page silently degrades — no error handling for CDN load failures exists in any template.
- The `Flow` website (Vue 3 + Vite) has a fundamentally different data flow: TypeScript source → Vite dev server HMR or build → bundled output, not a direct HTML → CSS/JS path like the other 13 websites.
- Several websites use inline `<script>` blocks in HTML (e.g., `Cards/index.html`) — these execute immediately during HTML parsing and are not captured by a file-level dependency scan.

## Suggested Improvements
- Add `<script>` `onerror` handlers for CDN-loaded dependencies with fallback to local copies, ensuring graceful degradation.
- Create a dependency graph visualization (Mermaid flowchart) showing the load order for the most complex website (`Adminto`) to serve as onboarding documentation.
- For websites with SCSS source (`Arter`, `Kasy`, `DpMarket`), document the SCSS compilation command so future contributors can regenerate CSS from modified source.

## Limitations
- This trace covers only the static file load chain; browser DevTools performance tracing (network waterfall, JS execution timeline) is out of scope.
- The exact initialization order of inline `<script>` blocks varies by browser and is not exhaustively verified here.
