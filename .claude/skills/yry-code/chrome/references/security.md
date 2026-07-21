# Security & Permissions

> The extension zip is public. Treat every line of code as
> attacker-visible, and treat every permission as a friction point
> the user has to clear.

## The Permissions Model in One Paragraph

Chrome asks the user to approve the union of `permissions` and
`host_permissions` at install time. `optional_permissions` and
`optional_host_permissions` are *not* requested until you call
`chrome.permissions.request(...)` at runtime, and the user can
deny. `activeTab` is special: it grants temporary access to the
current tab *after* a user gesture on the extension (clicking the
action, running a keyboard shortcut) and produces no install
warning.

## Decision Tree

```
Need to read/modify the current tab on user click?
  └─ Yes → "activeTab" is almost always enough.

Need to touch a specific origin on every page load?
  └─ Yes → add to "host_permissions" + content script.

Need to touch an origin but only sometimes?
  └─ Yes → "optional_host_permissions" + chrome.permissions.request.

Need to call a Chrome API?
  └─ Check whether the API needs a permission at all.
     Some don't: "runtime", "i18n", "extension" are always available.
```

## Content Security Policy

MV3 enforces a strict default CSP:

```
script-src 'self'; object-src 'self';
```

Concretely:

- No `https://cdn.example.com/jquery.js` — bundle locally.
- No `<script>doThing()</script>` — split into a `.js` file.
- No `eval`, `new Function`, `setTimeout("…", 0)`, `setInterval("…")`.
- `'unsafe-inline'` is **not** a knob you should reach for.

If you have a legitimate reason to relax the CSP (e.g. a build
artifact needs `wasm-unsafe-eval`), override `content_security_policy`
in the manifest *and* explain it in the Web Store listing.

## `host_permissions` and the Review

`<all_urls>` in `host_permissions` is the most common reason
extensions fail Web Store review. Chrome requires you to justify
broad host access in the **Single Purpose** field of the listing.
If your extension only needs to interact with the active tab, prefer
`activeTab`. If it needs to run on a specific origin, scope to that
origin.

## `activeTab` vs `host_permissions`

| | `activeTab` | `host_permissions` |
|---|---|---|
| Install warning | none | yes, full permission warning |
| Tab access | current tab after user gesture | any matching tab, any time |
| Content scripts | not granted | granted |
| `chrome.tabs.executeScript` | allowed (current tab only) | allowed on matching tabs |

`activeTab` is the right answer for "the user clicked the icon, do
something to this tab". It is *not* the right answer for "I need
this to run on every page load".

## Message Passing Safety

Every `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage` call
crosses a trust boundary. The receiver has no idea who sent the
message.

- **Validate the sender.** In the service worker, check
  `sender.id === chrome.runtime.id` for messages from your own
  extension, and inspect `sender.url` / `sender.origin` for messages
  from content scripts.
- **Never trust message payloads.** Treat them as untrusted input:
  validate shape, validate types, escape before injecting into the
  DOM.
- **Don't put secrets in messages.** Once a message is in a content
  script, the page can read it.
- **Use `chrome.runtime.connect` for long-lived channels.** The
  `sendMessage` API is fire-and-forget; if you need a request/response
  stream, open a `Port`.

```js
// background.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;          // not from us
  if (!sender.url?.startsWith(chrome.runtime.getURL(""))) return; // not from our content scripts
  if (typeof msg?.type !== "string") return;
  // ... handle msg
  return true; // keep the channel open for async sendResponse
});
```

## Secret Handling

The extension bundle is a zip that anyone can download. There are
no secrets in an MV3 extension.

- **API keys**: don't ship one. Either proxy through a backend you
  control, or have the user provide their own key.
- **OAuth**: use the **PKCE flow** with `chrome.identity.launchWebAuthFlow`.
  Never ship a `client_secret` — public clients (PKCE) exist
  exactly because extension clients cannot keep secrets.
- **Tokens**: keep them in `chrome.storage.local` and request
  `storage` permission. Do not write tokens to `localStorage` in a
  popup — `chrome.storage` survives extension updates and worker
  restarts.

## `chrome.storage` Gotchas

- `chrome.storage.local` is per-extension, per-profile, persisted.
- `chrome.storage.sync` is *also* synced across the user's signed-in
  browsers. Quota is small (~100 KB total, 8 KB/item). Use it for
  preferences, not for data.
- Both APIs are async (`Promise`-based in MV3). Do not call them on
  the popup's critical path unless you must; lazy-load after first
  paint.

## Content Script ↔ Page Boundary

A content script runs in an *isolated world* — it can read the
page's DOM but cannot see the page's JS variables. The page cannot
see the content script's variables either. To bridge the two, you
either:

- Set `world: "MAIN"` in the manifest and use `window` directly.
  Powerful and dangerous: the page can call into your script and
  the other way around.
- Inject a `<script>` element from the content script to bring a
  page-world function into scope, and dispatch `CustomEvent` to
  hand data back. This is the typical "share data with the page"
  pattern.

If you don't *need* page-world access, stay in the isolated world.

## `web_accessible_resources`

Files listed here are reachable from the web at a
`chrome-extension://<id>/<path>` URL. Anything you put in this list
should be safe to expose to the public — assume any web page can
fetch and inspect it.

## Subresource Integrity and Bundled Dependencies

- Bundle all dependencies. `npm install` everything; do not point
  at a CDN.
- For packages you can't bundle (rare), use SRI in the `<script>` tag
  *and* override the CSP to whitelist the host.
- Pin transitive dependencies. A malicious minor version of a
  package should not auto-ship to all your users.

## `declarativeNetRequest` vs `webRequest`

- `webRequest` is still available in MV3 for *observation* (e.g.
  counting requests, logging headers) but **cannot block** requests.
- For blocking, redirecting, or modifying requests, use
  `declarativeNetRequest` and ship rule files. The browser evaluates
  the rules natively, which is faster and more private than running
  JS in the request pipeline.

## Things to Verify Before Shipping

- [ ] No `<all_urls>` unless you really need it.
- [ ] No `'unsafe-inline'` / `'unsafe-eval'` in the CSP.
- [ ] No remote `<script src="https://…">`.
- [ ] No API keys, OAuth client secrets, or signing keys in the
      bundle.
- [ ] All `chrome.runtime.onMessage` handlers validate `sender.id`
      and payload shape.
- [ ] No tokens or PII in `localStorage`; use `chrome.storage`.
- [ ] The privacy disclosure in the Web Store listing matches what
      the extension actually does.
