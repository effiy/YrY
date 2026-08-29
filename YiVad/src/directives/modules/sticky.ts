import type { Directive, DirectiveBinding } from "vue";

export interface StickyOptions {
  top?: number;
  zIndex?: number;
  offsetX?: [number, number];
  offsetY?: [number, number];
  activeClass?: string;
  listenTarget?: string | HTMLElement | Window;
}

interface StickyElement extends HTMLElement {
  __sticky_observer__?: IntersectionObserver;
  __sticky_cleanup__?: () => void;
  __sticky_opts__?: Required<Pick<StickyOptions, "top" | "zIndex" | "activeClass">> &
    Partial<Pick<StickyOptions, "offsetX" | "offsetY" | "listenTarget">>;
}

const DEFAULTS = {
  top: 0,
  zIndex: 20,
  activeClass: "is-stuck"
} as const;

function applyInlineSticky(el: StickyElement, opts: StickyOptions) {
  const merged: StickyElement["__sticky_opts__"] = {
    top: opts.top ?? DEFAULTS.top,
    zIndex: opts.zIndex ?? DEFAULTS.zIndex,
    activeClass: opts.activeClass ?? DEFAULTS.activeClass,
    offsetX: opts.offsetX,
    offsetY: opts.offsetY,
    listenTarget: opts.listenTarget
  };
  el.__sticky_opts__ = merged;

  el.style.position = "sticky";
  el.style.top = `${merged.top}px`;
  el.style.zIndex = String(merged.zIndex);

  if (merged.offsetX) {
    const [left, right] = merged.offsetX;
    el.style.marginLeft = `-${left}px`;
    el.style.marginRight = `-${right}px`;
    el.style.paddingLeft = `${left}px`;
    el.style.paddingRight = `${right}px`;
  }
  if (merged.offsetY) {
    const [top, bottom] = merged.offsetY;
    el.style.marginTop = `-${top}px`;
    el.style.marginBottom = `${bottom}px`;
    el.style.paddingTop = `${top}px`;
    el.style.paddingBottom = `${bottom}px`;
  }
}

function resolveTarget(bindingTarget: StickyOptions["listenTarget"], el: StickyElement): Element | Window | null {
  if (bindingTarget instanceof HTMLElement || bindingTarget === window) return bindingTarget;
  if (typeof bindingTarget === "string") {
    const found = document.querySelector(bindingTarget);
    if (found) return found;
  }
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return node;
    node = node.parentElement;
  }
  return window;
}

function bindStuckDetection(el: StickyElement) {
  const opts = el.__sticky_opts__!;
  const target = resolveTarget(opts.listenTarget, el);
  const activeClass = opts.activeClass;

  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.position = "absolute";
  sentinel.style.left = "0";
  sentinel.style.right = "0";
  sentinel.style.top = "0";
  sentinel.style.height = "1px";
  sentinel.style.pointerEvents = "none";
  sentinel.style.visibility = "hidden";
  el.parentElement?.insertBefore(sentinel, el);

  const root = target === window ? null : (target as Element);
  const rootMargin = `-${opts.top - 1}px 0px 0px 0px`;

  let rafId = 0;
  const setStuck = (stuck: boolean) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      el.classList.toggle(activeClass, stuck);
    });
  };

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        setStuck(!e.isIntersecting);
      });
    },
    { root, rootMargin, threshold: [0] }
  );
  io.observe(sentinel);

  el.__sticky_observer__ = io;
  el.__sticky_cleanup__ = () => {
    cancelAnimationFrame(rafId);
    io.disconnect();
    sentinel.remove();
  };
}

function normalizeOptions(value: unknown): StickyOptions {
  if (value == null || value === true || value === "") return {};
  if (typeof value === "number") return { top: value };
  if (typeof value === "object") return value as StickyOptions;
  return {};
}

function cleanup(el: StickyElement) {
  el.__sticky_cleanup__?.();
  delete el.__sticky_cleanup__;
  delete el.__sticky_observer__;
  delete el.__sticky_opts__;
  el.style.position = "";
  el.style.top = "";
  el.style.zIndex = "";
  el.style.marginLeft = "";
  el.style.marginRight = "";
  el.style.marginTop = "";
  el.style.marginBottom = "";
  el.style.paddingLeft = "";
  el.style.paddingRight = "";
  el.style.paddingTop = "";
  el.style.paddingBottom = "";
}

const sticky: Directive<StickyElement, StickyOptions | number | boolean> = {
  mounted(el, binding) {
    const opts = normalizeOptions(binding.value);
    applyInlineSticky(el, opts);
    requestAnimationFrame(() => bindStuckDetection(el));
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue) return;
    const activeClass = el.__sticky_opts__?.activeClass ?? DEFAULTS.activeClass;
    el.classList.remove(activeClass);
    cleanup(el);
    const opts = normalizeOptions(binding.value);
    applyInlineSticky(el, opts);
    requestAnimationFrame(() => bindStuckDetection(el));
  },
  beforeUnmount(el) {
    cleanup(el);
  }
};

export default sticky;
