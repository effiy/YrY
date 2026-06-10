/**
 * rui-import diagnose — empty-input diagnostic and recommendation
 * Extracted from sync.mjs for single-responsibility
 */

import { relative } from "node:path";
import { API_X_TOKEN, PREVIEW_COUNT } from "./config.mjs";
import { scanFiles, resolveRemotePath } from "./scan.mjs";
import { querySessions } from "./api.mjs";

export async function recommendMode(root, workspaceName, opts, apiUrl) {
  const files = await scanFiles(root, opts.exclude);

  console.log("# rui-import 状态检测与推荐\n");

  if (!API_X_TOKEN) {
    console.log("⚠️  API_X_TOKEN: 缺失");
    console.log("   → 推荐: 配置 token 后执行 `/rui-import workspace=true` 全量导入\n");
  } else {
    console.log("✅ API_X_TOKEN: 已配置");
  }

  if (API_X_TOKEN) {
    try {
      const existingPaths = await querySessions(apiUrl);
      console.log(`✅ 远端可达: ${existingPaths.size} 个已有 session\n`);
    } catch (err) {
      console.log(`⚠️  远端不可达: ${err.message}`);
      console.log("   → 推荐: 检查网络或 API 地址后重试\n");
    }
  }

  console.log(`📋 待同步文件: ${files.length} 个`);
  if (files.length > 0) {
    const preview = files.slice(0, PREVIEW_COUNT);
    for (const f of preview) {
      const rp = resolveRemotePath(f, root, workspaceName, opts.prefix);
      console.log(`   ${relative(root, f)} → ${rp}`);
    }
    if (files.length > PREVIEW_COUNT) console.log(`   ... 等 ${files.length - PREVIEW_COUNT} 个文件`);
  }

  console.log("\n## 推荐任务\n");
  if (!API_X_TOKEN) {
    console.log("1. [凭据缺失] 设置 API_X_TOKEN 环境变量");
  }
  console.log("2. [全量导入] `/rui-import workspace=true` 扫描并上传全部文件");
  console.log("3. [增量同步] `/rui-import workspace=true exclude=...` 跳过指定目录");
  console.log("4. [预览检查] `/rui-import workspace=true mode=list` 仅列出不上传");
  console.log("5. [定期巡检] 定期运行空输入检查 token / 远端可达性 / 文件差异");
}
