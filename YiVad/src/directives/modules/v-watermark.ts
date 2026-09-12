import type { Directive } from "vue";
import { useWatermarkStore } from "@/stores/modules/watermark";

export const vWatermark: Directive = {
  mounted(el, binding) {
    const enabled = binding.value !== false;
    if (!enabled) {
      el.setAttribute("data-watermark-disabled", "true");
    }
  },
  updated(el, binding) {
    const enabled = binding.value !== false;
    if (!enabled) {
      el.setAttribute("data-watermark-disabled", "true");
    } else {
      el.removeAttribute("data-watermark-disabled");
    }
  },
};