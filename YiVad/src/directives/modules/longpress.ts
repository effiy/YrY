/**
 * v-longpress
 * Long press directive, triggers event on long press
 */
import type { Directive, DirectiveBinding } from "vue";

const directive: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw "callback must be a function";
    }
    // Define variables
    let pressTimer: any = null;
    // Create timer (execute function after 2 seconds)
    const start = (e: any) => {
      if (e.button) {
        if (e.type === "click" && e.button !== 0) {
          return;
        }
      }
      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          handler(e);
        }, 1000);
      }
    };
    // Cancel timer
    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    // Execute function
    const handler = (e: MouseEvent | TouchEvent) => {
      binding.value(e);
    };
    // Add event listeners
    el.addEventListener("mousedown", start);
    el.addEventListener("touchstart", start);
    // Cancel timer
    el.addEventListener("click", cancel);
    el.addEventListener("mouseout", cancel);
    el.addEventListener("touchend", cancel);
    el.addEventListener("touchcancel", cancel);
  }
};

export default directive;
