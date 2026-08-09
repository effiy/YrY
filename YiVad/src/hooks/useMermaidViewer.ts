/**
 * Mermaid viewer composable — global fullscreen preview + SVG download.
 *
 * After every mermaid.run() call, enhancers in the three mermaid surfaces
 * (KnowledgePreviewDialog, MessageBubble, KnowledgeChatPanel) decorate each
 * rendered `<pre class="mermaid">` element with a hover toolbar.
 *
 * Zoom + drag-to-pan are ONLY available in fullscreen mode (MermaidViewer.vue).
 * Inline diagrams show a compact toolbar with Fullscreen + Download buttons.
 *
 * Fullscreen state is a module-level singleton so any diagram on the page
 * can open the same overlay (mounted once in App.vue via <MermaidViewer />).
 */
import { ref, readonly } from "vue";
import { useGlobalStore } from "@/stores/modules/global";

// ── Global fullscreen state ──────────────────────────────────────────────

const fsVisible = ref(false);
const fsSvg = ref("");
const fsScale = ref(1);

// ── Toolbar icon SVGs (inline for zero-dependency) ───────────────────────

const ICON_FULLSCREEN =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

const ICON_DOWNLOAD =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

// ── Composable ───────────────────────────────────────────────────────────

export function useMermaidViewer() {
  // -- Fullscreen --

  function openFullscreen(svgEl: SVGSVGElement): void {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute("xmlns")) {
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    fsSvg.value = clone.outerHTML;
    fsScale.value = 1;
    fsVisible.value = true;
  }

  function closeFullscreen(): void {
    fsVisible.value = false;
  }

  function zoomIn(): void {
    fsScale.value = Math.min(5, +(fsScale.value * 1.25).toFixed(2));
  }

  function zoomOut(): void {
    fsScale.value = Math.max(0.1, +(fsScale.value / 1.25).toFixed(2));
  }

  function zoomFit(): void {
    fsScale.value = 1;
  }

  /** Programmatic scale setter (used by cursor-centered zoom in the overlay). */
  function setScale(s: number): void {
    fsScale.value = Math.min(5, Math.max(0.1, +s.toFixed(3)));
  }

  // -- Download --

  function downloadSvg(svgEl: SVGSVGElement): void {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    if (!clone.getAttribute("xmlns")) {
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    const data = '<?xml version="1.0" encoding="UTF-8"?>\n' + clone.outerHTML;
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── DOM enhancement (runs after each mermaid.run()) ───────────────────

  function toolbarCss(isDark: boolean): string {
    return [
      "position:absolute",
      "top:4px",
      "right:4px",
      "display:flex",
      "gap:1px",
      "padding:2px",
      "opacity:0",
      isDark ? "background:rgb(30 30 30 / 92%)" : "background:rgb(255 255 255 / 92%)",
      "border-radius:6px",
      "box-shadow:0 2px 8px rgb(0 0 0 / 10%)",
      "transition:opacity 0.18s",
      "z-index:10",
      "pointer-events:auto",
    ].join(";");
  }

  function btnCss(isDark: boolean): string {
    return [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      "width:26px",
      "height:26px",
      "padding:0",
      isDark ? "color:#aaa" : "color:#909399",
      "cursor:pointer",
      "background:transparent",
      "border:none",
      "border-radius:4px",
      "pointer-events:auto",
    ].join(";");
  }

  /**
   * For every rendered `<pre class="mermaid">` that contains an `<svg>`,
   * attach a hover toolbar with Fullscreen + Download buttons.
   * Zoom and drag-to-pan are available only in the fullscreen overlay.
   */
  function enhanceContainer(container: HTMLElement): void {
    const diagrams = container.querySelectorAll<HTMLElement>("pre.mermaid");
    for (const pre of diagrams) {
      const svg = pre.querySelector("svg") as SVGSVGElement | null;
      if (!svg || pre.hasAttribute("data-mv")) continue;
      pre.setAttribute("data-mv", "1");

      // Anchor for absolute-positioned toolbar + clip overflow
      pre.style.position = "relative";
      pre.style.overflow = "hidden";

      const isDark = useGlobalStore().isDark;
      const toolbar = document.createElement("div");
      toolbar.setAttribute("style", toolbarCss(isDark));
      toolbar.innerHTML = [
        `<button style="${btnCss(isDark)}" title="Fullscreen preview" data-mv-action="fullscreen">${ICON_FULLSCREEN}</button>`,
        `<button style="${btnCss(isDark)}" title="Download SVG" data-mv-action="download">${ICON_DOWNLOAD}</button>`,
      ].join("");

      // Show toolbar on hover
      pre.addEventListener("mouseenter", () => {
        toolbar.style.opacity = "1";
        toolbar.style.pointerEvents = "auto";
      });
      pre.addEventListener("mouseleave", () => {
        toolbar.style.opacity = "0";
        toolbar.style.pointerEvents = "none";
      });

      // Delegate clicks
      toolbar.addEventListener("click", (e: Event) => {
        const btn = (e.target as HTMLElement).closest("[data-mv-action]") as HTMLElement | null;
        if (!btn) return;
        const action = btn.getAttribute("data-mv-action");
        if (action === "fullscreen") {
          openFullscreen(svg);
        } else if (action === "download") {
          downloadSvg(svg);
        }
      });

      // Button hover effect
      toolbar.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          btn.style.color = isDark ? "#7aa2f7" : "#409eff";
          btn.style.background = isDark ? "rgb(255 255 255 / 6%)" : "#ecf5ff";
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.color = isDark ? "#aaa" : "#909399";
          btn.style.background = "transparent";
        });
      });

      pre.appendChild(toolbar);
    }
  }

  return {
    // Fullscreen reactive state (readonly so consumers can watch but not mutate)
    fsVisible: readonly(fsVisible),
    fsSvg: readonly(fsSvg),
    fsScale: readonly(fsScale),
    // Actions
    openFullscreen,
    closeFullscreen,
    zoomIn,
    zoomOut,
    zoomFit,
    setScale,
    downloadSvg,
    // Post-render enhancement
    enhanceContainer,
  };
}
