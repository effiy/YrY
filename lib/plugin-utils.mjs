/**
 * plugin-utils.mjs — Plugin cache and installation utilities
 *
 * Functions for locating files within the Claude plugin cache structure.
 * Previously part of lib/fs.mjs, extracted for single-responsibility.
 */

import { join } from "node:path";
import { homedir } from "node:os";
import { existsSync, readdirSync } from "node:fs";

/** Find help.mjs path for a skill inside the plugin cache (latest installed version). */
export function findPluginHelpPath(skillName) {
  const pluginRoot = join(homedir(), ".claude/plugins/cache/yry/yry");
  if (!existsSync(pluginRoot)) return null;
  try {
    const versions = readdirSync(pluginRoot).filter(d => /^\d+\.\d+\.\d+$/.test(d)).sort();
    if (versions.length === 0) return null;
    const helpPath = join(pluginRoot, versions[versions.length - 1], "skills", skillName, "help.mjs");
    return existsSync(helpPath) ? helpPath : null;
  } catch {
    return null;
  }
}
