/**
 * File I/O service — direct file read/write and OSS image upload.
 * These use fetch (not Axios) because they may involve large payloads
 * or endpoints outside the main API proxy.
 */
import { buildYiAiUrl } from "@/config/yiweb";

const TOKEN_KEY = "YiWeb.apiToken.v1";

function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

/**
 * Read a file from the server filesystem.
 */
export async function readFile(path: string): Promise<string> {
  const url = buildYiAiUrl("/read-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": getToken()
    },
    body: JSON.stringify({ path })
  });
  if (!resp.ok) {
    throw new Error(`Failed to read file: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data?.content ?? data?.data?.content ?? "";
}

/**
 * Write content to a file on the server.
 */
export async function writeFile(path: string, content: string): Promise<void> {
  const url = buildYiAiUrl("/write-file");
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": getToken()
    },
    body: JSON.stringify({ path, content })
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
    headers: {
      "Content-Type": "application/json",
      "X-Token": getToken()
    },
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
