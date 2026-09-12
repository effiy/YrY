/**
 * FLIP animation helper for drag-and-drop transitions.
 * First-Last-Invert-Play technique for smooth layout animations.
 */
export function flipAnimation(
  container: HTMLElement,
  getItemKey: (el: Element) => string
): () => void {
  const positions = new Map<string, DOMRect>();

  function record() {
    for (const child of Array.from(container.children)) {
      const key = getItemKey(child);
      if (key) positions.set(key, child.getBoundingClientRect());
    }
  }

  function play() {
    for (const child of Array.from(container.children)) {
      const key = getItemKey(child);
      if (!key) continue;
      const prev = positions.get(key);
      if (!prev) continue;
      const curr = child.getBoundingClientRect();
      const dx = prev.left - curr.left;
      const dy = prev.top - curr.top;

      if (dx !== 0 || dy !== 0) {
        (child as HTMLElement).style.transform = `translate(${dx}px, ${dy}px)`;
        (child as HTMLElement).style.transition = "transform 0s";
        requestAnimationFrame(() => {
          (child as HTMLElement).style.transition = "transform 0.3s ease";
          (child as HTMLElement).style.transform = "";
        });
      }
    }
  }

  return () => {
    record();
    requestAnimationFrame(() => play());
  };
}