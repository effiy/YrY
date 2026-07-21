/**
 * Mermaid Core Exports
 */

// Inject shared mermaid CSS
let _mermaidCssInjected = false;
const _injectMermaidCss = () => {
  if (_mermaidCssInjected || typeof document === 'undefined') return;
  _mermaidCssInjected = true;
  try {
    const existing = document.getElementById('mermaid-component-styles');
    if (existing) return;
    const link = document.createElement('link');
    link.id = 'mermaid-component-styles';
    link.rel = 'stylesheet';
    link.href = new URL('../../index.css', import.meta.url).href;
    document.head.appendChild(link);
  } catch (_) { }
};
_injectMermaidCss();

export { MermaidRenderer, createMermaidRenderer, default } from './MermaidRenderer.js';
export * from './MermaidConfig.js';
