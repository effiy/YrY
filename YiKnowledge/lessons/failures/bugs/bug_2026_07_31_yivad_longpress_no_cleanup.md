---
key: bug_2026_07_31_yivad_longpress_no_cleanup
title: v-longpress had no beforeUnmount — leaked 6 listeners + timer per element
project: YiVad
module: directives/modules/longpress.ts
severity: medium
priority: medium
status: fixed
type: resource-leak
iteration: loop-2026-07-31
assignee: claude
---

---
key: bug_2026_07_31_yivad_longpress_no_cleanup
title: v-longpress had no beforeUnmount — leaked 6 listeners + timer per element
project: YiVad
module: directives/modules/longpress.ts
severity: medium
priority: medium
status: fixed
type: resource-leak
iteration: loop-2026-07-31
assignee: claude
---

## Description

`YiVad/src/directives/modules/longpress.ts` defined a `mounted` hook that attached six event listeners (`mousedown`, `touchstart`, `click`, `mouseout`, `touchend`, `touchcancel`) and started a `setTimeout` of up to 1 second. It had **no `beforeUnmount` hook at all** — every listener and the timer stayed attached to the (now-detached) element after unmount.

Three concrete consequences:

1. **Listener leak.** Every element using `v-longpress` leaked 6 listeners on unmount. In a list rendering 100 long-pressable rows, navigating away kept 600 listeners alive — they fired against detached DOM and stale bindings.
2. **Timer fires after unmount.** The `pressTimer` was held in a function-scoped closure, not on `el`. If the user pressed, held, and the element unmounted within 1 second, the timer fired `binding.value(e)` against the stale binding.
3. **String throw.** `throw "callback must be a function"` lost stack-trace context.

## Steps to Reproduce

1. Render a list of `<div v-longpress="onLongPress(item)">` elements.
2. Long-press one (timer starts, 1s pending).
3. Within 1 second, navigate away (e.g. route change) — element unmounts.
4. The 1-second timer fires against the stale `binding.value`, which captures `item` from the unmounted scope.
5. Listeners for `mousedown`/`touchstart`/`click`/`mouseout`/`touchend`/`touchcancel` are never removed — they linger on the detached element until GC.

## Expected Result

`beforeUnmount` clears the pending timer and removes all six listeners. Validation errors throw `TypeError`, not a string.

## Actual Result

No `beforeUnmount` hook. All six listeners and the pending timer leaked. Stale-binding callback execution was possible if the element unmounted mid-press.

## Cause

The directive's author treated `mounted` as the entire lifecycle — there was no thought given to cleanup. The function-scoped `pressTimer` could not be reached from any `beforeUnmount` anyway, even if one had existed.

## Solution

Attached the timer handle and the start/cancel handlers to `el` (`__lpTimer__`, `__lpStart__`, `__lpCancel__`) so a new `beforeUnmount` hook can clear the timer and remove all six listeners. Replaced the string throw with `TypeError`.

```ts
interface ElType extends HTMLElement {
  __lpStart__: (e: MouseEvent | TouchEvent) => void;
  __lpCancel__: () => void;
  __lpTimer__: ReturnType<typeof setTimeout> | null;
}

const directive: Directive<ElType> = {
  mounted(el, binding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-longpress: binding.value must be a function");
    }
    el.__lpTimer__ = null;
    const handler = (e) => binding.value(e);
    const start = (e) => {
      if (e.button && e.type === "click" && e.button !== 0) return;
      if (el.__lpTimer__ === null) {
        el.__lpTimer__ = setTimeout(() => {
          el.__lpTimer__ = null;
          handler(e);
        }, 1000);
      }
    };
    const cancel = () => {
      if (el.__lpTimer__ !== null) {
        clearTimeout(el.__lpTimer__);
        el.__lpTimer__ = null;
      }
    };
    el.__lpStart__ = start;
    el.__lpCancel__ = cancel;
    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start);
    el.addEventListener("click", cancel);
    el.addEventListener("mouseout", cancel);
    el.addEventListener("touchend", cancel);
    el.addEventListener("touchcancel", cancel);
  },
  beforeUnmount(el) {
    if (el.__lpTimer__ !== null) {
      clearTimeout(el.__lpTimer__);
      el.__lpTimer__ = null;
    }
    el.removeEventListener("mousedown", el.__lpStart__);
    el.removeEventListener("touchstart", el.__lpStart__);
    el.removeEventListener("click", el.__lpCancel__);
    el.removeEventListener("mouseout", el.__lpCancel__);
    el.removeEventListener("touchend", el.__lpCancel__);
    el.removeEventListener("touchcancel", el.__lpCancel__);
  }
};
```

Process follow-up: any Vue directive that attaches listeners or starts timers in `mounted` MUST have a symmetric `beforeUnmount` that removes them. Per-element state (timers, handlers, observers) must be stored on `el` — not in function-scoped closures — so the unmount hook can reach it. The "throw a string" antipattern is a separate issue: always `throw new Error(...)` or a subclass.
