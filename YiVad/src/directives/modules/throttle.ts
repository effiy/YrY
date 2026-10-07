/**
 * v-throttle
 * Button throttle directive — backed by lodash throttle for robust edge-case handling.
 * Usage: <button v-throttle="handleClick">Throttle Submit</button>
 */
import { throttle as _throttle } from "lodash-es";
import type { Directive, DirectiveBinding } from "vue";

interface ElType extends HTMLElement {
  __throttled__?: () => any;
}

const throttle: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw new TypeError("v-throttle: binding.value must be a function");
    }
    el.__throttled__ = _throttle(binding.value, 1000);
    el.addEventListener("click", el.__throttled__);
  },
  beforeUnmount(el: ElType) {
    if (el.__throttled__) {
      (el.__throttled__ as any).cancel();
    }
    el.removeEventListener("click", el.__throttled__!);
  },
};

export default throttle;