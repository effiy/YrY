import { ref, onMounted } from "vue";

export function useSkeleton(minDisplayMs = 300, delayMs = 100) {
  const visible = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const show = () => {
    timer = setTimeout(() => {
      visible.value = true;
    }, delayMs);
  };

  const hide = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    const minTimer = Date.now();
    const force = () => { visible.value = false; };
    const elapsed = Date.now() - minTimer;
    if (elapsed >= minDisplayMs) force();
    else setTimeout(force, minDisplayMs - elapsed);
  };

  return { visible, show, hide };
}