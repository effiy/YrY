# Engineering & Publishing

> This file is about the *plumbing* — TypeScript, bundlers, tests,
> CI, versioning, and the Chrome Web Store submission.

## Project Layout

There is no mandated layout. A pragmatic default for a hand-rolled
extension:

```
my-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   └── index.ts            # service worker entry
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── options/                # same shape as popup/
│   ├── content/                # content script entry
│   └── shared/                 # message types, utilities
├── public/
│   ├── icons/                  # 16, 32, 48, 128 px PNGs
│   └── _locales/<lang>/messages.json
├── rules/                      # declarativeNetRequest rule files
├── tests/
│   ├── unit/                   # vitest / jest
│   └── e2e/                    # playwright (chromium channel)
├── package.json
├── tsconfig.json
└── vite.config.ts              # or webpack, or rollup
```

Frameworks like **WXT** and **Plasmo** provide this layout (and
auto-reload, manifest generation, etc.) out of the box. If you
don't need their batteries, a plain Vite config with multiple
input entries is plenty.

## TypeScript

- `"module": "ESNext"`, `"moduleResolution": "Bundler"` for the
  worker and popup.
- Add `@types/chrome` to the dev dependencies. It declares
  `chrome.*` namespaces and catches API typos at compile time.
- `tsc --noEmit` in CI. Don't ship a build that has type errors
  just because Vite silenced them with esbuild.
- Strict mode (`"strict": true`) catches the kind of optional
  property access that bites you when an API returns `undefined`.

## Bundling

- **One bundle per entry.** Vite's `build.rollupOptions.input`
  array lets you declare multiple entries; each becomes a chunk the
  extension can reference from `manifest.json`.
- **Hashed filenames are fine in dev** but Chrome reads the path
  from the manifest at install time. Either disable hashing in
  production or generate the manifest *after* the build.
- **Source maps.** Include them in dev builds; strip them from
  production builds that go to the Web Store (the zip should be
  small and the source is otherwise trivially decompilable anyway).
- **CSS imports.** Plain `import "./popup.css"` works in Vite. The
  emitted HTML gets a `<link>` tag.

## Manifest Generation

For anything beyond a toy extension, generate `manifest.json` from
TypeScript or a JSON-with-comments variant. Two reasons:

1. The same `version` field has to live in three places:
   `manifest.json`, the Web Store dashboard, and the GitHub
   release tag. Centralize.
2. Conditional sections (e.g. dev-only `host_permissions`) are
   easier to express in code than in JSON.

A minimal pattern:

```ts
// scripts/build-manifest.ts
import pkg from "../package.json" with { type: "json" };
import base from "./manifest.base.json" with { type: "json" };

export default {
  ...base,
  version: pkg.version,
  // override per environment
};
```

## Testing

### Unit tests (Vitest / Jest)

- Pure functions in `src/shared/` are the easy wins.
- Mock `chrome.*` via a small shim. `@types/chrome` does not
  provide a runtime; you need a stub.
- `vitest --environment jsdom` if your shared code touches the DOM
  in any way (e.g. parsing a content script's payload).

### End-to-end (Playwright on Chromium)

Playwright's `chromium` channel is a real Chrome with the
extension APIs available. To load an unpacked extension:

```ts
import { chromium } from "playwright";
import path from "node:path";

const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "ext-"));
const context = await chromium.launchPersistentContext(userDataDir, {
  channel: "chromium",
  args: [
    `--disable-extensions-except=${path.resolve("dist")}`,
    `--load-extension=${path.resolve("dist")}`,
    "--headless=new",  // optional; the new headless supports extensions
  ],
});

const extensionId = await getExtensionId(context); // read from service worker page
const popup = context.newPage();
await popup.goto(`chrome-extension://${extensionId}/popup.html`);
```

Tips:

- **Read the extension id from the service worker page.** Chrome
  assigns a deterministic id based on the manifest's `key` field;
  in tests, just grab the first service worker page's URL.
- **Reset state between tests.** Clear `chrome.storage.local` via
  `await page.evaluate(() => chrome.storage.local.clear())`.
- **Test the popup, options page, and content script separately.**
  Each has its own page; each needs its own test fixture.

### Manual smoke test

- `chrome://extensions` → enable Developer mode → "Load unpacked"
  → pick `dist/`. Reload after every rebuild.
- "Inspect views: service worker" opens the DevTools for the
  worker. Console logs survive worker restarts.
- Use `chrome://extensions` → "Errors" to surface manifest or
  runtime errors. The Web Store will surface the same class of
  issues.

## Versioning

- `version` in `manifest.json` is a semver string with no
  pre-release suffix.
- Chrome's auto-update picks up the highest version on the Web
  Store. You can never ship `1.0.0` after `1.0.1`.
- Reserve major bumps for breaking changes to the extension's
  surface (renamed commands, removed features). Most updates are
  `0.0.x` or `0.x.0`.
- Tag the GitHub release with the same version string. The Web
  Store dashboard and the GitHub tag should match.

## Chrome Web Store Submission

1. **Build the production zip.** `npm run build && zip -r dist.zip
   dist/`. The zip's top level should contain `manifest.json` and
   the rest of the bundle — no intermediate `dist/` directory.
2. **Create a developer account** at
   [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
   ($5 one-time fee).
3. **Upload the zip.** Fill in:
   - **Detailed description** (longer than `manifest.description`).
   - **Single purpose** — one or two sentences on what the
     extension does. Be specific.
   - **Permission justifications** — for each `permission` and
     `host_permissions`, explain *why* you need it. Be honest;
     vague justifications trigger rejections.
   - **Privacy practices** — disclose every data type you collect,
     every network request you make, every third-party service.
     The Web Store has a structured form; fill it in.
4. **Screenshots.** 1280×800 or 640×400 PNG. Show the popup, the
   options page, and the extension in action on a real page.
5. **Submit for review.** First review takes a few days; subsequent
   updates are usually hours.
6. **Monitor the dashboard** for review feedback. Rejections cite a
   specific policy; fix the underlying issue, not just the symptom.

## Review Checklist

- [ ] Extension does one thing well. (Single purpose.)
- [ ] No `<all_urls>` unless justified in the listing.
- [ ] No remote code, no `eval`, no inline scripts.
- [ ] Permissions have a real consumer in the code.
- [ ] No `webRequest` blocking (use `declarativeNetRequest`).
- [ ] Privacy disclosure matches behavior.
- [ ] Icons at 16, 48, 128 px.
- [ ] Description is ≤ 132 chars and honest.
- [ ] No emoji in `name` / `description`.
- [ ] Screenshots show the actual UI, not a mockup with "Coming
      soon" placeholders.

## Update Cadence

- **Ship small, ship often.** The Web Store review queue moves
  faster for incremental updates.
- **Self-host updates** (the `update_url` mechanism) is a power
  move — only use it for enterprise / internal distributions. The
  Web Store is the right default.
- **Deprecate cleanly.** When a feature goes away, remove it from
  the manifest and the Web Store listing. Leaving a `permission`
  you no longer use is a review failure.

## CI Suggestions

- `npm run lint` (ESLint with the TypeScript ruleset)
- `npm run typecheck` (`tsc --noEmit`)
- `npm run test` (Vitest)
- `npm run test:e2e` (Playwright, runs against the built `dist/`)
- `npm run build` (Vite production build)
- A weekly or daily scheduled `npm audit` for transitive
  dependency CVEs.

## Common Mistakes

- Shipping a build with `console.log` left in.
- Forgetting to bump `version` between submissions.
- Including a `.map` file in the production zip (you don't want
  your code trivially decompilable, though the source is already
  public).
- Reusing a single Vite bundle for background + popup — they
  have different shapes, different sizes, and different entry
  points. Declare both.
- Testing against `chromium` from Puppeteer — it has the right
  APIs but a different extension id strategy. Playwright with the
  `chromium` channel is closer to what the Web Store will see.
