/**
 * Visual viewport utilities
 *
 * Computes the bottom inset between layout viewport and visual viewport
 * (relevant on iOS Safari and some WebViews when toolbars/keyboard appear)
 * and writes it to the --vv-bottom CSS custom property.
 */

export const setupVisualViewportBottomInset = () => {
  const docEl = document.documentElement;
  if (!docEl) return;
  const vv = window.visualViewport;

  let raf = 0;
  const update = () => {
    const layoutH = docEl.clientHeight || 0;
    let insetBottom = 0;

    if (vv && Number.isFinite(vv.height) && Number.isFinite(vv.offsetTop)) {
      insetBottom = Math.max(0, layoutH - vv.height - vv.offsetTop);
    }

    docEl.style.setProperty("--vv-bottom", `${Math.round(insetBottom)}px`);
  };

  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  };

  update();
  if (vv) {
    vv.addEventListener("resize", schedule, { passive: true });
    vv.addEventListener("scroll", schedule, { passive: true });
  }
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
};
