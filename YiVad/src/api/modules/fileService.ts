/**
 * File I/O service — direct file read/write and OSS image upload.
 * These use fetch (not Axios) because they may involve large payloads
 * or endpoints outside the main API proxy.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiAi";

/**
 * Read a file from the server filesystem.
 */
export async function readFile(path: string): Promise<string> {
  const url = buildYiAiUrl("/read-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ target_file: path })
  });
  if (!resp.ok) {
    throw new Error(`Failed to read file: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data?.content ?? data?.data?.content ?? "";
}

/** 可读错误码分类 — readProjectFile 抛出的错误对象 */
export type ProjectFileErrorCode = "TIMEOUT" | "NOT_FOUND" | "NETWORK" | "ABORTED" | "BUSINESS";

export class ProjectFileError extends Error {
  constructor(
    public readonly code: ProjectFileErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ProjectFileError";
  }
}

export interface ReadProjectFileOptions {
  /** 独立超时（毫秒）。默认 8000ms（README 非关键路径不阻塞主 loading）。 */
  timeoutMs?: number;
  /** 外部 AbortSignal；和内部 timeout 合并后生效（若浏览器不支持 any 则退化 Promise.race）。 */
  signal?: AbortSignal;
}

function classifyError(e: unknown, status?: number): ProjectFileError {
  const maybe = e as { name?: string; code?: unknown; message?: string } | null | undefined;
  if (
    maybe?.name === "AbortError" ||
    maybe?.code === 20 ||
    (e instanceof DOMException && e.name === "AbortError")
  ) {
    return new ProjectFileError("ABORTED", "读取已取消", e);
  }
  const msg = String(maybe?.message ?? "");
  if (/timeout|超时|timed out/i.test(msg)) return new ProjectFileError("TIMEOUT", msg || "读取超时", e);
  if (/NetworkError|Failed to fetch|net::|ECONN|ENOTFOUND/i.test(msg)) {
    return new ProjectFileError("NETWORK", msg || "网络错误", e);
  }
  if (status === 404) return new ProjectFileError("NOT_FOUND", msg || "文件不存在", e);
  if (status && status >= 400 && status < 600) {
    return new ProjectFileError("BUSINESS", msg || `服务端错误 HTTP ${status}`, e);
  }
  return new ProjectFileError("BUSINESS", msg || "读取项目文件失败", e);
}

/**
 * Read a file directly from a project's source tree on disk.
 *
 * Story/scenario cards reference paths like `src/views/foo.vue` that belong
 * to a specific project (`story.project`). The preview must reflect the
 * live on-disk content of that file in the corresponding project — not a
 * stale snapshot in YiAi's static dir or MongoDB. This call hits YiAi's
 * `/read-project-file` endpoint, which resolves `<projects_root>/<project>/
 * <target_file>` with path-traversal protection and returns the file's
 * current content with no caching.
 *
 * 专业版增强：
 *   - 独立超时（默认 8s），避免 30s 水桶超时阻塞 UI；
 *   - 外部 signal 合并支持，组件卸载可确定性取消；
 *   - 结构化错误码（TIMEOUT/NOT_FOUND/NETWORK/ABORTED/BUSINESS）。
 */
export async function readProjectFile(
  project: string,
  path: string,
  options: ReadProjectFileOptions = {}
): Promise<string> {
  const { timeoutMs = 8_000, signal } = options;

  const ctrl = new AbortController();
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let unsub: (() => void) | null = null;

  function cleanup() {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    if (unsub) { unsub(); unsub = null; }
  }

  try {
    if (timeoutMs > 0) {
      timerId = setTimeout(() => {
        if (!ctrl.signal.aborted) ctrl.abort(new DOMException("Timeout", "AbortError"));
      }, timeoutMs);
    }
    if (signal) {
      if (signal.aborted) {
        ctrl.abort(signal.reason);
      } else {
        unsub = () => {};
        const handler = () => { ctrl.abort(signal.reason); };
        signal.addEventListener("abort", handler, { once: true });
        unsub = () => signal.removeEventListener("abort", handler);
      }
    }

    const url = buildYiAiUrl("/read-project-file");
    const resp = await fetch(url, {
      method: "POST",
      headers: yiAiAuthHeaders(),
      body: JSON.stringify({ project, target_file: path }),
      signal: ctrl.signal
    });
    if (!resp.ok) {
      throw classifyError(new Error(`Failed to read project file: HTTP ${resp.status}`), resp.status);
    }
    const data = await resp.json();
    return data?.data?.content ?? data?.content ?? "";
  } catch (e) {
    if (e instanceof ProjectFileError) throw e;
    throw classifyError(e);
  } finally {
    cleanup();
  }
}

/**
 * Write content to a file on the server filesystem.
 */
export async function writeFile(path: string, content: string): Promise<void> {
  const url = buildYiAiUrl("/write-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ target_file: path, content })
  });
  if (!resp.ok) {
    throw new Error(`Failed to write file: HTTP ${resp.status}`);
  }
}

/**
 * Upload an image (data URL) to OSS.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImageToOss(dataUrl: string, directory = "chat/images"): Promise<string> {
  const url = buildYiAiUrl("/upload/upload-image-to-oss");
  const filename = `img_${Date.now()}.png`;
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({
      data_url: dataUrl,
      filename,
      directory
    })
  });
  if (!resp.ok) {
    throw new Error(`Failed to upload image: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data?.url ?? data?.data?.url ?? "";
}

/** Delete a file from the server filesystem.
 *  Idempotent: a 404 (file not on disk — e.g. story-card files staged
 *  only into a session's `pageContent`) is treated as success so the
 *  caller's `deleteSession` still runs and the entry disappears from
 *  the tree without a noisy console error. */
export async function deleteFile(path: string): Promise<void> {
  const url = buildYiAiUrl("/delete-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ target_file: path })
  });
  if (resp.status === 404) return;
  if (!resp.ok) throw new Error(`Failed to delete file: HTTP ${resp.status}`);
}

/** Delete a folder (recursively) from the server filesystem. */
export async function deleteFolder(path: string): Promise<void> {
  const url = buildYiAiUrl("/delete-folder");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ target_dir: path })
  });
  if (!resp.ok) throw new Error(`Failed to delete folder: HTTP ${resp.status}`);
}

/** Rename (move) a file on the server filesystem. */
export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  const url = buildYiAiUrl("/rename-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ old_path: oldPath, new_path: newPath })
  });
  if (!resp.ok) throw new Error(`Failed to rename file: HTTP ${resp.status}`);
}

/** Rename (move) a folder on the server filesystem. */
export async function renameFolder(oldPath: string, newPath: string): Promise<void> {
  const url = buildYiAiUrl("/rename-folder");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ old_dir: oldPath, new_dir: newPath })
  });
  if (!resp.ok) throw new Error(`Failed to rename folder: HTTP ${resp.status}`);
}

/**
 * Fetch a source file from the YiVad dev server (own source tree).
 *
 * Story / scenario cards reference paths like `src/views/foo.vue` that
 * belong to the YiVad project itself — those files are NOT on YiAi's
 * disk, so `readFile` 404s. In dev mode, Rsbuild serves the project's
 * own source at its path, so we can pull the content here and persist
 * it to YiAi via `writeFile` so subsequent `readFile` calls hit disk.
 *
 * Fetch order:
 *   1. `?raw` — Vite-style raw-source fetch. For .vue files this
 *      returns the original SFC source (`<template>/<script>/<style>`),
 *      not the compiled JS module. Preferred for code review.
 *   2. direct `fetch("/" + path)` — fallback for files / dev servers
 *      that don't honor `?raw` (returns compiled module for .vue, raw
 *      source for .ts/.css/.md).
 *
 * Returns the file text on success, or null if the dev server is not
 * running / the path doesn't resolve (e.g. production builds where the
 * source tree isn't served).
 */

export interface DirEntry {
  name: string;
  path: string;
  size: number;
  mtime: number;
  ext: string;
}

export interface DirListing {
  root: string;
  dirs: { name: string; path: string }[];
  files: DirEntry[];
}

/** List directory contents recursively on the YiAi server. */
export async function listDirectory(targetDir = "", maxDepth = 3): Promise<DirListing> {
  const url = buildYiAiUrl("/list-directory");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ target_dir: targetDir, max_depth: maxDepth })
  });
  if (!resp.ok) throw new Error(`Failed to list directory: HTTP ${resp.status}`);
  const data = await resp.json();
  return data?.data ?? data;
}
