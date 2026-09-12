/**
 * Mermaid render composable — replaces the duplicated
 * `watch(html) → nextTick() → runMermaid(containerRef)` pattern
 * across chat surfaces with a single, tested call site.
 *
 * Built-in streaming optimization: when the HTML string contains no
 * mermaid blocks, `runMermaid` is never called.
 *
 * Usage:
 *   const { render, dispose } = useMermaidRender({
 *     html: citedHtml,
 *     containerRef: markdownRef,
 *   });
 */
import { watch, nextTick, onMounted, type Ref, type ComputedRef } from "vue";
import { runMermaid } from "./useMarkdown";

export interface UseMermaidRenderOptions {
  /** The reactive HTML string that may contain `<pre class="mermaid">` blocks. */
  html: Ref<string> | ComputedRef<string>;
  /** The container element that holds the rendered HTML. */
  containerRef: Ref<HTMLElement | undefined | null>;
  /** Optional: only run when this is truthy (e.g., not loading). */
  enabled?: Ref<boolean>;
}

export function useMermaidRender(options: UseMermaidRenderOptions) {
  const { html, containerRef, enabled } = options;

  /** Quick string check — avoids DOM queries when no mermaid blocks exist. */
  function hasMermaidBlocks(s: string): boolean {
    return s.includes('class="mermaid"') || s.includes("pre.mermaid");
  }

  /** Run mermaid rendering on the current container contents. */
  async function render(): Promise<void> {
    await nextTick();
    const c = containerRef.value;
    if (!c) return;
    if (enabled && !enabled.value) return;
    await runMermaid(c);
  }

  // Watch the HTML source for changes
  const stopWatch = watch(
    html,
    async (newHtml) => {
      if (!hasMermaidBlocks(newHtml)) return;
      if (enabled && !enabled.value) return;
      await render();
    },
    { immediate: true, flush: "post" },
  );

  // Ensure initial render catches edge cases where the immediate watcher
  // fires before the container is mounted
  onMounted(() => {
    if (containerRef.value && hasMermaidBlocks(html.value)) {
      render();
    }
  });

  function dispose(): void {
    stopWatch();
  }

  return { render, dispose };
}
