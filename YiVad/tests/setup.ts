// Mock localStorage for tests
const store: Record<string, string> = {};

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  },
  writable: true,
});

// Mock matchMedia for Element Plus responsive components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver for Element Plus components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as any;

// Mock scrollTo for Element Plus
window.scrollTo = () => {};
Element.prototype.scrollTo = () => {};

// Suppress Element Plus SSR warnings about teleport target
const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = String(args[0]);
  if (msg.includes("teleport") && msg.includes("target")) return;
  origWarn(...args);
};