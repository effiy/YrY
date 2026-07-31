/*
  Requirement: Prevent buttons from being clicked multiple times in a short period. Use a throttle function to limit clicks to once within a set interval.

  Approach:
    1. On first click, immediately call the method and disable the button; re-enable after the delay ends.
    2. Bind the target method to the directive.

  Usage: Add v-throttle and a callback function to the DOM element
  <button v-throttle="debounceClick">Throttle Submit</button>
*/
import type { Directive, DirectiveBinding } from "vue";
interface ElType extends HTMLElement {
  __handleClick__: () => any;
  __throttleTimer__: ReturnType<typeof setTimeout> | null;
  disabled: boolean;
}
const throttle: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-throttle: binding.value must be a function");
    }
    el.__throttleTimer__ = null;
    el.__handleClick__ = function () {
      if (el.__throttleTimer__) return;
      el.disabled = true;
      binding.value();
      el.__throttleTimer__ = setTimeout(() => {
        el.disabled = false;
        el.__throttleTimer__ = null;
      }, 1000);
    };
    el.addEventListener("click", el.__handleClick__);
  },
  beforeUnmount(el: ElType) {
    if (el.__throttleTimer__) {
      clearTimeout(el.__throttleTimer__);
      el.__throttleTimer__ = null;
    }
    el.removeEventListener("click", el.__handleClick__);
  }
};

export default throttle;
