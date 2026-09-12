/**
 * Module type declarations — ambient type definitions for non-TS imports.
 *
 * Usage: declare *.vue, *.scss, *.css, *.png, *.svg, etc. so TypeScript can
 * resolve these imports without error. The actual bundling is handled by Rsbuild.
 */

/* ── Vue SFC ─────────────────────────────────────────────────────────────── */

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

/* ── Style Modules ─────────────────────────────────────────────────────── */

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css';

/* ── Image Assets ──────────────────────────────────────────────────────── */

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}