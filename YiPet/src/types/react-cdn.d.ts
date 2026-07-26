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
  'data-icon'?: string;
  type?: string;
  checked?: boolean;
  disabled?: boolean;
  value?: string | number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (event: { target: { value: string } }) => void;
  onInput?: (event: { target: { value: string } }) => void;
  onClick?: (event: unknown) => void;
  ref?: { current: T | null };
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
      p: ReactHTMLAttributes<HTMLParagraphElement>;
      a: ReactHTMLAttributes<HTMLAnchorElement>;
      img: ReactHTMLAttributes<HTMLImageElement> & { src?: string; alt?: string };
      input: ReactHTMLAttributes<HTMLInputElement>;
      select: ReactHTMLAttributes<HTMLSelectElement>;
      option: ReactHTMLAttributes<HTMLOptionElement> & { value?: string | number; key?: string | number };
      label: ReactHTMLAttributes<HTMLLabelElement>;
      button: ReactHTMLAttributes<HTMLButtonElement>;
      header: ReactHTMLAttributes<HTMLElement>;
      footer: ReactHTMLAttributes<HTMLElement>;
      main: ReactHTMLAttributes<HTMLElement>;
      section: ReactHTMLAttributes<HTMLElement>;
      output: ReactHTMLAttributes<HTMLOutputElement>;
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
