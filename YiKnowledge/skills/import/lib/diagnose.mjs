/**
 * yry-import diagnose -- empty-input diagnostic and recommendation
 * Extracted from sync.mjs for single-responsibility
 */

import { relative } from "node:path";
import { API_X_TOKEN, PREVIEW_COUNT } from "./config.mjs";
import { scanFiles, resolveRemotePath } from "./scan.mjs";
import { querySessions } from "./api.mjs";

export async function recommendMode(root, workspaceName, opts, apiUrl) {
  const files = await scanFiles(root, opts.exclude);

  console.log("# yry-import Status Check and Recommendations\n");

  if (!API_X_TOKEN) {
    console.log("⚠️  API_X_TOKEN: Missing");
    console.log("   → Recommend: Configure token then run `/yry-import workspace=true` Full import\n");
  } else {
    console.log("✅ API_X_TOKEN: Configured");
  }

  if (API_X_TOKEN) {
    try {
      const existingPaths = await querySessions(apiUrl);
      console.log(`✅ Remote reachable: ${existingPaths.size} existing sessions\n`);
    } catch (err) {
      console.log(`⚠️  Remote unreachable: ${err.message}`);
      console.log("   → Recommend: Check network or API address and retry\n");
    }
  }

  console.log(`📋 Files pending sync: ${files.length}`);
  if (files.length > 0) {
    const preview = files.slice(0, PREVIEW_COUNT);
    for (const f of preview) {
      const rp = resolveRemotePath(f, root, workspaceName, opts.prefix);
      console.log(`   ${relative(root, f)} → ${rp}`);
    }
    if (files.length > PREVIEW_COUNT) console.log(`   ... and ${files.length - PREVIEW_COUNT} more files`);
  }

  console.log("\n## Recommended tasks\n");
  if (!API_X_TOKEN) {
    console.log("1. [Credentials missing] Set API_X_TOKEN environment variable");
  }
  console.log("2. [Full import] `/yry-import workspace=true` Scan and upload all files");
  console.log("3. [Incremental sync] `/yry-import workspace=true exclude=...` Skip specified directories");
  console.log("4. [Preview check] `/yry-import workspace=true mode=list` List only, no upload");
  console.log("5. [Periodic inspection] Run periodically with empty input to check token / remote reachability / file differences");
}