import { computed, type Ref } from "vue";

interface Position {
  x: number;
  y: number;
}

export function useMenuPosition(
  anchor: Ref<Position>,
  menuWidth: Ref<number>,
  menuHeight: Ref<number>
) {
  const adjustedPosition = computed(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    let x = anchor.value.x;
    let y = anchor.value.y;

    if (x + menuWidth.value > viewportWidth - padding) {
      x = Math.max(padding, x - menuWidth.value);
    }

    if (y + menuHeight.value > viewportHeight - padding) {
      y = Math.max(padding, y - menuHeight.value);
    }

    x = Math.max(padding, Math.min(x, viewportWidth - menuWidth.value - padding));
    y = Math.max(padding, Math.min(y, viewportHeight - menuHeight.value - padding));

    return { x, y };
  });

  const transformOrigin = computed(() => {
    const originX = anchor.value.x + menuWidth.value > window.innerWidth ? "right" : "left";
    const originY = anchor.value.y + menuHeight.value > window.innerHeight ? "bottom" : "top";
    return `${originY} ${originX}`;
  });

  return { adjustedPosition, transformOrigin };
}