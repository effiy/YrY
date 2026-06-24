/**
 * Vitest 全局 setup — mock 浏览器全局函数,防止 happy-dom 执行 script 时报错
 */

globalThis.alert = () => {};
globalThis.confirm = () => true;
globalThis.prompt = () => null;
