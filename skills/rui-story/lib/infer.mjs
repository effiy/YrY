/**
 * rui-story infer — story type inference from remote document content
 * Extracted from rui-story.mjs for single-responsibility
 */

import { CONCURRENCY } from "../../../lib/constants.mjs";
import { readRemoteFile } from "../../../lib/network.mjs";
import { runConcurrent } from "../../../lib/concurrency.mjs";

export async function inferType(apiUrl, storySessions, projectPrefix, apiToken) {
  const reviewTarget = `${projectPrefix}技术评审.md`;
  const reviewSession = storySessions.find(s => {
    const base = (s.file_path || "").split("/").pop();
    return base === reviewTarget;
  });
  if (!reviewSession) return "meta";

  const remotePath = reviewSession.file_path;
  try {
    const data = await readRemoteFile(apiUrl, remotePath, apiToken);
    const content = (data?.data?.content ?? data?.content ?? "").toLowerCase();

    const hasBackend = /\b(api|数据|后端|服务端|接口|数据库|server|backend|服务|路由)\b/i.test(content);
    const hasFrontend = /\b(组件|交互|样式|前端|页面|ui|frontend|界面|布局|渲染|响应式)\b/i.test(content);

    if (hasBackend && hasFrontend) return "fullstack";
    if (hasBackend) return "backend";
    if (hasFrontend) return "frontend";
    return "meta";
  } catch {
    return "meta";
  }
}

export async function inferTypesBatch(apiUrl, storyMap, projectPrefix, apiToken) {
  const entries = [...storyMap.entries()];
  const results = new Map();

  await runConcurrent(entries, async ([name, sessions]) => {
    results.set(name, await inferType(apiUrl, sessions, projectPrefix, apiToken));
  }, CONCURRENCY);

  return results;
}
