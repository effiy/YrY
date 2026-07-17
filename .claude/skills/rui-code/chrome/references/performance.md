# Performance & Lifecycle

> MV3's biggest shift is that the extension's brain is a **service
> worker** — a stateless, event-driven script that Chrome tears down
> after ~30s of idle. If you write MV2-style code, your extension
> will appear to "forget" things between events.

## The Service Worker Lifecycle

1. **Install.** A fresh install (or update) fires
   `chrome.runtime.onInstalled`. The worker spins up, runs the
   listener, then idles.
2. **Event.** Any registered listener (`onMessage`, `onClicked`,
   `onCommand`, `onAlarm`, …) wakes the worker. Top-level code does
   **not** run again — only the listener body.
3. **Idle.** ~30 seconds after the last event, Chrome kills the
   worker. Module-level state is gone.
4. **Wake.** The next event repeats from step 2.

**Implication:** anything you store in a top-level variable of the
service worker is unreliable across events. Use `chrome.storage.local`
(or `chrome.storage.session` for ephemeral data).

```js
// background.js — register listeners at the top level, synchronously
chrome.runtime.onInstalled.addListener((details) => { /* ... */ });
chrome.action.onClicked.addListener((tab) => { /* ... */ });
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  return true; // keep the channel open for async sendResponse
});
```

A common mistake:

```js
// BAD — by the time onMessage fires, this listener was registered
// during a previous worker lifetime, but the worker is fresh now and
// has not re-registered. The message is dropped.
chrome.runtime.onMessage.addListener(async (msg) => {
  const data = await fetchSomething(); // top-level await — illegal anyway
  // ...
});
```

If the listener registration happens in an async callback, the
worker can be torn down before the listener is attached. Always
register listeners synchronously at module load.

## Top-Level `await` and Module Mode

Set `"type": "module"` in the manifest background entry if you
want ES modules:

```jsonc
"background": { "service_worker": "background.js", "type": "module" }
```

In module mode, top-level `await` is allowed but it *delays* event
dispatch until the promise resolves. Use it sparingly — it can
push event delivery past the worker's lifetime budget.

## `chrome.alarms` (the only timer that survives)

- The worker can be killed between events. `setTimeout` and
  `setInterval` *do not* survive.
- `chrome.alarms` schedules via Chrome's alarm service. The worker
  is woken when the alarm fires.
- Minimum interval: 30 seconds in production (1 minute in a packed
  extension). Plan accordingly.

```js
// Periodically refresh cached data
chrome.alarms.create("refresh", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh") void refreshCache();
});
```

## Storage: `local` vs `session` vs `sync`

| | `local` | `session` | `sync` |
|---|---|---|---|
| Persists across worker restarts | yes | yes | yes |
| Persists across browser restarts | yes | **no** (cleared on browser quit) | yes |
| Synced across signed-in browsers | no | no | yes |
| Quota | 10 MB | 10 MB | ~100 KB total, 8 KB/item |
| Use for | settings, cached data, drafts | tab-scoped data, one-shot tokens | preferences, small flags |

Prefer `chrome.storage.session` for anything that should not
survive the browser closing (e.g. an OAuth token you do not want
sitting on disk).

## Offscreen Documents

Some APIs cannot run inside a service worker because they need a
DOM or long-lived execution context:

- `Audio` playback, `MediaSource`, `WebRTC`
- Clipboard image read
- `IndexedDB` (works in the worker, but some libraries assume a
  window)
- Anything that needs `document` / `window` APIs

For these, create an **offscreen document**:

```js
// background.js
await chrome.offscreen.createDocument({
  url: "offscreen.html",
  reasons: ["AUDIO_PLAYBACK"],   // pick a valid OffscreenReason
  justification: "Play notification sound"
});
```

The offscreen document is a normal HTML page; route it through
`chrome.runtime.sendMessage` / `chrome.runtime.connect` from the
worker. Remember to call `chrome.offscreen.closeDocument()` when
you're done — the worker will be kept alive as long as an offscreen
document is open.

## Popup Performance

The popup is the first thing the user perceives. Aim for sub-100ms
time-to-first-paint.

- **Inline the critical CSS.** If the popup is small, inline a
  `<style>` block in `popup.html`.
- **Defer non-critical work.** Render the shell first, then load
  data. A loading spinner is faster than a blank screen.
- **Don't read `chrome.storage` on the critical path.** Use a
  default value and patch it in when the storage promise resolves.
- **Avoid large frameworks for small popups.** React with a 200 KB
  bundle is rarely worth it for a 300×200 popup. If you need
  reactivity, Preact or Solid is plenty.
- **Measure.** Use `performance.now()` markers or the Performance
  panel. Open the popup via the toolbar, not via "Inspect views" —
  the latter adds overhead.

## Lazy Loading in the Worker

- Use `import()` to load heavy modules only when an event needs
  them. The worker stays small on cold start.
- Avoid bundling a 1 MB analytics SDK in the worker; load it in
  the popup and forward events to the worker via messages.

## `chrome.scripting` and `executeScript`

- Prefer manifest-declared content scripts for code that must run
  on every page load.
- Use `chrome.scripting.executeScript` for one-off injections (the
  user just clicked a button, run a snippet on the current tab).
- Specify `target: { tabId }` rather than `allFrames: true` unless
  you actually need every frame.

## Lifecycle Events You Should Handle

| Event | When | Use it for |
|---|---|---|
| `chrome.runtime.onInstalled` | install, update, Chrome update | seed defaults, migrate storage schema, set up alarms |
| `chrome.runtime.onStartup` | browser starts (not on every worker wake) | restore session data |
| `chrome.runtime.onSuspend` | worker is about to be killed (rarely fires) | flush critical writes |
| `chrome.alarms.onAlarm` | scheduled time reached | background refresh, periodic tasks |
| `chrome.storage.onChanged` | another context wrote to storage | react to user changes in options page |
| `chrome.tabs.onRemoved` / `onUpdated` | tab state changes | clean up per-tab state |

## Debouncing and Batching

The worker is a shared resource. If you have a message handler that
fans out to 100 tabs:

- Batch: use `chrome.tabs.query({})` once, not per-tab.
- Debounce: collapse rapid `onUpdated` events into a single
  reconciliation pass.
- Coalesce writes: if you receive 50 storage updates in 100ms, write
  the merged result once.

## "Will it wake the worker?" Cheat Sheet

Wakes the worker (keep handlers short):

- `onMessage`, `onConnect`, `onCommand`
- `onClicked`, `onAlarm`, `onInstalled`, `onStartup`
- `chrome.tabs.*`, `chrome.windows.*`, `chrome.action.*`
- `chrome.webNavigation.*`
- `chrome.permissions.onAdded` / `onRemoved`

Does **not** wake the worker (must register a listener that the
service will deliver later):

- `chrome.webRequest.*` events in MV3 (declarative only for blocking)
- `chrome.declarativeNetRequest.*` (rule-based, no JS)

## Common Mistakes

- Caching `chrome.storage` reads in a module-level variable.
- Using `setTimeout` to "wait for the user to finish typing" — the
  worker can die.
- Reading `chrome.storage.local` in the popup's first render and
  blocking on it.
- Importing a 500 KB module at the top of `background.js` and
  paying the cost on every cold start.
- Forgetting `return true` from `onMessage` when the response is
  async.
