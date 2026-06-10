/**
 * rui-import config — configuration constants
 * Extracted from sync.mjs for single-responsibility
 */

import { DEFAULT_API_URL } from "../../../lib/constants.mjs";

export const API_URL = process.env.IMPORT_DOCS_API_URL || DEFAULT_API_URL;
export const API_X_TOKEN = process.env.API_X_TOKEN || "";
export const DEFAULT_EXCLUDES = new Set([".git", "node_modules", ".claude-plugin", "dist"]);

export const PREVIEW_COUNT = 10;
export const DECIMAL_RADIX = 10;
export const SKILL_NAME = "rui-import";
