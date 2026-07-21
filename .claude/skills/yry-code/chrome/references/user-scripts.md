# User Scripts (`chrome.userScripts`)

> `chrome.userScripts` is the MV3 answer to Greasemonkey / Tampermonkey.
> It lets a user-scripts extension register scripts at runtime, with
> `@match`-style patterns, and run them in the page's world. Chrome 120+.

## What "User Scripts" Means

A user script is a JavaScript file that:

- Runs in the **page's world** (not the extension's isolated world).
- Is matched against a URL pattern (similar to content scripts).
- Can be installed, updated, and removed at runtime — typically from
  a script repository the user has chosen to trust.

The MV3 `userScripts` API is the review-friendly wrapper around
page-world script execution. If you're porting a Tampermonkey
extension, this is the API you want.

## Permission

```jsonc
{
  "permissions": ["userScripts"]
}
```

There is no `host_permissions` requirement for `userScripts`; the
match patterns are passed at registration time and are not
treated as host access in the Web Store review — with the
exception of a small set of "sensitive" sites (see below).

## Registering a Script

```js
await chrome.userScripts.register([{
  id: "my-script",
  matches: ["https://example.com/*"],
  js: [{ file: "my-script.user.js" }],
  runAt: "document_start",
  world: "USER_SCRIPT",
  allFrames: false,
}]);
```

The script file lives in the extension bundle. `matches` works
like content-script matches (`<all_urls>`, `*://*/*`, scheme
globs, etc.).

## `world: "USER_SCRIPT"` vs `world: "MAIN"`

`userScripts` accepts two worlds:

- **`USER_SCRIPT`** — runs in the page's window. The page can
  call your functions; you can call into the page's globals.
  `GM_info` is **not** injected automatically — provide it
  yourself or skip it.
- **`MAIN`** — same as `chrome.scripting` with `world: "MAIN"`.
  Functionally identical.

For most Tampermonkey-style scripts, `USER_SCRIPT` is the right
choice. Treat it as "I am in the page's world, with my own
isolated globals."

## Listing, Updating, and Removing

```js
// List registered scripts:
const { scripts } = await chrome.userScripts.getScripts();

// Update one:
await chrome.userScripts.update([{
  id: "my-script",
  matches: ["https://example.com/*", "https://example.org/*"],
}]);

// Remove by id:
await chrome.userScripts.unregister({ ids: ["my-script"] });
```

Registrations are per-profile and survive browser restarts, but
are lost when the extension is unloaded or disabled. The
extension itself is the source of truth — store script metadata
in `chrome.storage.local` and re-register on `onInstalled`.

## "Sensitive" Sites

The Web Store has stricter rules for scripts that target a
handful of "sensitive" sites (google.com, facebook.com,
youtube.com, and a few others). You can register against them
locally for personal use, but **distributing** an extension that
targets them is grounds for rejection. The list is published in
the Chrome extension docs.

If the user's script targets one of these sites, flag it and
recommend a sideloaded / unpacked install rather than a Web
Store publication.

## Differences from `chrome.scripting`

| | `chrome.userScripts` | `chrome.scripting` |
|---|---|---|
| Declared in manifest | no | no (permission required) |
| Runs on every page load | yes (after registration) | no (one-off `executeScript` call) |
| World | `USER_SCRIPT` (page) or `MAIN` | `ISOLATED` (default) or `MAIN` |
| Use when | Tampermonkey-style always-on scripts | one-off injection in response to a gesture |
| Sensitive-site restrictions | yes | no |
| Permissions needed | `userScripts` | `scripting` (+ `host_permissions` as needed) |

## Migrating a Tampermonkey Script — the Common Snags

- `GM_xmlhttpRequest` is **not** implemented in MV3 `userScripts`
  by design — it would let any user script bypass the page's
  CORS. Use `fetch` from the page world (still subject to CORS)
  or route through the service worker via
  `chrome.runtime.sendMessage` for privileged requests.
- `GM_info` and other `GM_*` helpers are not auto-injected. Define
  the subset you actually use inside the script.
- `@require` URLs that point at remote scripts are blocked by the
  extension's CSP. Inline the library into the user script
  (or bundle it with the extension and load it via
  `chrome.userScripts.register([...js])` with multiple entries).
- `unsafeWindow` is the page's `window` — that's the default in
  `USER_SCRIPT` world. No special API needed.
- `@match` / `@include` patterns translate to the `matches` array
  in the registration call. Drop the `// ==UserScript==` header;
  Chrome no longer parses it.

## Common Mistakes

- **Treating `USER_SCRIPT` like `ISOLATED`.** In `USER_SCRIPT`,
  the page can call your functions. Don't expose privileged
  helpers in the global scope.
- **Re-registering on every `onInstalled` without first
  unregistering.** `register` is not idempotent — if the same
  `id` is already registered, the call throws. Unregister first
  or use `update`.
- **Targeting sensitive sites in a published extension.** The
  Web Store will reject it. Suggest the user install it as an
  unpacked extension from your own site instead.
- **Hoping for `GM_xmlhttpRequest`.** It is not implemented in
  MV3 `userScripts`. Route through the service worker.
- **Loading a script from a remote URL.** MV3 forbids remote
  code; the script file must live in the extension bundle.
