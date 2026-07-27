/**
 * Type declarations for React 15.6.1 loaded from CDN (global window.React / window.ReactDOM).
 *
 * These are minimal shims that cover only the subset of React 15's API used by YiPet:
 *   - React.Component (class-based, no hooks)
 *   - React.createElement (JSX factory)
 *   - ReactDOM.render / ReactDOM.unmountComponentAtNode
 *
 * Vite's esbuild JSX transform is configured with:
 *   jsxFactory: "React.createElement"
 *   jsxFragmentFactory: "React.Fragment"
 */

interface ReactHTMLAttributes<T> {
  id?: string;
  key?: string | number;
  className?: string;
  style?: Record<string, string | number>;
  htmlFor?: string;
  role?: string;
  'aria-live'?: string;
  'aria-label'?: string;
  'data-icon'?: string;
  type?: string;
  checked?: boolean;
  disabled?: boolean;
  value?: string | number;
  min?: number;
  max?: number;
  step?: number;
  title?: string;
  rows?: number;
  placeholder?: string;
  autoFocus?: boolean;
  dateTime?: string;
  onChange?: (event: { target: { value: string } }) => void;
  onInput?: (event: { target: { value: string } }) => void;
  onClick?: (event: unknown) => void;
  ref?: ((el: T | null) => void) | { current: T | null };
  dangerouslySetInnerHTML?: { __html: string };
  // Allow any additional attributes for flexibility
  [dataAttrib: string]: unknown;
}

type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[];

interface ReactElement {
  type: string | ReactComponentClass<unknown>;
  props: Record<string, unknown>;
  key: string | number | null;
}

interface ReactComponentClass<P> {
  new (props: P): ReactComponent<P>;
  (props: P): ReactElement;
  displayName?: string;
  prototype: ReactComponent<P>;
}

interface ReactComponent<P = Record<string, unknown>> {
  props: P;
  state: Record<string, unknown>;
  setState(patch: Record<string, unknown>, cb?: () => void): void;
  render(): ReactElement | ReactElement[] | null;
  componentDidMount?(): void;
  componentWillUnmount?(): void;
  forceUpdate(cb?: () => void): void;
}

interface ReactCreateElement {
  // HTML intrinsic elements
  (type: string, props: Record<string, unknown> | null, ...children: ReactNode[]): ReactElement;
  // Component class
  (type: ReactComponentClass<Record<string, unknown>>, props: Record<string, unknown> | null, ...children: ReactNode[]): ReactElement;
}

interface ReactDOMStatic {
  render(element: ReactElement, container: HTMLElement | null): void;
  unmountComponentAtNode(container: HTMLElement): boolean;
}

declare global {
  const React: {
    createElement: ReactCreateElement;
    Component: {
      new <P>(props: P): ReactComponent<P>;
      call(instance: ReactComponent, props: Record<string, unknown>): void;
      prototype: ReactComponent<Record<string, unknown>>;
    };
    Fragment: unique symbol;
  };

  const ReactDOM: ReactDOMStatic;

  // JSX namespace for TypeScript — tells tsc that <div>, <span>, etc. are valid
  namespace JSX {
    interface IntrinsicElements {
      div: ReactHTMLAttributes<HTMLDivElement>;
      span: ReactHTMLAttributes<HTMLSpanElement>;
      h1: ReactHTMLAttributes<HTMLHeadingElement>;
      h2: ReactHTMLAttributes<HTMLHeadingElement>;
      h3: ReactHTMLAttributes<HTMLHeadingElement>;
      h4: ReactHTMLAttributes<HTMLHeadingElement>;
      h5: ReactHTMLAttributes<HTMLHeadingElement>;
      h6: ReactHTMLAttributes<HTMLHeadingElement>;
      p: ReactHTMLAttributes<HTMLParagraphElement>;
      a: ReactHTMLAttributes<HTMLAnchorElement> & { href?: string; target?: string; rel?: string };
      img: ReactHTMLAttributes<HTMLImageElement> & { src?: string; alt?: string };
      input: ReactHTMLAttributes<HTMLInputElement> & { placeholder?: string; autoFocus?: boolean };
      textarea: ReactHTMLAttributes<HTMLTextAreaElement> & { placeholder?: string; rows?: number; value?: string };
      select: ReactHTMLAttributes<HTMLSelectElement>;
      option: ReactHTMLAttributes<HTMLOptionElement> & { value?: string | number; key?: string | number };
      label: ReactHTMLAttributes<HTMLLabelElement>;
      button: ReactHTMLAttributes<HTMLButtonElement> & { title?: string; 'aria-label'?: string };
      header: ReactHTMLAttributes<HTMLElement>;
      footer: ReactHTMLAttributes<HTMLElement>;
      main: ReactHTMLAttributes<HTMLElement>;
      section: ReactHTMLAttributes<HTMLElement>;
      nav: ReactHTMLAttributes<HTMLElement>;
      small: ReactHTMLAttributes<HTMLElement>;
      output: ReactHTMLAttributes<HTMLOutputElement>;
      time: ReactHTMLAttributes<HTMLTimeElement> & { dateTime?: string };
      ul: ReactHTMLAttributes<HTMLUListElement>;
      ol: ReactHTMLAttributes<HTMLOListElement>;
      li: ReactHTMLAttributes<HTMLLIElement>;
      code: ReactHTMLAttributes<HTMLElement>;
      pre: ReactHTMLAttributes<HTMLPreElement>;
      strong: ReactHTMLAttributes<HTMLElement>;
      em: ReactHTMLAttributes<HTMLElement>;
      blockquote: ReactHTMLAttributes<HTMLQuoteElement>;
      hr: ReactHTMLAttributes<HTMLHRElement>;
      br: ReactHTMLAttributes<HTMLBRElement>;
      table: ReactHTMLAttributes<HTMLTableElement>;
      thead: ReactHTMLAttributes<HTMLTableSectionElement>;
      tbody: ReactHTMLAttributes<HTMLTableSectionElement>;
      tr: ReactHTMLAttributes<HTMLTableRowElement>;
      th: ReactHTMLAttributes<HTMLTableCellElement>;
      td: ReactHTMLAttributes<HTMLTableCellElement>;
      svg: ReactHTMLAttributes<SVGSVGElement> & { viewBox?: string; fill?: string; stroke?: string; 'stroke-width'?: string; 'aria-hidden'?: string };
      path: ReactHTMLAttributes<SVGPathElement> & { d?: string };
      circle: ReactHTMLAttributes<SVGCircleElement> & { cx?: string; cy?: string; r?: string };
      rect: ReactHTMLAttributes<SVGRectElement> & { x?: string; y?: string; width?: string; height?: string; rx?: string };
      template: ReactHTMLAttributes<HTMLTemplateElement>;
      [tag: string]: Record<string, unknown>;
    }
  }

  interface Window {
    YiPet: Record<string, unknown>;
    PET_DEFAULTS: Record<string, unknown>;
    PET_ENDPOINTS: Record<string, unknown>;
    PET_CONFIG: Record<string, unknown>;
    YIPET_POPUP: Record<string, unknown>;
    YiPetPopup: Record<string, unknown>;
  }
}

export {};
