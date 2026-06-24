/**
 * rui-import api — remote API CRUD operations
 * Extracted from sync.mjs for single-responsibility
 */

import { fetchJson, querySessionsFull } from "../../../lib/io.mjs";
import { API_X_TOKEN } from "./config.mjs";
import { getTags } from "./scan.mjs";

export async function querySessions(apiUrl) {
  const list = await querySessionsFull(apiUrl, API_X_TOKEN);
  const paths = new Map();
  for (const item of list) {
    if (item.file_path) paths.set(item.file_path, item);
  }
  return paths;
}

export async function writeRemoteFile(apiUrl, remotePath, content, overwrite) {
  const body = { target_file: remotePath, content, is_base64: false, overwrite: !!overwrite };
  return fetchJson(apiUrl + "/write-file", API_X_TOKEN, { method: "POST", body: JSON.stringify(body) });
}

export async function createSession(apiUrl, remotePath, localPath, projectRootName) {
  const basename = remotePath.split("/").pop();
  const tags = getTags(remotePath, localPath, projectRootName);
  const now = Date.now();
  const body = {
    module_name: "services.database.data_service",
    method_name: "create_document",
    parameters: {
      cname: "sessions",
      data: {
        url: `aicr-session://${now}-${Math.random().toString(36).slice(2, 8)}`,
        title: basename,
        file_path: remotePath,
        messages: [],
        tags,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
      },
    },
  };
  const resp = await fetchJson(apiUrl + "/", API_X_TOKEN, { method: "POST", body: JSON.stringify(body) });
  const created = resp?.data || resp;
  return (created && created.file_path) ? created : { file_path: remotePath, _id: "local-" + now };
}

export async function updateSession(apiUrl, remotePath, existingItem) {
  const docId = existingItem._id || existingItem.id;
  if (!docId) return;
  const now = Date.now();
  const body = {
    module_name: "services.database.data_service",
    method_name: "update_document",
    parameters: {
      cname: "sessions",
      doc_id: docId,
      data: { updatedAt: now, lastAccessTime: now },
    },
  };
  return fetchJson(apiUrl + "/", API_X_TOKEN, { method: "POST", body: JSON.stringify(body) });
}
