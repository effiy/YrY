/**
 * node-shim.d.ts — Node.js 类型 shim（临时替代 @types/node）
 *
 * Why：项目暂未将 `@types/node` 加入 devDependencies（需用户决策，会改 package-lock.json）。
 *      没有 @types/node 时，tsc 报 507 个 TS2591 错误（`Cannot find name 'process'/'node:fs'` 等），
 *      淹没真正的类型问题。本 shim 用最小声明消除这些噪音，让 ~107 个真实类型错误显现。
 *
 * How to apply：本文件由 tsconfig.json `include` 自动加载。当 `@types/node` 安装后，
 *               删除本文件 + tsconfig `types: ["node"]` 即可，无业务代码改动。
 *
 * 注意：本 shim 将 node:* 模块的所有导出声明为 any（不提供真实类型），
 *       与项目 `strict: false` 的宽松类型基线一致。
 */

// ── process 全局 ────────────────────────────────────────────────────────
declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  stdout: { write: (data: string | Uint8Array) => boolean; isTTY?: boolean };
  stderr: { write: (data: string | Uint8Array) => boolean; isTTY?: boolean };
  stdin: { read: () => string | null };
  exit: (code?: number) => void;
  cwd: () => string;
  chdir: (dir: string) => void;
  platform: string;
  arch: string;
  execPath: string;
  pid: number;
  versions: Record<string, string>;
  listeners: Record<string, unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener: (...args: unknown[]) => void) => void;
  once: (event: string, listener: (...args: unknown[]) => void) => void;
  exitCode: number;
};

// ── node:* 模块（any 导出，仅消除 TS2591） ────────────────────────────
declare module "node:path";
declare module "node:fs";
declare module "node:fs/promises";
declare module "node:child_process";
declare module "node:url";
declare module "node:os";
declare module "node:crypto";
declare module "node:module";
declare module "node:https";
declare module "node:http";
declare module "node:net";
declare module "node:stream";
declare module "node:util";
declare module "node:readline";
declare module "node:zlib";
declare module "node:buffer";
declare module "node:events";
declare module "node:assert";
declare module "node:timers";

// ── 其他 Node 全局 ──────────────────────────────────────────────────────
declare const Buffer: {
  from: (data: string | ArrayLike<number>, encoding?: string) => Buffer & { toString(encoding?: string): string };
  isBuffer: (obj: unknown) => obj is Buffer;
  alloc: (size: number, fill?: string | number) => Buffer & { toString(encoding?: string): string };
  concat: (list: Array<Uint8Array>, totalLength?: number) => Buffer & { toString(encoding?: string): string };
};
declare interface Buffer extends Uint8Array {
  toString(encoding?: string): string;
  length: number;
  [index: number]: number;
}

declare const __dirname: string;
declare const __filename: string;
declare const require: (id: string) => unknown;
declare const module: { exports: Record<string, unknown> };
declare const exports: Record<string, unknown>;

declare function setTimeout(handler: () => void, timeout?: number, ...args: unknown[]): NodeJS.Timeout;
declare function clearTimeout(handle?: NodeJS.Timeout): void;
declare function setInterval(handler: () => void, timeout?: number, ...args: unknown[]): NodeJS.Timeout;
declare function clearInterval(handle?: NodeJS.Timeout): void;
declare function setImmediate(handler: () => void, ...args: unknown[]): NodeJS.Timeout;
declare function clearImmediate(handle?: NodeJS.Timeout): void;
declare function queueMicrotask(handler: () => void): void;

declare const fetch: unknown;
declare const AbortController: { new (): { signal: AbortSignal; abort: () => void } };
declare const AbortSignal: { new (): AbortSignal };
declare interface AbortSignal { aborted: boolean; addEventListener: (type: string, listener: () => void) => void }
declare const URL: unknown;
declare const URLSearchParams: unknown;
declare const performance: { now: () => number };
declare const structuredClone: <T>(value: T) => T;
declare const TextEncoder: { new (): { encode: (s: string) => Uint8Array } };
declare const TextDecoder: { new (): { decode: (input: Uint8Array) => string } };

// NodeJS namespace（setTimeout 等返回的 Timeout 类型）
declare namespace NodeJS {
  interface Timeout {}
}

// import.meta.dirname / .filename (Node 20.11+)
interface ImportMeta {
  dirname?: string;
  filename?: string;
  url: string;
}
