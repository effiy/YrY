# §0 Effect Sketch — Pre-Commit Incremental Self-Check

**What this scene demonstrates**: Before committing changes to the Websites project, a developer runs a lightweight incremental check that focuses only on the files that changed — not the entire 14-website collection. The check verifies that modified HTML files have no broken asset links, that edited CSS files have valid syntax, and that any change to a shared third-party library (e.g., upgrading jQuery in one website) is intentional and documented.

**Why it matters**: A full post-init check across 14 websites with 282 HTML pages takes too long to run before every commit. The incremental check runs in under 5 seconds by scoping to the `git diff` output, making it practical as a pre-commit hook. It catches the most common mistakes — broken links from renamed/moved files, accidentally committed debug code (`console.log`), and unintended file deletions — before they enter the repository.

---

# §1 Test Design — Verification Steps

## Step 1: Identify changed files via git diff
**Action**: Run `git diff --name-only HEAD` to list all changed files. Filter to `.html`, `.css`, `.js`, `.scss` extensions. For each changed file, determine which website it belongs to.
**Expected**: The output is a concise list of changed files grouped by website. If zero files changed, the check passes immediately.
**File**: `/Users/yi/YrY/Websites/` (git working directory)

## Step 2: Validate asset paths in changed HTML files
**Action**: For each changed `.html` file, extract all relative `<link href>`, `<script src>`, and `<img src>` references. Verify each target exists relative to the HTML file's directory.
**Expected**: All asset references in changed HTML files resolve successfully.
**File**: `git diff --name-only` output (filtered for `*.html`)

## Step 3: Validate syntax of changed CSS files
**Action**: For each changed `.css` file, check for common syntax errors: unclosed braces `{` without matching `}`, missing semicolons after property values, invalid hex color codes.
**Expected**: Changed CSS files are syntactically valid.
**File**: `git diff --name-only` output (filtered for `*.css`)

## Step 4: Check for accidental console.log / debugger statements in changed JS files
**Action**: For each changed `.js` file, search for `console.log`, `console.debug`, `debugger`, and `alert(` statements. Flag any occurrences as potential debugging artifacts.
**Expected**: Zero debug/alert statements in production JS files.
**File**: `git diff --name-only` output (filtered for `*.js`)

## Step 5: If a third-party library was modified, confirm the change is intentional
**Action**: Check if any changed file matches a known third-party library path (`*/plugins/*`, `*/vendor/*`, `*/libs/*`, `*/dist/*`). If so, verify that the `git diff` for that file shows only expected changes (version bump, not accidental modification).
**Expected**: Third-party library changes are intentional version upgrades. Any unexpected modification is flagged.
**File**: `git diff --name-only` output (filtered for `*/plugins/*`, `*/vendor/*`, `*/libs/*`)

---

# §2 Output Inventory

| File/Directory | Type | Description |
|---------------|------|-------------|
| `/Users/yi/YrY/Websites/.gitignore` | file | Git ignore rules — excludes `node_modules/`, but does not exclude compiled output |
| `*/*.html` | file | HTML pages (282 total) — check focuses on git diff subset |
| `*/css/**/*.css` | file | CSS stylesheets — check for syntax errors in changed files |
| `*/js/**/*.js` | file | JS scripts — check for debug statements in changed files |
| `*/js/plugins/` | dir | Third-party JS libraries — flag any unexpected modifications |

---

# §3 Test Report — 2026-07-21

| Step | Result | Notes |
|------|:---:|-------|
| 1 | ✅ | Git diff identified changed files; grouping by website works correctly |
| 2 | ✅ | Changed HTML files have valid asset paths; all `<link>` and `<script>` references resolve |
| 3 | ✅ | Changed CSS files pass syntax validation; no unclosed braces or invalid properties |
| 4 | ✅ | No `console.log`, `debugger`, or `alert()` found in changed JS files |
| 5 | ✅ | No third-party library files were modified; all changes are to custom code only |

**Overall**: pass — 5/5 steps passed

---

# §4 Self-Improvement

## Edge Cases Found
- If a developer renames a CSS file (e.g., `style.css` → `main.css`) but forgets to update the `<link>` tag in the HTML, the incremental check would catch the broken link in step 2 — but only if the HTML file is also in the git diff. If only the CSS rename is committed, no HTML change is in the diff, and the broken link escapes detection.
- The check for `console.log` in step 4 uses a simple grep — it cannot distinguish between a `console.log` that's inside a comment block and one that is live code. False positives are possible but harmless (they prompt a human review).
- If a developer makes changes across multiple websites in one commit (e.g., upgrading jQuery in both Arter and Blog), the incremental check handles all changed files correctly but provides no cross-website consistency validation (that belongs to the full post-init check).

## Suggested Improvements
- Add a hook to detect when a CSS/JS file is renamed or moved — automatically check all HTML files in the same website for broken references, even if the HTML files weren't in the diff.
- Integrate the pre-commit check into `.git/hooks/pre-commit` so it runs automatically before every `git commit`, blocking the commit if any step fails.
- Add a step to validate `.scss` syntax for changed SCSS files (currently only `.css` is checked). However, since SCSS compilation is not standardized across all websites, this would require installing a SCSS compiler.

## Limitations
- This check is file-level, not semantic-level — it catches broken paths and syntax errors but not logic bugs (e.g., a JavaScript function that silently returns the wrong value).
- The check requires a git repository context; it does not work on a plain directory copy without `.git/`.
- Cross-website consistency (e.g., ensuring Bootstrap version is the same across all templates that claim to use it) is not checked here — that's a full-scan concern.
