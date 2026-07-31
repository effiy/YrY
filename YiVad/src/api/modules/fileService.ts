/**
 * File I/O service — direct file read/write and OSS image upload.
 * These use fetch (not Axios) because they may involve large payloads
 * or endpoints outside the main API proxy.
 */
import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";

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
 */
export async function readProjectFile(project: string, path: string): Promise<string> {
  const url = buildYiAiUrl("/read-project-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ project, target_file: path })
  });
  if (!resp.ok) {
    throw new Error(`Failed to read project file: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data?.data?.content ?? data?.content ?? "";
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
export async function uploadImageToOss(dataUrl: string, directory = "aicr/images"): Promise<string> {
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
export async function fetchSourceFromDevServer(path: string): Promise<string | null> {
  if (!import.meta.env.DEV) return null;
  const cleaned = String(path || "").replace(/^\/+/, "");
  if (!cleaned) return null;
  for (const suffix of ["?raw", ""]) {
    try {
      const url = suffix ? `/${cleaned}${suffix}` : `/${cleaned}`;
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const text = await resp.text();
      // Rsbuild returns 200 with HTML shell for unknown paths in some
      // setups; a real source file is plain text without a <!DOCTYPE>
      // prefix. Also reject the Vite/Rspack HMR bootstrap that a direct
      // .vue fetch returns when ?raw is unavailable — those start with
      // `import`/`const`/`__vite__` but the SFC source starts with
      // `<template>`/`<script>`/`<style>`/`<!--`, so a heuristic works.
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) continue;
      // Reject compiled JS module output for non-JS source files. The
      // `?raw` middleware should make this unreachable, but defend against
      // bare-fetch fallback returning the compiled module for .vue files.
      const isJsLike = /\.(m?[tj]s|jsx|tsx)$/.test(cleaned);
      if (!isJsLike && /^(import\s|export\s|"use strict"|__vite__|const __vite|\/\/.*\nimport)/.test(text)) {
        continue;
      }
      return text;
    } catch {
      // try next suffix
    }
  }
  return null;
}
