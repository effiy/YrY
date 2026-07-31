---
key: bug_2026_07_31_yivad_debounce_throttle_timer_leak
title: v-debounce and v-throttle leaked setTimeout + threw string instead of Error
project: YiVad
module: directives/modules/debounce.ts, directives/modules/throttle.ts
severity: medium
priority: medium
status: fixed
type: resource-leak
iteration: loop-2026-07-31
assignee: claude
---

---
key: bug_2026_07_31_yivad_debounce_throttle_timer_leak
title: v-debounce and v-throttle leaked setTimeout + threw string instead of Error
project: YiVad
module: directives/modules/debounce.ts, directives/modules/throttle.ts
severity: medium
priority: medium
status: fixed
type: resource-leak
iteration: loop-2026-07-31
assignee: claude
---

## Description

`YiVad/src/directives/modules/debounce.ts` and `throttle.ts` both stored their pending `setTimeout` handle in a local `timer` variable captured by the directive's `mounted` closure. `beforeUnmount` only called `removeEventListener("click", ...)` — it never cleared the timer.

Two concrete consequences:

1. **Stale-closure callback execution after unmount.** If the user clicks a `v-debounce` button and the element unmounts within 500 ms (route change, conditional `v-if`, modal close), the timer keeps running. When it fires, it calls `binding.value()` — a closure over the binding from the now-unmounted element. The callback runs against stale state, potentially calling store methods or emitting events on a component that no longer exists. For `v-throttle`, the timer also leaves `el.disabled = true` permanently if the element somehow stays in the DOM (e.g. re-rendered without re-mounting).

2. **`throw "callback must be a function"` threw a string.** Throwing a string instead of `new Error(...)` loses stack-trace context and breaks `err instanceof Error` checks upstream — `err.message` is undefined and any `try/catch` that does `err.stack` is silent.

## Steps to Reproduce

1. Mount a button: `<button v-debounce="onSave">Save</button>` where `onSave` writes to a Pinia store.
2. Click the button (timer starts, 500 ms pending).
3. Within 500 ms, route-change away (element unmounts, `beforeUnmount` runs, only removes click listener).
4. ~500 ms later, the timer fires → `binding.value()` → `onSave()` runs against the stale binding.
5. If the component's reactive state has been torn down, the store write either succeeds with stale data or throws silently.

For the string-throw: anywhere `binding.value` is not a function (e.g. someone writes `v-debounce="onSave"` and `onSave` is `undefined` due to a typo), the directive throws `"callback must be a function"` — a string. Any `try/catch` doing `err.message` gets undefined; the original stack is gone.

## Expected Result

- `beforeUnmount` clears the pending timer so the callback cannot fire after unmount.
- Validation errors throw `TypeError` (or `Error`), not a bare string.

## Actual Result

Pending `setTimeout` continued to run after `beforeUnmount`. The callback executed against stale bindings. Validation errors threw strings, losing stack-trace context.

## Cause

The directives treated `timer` as a function-scoped variable rather than attaching it to `el` (the directive's host element). Without a reference on `el`, `beforeUnmount` had no way to clear it. The `throw "string"` was a convenience shortcut that predates the project's TypeScript strictness.

## Solution

Stored the timer handle on `el.__debounceTimer__` (and `__throttleTimer__`) so `beforeUnmount` can clear it. Also replaced `throw "string"` with `throw new TypeError("...")` so the error has a proper stack and message.

```ts
// debounce.ts (after fix)
interface ElType extends HTMLElement {
  __handleClick__: () => any;
  __debounceTimer__: ReturnType<typeof setTimeout> | null;
}
const debounce: Directive = {
  mounted(el, binding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-debounce: binding.value must be a function");
    }
    el.__debounceTimer__ = null;
    el.__handleClick__ = function () {
      if (el.__debounceTimer__) clearTimeout(el.__debounceTimer__);
      el.__debounceTimer__ = setTimeout(() => {
        el.__debounceTimer__ = null;
        binding.value();
      }, 500);
    };
    el.addEventListener("click", el.__handleClick__);
  },
  beforeUnmount(el) {
    if (el.__debounceTimer__) {
      clearTimeout(el.__debounceTimer__);
      el.__debounceTimer__ = null;
    }
    el.removeEventListener("click", el.__handleClick__);
  }
};
```

Same shape for `throttle.ts`, with `__throttleTimer__`.

Process follow-up: when a Vue directive stores per-element state (timer, observer, abort-controller), it MUST be attached to `el` (e.g. `el.__myTimer__`), not held in a function-scoped closure — otherwise `beforeUnmount` cannot reach it to clean up. The "throw a string" antipattern is a separate issue: always `throw new Error(...)` (or a subclass) so the stack and message survive.
