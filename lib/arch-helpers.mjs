/**
 * arch-helpers — Shared utilities for architecture compliance checks.
 *
 * Extracted from lib/arch-check.mjs to reduce file size below 500-line limit.
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

export function grepLines(pattern, dir, ext = ".mjs", excludeFile = null) {
  try {
    let cmd = `grep -r "${pattern}" "${dir}" --include="*${ext}" -n 2>/dev/null || true`;
    const result = execSync(cmd, { encoding: "utf-8", timeout: 5000 });
    let lines = result.trim().split("\n").filter(Boolean);
    if (excludeFile) {
      lines = lines.filter((l) => !l.startsWith(excludeFile));
    }
    return lines;
  } catch {
    return [];
  }
}

export function countFiles(dir, pattern = "*.mjs") {
  try {
    const result = execSync(
      `ls ${dir}/${pattern} 2>/dev/null | wc -l`,
      { encoding: "utf-8", timeout: 3000 }
    );
    return parseInt(result.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

export function fileLineCount(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

export function readFrontmatter(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const fm = {};
    const lines = match[1].split("\n");
    for (const line of lines) {
      const kv = line.match(/^(\w+):\s*(.+)/);
      if (kv) {
        const key = kv[1].trim();
        let val = kv[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        fm[key] = val;
      }
    }
    return fm;
  } catch {
    return null;
  }
}

export function hasConjunctions(desc) {
  if (!desc) return false;
  return /和|与|也|并|及|以及|并且/.test(desc);
}
