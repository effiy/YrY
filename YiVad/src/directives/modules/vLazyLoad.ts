import type { Directive, DirectiveBinding } from "vue";

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) loadImage(img, src);
        observer.unobserve(img);
      }
    }
  },
  { rootMargin: "200px", threshold: 0.1 }
);

const imageCache = new Set<string>();

function loadImage(img: HTMLImageElement, src: string): void {
  const placeholder = img.dataset.placeholder;
  if (placeholder) img.src = placeholder;

  const tempImage = new Image();
  tempImage.onload = () => {
    img.src = src;
    img.classList.add("lazy-loaded");
    imageCache.add(src);
  };
  tempImage.onerror = () => {
    const errorSrc = img.dataset.error;
    if (errorSrc) img.src = errorSrc;
    img.classList.add("lazy-error");
  };
  tempImage.src = src;
}

export const vLazyLoad: Directive<HTMLImageElement, string> = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding<string>) {
    const src = binding.value;
    if (!src) return;
    el.dataset.src = src;
    el.style.transition = "opacity 0.3s ease-in-out";
    el.style.opacity = "0";
    observer.observe(el);
  },

  updated(el: HTMLImageElement, binding: DirectiveBinding<string>) {
    if (binding.value !== binding.oldValue) {
      el.dataset.src = binding.value;
      imageCache.delete(binding.oldValue || "");
      observer.observe(el);
    }
  },

  unmounted(el: HTMLImageElement) {
    observer.unobserve(el);
  },
};