/**
 * rui-import find-root -- project root detection inlined from _shared/fs.mjs
 * Originally lived in .claude/skills/_shared/; inlined here so the skill is
 * self-contained and runnable without external shared modules.
 */

import { existsSync } from "node:fs";
import { dirname } from "node:path";

export function findProjectRoot(cwd) {
  let dir = cwd;
  while (true) {
    if (existsSync(`${dir}/.git`) || existsSync(`${dir}/.claude`)) return dir;
    const parent = dirname(dir);
    if (parent === dir) return cwd;
    dir = parent;
  }
}
