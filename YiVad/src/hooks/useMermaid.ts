import { onMounted, nextTick, type Ref } from "vue";
import { runMermaid } from "./useMarkdown";

export function useMermaid(...refs: Ref<HTMLElement | null>[]) {
  onMounted(async () => {
    await nextTick();
    for (const ref of refs) {
      if (ref.value) runMermaid(ref.value);
    }
  });
}