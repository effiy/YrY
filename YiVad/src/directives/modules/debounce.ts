/**
 * v-debounce
 * Button debounce directive — backed by lodash debounce for robust edge-case handling.
 * Accepts: function type
 */
import { debounce as _debounce } from "lodash-es";
import type { Directive, DirectiveBinding } from "vue";

interface ElType extends HTMLElement {
  __debounced__?: () => any;
}

const debounce: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-debounce: binding.value must be a function");
    }
    el.__debounced__ = _debounce(binding.value, 500);
    el.addEventListener("click", el.__debounced__);
  },
  beforeUnmount(el: ElType) {
    if (el.__debounced__) {
      (el.__debounced__ as any).cancel();
    }
    el.removeEventListener("click", el.__debounced__!);
  },
};

export default debounce;