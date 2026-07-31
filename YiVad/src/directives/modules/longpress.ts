/**
 * v-longpress
 * Long press directive, triggers event on long press
 */
import type { Directive, DirectiveBinding } from "vue";

interface ElType extends HTMLElement {
  __lpStart__: (e: MouseEvent | TouchEvent) => void;
  __lpCancel__: () => void;
  __lpTimer__: ReturnType<typeof setTimeout> | null;
}

const directive: Directive<ElType> = {
  mounted(el, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-longpress: binding.value must be a function");
    }
    el.__lpTimer__ = null;
    // Execute function
    const handler = (e: MouseEvent | TouchEvent) => {
      binding.value(e);
    };
    // Create timer (execute function after 1 second)
    const start = (e: any) => {
      if (e.button) {
        if (e.type === "click" && e.button !== 0) {
          return;
        }
      }
      if (el.__lpTimer__ === null) {
        el.__lpTimer__ = setTimeout(() => {
          el.__lpTimer__ = null;
          handler(e);
        }, 1000);
      }
    };
    // Cancel timer
    const cancel = () => {
      if (el.__lpTimer__ !== null) {
        clearTimeout(el.__lpTimer__);
        el.__lpTimer__ = null;
      }
    };
    el.__lpStart__ = start;
    el.__lpCancel__ = cancel;
    // Add event listeners
    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start);
    // Cancel timer
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

export default directive;
