# Side Panel (`chrome.sidePanel`)

> The MV3 side panel is a persistent, narrow pane that lives in the
> browser's side bar — Chrome 114+ on desktop. Use it when your
> extension's UI is *too big for a popup* but *too tied to the
> current tab for a full options page*.

## When to Pick a Side Panel

| Surface | Tradeoff |
|---|---|
| Popup (action) | Quick, ephemeral, gone on outside click. Best for toggles and one-shot actions. |
| Side panel | Persistent, scrollable, lives next to the page. Best for content that pairs with the current tab. |
| Options page | Independent of the page. Best for settings, account, dangerous actions. |

A panel is right when the user would say *"I want this open while I
read the page."* A popup is right when they'd say *"I want to do
one thing and move on."*

## Manifest

```jsonc
{
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "permissions": ["sidePanel"]
}
```

- `default_path` is required.
- The HTML file is a normal web page — same rules as a popup
  (no remote code, bundle CSS/JS, button `type="button"`).
- `sidePanel` is a permission without an install prompt; it just
  unlocks the API.

## Opening the Panel

Three ways to open the side panel, in increasing order of intent:

1. **From the action icon.** The user clicks the toolbar icon and
   the panel opens next to the current tab. The action icon
   becomes a panel-opener when you set `side_panel.default_path`
   *and* you do not set `action.default_popup`. The flow needs no
   JS in the service worker.

   ```jsonc
   "action": { "default_title": "Open my panel" }
   "side_panel": { "default_path": "sidepanel.html" }
   ```

2. **Programmatically, in response to a user gesture.** From the
   service worker, after a click or a keyboard shortcut:

   ```js
   // background.js
   chrome.sidePanel.open({ tabId: tab.id });
   ```

   This requires a user gesture in the recent past. A bare
   `sidePanel.open()` from `onInstalled` will silently fail.

3. **Auto-open on action click.** In the service worker:

   ```js
   await chrome.sidePanel.setPanelBehavior({
     openPanelOnActionClick: true
   });
   ```

   Use this when your `action` has no popup and you want clicks to
   always open the panel. Without it, the click is a no-op.

## Per-Tab Configuration

The same extension can show a *different* panel per tab — for
example, a reader mode panel only on article pages, and a clean
"nothing here" view on others.

```js
// In the service worker, when the user navigates:
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (tab.url?.startsWith("https://example.com/articles/")) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "reader.html",
      enabled: true
    });
  } else {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});
```

`setOptions` overrides the manifest's `default_path` for that tab.
`enabled: false` hides the side panel entry in the Chrome UI for
that tab.

## Service Worker ↔ Panel Contract

The panel is a regular web page. The service worker is not alive
unless something wakes it. Routing between them is the same
pattern as a popup:

```js
// sidepanel.js
const port = chrome.runtime.connect({ name: "sidepanel" });
port.postMessage({ type: "ping" });
port.onMessage.addListener((msg) => {
  if (msg.type === "pong") console.log("worker is alive");
});
```

```js
// background.js
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "sidepanel") return;
  port.postMessage({ type: "pong" });
});
```

Use `chrome.runtime.connect` (a long-lived `Port`) for streaming
data; use `sendMessage` for one-shot requests.

## Width and Persistence

- Chrome's default panel width is narrow (~300 px). The user can
  drag the divider; the position is per-user, per-extension. You
  cannot set a custom width from the extension.
- Persist view state (scroll position, last selected item) in
  `chrome.storage.session`. This survives panel closes but not
  browser quits, which is the right lifetime for view state.

## Navigation Inside the Panel

If the user clicks a link in the panel, you have to decide what
happens:

- **Open in the current tab** (replacing it):

  ```js
  chrome.tabs.update(tabId, { url: href });
  ```

- **Open in a new tab** (preserves the panel context):

  ```js
  chrome.tabs.create({ url: href });
  ```

Default to "open in a new tab" unless the panel is the user's
primary surface. Most extensions get this wrong by linking away
from the page the panel is paired with.

## Common Mistakes

- **Calling `chrome.sidePanel.open({})` with no `tabId`.** It's
  allowed, but Chrome will open the panel on the active tab — which
  may not be what you want. Be explicit.
- **Forgetting `setPanelBehavior` when removing the popup.** If
  you delete `action.default_popup` without `setPanelBehavior`, the
  action icon becomes a dead click.
- **Relying on the panel to wake the service worker.** It doesn't,
  on its own. The panel must `sendMessage` or `connect` to the
  worker explicitly.
- **Persisting panel state in `chrome.storage.sync`.** Sync quota
  is small and the data is per-device anyway. Use `chrome.storage.local`
  or `chrome.storage.session`.
