/**
 * v-copy
 * Copy a value to clipboard
 * Accepts: string / Ref<string> / Reactive<string>
 */

import type { Directive, DirectiveBinding } from "vue";
import { ElMessage } from "element-plus";
interface ElType extends HTMLElement {
  copyData: string | number;
}
const copy: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value;
    el.addEventListener("click", handleClick);
  },
  updated(el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value;
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener("click", handleClick);
  }
};

async function handleClick(this: any) {
  try {
    await navigator.clipboard.writeText(this.copyData);
    ElMessage({
      type: "success",
      message: "Copied successfully"
    });
  } catch (err) {
    console.error("Copy operation not supported or failed: ", err);
  }
}

export default copy;
