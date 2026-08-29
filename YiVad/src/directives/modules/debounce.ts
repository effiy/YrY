/**
 * v-debounce
 * Button debounce directive, can be extended to input
 * Accepts: function type
 */
import type { Directive, DirectiveBinding } from "vue";
interface ElType extends HTMLElement {
  __handleClick__: () => any;
  __debounceTimer__: ReturnType<typeof setTimeout> | null;
}
const debounce: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-debounce: binding.value must be a function");
    }
    el.__debounceTimer__ = null;
    el.__handleClick__ = function () {
      if (el.__debounceTimer__) {
        clearTimeout(el.__debounceTimer__);
      }
      el.__debounceTimer__ = setTimeout(() => {
        el.__debounceTimer__ = null;
        binding.value();
      }, 500);
    };
    el.addEventListener("click", el.__handleClick__);
  },
  beforeUnmount(el: ElType) {
    if (el.__debounceTimer__) {
      clearTimeout(el.__debounceTimer__);
      el.__debounceTimer__ = null;
    }
    el.removeEventListener("click", el.__handleClick__);
  }
};

export default debounce;
