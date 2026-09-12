/**
 * Dev-server proxy config — replaces build/proxy.ts (vite version).
 *
 * Rsbuild's `server.proxy` is powered by `http-proxy-middleware`, which uses
 * `pathRewrite` (object keys are regex, values are replacement strings) rather
 * than vite's `rewrite: (path) => string`.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, normalize, sep } from "node:path";

type ProxyItem = [string, string];

type ProxyList = ProxyItem[];

type ProxyEntry = {
  target: string;
  changeOrigin: true;
  ws: true;
  pathRewrite: Record<string, string>;
  secure?: false;
};

type ProxyTargetList = Record<string, ProxyEntry>;

export function createProxy(list: ProxyList = []): ProxyTargetList {
  const ret: ProxyTargetList = {};
  for (const [prefix, target] of list) {
    const isHttps = /^https:\/\//.test(target);
    ret[prefix] = {
      target,
      changeOrigin: true,
      ws: true,
      pathRewrite: { [`^${prefix}`]: "" },
      ...(isHttps ? { secure: false } : {})
    };
  }
  return ret;
}

/**
 * Dev-server middleware that serves the raw source of a project file when
 * the request URL ends in `?raw` — Vite-compatible `?raw` queries that the
 * old Vite pipeline supported natively but Rsbuild doesn't out of the box.
 *
 * Why this exists: story/scenario cards reference paths like
 * `src/views/foo.vue` that live in YiVad's own source tree (NOT on YiAi's
 * disk). The only way to preview their content in the browser is to ask
 * the dev server for the file. Without `?raw` support, Rsbuild returns the
 * compiled module for `.vue` files — "wrong content" for a preview.
 *
 * Security: the resolved path must stay inside `root`. Any traversal
 * attempt (../, absolute paths, encoded sequences) is rejected.
 */
export function sourceRawMiddleware(root: string) {
  const rootAbs = normalize(resolve(root));
  return function (req: any, res: any, next: any) {
    const url: string = req?.url ?? "";
    if (!url.includes("?raw")) return next?.();
    const cleanUrl = url.split("?")[0].replace(/^\/+/, "");
    if (!cleanUrl) return next?.();

    const resolved = normalize(resolve(rootAbs, cleanUrl));
    if (!resolved.startsWith(rootAbs + sep) && resolved !== rootAbs) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }
    if (!existsSync(resolved) || !statSync(resolved).isFile()) {
      return next?.();
    }
    try {
      const text = readFileSync(resolved, "utf-8");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(text);
    } catch {
      res.statusCode = 500;
      res.end("read failed");
    }
  };
}

