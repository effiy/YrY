# `chrome.scripting` — Programmatic Code Injection

> `chrome.scripting` is the MV3 replacement for the MV2
> `chrome.tabs.executeScript` and `chrome.tabs.insertCSS`. It runs
> code in web pages from the service worker, with explicit targets
> and an explicit permission boundary.

## Two Ways to Run Code on a Page

1. **Manifest content scripts** (declared in `manifest.json`).
   They run on every matching page load, automatically. No JS
   needed to inject them.
2. **`chrome.scripting`** (called from the service worker). You
   inject code on demand — typically when the user clicks the
   action or a keyboard shortcut fires.

If the code must run on every page load, declare a content script.
If it runs in response to a gesture, use `chrome.scripting`. The
distinction matters because content scripts wake the worker for
every match; `chrome.scripting` only runs when you call it.

## Permission

Add `"scripting"` to `permissions`. To run in a specific origin,
add the origin to `host_permissions` (or `optional_host_permissions`).

```jsonc
{
  "permissions": ["scripting"],
  "host_permissions": ["https://example.com/*"]
}
```

`activeTab` is enough when the script only runs in the current
tab, after a user gesture.

## `executeScript`

```js
// In the service worker, after a user click:
const [result] = await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: (selector) => {
    const el = document.querySelector(selector);
    return el ? el.textContent : null;
  },
  args: ["h1"],
});
console.log(result.result); // page heading, or null
```

Notes:

- `func` is a *function* in the extension world, but Chrome
  serializes its body and runs it in the page's isolated world.
  No closures, no top-level imports — the function must be
  self-contained.
- `args` is an array of JSON-serializable values passed to `func`.
- The return value is wrapped: `[ { result, frameId, documentId } ]`.
  For a single tab/frame, the first element is what you want.

## `insertCSS` and `removeCSS`

```js
// Add a stylesheet:
const css = ".my-highlight { background: yellow; }";
await chrome.scripting.insertCSS({
  target: { tabId },
  css,
});

// Or load it from a file in the bundle:
await chrome.scripting.insertCSS({
  target: { tabId },
  files: ["highlight.css"],
});

// And later, remove it:
await chrome.scripting.removeCSS({
  target: { tabId },
  files: ["highlight.css"],
});
```

`insertCSS` returns a `styleKey` you can store and pass to
`removeCSS` to be precise. By default, removing with the same
`files` removes all matching insertions.

## Targeting Specific Frames and Documents

```js
await chrome.scripting.executeScript({
  target: {
    tabId,
    frameIds: [0],              // top frame only
    // documentIds: ["…"],      // specific document, not frame
  },
  func: () => document.title,
});
```

- `frameIds: [0]` is the top frame. Other numbers are iframes.
- `documentIds` targets a specific document (post-navigation
  state). This survives same-origin navigations in the frame.
- Omit both to target all frames — almost never what you want,
  and slow.

## Dynamic Content Scripts with `registeredContentScripts`

`chrome.scripting.registeredContentScripts` lets you manage
content scripts at runtime, without redeploying the extension.

```js
// Register a script for a specific origin, on demand:
const id = await chrome.scripting.registeredContentScripts.register({
  id: "example-helper",
  matches: ["https://example.com/*"],
  js: [{ file: "content.js" }],
  runAt: "document_start",
});

// Later, update it:
await chrome.scripting.registeredContentScripts.update([{
  id: "example-helper",
  matches: ["https://example.com/*", "https://example.org/*"],
}]);

// Or remove it:
await chrome.scripting.registeredContentScripts.unregister({
  ids: ["example-helper"],
});
```

Use this when the set of origins or scripts depends on user
preferences or a remote config. The script runs on every page
load *after* registration, just like a manifest script.

## World Selection

By default, the script runs in the `ISOLATED` world — it can read
the page's DOM but cannot see the page's JS variables. To run in
the page's world (e.g. to monkey-patch a global), pass
`world: "MAIN"`:

```js
await chrome.scripting.executeScript({
  target: { tabId },
  world: "MAIN",
  func: () => { window.myHook = (x) => console.log(x); },
});
```

`MAIN` is a bigger attack surface (the page can call your
function) and a Web Store review flag. Prefer `ISOLATED` unless
you have a concrete reason. For a Tampermonkey-style "I want to
be in the page world" use case, prefer `chrome.userScripts` with
`world: "USER_SCRIPT"` (see `user-scripts.md`).

## Permission Edge Cases

- **`activeTab`** lets you `executeScript` in the current tab
  after a user gesture. You don't need the origin in
  `host_permissions` for that call.
- **`host_permissions`** is required for cross-origin scripts
  (i.e. origins you didn't get via `activeTab`).
- **`scripting` permission** is always required, even with
  `activeTab`.

## Common Mistakes

- **Capturing variables in `func`.** Closures don't survive
  serialization. Pass everything you need via `args`.
- **Targeting `allFrames: true` when you meant `frameIds: [0]`.**
  The first runs in every iframe; the second is the top frame.
- **Forgetting to clean up CSS.** `insertCSS` persists in the
  page until you call `removeCSS` or the tab is closed. A
  highlighter that "leaks" styles across tabs is a common bug.
- **Calling `executeScript` from a content script.** The
  `chrome.scripting` API is service-worker only. Content scripts
  must `sendMessage` to the worker and have it execute the call.
- **Expecting `func` to return a non-serializable value.** It can
  return a promise (Chrome awaits it), but the resolved value
  must be JSON-serializable. Functions, DOM nodes, and `Map`s
  are not — convert to plain objects first.
