# `manifest.json` — Field Reference

> Source of truth: [developer.chrome.com/docs/extensions/reference/manifest](https://developer.chrome.com/docs/extensions/reference/manifest).
> This file captures judgment, not the full schema.

## Required Fields

| Field | Type | Notes |
|---|---|---|
| `manifest_version` | `3` | Hard requirement. Do not emit `2`. |
| `name` | string | Short, title-cased. The Web Store shows this verbatim. |
| `version` | semver string | `MAJOR.MINOR.PATCH`. Monotonically increasing. |
| `description` | string | ≤ 132 chars. Plain language — no marketing fluff, no emoji. The Web Store rejects "best" / "#1" / "amazing". |

## Top-Level Layout

```jsonc
{
  "manifest_version": 3,
  "name": "Example",
  "version": "1.0.0",
  "description": "Highlights the current tab's reading time.",
  "icons": { "16": "icons/16.png", "48": "icons/48.png", "128": "icons/128.png" },
  "action": { "default_popup": "popup.html", "default_icon": { ... } },
  "background": { "service_worker": "background.js", "type": "module" },
  "permissions": ["storage", "alarms"],
  "host_permissions": [],
  "optional_permissions": [],
  "optional_host_permissions": [],
  "content_scripts": [],
  "options_ui": { "page": "options.html", "open_in_tab": true },
  "web_accessible_resources": [],
  "commands": { "_execute_action": { "suggested_key": { "default": "Ctrl+Shift+Y" } } }
}
```

## `action` (toolbar UI)

- Replaces `browser_action` and `page_action` from MV2.
- `default_popup` — HTML path. The popup is a normal web page with
  no Chrome APIs of its own; route to the service worker for state.
- `default_icon` — a multi-size map, not a single PNG.
- `default_title` — used for the tooltip and screen-reader label.

```jsonc
"action": {
  "default_popup": "popup.html",
  "default_title": "Reading time",
  "default_icon": { "16": "icons/16.png", "32": "icons/32.png" }
}
```

## `background` (service worker)

- `service_worker` — path to a JS file. The file runs on every event
  the worker handles, then is torn down after ~30s of idle.
- `type: "module"` — opt in to ES modules. Use this whenever you
  need `import` or top-level `await` in the worker.
- Do not assume DOM access; the service worker has no `window`.

```jsonc
"background": {
  "service_worker": "background.js",
  "type": "module"
}
```

## `permissions` vs `host_permissions` vs `optional_*`

- `permissions` — Chrome API namespaces (`storage`, `alarms`, `tabs`,
  `scripting`, `declarativeNetRequest`, …).
- `host_permissions` — origin patterns (`https://example.com/*`).
  These trigger a full permission warning on install.
- `optional_permissions` + `optional_host_permissions` — requested
  at runtime via `chrome.permissions.request(...)`. No install
  warning; the user can deny.
- `activeTab` (in `permissions`) — gives temporary host access to
  the current tab *after* a user gesture on the extension. This is
  almost always the right answer for "I need to read the current
  page".

**Rule of thumb:** if a feature only needs access to the tab the
user just clicked, use `activeTab`. If it needs access to specific
origins, use `optional_host_permissions` and request on demand.
Reserve `host_permissions` for cases where the user must pre-authorize
all matching tabs (e.g. a content script that runs on every page
load).

## `content_scripts`

- `matches` — required, an array of match patterns. `<all_urls>` is
  the single biggest review failure; scope to origins when possible.
- `js` / `css` — file paths inside the extension bundle.
- `run_at` — `document_start` | `document_end` | `document_idle`.
  Default is `document_idle`; pick `document_start` only when you
  must intercept something before the page runs.
- `world` — `ISOLATED` (default) or `MAIN`. `MAIN` lets the content
  script share the page's JS context; it is a much bigger review
  surface, use sparingly.
- `all_frames` — `true` if the script should also run in iframes.

```jsonc
"content_scripts": [{
  "matches": ["https://example.com/*"],
  "js": ["content.js"],
  "css": ["content.css"],
  "run_at": "document_idle"
}]
```

## `web_accessible_resources`

- Required for any file a content script on a web page needs to
  inject into the page DOM (images, additional JS, CSS).
- MV3 requires the `resources` array and a `matches` array; the
  old MV2 "string" form is invalid.

```jsonc
"web_accessible_resources": [{
  "resources": ["images/injected.png"],
  "matches": ["https://example.com/*"]
}]
```

## `options_ui`

- `page` — HTML path. Same shape as a popup.
- `open_in_tab` — `true` for a full-tab page, `false` to embed in
  Chrome's options chrome (very narrow viewport, rarely useful).

## `commands` (keyboard shortcuts)

```jsonc
"commands": {
  "toggle-reading-time": {
    "suggested_key": { "default": "Ctrl+Shift+Y", "mac": "Command+Shift+Y" },
    "description": "Toggle reading time display"
  }
}
```

The key is a free string you handle yourself in
`chrome.commands.onCommand`. `_execute_action` is a reserved key
that opens the popup.

## `icons`

Provide 16, 48, and 128 px PNGs. Chrome picks the right one for
the toolbar, the Web Store listing, and the install dialog. SVG is
not accepted for the manifest icons themselves; you can ship an SVG
inside the bundle and reference it from HTML if you want.

## `declarative_net_request` (a common MV3 swap)

If you used MV2 `webRequest` to block or modify requests, you
probably want `declarativeNetRequest` in MV3. Add the permission
and ship a rules file:

```jsonc
"permissions": ["declarativeNetRequest"],
"declarative_net_request": {
  "rule_resources": [{
    "id": "ruleset_1",
    "path": "rules.json",
    "enabled": true
  }]
}
```

`webRequest` is still available in MV3 for *observing* requests,
but it can no longer block them.

## Default `content_security_policy`

Chrome injects a default CSP for MV3 extensions:

```
script-src 'self'; object-src 'self';
```

That means:

- No remote scripts.
- No inline `<script>`. Use a separate JS file.
- No `eval`, `new Function`, `setTimeout(string, …)`.

If you need a nonce-based inline script (rare), override `csp` in
the manifest. Don't.

## Internationalization

- `name` and `description` can use `__MSG_key__` placeholders.
- Provide a `default_locale` and a `_locales/<lang>/messages.json`
  per language you support.

```jsonc
"name": "__MSG_extName__",
"description": "__MSG_extDescription__",
"default_locale": "en"
```

## Versioning Rules

- `version` must be parseable as dotted numbers (`1`, `1.0`, `1.0.0`
  are all fine; `1.0.0-beta` is not).
- The Web Store refuses non-monotonic updates. You can never ship
  `1.0.0` after `1.0.1`.
- Reserve a bump for a real change. `0.0.x` is fine for "bug fixes
  to the same feature set".

## Common Mistakes

- Omitting `default_locale` while using `__MSG_*__` placeholders.
- Setting `background.scripts` (MV2) instead of
  `background.service_worker`.
- Putting `<all_urls>` in `host_permissions` to "make the content
  script work" — scope it down.
- Including both `action` and `browser_action` — the latter is
  silently ignored and signals confusion.
