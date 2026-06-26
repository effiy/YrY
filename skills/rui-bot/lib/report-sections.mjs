/**
 * Backward-compatibility barrel for the previously-monolithic
 * report-sections.mjs. The 1941-line file was split into focused
 * sub-modules under ./report-sections/ (overview, dimensions, structure,
 * visualizations, risks, trend, components) plus a small data module for
 * fix-guidance / methodology tables.
 *
 * This file preserves every previously-exported name so existing
 * callers (health-report.mjs, etc.) keep working unchanged.
 *
 * To see what each section builder does, jump to its focused module —
 * the file-level JSDoc there documents responsibilities and inputs.
 */

export * from "./report-sections/index.mjs";